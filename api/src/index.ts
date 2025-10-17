/**
 * ============================================================================
 * DOCUFLOW AI - CLOUDFLARE WORKER API
 * ============================================================================
 *
 * A stateless, JWT-only SaaS API with:
 * - Clerk authentication (JWT validation)
 * - Stripe subscription billing with webhook handling
 * - Usage tracking with monthly billing periods (stored in KV)
 * - Rate limiting (100 req/min per user)
 * - Dynamic CORS handling for multiple deployment environments
 *
 * ARCHITECTURE: Monolithic (recommended by Cloudflare for <1000 lines)
 * - Faster cold starts (no module resolution)
 * - Simpler debugging (single file)
 * - Can split later if needed (see line 600+ for modular examples)
 *
 * ============================================================================
 */

import { createClerkClient, verifyToken } from '@clerk/backend';
import { handleStripeWebhook as stripeWebhookHandler } from './stripe-webhook';

/**
 * Environment variables required for the worker
 * Set via: wrangler secret put <KEY>
 */
interface Env {
	CLERK_SECRET_KEY: string;           // Clerk secret key (sk_test_...)
	CLERK_PUBLISHABLE_KEY: string;      // Clerk publishable key (pk_test_...)
	STRIPE_SECRET_KEY: string;          // Stripe secret key (sk_test_...)
	STRIPE_WEBHOOK_SECRET?: string;     // Stripe webhook signing secret (whsec_...)
	STRIPE_PRICE_ID: string;            // Stripe price ID for Pro tier (price_...)
	ALLOWED_ORIGINS?: string;           // OPTIONAL: Comma-separated list of allowed origins
	                                     // Example: "https://app.example.com,https://staging.example.com"
	                                     // If not set, falls back to defaults (see CORS section)
	USAGE_KV: KVNamespace;              // KV namespace binding (set in wrangler.toml)
	CLERK_JWT_TEMPLATE: string;         // JWT template name (e.g., "pan-api")
}

/**
 * Usage data structure stored in KV
 * Key format: `usage:{userId}`
 * TTL: None (persists forever, resets monthly for free tier)
 */
interface UsageData {
	usageCount: number;        // Number of requests made in current period
	plan: 'free' | 'pro';      // User's current plan (synced from Clerk metadata)
	lastUpdated: string;       // ISO timestamp of last update
	periodStart?: string;      // Billing period start (YYYY-MM-DD)
	periodEnd?: string;        // Billing period end (YYYY-MM-DD)
}

// ============================================================================
// PRICING TIER CONFIGURATION
// ============================================================================

/**
 * Free tier limit (requests per billing period)
 *
 * HOW TO CHANGE:
 * - Change this constant to modify free tier limit
 * - Example: const FREE_TIER_LIMIT = 10; // 10 requests per month
 */
const FREE_TIER_LIMIT = 5;

/**
 * Rate limit (requests per minute, applies to ALL users)
 *
 * HOW TO CHANGE:
 * - Change this constant to modify rate limit
 * - Example: const RATE_LIMIT_PER_MINUTE = 200; // 200 req/min
 */
const RATE_LIMIT_PER_MINUTE = 100;

