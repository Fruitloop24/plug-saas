# DocuFlow AI - Production SaaS Starter

**A stateless, JWT-only SaaS application** with authentication, subscription billing, usage tracking, and rate limiting.

**Live Demo**: https://pandoc-omega.vercel.app/
**API**: https://pan-api.k-c-sheffield012376.workers.dev
**Stack**: Next.js (Vercel) + Cloudflare Workers + Clerk + Stripe

---

## Architecture Overview

```
┌─────────────┐      JWT      ┌──────────────────┐
│   Next.js   │ ────────────> │ Cloudflare Worker│
│  (Vercel)   │   Bearer      │    (CF Edge)     │
└─────────────┘               └──────────────────┘
       │                              │
       │                              │
       v                              v
┌─────────────┐               ┌──────────────────┐
│    Clerk    │               │   Stripe + KV    │
│   (Auth)    │               │  (Billing+Data)  │
└─────────────┘               └──────────────────┘
```

### Core Design Principles

✅ **JWT-only** - No sessions, no cookies, fully stateless
✅ **User isolation** - All data keyed by `userId` from JWT claims
✅ **No database** - Clerk for identity, Stripe for billing, KV for counters
✅ **Edge-native** - Deploy globally, scale infinitely
✅ **Portable** - Not locked to any single vendor

---

## What's Built

### Frontend (Next.js 15 + App Router)
- 📍 **Location**: `frontend/`
- 🚀 **Hosted**: Vercel (auto-deploy on push to `master`)
- 🔐 **Auth**: Clerk's `<UserButton>` with profile management
- 🎨 **UI**: Modern blue/slate theme, responsive design
- 📊 **Features**: Landing page, dashboard, usage tracking, Stripe checkout

### Backend (Cloudflare Worker)
- 📍 **Location**: `api/src/index.ts` (394 lines)
- 🚀 **Hosted**: Cloudflare Workers (auto-deploy via GitHub Actions)
- 🔐 **Auth**: Clerk JWT verification on every request
- 🎯 **Endpoints**:
  - `GET /health` - Health check
  - `GET /api/usage` - Get user usage stats (requires JWT)
  - `POST /api/data` - Process request + increment usage (requires JWT)
  - `POST /api/create-checkout` - Create Stripe checkout session (requires JWT)
  - `POST /webhook/stripe` - Stripe webhook handler (no auth, signature verified)

### Stripe Webhook Handler
- 📍 **Location**: `api/src/stripe-webhook.ts` (121 lines)
- 🎯 **Purpose**: Updates Clerk user metadata when subscription succeeds
- ✅ **Signature verification**: Uses `STRIPE_WEBHOOK_SECRET`
- 🔄 **Flow**: Checkout → Webhook → Update Clerk `public_metadata.plan` → New JWT

---

## Features

### ✅ Authentication
- Clerk handles all auth flows (sign-up, sign-in, profile, sign-out)
- JWT template `pan-api` includes user plan in claims
- No server-side sessions - pure JWT validation

### ✅ Usage Tracking
- Stored in Cloudflare KV: `usage:{userId}`
- Tracks: count, plan, billing period start/end
- Auto-resets monthly for free tier
- Pro tier: unlimited usage

### ✅ Rate Limiting
- 100 requests/minute per user
- Stored in KV with 2-minute TTL
- Returns 429 with `Retry-After` header

### ✅ Subscription Billing
- Free tier: 5 documents/month
- Pro tier: Unlimited ($29/month)
- Stripe handles all payment processing
- Webhook auto-upgrades user in Clerk

### ✅ CORS Handling
- Dynamic CORS based on request `Origin` header
- Allows: `app.panacea-tech.net`, `*.pan-frontend.pages.dev`, `*.vercel.app`, localhost
- No hardcoded origins - works with changing preview URLs

---

## Environment Variables

### Frontend (Vercel)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=https://pan-api.k-c-sheffield012376.workers.dev
```

### Backend (Cloudflare Worker Secrets)
```bash
# Set via: wrangler secret put <KEY>
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_JWT_TEMPLATE=pan-api
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

**Note**: All keys documented in `api/.dev.vars` (not committed to git)

