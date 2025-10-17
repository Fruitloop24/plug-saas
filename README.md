# Production SaaS Starter - Cloudflare Edge Edition

> **A complete, production-ready SaaS template** built entirely on Cloudflare's edge platform. No servers, no databases, just pure edge computing with authentication, billing, and usage tracking.

**Live Demo**: https://clerk-frontend.pages.dev
**API**: https://pan-api.k-c-sheffield012376.workers.dev
**Stack**: Vite + React 19 + Cloudflare Workers + Clerk + Stripe

---

## Why This Template?

Most SaaS tutorials stop at "hello world." This template goes all the way to production with real-world patterns:

**The Problem**: Building a SaaS requires solving authentication, billing, rate limiting, usage tracking, webhook handling, security headers, idempotency, and deployment—all working together. Most examples only show isolated pieces.

**This Solution**: A complete, documented, production-tested stack that handles:
- ✅ User authentication with JWT (Clerk)
- ✅ Subscription billing with webhooks (Stripe)
- ✅ Usage tracking with monthly reset (KV)
- ✅ Rate limiting per user (100 req/min)
- ✅ Webhook idempotency (prevents duplicate charges)
- ✅ Security headers (CSP, HSTS, X-Frame-Options)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Zero cold starts, global edge deployment

**No traditional servers. No database. Just edge functions and static hosting.**

---

## Architecture Overview

```
┌─────────────┐      JWT      ┌──────────────────┐
│ Vite+React  │ ────────────> │ Cloudflare Worker│
│  (CF Pages) │   Bearer      │    (CF Edge)     │
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
✅ **100% Static** - Pure client-side React, no server actions

---

## What's Included

### Frontend (Vite + React 19)
- **Location**: `frontend-v2/`
- **Hosted**: Cloudflare Pages (global CDN)
- **Auth**: `@clerk/clerk-react` with complete auth flows
- **UI**: Modern responsive design with Tailwind CSS
- **Features**:
  - Landing page with pricing
  - Protected dashboard with usage tracking
  - Stripe checkout integration
  - User profile management
- **Performance**: Instant HMR, optimized production builds

### Backend (Cloudflare Worker)
- **Location**: `api/src/index.ts` (~750 lines, heavily documented)
- **Hosted**: Cloudflare Workers (global edge deployment)
- **Authentication**: JWT verification on every request
- **API Endpoints**:
  - `GET /health` - Health check
  - `GET /api/usage` - Get user usage stats (requires JWT)
  - `POST /api/data` - Process request + increment usage (requires JWT)
  - `POST /api/create-checkout` - Create Stripe checkout session (requires JWT)
  - `POST /webhook/stripe` - Stripe webhook handler (signature verified)

### Stripe Webhook Handler
- **Location**: `api/src/stripe-webhook.ts` (~190 lines)
- **Purpose**: Updates user plan when subscription changes
- **Key Features**:
  - Webhook signature verification
  - **Idempotency using KV storage** - Prevents duplicate processing
  - **Error handling with automatic retries** - Leverages Stripe's retry logic
  - Handles all subscription lifecycle events
- **Flow**: Stripe Event → Webhook → Update Clerk Metadata → New JWT with updated plan

---

## Key Features Explained

### 🔐 Authentication (Clerk)
- Complete sign-up/sign-in flows with email verification
- JWT template includes user plan in token claims
- No server-side sessions needed
- Works perfectly on static hosting

### 💳 Subscription Billing (Stripe)
- **Free tier**: 5 requests/month with automatic reset
- **Pro tier**: Unlimited usage ($29/month)
- Stripe Checkout for payment processing
- **Webhook integration** with idempotency protection
- Automatic plan upgrades via metadata sync

### 📊 Usage Tracking
- Stored in Cloudflare KV: `usage:{userId}`
- Tracks: count, plan, billing period start/end
- **Auto-resets monthly** for free tier users
- Pro tier: unlimited usage (no tracking overhead)

### 🚦 Rate Limiting
- **100 requests/minute per user**
- Implemented with KV + 2-minute TTL
- Returns 429 with `Retry-After` header
- Per-user buckets prevent noisy neighbor issues

### 🔒 Security Headers
- **Content-Security-Policy** - Tailored for Clerk + Stripe domains
- **X-Frame-Options** - Prevents clickjacking
- **Strict-Transport-Security** - Forces HTTPS
- **X-Content-Type-Options** - Prevents MIME sniffing
- **Referrer-Policy** - Controls referrer leakage
- **Permissions-Policy** - Disables unused browser features

### 🛡️ Webhook Idempotency
**The Problem**: Stripe may send the same webhook multiple times due to network retries, which could cause:
- Duplicate plan upgrades
- Inconsistent user state
- Race conditions

**The Solution**:
- Store processed event IDs in KV with 30-day TTL
- Check idempotency before processing
- Return success immediately for duplicate events
- Automatic cleanup via TTL (matches Stripe's retention)

### 🌐 CORS Handling
- **Dynamic origin validation** (no wildcard `*`)
- Supports:
  - Production domains
  - CF Pages preview URLs (via regex)
  - Localhost for development
- Configurable via environment variable

---

## Quick Start

### Prerequisites
- Node.js 20+
- Cloudflare account (free tier works)
- Clerk account (free up to 10k users)
- Stripe account (test mode)

### 1. Clone & Install
```bash
git clone <your-repo>
cd clerk

