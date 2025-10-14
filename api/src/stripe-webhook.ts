import { createClerkClient } from '@clerk/backend';
import Stripe from 'stripe';

interface Env {
	CLERK_SECRET_KEY: string;
	STRIPE_SECRET_KEY: string;
	STRIPE_WEBHOOK_SECRET?: string;
}

export async function handleStripeWebhook(
	request: Request,
	env: Env
): Promise<Response> {
	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		return new Response(JSON.stringify({ error: 'No signature' }), { status: 400 });
	}

	// Verify webhook signature
	const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
		apiVersion: '2024-12-18.acacia',
	});

	let event: Stripe.Event;
	try {
		// Require webhook secret in production (fail hard if missing)
		if (!env.STRIPE_WEBHOOK_SECRET) {
			console.error('❌ STRIPE_WEBHOOK_SECRET required - webhook signature verification mandatory');
			return new Response(
				JSON.stringify({ error: 'Webhook secret not configured' }),
				{ status: 500 }
			);
		}

		// Verify the webhook signature
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			env.STRIPE_WEBHOOK_SECRET
		);
		console.log('✅ Webhook signature verified');
	} catch (err: any) {
		console.error('Webhook signature verification failed:', err.message);
		return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 });
	}

	const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

	// Handle different event types
	switch (event.type) {
		case 'checkout.session.completed':
			// For checkout, userId is in client_reference_id
			const session = event.data.object as Stripe.Checkout.Session;
			const userId = session.client_reference_id || session.metadata?.userId;

			if (!userId) {
				console.error('No userId in checkout session');
				return new Response(JSON.stringify({ error: 'No userId' }), { status: 400 });
			}

			// Update Clerk user metadata to 'pro'
			await clerkClient.users.updateUser(userId, {
				publicMetadata: {
					plan: 'pro',
					stripeCustomerId: session.customer as string,
				},
			});

			console.log(`Updated user ${userId} to pro plan after checkout`);
			break;

		case 'customer.subscription.created':
		case 'customer.subscription.updated':
			// Extract customer metadata (should include userId)
			const subscription = event.data.object as Stripe.Subscription;
			const subUserId = subscription.metadata?.userId;

			if (!subUserId) {
				console.error('No userId in subscription metadata');
				return new Response(JSON.stringify({ error: 'No userId' }), { status: 400 });
			}

			// Update Clerk user metadata to 'pro'
			await clerkClient.users.updateUser(subUserId, {
				publicMetadata: {
					plan: 'pro',
					stripeCustomerId: subscription.customer as string,
					subscriptionId: subscription.id,
				},
			});

			console.log(`Updated user ${subUserId} to pro plan`);
			break;

		case 'customer.subscription.deleted':
			const deletedSubscription = event.data.object as Stripe.Subscription;
			const deletedUserId = deletedSubscription.metadata?.userId;

			if (!deletedUserId) {
				console.error('No userId in deleted subscription metadata');
				return new Response(JSON.stringify({ error: 'No userId' }), { status: 400 });
			}

			// Downgrade user back to free
			await clerkClient.users.updateUser(deletedUserId, {
				publicMetadata: {
					plan: 'free',
				},
			});

			console.log(`Downgraded user ${deletedUserId} to free plan`);
			break;

		default:
			console.log(`Unhandled event type: ${event.type}`);
	}

	return new Response(JSON.stringify({ received: true }), { status: 200 });
}
