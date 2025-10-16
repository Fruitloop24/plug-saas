import { createClerkClient, verifyToken } from '@clerk/backend';
import { handleStripeWebhook as stripeWebhookHandler } from './stripe-webhook';

interface Env {
	CLERK_SECRET_KEY: string;
	CLERK_PUBLISHABLE_KEY: string;
	STRIPE_SECRET_KEY: string;
	STRIPE_WEBHOOK_SECRET?: string;
	STRIPE_PRICE_ID: string;
	FRONTEND_URL?: string; // Optional - we use Origin header instead
	USAGE_KV: KVNamespace;
	CLERK_JWT_TEMPLATE: string;
}

interface UsageData {
	usageCount: number;
	plan: 'free' | 'pro';
	lastUpdated: string;
	periodStart?: string; // Billing period start (YYYY-MM-DD)
	periodEnd?: string; // Billing period end (YYYY-MM-DD)
}

const FREE_TIER_LIMIT = 5;
const RATE_LIMIT_PER_MINUTE = 100;

// Validate required environment variables
function validateEnv(env: Env): { valid: boolean; missing: string[] } {
	const required = [
		'CLERK_SECRET_KEY',
		'CLERK_PUBLISHABLE_KEY',
		'STRIPE_SECRET_KEY',
		'STRIPE_PRICE_ID',
		'CLERK_JWT_TEMPLATE',
	];

	const missing = required.filter((key) => !env[key as keyof Env]);

	// Check KV binding
	if (!env.USAGE_KV) {
		missing.push('USAGE_KV');
	}

	return { valid: missing.length === 0, missing };
}

// Rate limiting check
async function checkRateLimit(userId: string, env: Env): Promise<{ allowed: boolean; remaining: number }> {
	const now = Date.now();
	const minute = Math.floor(now / 60000); // Current minute bucket
	const rateLimitKey = `ratelimit:${userId}:${minute}`;

	const currentCount = await env.USAGE_KV.get(rateLimitKey);
	const count = currentCount ? parseInt(currentCount) : 0;

	if (count >= RATE_LIMIT_PER_MINUTE) {
		return { allowed: false, remaining: 0 };
	}

	// Increment counter with 2-minute TTL (current + next minute buffer)
	await env.USAGE_KV.put(rateLimitKey, (count + 1).toString(), { expirationTtl: 120 });

	return { allowed: true, remaining: RATE_LIMIT_PER_MINUTE - count - 1 };
}

// Get current billing period (first day of month to last day)
function getCurrentPeriod(): { start: string; end: string } {
	const now = new Date();
	const year = now.getUTCFullYear();
	const month = now.getUTCMonth();

	const start = new Date(Date.UTC(year, month, 1));
	const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

	return {
		start: start.toISOString().split('T')[0],
		end: end.toISOString().split('T')[0],
	};
}