---

## CI/CD Pipeline

### Automatic Deployments

**Frontend** → Vercel
- Triggers: Every push to `master`
- Build: `npm run build` (standard Next.js)
- Deploy: Automatic via Vercel GitHub integration
- Preview: Every PR gets preview URL

**Backend** → Cloudflare Workers
- Triggers: Changes to `api/**` or manual workflow dispatch
- Build: TypeScript compilation
- Deploy: `wrangler deploy` via GitHub Actions
- File: `.github/workflows/deploy-worker.yml`

**What Happened to CF Pages?**
We initially tried Cloudflare Pages but hit a critical issue: Clerk's `UserButton` uses server actions internally, which POST to static pages → 405 errors. This is a known limitation of `@cloudflare/next-on-pages` (now archived). Switching to Vercel solved this immediately - `UserButton` works perfectly out of the box.

---

## Challenges Faced & Solutions

### 1. Clerk Sign-Out 405 Error on CF Pages
**Problem**: UserButton tries to POST during sign-out, but CF Pages serves static files → 405 Method Not Allowed
**Root Cause**: `@cloudflare/next-on-pages` doesn't register POST routes for non-edge runtime pages
**Attempted Fixes**:
- Custom sign-out button (worked but removed profile dropdown)
- `export const runtime = 'edge'` (breaks build - Clerk uses Node.js APIs)
- @opennextjs/cloudflare (migration required)
**Final Solution**: **Switched to Vercel** - works immediately, no config needed

### 2. CORS Errors with CF Pages Preview URLs
**Problem**: Worker CORS allowed `https://pan-frontend.pages.dev` but CF deploys to hash URLs like `https://ed0fab66.pan-frontend.pages.dev`
**Solution**: Dynamic CORS using request `Origin` header + regex for `*.pan-frontend.pages.dev`

### 3. Clerk Production Keys DNS Verification
**Problem**: Production keys require DNS verification (stuck at 0/5 verified)
**Solution**: Used dev keys for testing, custom domain setup takes 24-48 hours for propagation

### 4. Environment Variable Validation
**Problem**: Vercel rejected env var names with hyphens
**Solution**: Use underscores only in keys (e.g., `NEXT_PUBLIC_API_URL` not `NEXT-PUBLIC-API-URL`)

---

## How to Add/Modify Tiers

### Step 1: Define Tier Limits (Worker)

Edit `api/src/index.ts`:

```typescript
// Current:
const FREE_TIER_LIMIT = 5;

// Add more tiers:
const TIER_LIMITS = {
  free: 5,
  starter: 50,
  pro: 500,
  enterprise: 'unlimited'
} as const;

type Plan = keyof typeof TIER_LIMITS;
```

### Step 2: Update Plan Check Logic

In `handleDataRequest()`:

```typescript
const plan = (user.publicMetadata?.plan as Plan) || 'free';
const limit = TIER_LIMITS[plan];

if (limit !== 'unlimited' && usageData.usageCount >= limit) {
  return new Response(
    JSON.stringify({ error: `${plan} tier limit reached`, limit }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### Step 3: Create Stripe Products

1. Go to Stripe Dashboard → Products
2. Create products: "Starter ($9/mo)", "Pro ($29/mo)", "Enterprise ($99/mo)"
3. Copy price IDs (e.g., `price_1ABC...`)
4. Update worker secrets: `wrangler secret put STRIPE_PRICE_ID_STARTER`

### Step 4: Update Clerk Metadata via Webhook

Edit `api/src/stripe-webhook.ts`:

```typescript
// Map Stripe price IDs to plans
const PRICE_TO_PLAN: Record<string, Plan> = {
  'price_1ABC...': 'starter',
  'price_1XYZ...': 'pro',
  'price_1ENT...': 'enterprise',
};