/**
 * HOW TO ADD A NEW PRICING TIER (e.g., "starter", "enterprise"):
 *
 * 1. Update UsageData interface to include new plan:
 *    plan: 'free' | 'pro' | 'starter' | 'enterprise';
 *
 * 2. Add tier limits:
 *    const TIER_LIMITS = {
 *      free: 5,
 *      starter: 50,
 *      pro: Infinity,
 *      enterprise: Infinity,
 *    };
 *
 * 3. Update handleDataRequest to check limits:
 *    const limit = TIER_LIMITS[plan];
 *    if (usageData.usageCount >= limit) { ... }
 *
 * 4. Update handleUsageCheck to return correct limit:
 *    limit: TIER_LIMITS[plan] === Infinity ? 'unlimited' : TIER_LIMITS[plan]
 *
 * 5. Create Stripe price in dashboard for new tier
 *
 * 6. Update Stripe webhook to handle new plan name
 *
 * EXAMPLE (commented out for reference):
 *
 * const TIER_LIMITS: Record<string, number> = {
 *   free: 5,
 *   starter: 50,        // New tier: 50 requests/month
 *   pro: Infinity,
 *   enterprise: Infinity,
 * };
 *
 * Then in handleDataRequest:
 * const limit = TIER_LIMITS[plan] || 0;
 * if (limit !== Infinity && usageData.usageCount >= limit) { ... }
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates that all required environment variables are set
 *
 * IMPORTANT: Cloudflare Workers don't have a "startup" phase like traditional
 * servers. Validation runs on first request. If you need to validate earlier,
 * use a test script that hits /health endpoint after deployment.
 *
 * @param env - Environment variables passed to fetch handler
 * @returns Object with validation status and list of missing variables
 *
 * HOW TO ADD NEW REQUIRED ENV VAR:
 * 1. Add to Env interface above
 * 2. Add to 'required' array below
 * 3. Set via: wrangler secret put NEW_VAR_NAME
 */
function validateEnv(env: Env): { valid: boolean; missing: string[] } {
	const required = [
		'CLERK_SECRET_KEY',
		'CLERK_PUBLISHABLE_KEY',
		'STRIPE_SECRET_KEY',
		'STRIPE_PRICE_ID',
		'CLERK_JWT_TEMPLATE',
	];

	const missing = required.filter((key) => !env[key as keyof Env]);

	// Check KV binding (set in wrangler.toml, not via secrets)
	if (!env.USAGE_KV) {
		missing.push('USAGE_KV');
	}

	return { valid: missing.length === 0, missing };
}

/**
 * Rate limiting check using KV storage
 *
 * ALGORITHM:
 * - Uses per-minute buckets: ratelimit:{userId}:{minute}
 * - Minute calculated as: Math.floor(Date.now() / 60000)
 * - TTL of 2 minutes ensures cleanup without manual deletion
 *
 * HOW TO MODIFY RATE LIMITS:
 * - Change RATE_LIMIT_PER_MINUTE constant (line 72)
 * - For per-tier rate limits:
 *   1. Add tier-specific limits: const RATE_LIMITS = { free: 60, pro: 200 }
 *   2. Pass user's plan to this function
 *   3. Use: const limit = RATE_LIMITS[plan]
 *
 * HOW TO CHANGE TIME WINDOW:
 * - For per-hour: Math.floor(now / 3600000) + TTL 7200
 * - For per-day: Math.floor(now / 86400000) + TTL 172800
 *
 * @param userId - Clerk user ID from JWT
 * @param env - Environment (for KV access)
 * @returns allowed: boolean, remaining: number of requests left
 */
async function checkRateLimit(userId: string, env: Env): Promise<{ allowed: boolean; remaining: number }> {
	const now = Date.now();
	const minute = Math.floor(now / 60000); // Current minute bucket
	const rateLimitKey = `ratelimit:${userId}:${minute}`;

	// Get current count from KV
	const currentCount = await env.USAGE_KV.get(rateLimitKey);
	const count = currentCount ? parseInt(currentCount) : 0;

	// Check if limit exceeded
	if (count >= RATE_LIMIT_PER_MINUTE) {
		return { allowed: false, remaining: 0 };
	}

	// Increment counter with 2-minute TTL (current + next minute buffer)
	// This ensures automatic cleanup without manual deletion
	await env.USAGE_KV.put(rateLimitKey, (count + 1).toString(), { expirationTtl: 120 });

	return { allowed: true, remaining: RATE_LIMIT_PER_MINUTE - count - 1 };
}

