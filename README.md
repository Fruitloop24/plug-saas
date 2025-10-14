# Clerk + Stripe SaaS Foundation

A production-ready authentication and payment system built on Cloudflare Workers, Clerk, and Stripe. This provides a secure, stateless foundation for building SaaS applications with JWT-based auth and subscription billing.

## What You Get

- **JWT-only authentication** with Clerk (no sessions, no cookies)
- **Stripe subscription payments** with automatic user upgrades/downgrades
- **Cloudflare Workers API** backend (370 lines of TypeScript)
- **Usage tracking** with free/pro tier gating
- **Webhook signature verification** for secure Stripe integration
- **TypeScript throughout** with full type safety
- **Next.js frontend** with Clerk components

## Architecture

```
┌──────────────┐
│   Frontend   │  Next.js + Clerk
│  (React/TS)  │──────┐
└──────────────┘      │
                      ├──> Bearer JWT Token
                      │
┌──────────────┐      ▼
│  Cloudflare  │  ┌─────────────────┐
│   Workers    │◀─┤  Clerk Backend  │
│  (Stateless) │  └─────────────────┘
└──────────────┘
      │  │  │
      │  │  └──────> Stripe API (payments)
      │  └─────────> KV Storage (usage tracking)
      └────────────> Clerk API (user metadata)
```

**Token Flow:**
1. User signs in via Clerk → gets JWT with custom template `pan-api`
2. JWT includes `userId` + `plan` (free/pro) claims
3. Frontend calls API with `Authorization: Bearer <token>`
4. Worker verifies JWT, extracts userId/plan, routes to handlers
5. Handlers check usage limits and execute business logic

**Payment Flow:**
1. User clicks "Upgrade to Pro" → frontend creates Stripe checkout session
2. User completes payment on Stripe → webhook fires to worker
3. Worker verifies webhook signature → updates Clerk user metadata
4. User refreshes page → new JWT includes `plan: "pro"`
5. API automatically grants unlimited access

## Project Structure

```
clerk/
├── api/                          # Cloudflare Worker (Backend)
│   ├── src/
│   │   ├── index.ts              # Main worker (252 lines)
│   │   └── stripe-webhook.ts     # Webhook handler (118 lines)
│   ├── wrangler.toml             # Worker config
│   ├── .dev.vars                 # Local env vars (NEVER COMMIT)
│   ├── .env.example              # Template for credentials
│   └── package.json
│
├── frontend/                     # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/page.tsx    # User dashboard
│   │   │   ├── sign-in/              # Clerk sign-in
│   │   │   └── sign-up/              # Clerk sign-up
│   │   └── middleware.ts         # Clerk auth middleware
│   ├── .env.local                # Local env vars (NEVER COMMIT)
│   ├── .env.example              # Template for credentials
│   └── package.json
│
├── .gitignore                    # Comprehensive ignore rules
└── README.md                     # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account (free tier works)
- Clerk account (free tier: 10K MAU)
- Stripe account (free, pay per transaction)

### 1. Clone and Install

```bash
git clone git@github.com:Fruitloop24/clerk.git
cd clerk

# Install API dependencies
cd api
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Go to **JWT Templates** → Create new template:
   - Name: `pan-api`
   - Add claim: `plan` → `{{user.public_metadata.plan}}`