const plan = PRICE_TO_PLAN[priceId] || 'free';
```

### Step 5: Update Frontend Pricing

Edit `frontend/src/app/page.tsx` to display new tiers in pricing section.

**That's it!** The system automatically:
- ✅ Checks limits based on plan in JWT
- ✅ Updates user plan via Stripe webhook
- ✅ Resets usage monthly for metered tiers
- ✅ Allows unlimited for pro/enterprise

---

## How to Modify Usage Counters

### Change Limits

Edit `api/src/index.ts`:

```typescript
const FREE_TIER_LIMIT = 10; // Change from 5 to 10
```

Deploy: `cd api && npm run deploy`

### Change Billing Period

Current: Monthly (resets on 1st of each month)

```typescript
// In getCurrentPeriod():
const start = new Date(Date.UTC(year, month, 1));
const end = new Date(Date.UTC(year, month + 1, 0));
```

To make weekly:
```typescript
const now = new Date();
const dayOfWeek = now.getUTCDay();
const start = new Date(now);
start.setUTCDate(now.getUTCDate() - dayOfWeek);
const end = new Date(start);
end.setUTCDate(start.getUTCDate() + 7);
```

### Change What Counts as Usage

Currently: Every POST to `/api/data` increments counter

To count different actions:
1. Add new endpoint (e.g., `/api/process-document`)
2. Call `incrementUsage(userId, env)` in handler
3. Extract increment logic to shared function

### View Usage Data

```bash
# Via wrangler CLI:
wrangler kv:key get --binding=USAGE_KV "usage:user_abc123"

# Returns:
{
  "usageCount": 3,
  "plan": "free",
  "periodStart": "2025-10-01",
  "periodEnd": "2025-10-31",
  "lastUpdated": "2025-10-15T14:23:45.123Z"
}
```

---

## Testing Scenarios

### Manual Testing Flow

1. **Sign Up**: Go to https://pandoc-omega.vercel.app/ → Click "Get Started Free"
2. **Dashboard**: Verify usage shows "0 / 5" for free tier
3. **Make Requests**: Click "Process Document" 5 times
4. **Hit Limit**: 6th click should show "Free tier limit reached"
5. **Upgrade**: Click "Upgrade to Pro" → Complete Stripe checkout (use test card `4242 4242 4242 4242`)
6. **Verify Upgrade**: Return to dashboard → should show "Unlimited • Pro Plan Active"
7. **Test Unlimited**: Click "Process Document" 20 times → all succeed
8. **Sign Out**: Click user avatar → "Sign out" → redirects to home

### Test Cases to Cover

| Scenario | Expected Result |
|----------|----------------|
| New user signs up | Gets `plan: free`, `usageCount: 0` |
| Free user makes 5 requests | All succeed, counter increments |
| Free user makes 6th request | 403 error, "Free tier limit reached" |
| Free user upgrades via Stripe | Webhook updates plan to `pro` |
| Pro user makes unlimited requests | All succeed, no limit check |
| User hits rate limit (100 req/min) | 429 error, "Rate limit exceeded" |
| Invalid JWT sent | 401 error, "Invalid token" |
| Missing Authorization header | 401 error, "Missing Authorization header" |
| New month starts | Free tier usage resets to 0 |

### Automated Testing (TODO)

Create test agent that:
1. Signs up 5 test users with different emails
2. Simulates usage patterns (light, moderate, heavy)
3. Tests upgrade flow end-to-end
4. Verifies webhook updates metadata correctly
5. Tests edge cases (concurrent requests, month rollovers)

---

## Local Development

### Start Backend
```bash
cd api
npm install
npm run dev  # Starts on http://localhost:8787
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev  # Starts on http://localhost:3000
```

### Test API Health
```bash
curl http://localhost:8787/health
# Returns: {"status":"ok"}
```

### Test with JWT
1. Sign in at http://localhost:3000
2. Open browser DevTools → Network tab
3. Find request to `/api/usage`
4. Copy `Authorization: Bearer <token>` header
5. Use in curl:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8787/api/usage
```

---

## Deployment Commands

### Deploy Worker
```bash
cd api
npm run deploy
```

### Deploy Frontend
Push to `master` → Vercel auto-deploys

Or manual:
```bash
cd frontend
vercel --prod
```

---

## File Structure