/**
 * Get current billing period (calendar month by default)
 *
 * BILLING PERIOD: First day of month 00:00 UTC → Last day of month 23:59 UTC
 *
 * HOW TO CHANGE BILLING PERIOD:
 *
 * FOR WEEKLY BILLING:
 *   const now = new Date();
 *   const dayOfWeek = now.getUTCDay();
 *   const start = new Date(now);
 *   start.setUTCDate(now.getUTCDate() - dayOfWeek); // Go to Sunday
 *   const end = new Date(start);
 *   end.setUTCDate(start.getUTCDate() + 6); // Go to Saturday
 *
 * FOR QUARTERLY BILLING:
 *   const quarter = Math.floor(month / 3);
 *   const start = new Date(Date.UTC(year, quarter * 3, 1));
 *   const end = new Date(Date.UTC(year, (quarter + 1) * 3, 0, 23, 59, 59));
 *
 * FOR ANNUAL BILLING:
 *   const start = new Date(Date.UTC(year, 0, 1));
 *   const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
 *
 * @returns { start: YYYY-MM-DD, end: YYYY-MM-DD }
 */
function getCurrentPeriod(): { start: string; end: string } {
	const now = new Date();
	const year = now.getUTCFullYear();
	const month = now.getUTCMonth();

	// First day of current month at 00:00 UTC
	const start = new Date(Date.UTC(year, month, 1));

	// Last day of current month at 23:59:59.999 UTC
	// (month + 1, 0) gives last day of current month
	const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

	return {
		start: start.toISOString().split('T')[0], // YYYY-MM-DD
		end: end.toISOString().split('T')[0],     // YYYY-MM-DD
	};
}

/**
 * Check if usage data needs reset for new billing period
 *
 * LOGIC:
 * - If no period tracked → needs reset (first time user)
 * - If periodStart doesn't match current period start → needs reset (new month)
 *
 * APPLIES TO: Free tier only (Pro tier has unlimited usage)
 *
 * @param usageData - Current usage data from KV
 * @returns true if usage should be reset to 0
 */
function shouldResetUsage(usageData: UsageData): boolean {
	const currentPeriod = getCurrentPeriod();

	// If no period tracked, needs reset (first time user)
	if (!usageData.periodStart || !usageData.periodEnd) {
		return true;
	}

	// If current date is after period end, needs reset (new billing period)
	return currentPeriod.start !== usageData.periodStart;
}

// ============================================================================
// MAIN FETCH HANDLER
// ============================================================================