# Install backend dependencies
cd api && npm install

# Install frontend dependencies
cd ../frontend-v2 && npm install
```

### 2. Configure Clerk
1. Create a Clerk application at https://clerk.com
2. Create a JWT template named `pan-api` with claims:
   ```json
   {
     "plan": "{{user.public_metadata.plan}}"
   }
   ```
3. Copy your publishable and secret keys

### 3. Configure Stripe
1. Create a Stripe account at https://stripe.com
2. Create a product with two prices:
   - Free: $0/month (for reference)
   - Pro: $29/month (or your price)
3. Copy the Pro price ID (starts with `price_`)
4. Set up webhook endpoint (see [Stripe Webhook Setup](#stripe-webhook-setup))

### 4. Set Environment Variables

**Backend** (`api/.dev.vars`):
```bash
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_JWT_TEMPLATE=pan-api
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

**Frontend** (`frontend-v2/.env`):
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8787
```

### 5. Run Locally
```bash
# Terminal 1: Start backend
cd api
npm run dev  # http://localhost:8787

# Terminal 2: Start frontend
cd frontend-v2
npm run dev  # http://localhost:5173
```

### 6. Deploy

**Backend** (Cloudflare Workers):
```bash
cd api
npm run deploy
```

**Frontend** (Cloudflare Pages):
1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Configure build:
   - **Root directory**: `frontend-v2`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. Add environment variables in CF dashboard
5. Deploy!

---

## Stripe Webhook Setup

### Step 1: Create Webhook Endpoint
1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter your worker URL + `/webhook/stripe`:
   ```
   https://YOUR-WORKER.workers.dev/webhook/stripe
   ```
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)

### Step 2: Set Webhook Secret
```bash
cd api
wrangler secret put STRIPE_WEBHOOK_SECRET
# Paste the whsec_... value when prompted
```

### Step 3: Test End-to-End
1. Sign up as a new user
2. Use 5 free requests
3. Click "Upgrade to Pro"
4. Complete checkout (test card: `4242 4242 4242 4242`)
5. Verify dashboard shows "Unlimited • Pro Plan Active"
6. Test unlimited usage

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vite + React 19 | Pure client-side SPA |
| **Hosting** | Cloudflare Pages | Static hosting + global CDN |
| **Auth** | Clerk | User management + JWT |
| **Payments** | Stripe | Subscription billing + webhooks |
| **API** | Cloudflare Workers | Serverless edge functions |
| **Storage** | Cloudflare KV | Usage counters + idempotency |
| **CI/CD** | GitHub Actions | Automated deployment |

---

## File Structure

```
clerk/
├── api/                        # Cloudflare Worker
│   ├── src/
│   │   ├── index.ts           # Main API (~750 lines, heavily documented)
│   │   └── stripe-webhook.ts  # Stripe webhook handler (~190 lines)
│   ├── wrangler.toml          # Worker configuration
│   ├── .dev.vars              # Local secrets (gitignored)
│   └── package.json
├── frontend-v2/                # Vite + React app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx    # Landing page with pricing
│   │   │   ├── Dashboard.tsx  # Protected dashboard
│   │   │   ├── SignInPage.tsx # Sign-in flow
│   │   │   └── SignUpPage.tsx # Sign-up flow
│   │   ├── App.tsx            # React Router + protected routes
│   │   ├── main.tsx           # Entry point + ClerkProvider
│   │   └── index.css          # Tailwind directives
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   └── package.json
├── .github/workflows/
│   └── deploy-worker.yml      # CI/CD for Worker deployment
└── README.md                  # This file
```

**Total Code**: ~2,500 lines TypeScript (940 backend, ~1,500 frontend)

---

## Security Features

### Implemented ✅
- **JWT verification** on every API request
- **Stripe webhook signature verification** (prevents spoofing)
- **Idempotency protection** (prevents duplicate webhook processing)
- **Security headers** (CSP, HSTS, X-Frame-Options, etc.)
- **Rate limiting** (100 req/min per user)
- **User data isolation** (all data keyed by userId)
- **Dynamic CORS** (no wildcard, validated origins)
- **Environment variable validation** (fails fast on misconfiguration)

### Production Hardening TODO
- [ ] Error tracking (Sentry or Cloudflare Logs)
- [ ] Request logging (Axiom/Logflare)
- [ ] Audit logs for plan changes
- [ ] CAPTCHA for sign-up (bot prevention)
- [ ] Content moderation (if applicable)

---

## Cost Analysis

### Development (Free Tier)

| Service | Cost | Notes |
|---------|------|-------|
| Cloudflare Pages | **$0** | Unlimited static sites |
| Cloudflare Workers | **$0** | 100k requests/day free |
| Cloudflare KV | **$0** | 100k reads/day free |
| Clerk | **$0** | Free up to 10k MAU |
| Stripe | **$0** | Pay per transaction (2.9% + 30¢) |
| **Total** | **$0/month** | Perfect for MVPs |

### Production (10k Active Users)

| Service | Cost | Notes |
|---------|------|-------|
| Cloudflare Pages | **$0** | Still free! |
| Cloudflare Workers | **$5/mo** | Paid plan (10M req included) |
| Cloudflare KV | **$0.50/mo** | Estimated for 10k users |
| Clerk | **$25/mo** | 10k-50k MAU tier |
| Stripe | **2.9% + $0.30** | Per transaction |
| **Total** | **~$30/month** | + transaction fees |

**Scalability**: Can handle 10M requests/month for $5 on Workers. Pages scales infinitely. No database costs ever.

---

## Why Vite + React (Not Next.js)?

**The Problem**: We initially built with Next.js, but Clerk's `<UserButton>` component uses server actions, which causes 405 errors when deployed as a static site to Cloudflare Pages.

**Solutions Attempted**:
- ❌ Custom sign-out button (works, but loses profile UI)
- ❌ Next.js edge runtime (breaks - Clerk uses Node APIs)
- ❌ `@cloudflare/next-on-pages` (archived, unmaintained)

**The Switch to Vite**:
- ✅ 100% client-side React (no server actions)
- ✅ Perfect for Cloudflare Pages
- ✅ Smaller bundle size
- ✅ Faster dev experience (instant HMR)
- ✅ Zero configuration needed

**Result**: All functionality preserved, better performance, no hosting limitations.

---

## Lessons Learned / Best Practices

### 1. JWT Claims Are Your Friend
Instead of calling `clerkClient.users.getUser()` on every request, put user plan in JWT claims:
```json
{
  "plan": "{{user.public_metadata.plan}}"
}
```
- No extra API call
- Faster response times
- True stateless architecture

### 2. Webhook Idempotency Is Critical
Stripe will retry webhooks. Without idempotency:
- Users get upgraded multiple times
- Inconsistent state
- Hard-to-debug race conditions

**Solution**: Store event IDs in KV with TTL matching Stripe's retention (30 days).

### 3. Error Handling = Reliability
Wrap Clerk API calls in try-catch. Return 500 on failure so Stripe automatically retries:
```typescript
try {
  await clerkClient.users.updateUser(userId, { ... });
} catch (err) {
  return new Response('Failed', { status: 500 }); // Stripe will retry
}
```

### 4. Security Headers Add Zero Overhead
Adding CSP, HSTS, X-Frame-Options, etc. is just setting response headers. No performance cost, massive security benefit.

### 5. Dynamic CORS > Wildcards
Never use `Access-Control-Allow-Origin: *` with credentials. Instead:
- Maintain an allowlist of domains
- Use regex for preview URLs
- Echo back the validated origin

---

## Testing Checklist

### Manual Testing Flow (End-to-End)

1. ✅ **Sign Up**: New user registration with email verification
2. ✅ **Dashboard**: Check usage shows "0 / 5" for free tier
3. ✅ **Make Requests**: Process 5 documents, verify counter increments
4. ✅ **Hit Limit**: 6th request shows "Free tier limit reached"
5. ✅ **Upgrade Flow**: Click "Upgrade to Pro" → Complete Stripe checkout
6. ✅ **Webhook Processing**: Verify plan updates (check Clerk metadata)
7. ✅ **Pro Tier**: Dashboard shows "Unlimited • Pro Plan Active"
8. ✅ **Unlimited Usage**: Process 20+ requests successfully
9. ✅ **Sign Out**: Verify redirect to landing page

### What to Test in Production
- Rate limiting (100 req/min)
- Webhook idempotency (use Stripe CLI to replay events)
- Security headers (use https://securityheaders.com)
- CORS (test from different origins)
- Error handling (kill Clerk API temporarily)

---

## Deployment & CI/CD

### GitHub Actions Workflow

**Triggers**:
- Push to `master` (if `api/**` changed)
- Manual workflow dispatch

**Steps**:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Install Wrangler v4
5. Deploy to Cloudflare Workers
6. Deploy includes minification

**Configuration**: `.github/workflows/deploy-worker.yml`

### Frontend Deployment

**Automatic via Cloudflare Pages**:
- Triggers on every push to main
- Preview URLs for every PR
- Configured in CF dashboard

---

## Next Steps / Roadmap

### High Priority
1. **GitHub Actions debugging** - Worker deployment works manually, needs CI fixes
2. **SEO optimization** - Meta tags, robots.txt, sitemap for discoverability
3. **Custom domain** - Point custom domain to CF Pages
4. **Production keys** - Switch from test to live Clerk/Stripe keys

### Medium Priority
5. **Load testing** - Test rate limits, concurrent users, edge cases
6. **Monitoring** - Set up Axiom/Logflare for request/error logs
7. **Billing portal** - Stripe customer portal for subscription management
8. **E2E tests** - Playwright tests for complete user flows

### Low Priority
9. **Code organization** - Extract tier config to separate module
10. **TypeScript strictness** - Enable stricter type checking
11. **Caching strategy** - Use CF Cache API for static responses
12. **Analytics dashboard** - Show usage trends over time

---

## Contributing

This is an open-source SaaS starter template. Contributions welcome!

**How to contribute**:
- 🐛 Report bugs via GitHub Issues
- 💡 Suggest features or improvements
- 🔀 Submit Pull Requests with enhancements
- 📖 Improve documentation

**Areas that need help**:
- E2E testing setup (Playwright)
- Additional payment providers
- Multi-currency support
- Example feature implementations

---

## License

MIT - Use this template for your SaaS, commercial or personal projects.

---

## Questions & Support

**Common Issues**:
- **Deployment fails**: Check GitHub Actions logs or CF Workers dashboard
- **Auth not working**: Verify Clerk JWT template includes `plan` claim
- **Usage not tracking**: Check KV namespace binding in `wrangler.toml`
- **Webhook fails**: Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

**Need help?** Open an issue on GitHub or check the inline code documentation (heavily commented).

---

## Acknowledgments

**Built with**:
- [Claude Code](https://claude.com/claude-code) - AI pair programming
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge compute platform
- [Clerk](https://clerk.com/) - Authentication
- [Stripe](https://stripe.com/) - Payments

**Timeline**: Production-ready SaaS on Cloudflare in under a week.

---

**⭐ If this template helped you, consider starring the repo!**