```
clerk/
├── api/                        # Cloudflare Worker
│   ├── src/
│   │   ├── index.ts           # Main API (394 lines)
│   │   └── stripe-webhook.ts  # Stripe handler (121 lines)
│   ├── wrangler.toml          # Worker config
│   ├── .dev.vars              # Local secrets (not committed)
│   └── package.json
├── frontend/                   # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── dashboard/page.tsx  # Dashboard
│   │   │   └── layout.tsx     # Root layout + ClerkProvider
│   │   └── middleware.ts      # Clerk auth middleware
│   ├── .env.local             # Frontend env vars (not committed)
│   └── package.json
├── .github/workflows/
│   └── deploy-worker.yml      # CI/CD for Worker
└── README.md                  # This file
```

**Total Code**: ~2,000 lines TypeScript (515 backend, ~1,500 frontend)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | React framework |
| **Hosting** | Vercel | Frontend hosting |
| **Auth** | Clerk | User management + JWT |
| **Payments** | Stripe | Subscription billing |
| **API** | Cloudflare Workers | Serverless backend |
| **Storage** | Cloudflare KV | Usage counters |
| **CI/CD** | GitHub Actions | Auto-deployment |

---

## Costs

### Current (Development)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | **$0** | Hobby plan, unlimited projects |
| Clerk | **$0** | Free up to 10k MAU |
| Stripe | **$0** | Pay-as-you-go (2.9% + 30¢ per transaction) |
| Cloudflare Workers | **$0** | 100k req/day free |
| Cloudflare KV | **$0** | 100k reads/day free |
| **Total** | **$0/month** | Until you hit free tier limits |

### Production (Estimated at 10k users)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | **$20/month** | Pro plan (if needed) |
| Clerk | **$25/month** | 10k-50k MAU |
| Stripe | **2.9% + $0.30** | Per transaction |
| Cloudflare Workers | **$5/month** | Paid plan (10M req included) |
| **Total** | **~$50/month** | + Stripe fees |

**Scalability**: Can handle 10M requests/month for $5 on CF Workers. Vercel scales automatically.

---

## Security

### Implemented
- ✅ JWT verification on every request
- ✅ Stripe webhook signature verification
- ✅ Environment variable validation
- ✅ Rate limiting (100 req/min)
- ✅ User data isolation (keyed by userId)
- ✅ CORS restrictions (dynamic origin checking)

### TODO (Production Hardening)
- [ ] Add security headers (CSP, X-Frame-Options, etc.)
- [ ] Set up Sentry for error tracking
- [ ] Add request logging (Axiom/Logflare)
- [ ] Implement audit logs for tier changes
- [ ] Add CAPTCHA for sign-up (prevent bots)

---

## Monitoring

### Current Status
- ✅ GitHub Actions logs (build/deploy status)
- ✅ Vercel deployment logs
- ✅ Cloudflare Workers logs (via `wrangler tail`)

### Production Setup (TODO)
1. **Sentry**: Error tracking + alerting
2. **Cloudflare Analytics**: Request metrics, error rates
3. **Stripe Dashboard**: Revenue, churn, MRR
4. **Clerk Dashboard**: User growth, auth metrics

---

## Future Enhancements

### High Priority
- [ ] Add more pricing tiers (Starter, Pro, Enterprise)
- [ ] Email notifications (usage warnings, receipts)
- [ ] Admin dashboard (view all users, usage stats)
- [ ] Export usage data for billing reconciliation

### Medium Priority
- [ ] Team/organization support (shared usage pools)
- [ ] Usage-based billing (overage charges)
- [ ] Custom usage limits per user (enterprise)
- [ ] Webhook event history viewer

### Low Priority
- [ ] Usage analytics dashboard
- [ ] Referral program
- [ ] API key generation (for programmatic access)
- [ ] Webhook delivery retries

---

## Contributing

This is a production SaaS starter template. Feel free to:
- Fork and customize for your use case
- Submit issues for bugs/improvements
- Contribute enhancements via PRs

---

## License

MIT

---

## Questions?

- **Deployment issues**: Check Vercel logs or GitHub Actions
- **Auth problems**: Verify Clerk JWT template includes `plan` claim
- **Usage not incrementing**: Check KV binding in `wrangler.toml`
- **Stripe webhook fails**: Verify `STRIPE_WEBHOOK_SECRET` is set correctly

---

**Built with Claude Code** | October 2025