export default {
	/**
	 * Main request handler for Cloudflare Worker
	 *
	 * FLOW:
	 * 1. Validate environment variables (fails fast if misconfigured)
	 * 2. Handle CORS preflight (OPTIONS requests)
	 * 3. Check health endpoint (no auth required)
	 * 4. Handle Stripe webhook (signature verification, no JWT)
	 * 5. Verify JWT token for protected routes
	 * 6. Check rate limiting (100 req/min per user)
	 * 7. Route to appropriate handler
	 *
	 * SECURITY:
	 * - Dynamic CORS validation (no wildcard)
	 * - JWT verification on every protected request
	 * - Rate limiting per user
	 * - Stripe webhook signature verification
	 */
	async fetch(request: Request, env: Env): Promise<Response> {
		// ====================================================================
		// STEP 1: VALIDATE ENVIRONMENT (Fast Fail)
		// ====================================================================
		const envCheck = validateEnv(env);
		if (!envCheck.valid) {
			console.error('Environment validation failed:', envCheck.missing);
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

		// ====================================================================
		// STEP 2: CORS HANDLING (Dynamic Origin Validation with Env Var)
		// ====================================================================
		/**
		 * CORS STRATEGY: Dynamic origin validation (no wildcard)
		 *
		 * WHY NO WILDCARD:
		 * - Wildcard ('*') allows ANY website to call your API
		 * - This exposes user JWTs and data to malicious sites
		 * - We use explicit origin allowlist + regex patterns instead
		 *
		 * TWO WAYS TO CONFIGURE:
		 *
		 * METHOD 1: ENV VARIABLE (Recommended for Production)
		 * ------------------------------------------------
		 * Set ALLOWED_ORIGINS as comma-separated list:
		 *
		 * wrangler secret put ALLOWED_ORIGINS
		 * # Enter: https://clerk-frontend.pages.dev,https://app.panacea-tech.net
		 *
		 * This allows dynamic updates without code changes.
		 *
		 * METHOD 2: HARDCODED DEFAULTS (Development Fallback)
		 * ------------------------------------------------
		 * If ALLOWED_ORIGINS not set, uses defaults below:
		 * - localhost:5173 (Vite dev server)
		 * - clerk-frontend.pages.dev (CF Pages production)
		 * - app.panacea-tech.net (Custom domain)
		 *
		 * REGEX PATTERNS (Always Active):
		 * ------------------------------------------------
		 * These patterns match dynamically generated URLs:
		 * - *.clerk-frontend.pages.dev (CF Pages preview branches)
		 * - *.vercel.app (Vercel deployments, for testing)
		 *
		 * HOW TO ADD NEW ORIGIN:
		 * ------------------------------------------------
		 * Option A: Update env var (no code change)
		 *   wrangler secret put ALLOWED_ORIGINS
		 *   # Add new origin to comma-separated list
		 *
		 * Option B: Update defaults below (requires redeploy)
		 *   defaultAllowedOrigins: ['https://new-domain.com', ...]
		 *
		 * Option C: Add regex pattern (for wildcard subdomains)
		 *   /^https:\/\/[a-z0-9-]+\.myapp\.com$/.test(origin)
		 *
		 * SECURITY NOTES:
		 * ------------------------------------------------
		 * - Origins aren't "secrets" (visible in Network tab)
		 * - BUT limiting them prevents unauthorized API access
		 * - Preview URLs use regex to avoid hardcoding thousands of hashes
		 * - Localhost only allowed in dev (remove for production if needed)
		 */
		const origin = request.headers.get('Origin') || '';

		// Parse allowed origins from env var OR use defaults
		const defaultAllowedOrigins = [
			'https://app.panacea-tech.net',        // Production custom domain
			'https://clerk-frontend.pages.dev',    // CF Pages production
			'http://localhost:5173',               // Vite dev server
			'http://localhost:3000',               // Legacy Next.js dev
			'http://localhost:4011',               // Alt dev port
		];

		const allowedOrigins = env.ALLOWED_ORIGINS
			? env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) // Parse from env var
			: defaultAllowedOrigins;                             // Fall back to defaults

		// Check if origin is allowed (exact match OR regex pattern)
		const isAllowedOrigin =
			allowedOrigins.includes(origin) ||
			// CF Pages preview URLs: abc123.clerk-frontend.pages.dev
			/^https:\/\/[a-z0-9-]+\.clerk-frontend\.pages\.dev$/.test(origin) ||
			// Vercel deployments (for testing): foo-bar.vercel.app
			/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);

		// Build CORS headers with validated origin
		const corsHeaders = {
			// If origin allowed, echo it back. Otherwise, use first allowed origin as safe fallback
			'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
		};

		// Debug logging (only in dev - remove for production if needed)
		if (!isAllowedOrigin && origin) {
			console.warn(`[CORS] Rejected origin: ${origin}`);
			console.warn(`[CORS] Allowed origins: ${allowedOrigins.join(', ')}`);
		}

		// Handle CORS preflight (OPTIONS requests)
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204, // No Content
				headers: corsHeaders
			});
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
			// Create Clerk client (used later in handleCreateCheckout for email)
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

			// ====================================================================
			// GET PLAN FROM JWT CLAIMS (SSOT - No unnecessary API call!)
			// ====================================================================
			/**
			 * Plan is already in the JWT from Clerk's "pan-api" template
			 * Template config: { "plan": "{{user.public_metadata.plan}}" }
			 *
			 * WHY NOT call clerkClient.users.getUser()?
			 * - JWT is already verified and decoded
			 * - Plan is in sessionClaims.plan (from JWT template)
			 * - No extra network call to Clerk API
			 * - Faster response time
			 * - True "JWT-only" stateless architecture
			 *
			 * When does plan update?
			 * - Stripe webhook updates Clerk publicMetadata
			 * - User gets new JWT on next sign-in/token refresh
			 * - New JWT includes updated plan automatically
			 */
			const plan = ((auth.sessionClaims as any)?.plan as 'free' | 'pro') || 'free';
			console.log(`✅ User ${userId} authenticated with plan: ${plan} (from JWT)`);

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