4. Copy your API keys (you'll need these next)

### 3. Configure Environment Variables

**API (.dev.vars):**

```bash
cd api
cp .env.example .dev.vars
# Edit .dev.vars with your actual keys
```

Required variables:
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `STRIPE_PRICE_ID` - Create a product/price in Stripe, use price ID
- `FRONTEND_URL` - e.g., `http://localhost:3000`

**Frontend (.env.local):**

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your actual keys
```

Required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_API_URL` - e.g., `http://localhost:8787`

### 4. Set Up Stripe Webhook (Local Development)

```bash
# Install Stripe CLI
# See: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local worker
stripe listen --forward-to http://localhost:8787/webhook/stripe
```

The CLI will output a webhook signing secret (`whsec_...`). You can optionally add this to `.dev.vars` as `STRIPE_WEBHOOK_SECRET` for testing signature verification in dev.

### 5. Run the Stack

**Terminal 1 - API Worker:**
```bash
cd api
npm run dev
# Worker runs on http://localhost:8787
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Next.js runs on http://localhost:3000
```

**Terminal 3 - Stripe Webhooks:**
```bash
stripe listen --forward-to http://localhost:8787/webhook/stripe
```

### 6. Test the Flow

1. Open http://localhost:3000
2. Sign up for an account
3. Go to dashboard → see usage counter (5 free requests)
4. Click "Make API Request" 5 times → hits limit
5. Click "Upgrade to Pro" → complete Stripe checkout
6. Return to dashboard → now unlimited requests

## API Endpoints

All endpoints require `Authorization: Bearer <jwt-token>` header (except webhook).

### POST /api/data

Process a request and track usage.

**Response (success):**
```json
{
  "success": true,
  "data": { "message": "Request processed successfully" },
  "usage": {
    "count": 3,
    "limit": 5,  // or "unlimited" for pro
    "plan": "free"
  }
}
```

**Response (limit reached):**
```json
{
  "error": "Free tier limit reached",
  "usageCount": 5,
  "limit": 5,
  "message": "Please upgrade to Pro for unlimited access"
}
```

### GET /api/usage

Check current usage stats.

**Response:**
```json
{
  "userId": "user_abc123",
  "plan": "free",
  "usageCount": 3,
  "limit": 5,
  "remaining": 2
}
```

### POST /api/create-checkout

Create a Stripe checkout session for upgrading to Pro.

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### POST /webhook/stripe

Stripe webhook endpoint (no auth required, signature verified).

Handles:
- `checkout.session.completed` → upgrade user to pro
- `customer.subscription.updated` → maintain pro status
- `customer.subscription.deleted` → downgrade to free

## Cost Structure

This stack is **essentially free until you succeed**:

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| **Cloudflare Workers** | 100K req/day | $5/month for 10M req |
| **Clerk** | 10K MAU | $25/month |
| **Stripe** | No fixed cost | 2.9% + 30¢ per transaction |
| **KV Storage** | 100K reads/day | $0.50/million reads |

**Example costs:**
- 100 free-tier users: **$0/month**
- 1,000 users: **~$0/month**
- 10,000 users: **~$50/month** (Clerk + CF)
- Stripe fees only when you make money

## Adding Your Business Logic

The auth/payment foundation is **completely separate** from your product code.

**Example: Add a new API endpoint**

```typescript
// In api/src/index.ts

// 1. Add route (after line 98)
if (url.pathname === '/api/my-feature' && request.method === 'POST') {
  return await handleMyFeature(userId, plan, env, corsHeaders);
}

// 2. Add handler function
async function handleMyFeature(
  userId: string,
  plan: 'free' | 'pro',
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // Check if pro is required
  if (plan !== 'pro') {
    return new Response(
      JSON.stringify({ error: 'Pro plan required' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Your business logic here
  const result = await doYourThing(userId);

  return new Response(
    JSON.stringify({ success: true, data: result }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

**That's it.** Auth, billing, and user isolation are handled automatically.

## Deployment

### Deploy API to Cloudflare

```bash
cd api

# Set production secrets
wrangler secret put CLERK_SECRET_KEY
wrangler secret put CLERK_PUBLISHABLE_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET  # Get from Stripe dashboard
wrangler secret put STRIPE_PRICE_ID
wrangler secret put FRONTEND_URL  # Your production domain

# Deploy
npm run deploy
```

Your worker will be available at: `https://pan-api.your-subdomain.workers.dev`

### Set Up Production Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://pan-api.your-subdomain.workers.dev/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add to Cloudflare: `wrangler secret put STRIPE_WEBHOOK_SECRET`

### Deploy Frontend to Vercel

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

Or use Cloudflare Pages, Netlify, etc.

## Security Features

✅ **JWT-only auth** (no session cookies to steal)
✅ **Webhook signature verification** (rejects fake Stripe webhooks)
✅ **Environment variable isolation** (secrets never committed)
✅ **User data isolation** (all queries keyed by userId)
✅ **TypeScript type safety** (catch errors at compile time)
✅ **CORS configured** (protect against CSRF)

**⚠️ Production Checklist:**
- [ ] All secrets set via `wrangler secret put`
- [ ] Stripe webhook secret configured
- [ ] CORS updated to whitelist your domain
- [ ] Clerk JWT template created (`pan-api`)
- [ ] Stripe webhook endpoint added in dashboard

## Troubleshooting

**"Invalid token" errors:**
- Check JWT template name is `pan-api` in Clerk
- Verify `CLERK_SECRET_KEY` is correct in `.dev.vars`
- Make sure you're passing token as `Authorization: Bearer <token>`

**"Free tier limit reached" not updating after payment:**
- Check Stripe webhook listener is running: `stripe listen ...`
- Verify webhook endpoint is `/webhook/stripe`
- Check worker logs for webhook events
- User must refresh page to get new JWT with updated plan

**"No userId in checkout session" webhook error:**
- Checkout session needs `client_reference_id` set to userId
- Check `handleCreateCheckout()` in `api/src/index.ts:220`

**Worker not starting:**
- Run `npm install` in `api/` directory
- Check `.dev.vars` exists and has all required variables
- Make sure no other process is using port 8787

## Tech Stack

- **Backend:** Cloudflare Workers (V8 isolates, edge deployment)
- **Auth:** Clerk (JWT with custom templates)
- **Payments:** Stripe (Checkout + webhooks)
- **Storage:** Cloudflare KV (usage tracking)
- **Frontend:** Next.js 14 (App Router)
- **Language:** TypeScript (full stack)

## Contributing

This is a foundation template - fork it and build your product on top!

If you find bugs or have improvements:
1. Open an issue
2. Submit a PR
3. Tag @Fruitloop24

## License

MIT License - use this however you want.

## Credits

Built as a minimal, production-ready foundation for SaaS apps. No frameworks, no bloat, just auth + payments done right.

**Code Review Rating:** 7.5/10 (agent-evaluated)

Master branch to master branch. Let's ship it.