// Check if usage data needs reset for new billing period
function shouldResetUsage(usageData: UsageData): boolean {
	const currentPeriod = getCurrentPeriod();

	// If no period tracked, needs reset
	if (!usageData.periodStart || !usageData.periodEnd) {
		return true;
	}

	// If current date is after period end, needs reset
	return currentPeriod.start !== usageData.periodStart;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Validate environment variables on first request
		const envCheck = validateEnv(env);
		if (!envCheck.valid) {
			return new Response(
				JSON.stringify({
					error: 'Server configuration error',
					message: 'Missing required environment variables',
					missing: envCheck.missing,
				}),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// CORS headers - allow custom domain, Vercel, CF Pages, and localhost
		const origin = request.headers.get('Origin') || '';
		const allowedOrigins = [
			'https://app.panacea-tech.net', // Custom domain
			'https://pan-frontend.pages.dev', // CF Pages production
			'http://localhost:3000', // Local dev
			'http://localhost:4011', // Local dev alt port
		];

		// Allow Vercel preview/production URLs and CF Pages preview URLs
		const isAllowedOrigin = allowedOrigins.includes(origin) ||
			/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) || // Vercel deployments
			/^https:\/\/[a-z0-9]+\.pan-frontend\.pages\.dev$/.test(origin); // CF Pages previews

		// TODO: Replace wildcard with specific origins from env var for production
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*', // TEMPORARY wildcard for testing
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(request.url);

		// Health check endpoint
		if (url.pathname === '/health') {
			return new Response(JSON.stringify({ status: 'ok' }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Stripe webhook doesn't require JWT auth
		if (url.pathname === '/webhook/stripe' && request.method === 'POST') {
			return await stripeWebhookHandler(request, env);
		}

		// Verify JWT token
		const authHeader = request.headers.get('Authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		try {
			// Create Clerk client
			const clerkClient = createClerkClient({
				secretKey: env.CLERK_SECRET_KEY,
				publishableKey: env.CLERK_PUBLISHABLE_KEY,
			});

			// Authenticate the request
			const { toAuth } = await clerkClient.authenticateRequest(request, {
				secretKey: env.CLERK_SECRET_KEY,
				publishableKey: env.CLERK_PUBLISHABLE_KEY,
			});

			const auth = toAuth();

			if (!auth || !auth.userId) {
				throw new Error('Unauthorized');
			}

			const userId = auth.userId;

			// Rate limiting check
			const rateCheck = await checkRateLimit(userId, env);
			if (!rateCheck.allowed) {
				return new Response(
					JSON.stringify({
						error: 'Rate limit exceeded',
						message: `Maximum ${RATE_LIMIT_PER_MINUTE} requests per minute`,
						retryAfter: 60,
					}),
					{
						status: 429,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json',
							'Retry-After': '60',
						},
					}
				);
			}

			// Get user to check plan from metadata
			const user = await clerkClient.users.getUser(userId);
			const plan = (user.publicMetadata?.plan as 'free' | 'pro') || 'free';

			// Route handlers
			if (url.pathname === '/api/data' && request.method === 'POST') {
				return await handleDataRequest(userId, plan, env, corsHeaders);
			}

			if (url.pathname === '/api/usage' && request.method === 'GET') {
				return await handleUsageCheck(userId, plan, env, corsHeaders);
			}

			if (url.pathname === '/api/create-checkout' && request.method === 'POST') {
				return await handleCreateCheckout(userId, clerkClient, env, corsHeaders, origin);
			}

			return new Response(JSON.stringify({ error: 'Not found' }), {
				status: 404,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		} catch (error) {
			console.error('Token verification failed:', error);
			return new Response(JSON.stringify({ error: 'Invalid token' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
	},
};

async function handleDataRequest(
	userId: string,
	plan: 'free' | 'pro',
	env: Env,
	corsHeaders: Record<string, string>
): Promise<Response> {
	// Get current usage
	const usageKey = `usage:${userId}`;
	const usageDataRaw = await env.USAGE_KV.get(usageKey);

	const currentPeriod = getCurrentPeriod();

	let usageData: UsageData = usageDataRaw
		? JSON.parse(usageDataRaw)
		: {
				usageCount: 0,
				plan,
				lastUpdated: new Date().toISOString(),
				periodStart: currentPeriod.start,
				periodEnd: currentPeriod.end,
		  };

	// Reset usage if new billing period (for free tier)
	if (plan === 'free' && shouldResetUsage(usageData)) {
		usageData.usageCount = 0;
		usageData.periodStart = currentPeriod.start;
		usageData.periodEnd = currentPeriod.end;
	}

	// Update plan if changed
	usageData.plan = plan;

	// Check if free tier limit exceeded
	if (plan === 'free' && usageData.usageCount >= FREE_TIER_LIMIT) {
		return new Response(
			JSON.stringify({
				error: 'Free tier limit reached',
				usageCount: usageData.usageCount,
				limit: FREE_TIER_LIMIT,
				message: 'Please upgrade to Pro for unlimited access',
			}),
			{
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	}

	// Increment usage count
	usageData.usageCount++;
	usageData.lastUpdated = new Date().toISOString();
	await env.USAGE_KV.put(usageKey, JSON.stringify(usageData));

	// Return success response
	return new Response(
		JSON.stringify({
			success: true,
			data: { message: 'Request processed successfully' },
			usage: {
				count: usageData.usageCount,
				limit: plan === 'free' ? FREE_TIER_LIMIT : 'unlimited',
				plan,
			},
		}),
		{
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		}
	);
}

async function handleUsageCheck(
	userId: string,
	plan: 'free' | 'pro',
	env: Env,
	corsHeaders: Record<string, string>
): Promise<Response> {
	const usageKey = `usage:${userId}`;
	const usageDataRaw = await env.USAGE_KV.get(usageKey);

	const currentPeriod = getCurrentPeriod();

	const usageData: UsageData = usageDataRaw
		? JSON.parse(usageDataRaw)
		: {
				usageCount: 0,
				plan,
				lastUpdated: new Date().toISOString(),
				periodStart: currentPeriod.start,
				periodEnd: currentPeriod.end,
		  };

	return new Response(
		JSON.stringify({
			userId,
			plan,
			usageCount: usageData.usageCount,
			limit: plan === 'free' ? FREE_TIER_LIMIT : 'unlimited',
			remaining: plan === 'free' ? Math.max(0, FREE_TIER_LIMIT - usageData.usageCount) : 'unlimited',
			periodStart: usageData.periodStart,
			periodEnd: usageData.periodEnd,
		}),
		{
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		}
	);
}

async function handleCreateCheckout(
	userId: string,
	clerkClient: any,
	env: Env,
	corsHeaders: Record<string, string>,
	origin: string
): Promise<Response> {
	try {
		// Get user email from Clerk
		const user = await clerkClient.users.getUser(userId);
		const userEmail = user.emailAddresses[0]?.emailAddress || '';

		// Use origin from request for success/cancel URLs (handles changing hash URLs)
		const frontendUrl = origin || 'https://app.panacea-tech.net';

		// Create Stripe checkout session
		const checkoutSession = await fetch('https://api.stripe.com/v1/checkout/sessions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				'success_url': `${frontendUrl}/dashboard?success=true`,
				'cancel_url': `${frontendUrl}/dashboard?canceled=true`,
				'customer_email': userEmail,
				'client_reference_id': userId,
				'mode': 'subscription',
				'line_items[0][price]': env.STRIPE_PRICE_ID,
				'line_items[0][quantity]': '1',
				'metadata[userId]': userId,
			}).toString(),
		});

		const session = await checkoutSession.json() as { url?: string; error?: { message: string } };

		if (!checkoutSession.ok) {
			throw new Error(session.error?.message || 'Failed to create checkout session');
		}

		return new Response(
			JSON.stringify({ url: session.url }),
			{
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error: any) {
		console.error('Checkout error:', error);
		return new Response(
			JSON.stringify({ error: error.message || 'Failed to create checkout' }),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	}
}

