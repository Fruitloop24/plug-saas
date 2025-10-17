# DocuFlow AI - Production SaaS Starter

**A stateless, JWT-only SaaS application** with authentication, subscription billing, usage tracking, and rate limiting.

**Live Demo**: https://clerk-frontend.pages.dev
**API**: https://pan-api.k-c-sheffield012376.workers.dev
**Stack**: Vite + React + Cloudflare Workers + Clerk + Stripe

---

## Current Status (Oct 17, 2025)

### PRODUCTION READY - CORE FEATURES COMPLETE

**Live URLs:**
- **Frontend**: https://clerk-frontend.pages.dev (Cloudflare Pages)
- **API**: https://pan-api.k-c-sheffield012376.workers.dev (Cloudflare Workers)
- **Stripe Webhook**: Configured and tested

**What's Working:**
- ✅ **Frontend on CF Pages** - Vite + React deployed, instant global delivery
- ✅ **Backend on CF Workers** - Stateless API with JWT auth
- ✅ **Sign-up/Sign-in flows** - Clerk auth with email verification
- ✅ **Usage tracking** - Free tier (5/month) with monthly reset
- ✅ **Rate limiting** - 100 requests/min per user
- ✅ **Stripe checkout** - Creates payment sessions successfully
- ✅ **Webhook integration** - Auto-upgrades users to Pro after payment
- ✅ **Webhook idempotency** - Prevents duplicate event processing using KV storage
- ✅ **Webhook error handling** - Retry logic with Stripe's automatic retries
- ✅ **Pro plan activation** - Clerk metadata updated, dashboard shows unlimited
- ✅ **CORS security** - Dynamic origin validation (no wildcard)
- ✅ **All secrets configured** - Clerk, Stripe, webhook secret in CF Workers
- ✅ **Deployment** - Both frontend and backend live on Cloudflare

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

## What's Built

### Frontend (Vite + React 19)
- **Location**: `frontend-v2/`
- **Hosted**: Cloudflare Pages
- **Auth**: `@clerk/clerk-react` with full auth flows
- **UI**: Modern blue/slate theme, responsive design, Tailwind CSS
- **Features**: Landing page, dashboard, usage tracking, Stripe checkout
- **Build**: Vite (instant HMR, fast production builds)
- **Routing**: React Router v7 (client-side routing)

### Backend (Cloudflare Worker)
- **Location**: `api/src/index.ts` (689 lines)
- **Hosted**: Cloudflare Workers (global edge deployment)
- **Auth**: Clerk JWT verification on every request
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /api/usage` - Get user usage stats (requires JWT)
  - `POST /api/data` - Process request + increment usage (requires JWT)
  - `POST /api/create-checkout` - Create Stripe checkout session (requires JWT)
  - `POST /webhook/stripe` - Stripe webhook handler (signature verified)

### Stripe Webhook Handler
- **Location**: `api/src/stripe-webhook.ts` (167 lines)
- **Purpose**: Updates Clerk user metadata when subscription changes
- **Features**:
  - Signature verification with `STRIPE_WEBHOOK_SECRET`
  - Idempotency using KV storage (prevents duplicate processing)
  - Error handling with automatic Stripe retries
  - Handles: checkout.session.completed, subscription.created/updated/deleted
- **Flow**: Checkout → Webhook → Update Clerk `publicMetadata.plan` → New JWT

---

## Features

### Authentication
- Clerk handles all auth flows (sign-up, sign-in, profile, sign-out)
- JWT template `pan-api` includes user plan in claims
- No server-side sessions - pure JWT validation
- UserButton works perfectly on static hosting

### Usage Tracking
- Stored in Cloudflare KV: `usage:{userId}`
- Tracks: count, plan, billing period start/end
- Auto-resets monthly for free tier
- Pro tier: unlimited usage

### Rate Limiting
- 100 requests/minute per user
- Stored in KV with 2-minute TTL
- Returns 429 with `Retry-After` header

### Subscription Billing
- Free tier: 5 documents/month
- Pro tier: Unlimited ($29/month)
- Stripe handles all payment processing
- Webhook auto-upgrades user in Clerk with retry logic

### CORS Handling
- Dynamic CORS based on request `Origin` header
- Allows: CF Pages domains, localhost
- No hardcoded origins - works with preview URLs

---

## Environment Variables

### Frontend (Cloudflare Pages)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=https://pan-api.k-c-sheffield012376.workers.dev
```

### Backend (Cloudflare Worker Secrets)
```bash
# Set via: wrangler secret put <KEY>
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_JWT_TEMPLATE=pan-api
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # ← GET THIS FROM STRIPE!
STRIPE_PRICE_ID=price_...
```

**Note**: All keys documented in `api/.dev.vars` (not committed to git)

---

## Stripe Webhook Setup

### Step 1: Configure Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter webhook URL:
   ```
   https://pan-api.k-c-sheffield012376.workers.dev/webhook/stripe
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_...`)

### Step 2: Set Webhook Secret in Worker

```bash
cd api
wrangler secret put STRIPE_WEBHOOK_SECRET
# Paste the whsec_... value when prompted
```

### Step 3: Test It

1. Sign up as a new user
2. Use 5 free requests
3. Click "Upgrade to Pro"
4. Complete Stripe checkout (test card: `4242 4242 4242 4242`)
5. Return to dashboard → should show "Pro Plan Active" and unlimited usage

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
cd frontend-v2
npm install
npm run dev  # Starts on http://localhost:5173
```

### Test API Health
```bash
curl http://localhost:8787/health
# Returns: {"status":"ok"}
```

### Test with JWT
1. Sign in at http://localhost:5173
2. Open browser DevTools → Network tab
3. Find request to `/api/usage`
4. Copy `Authorization: Bearer <token>` header
5. Use in curl:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8787/api/usage
```

---

## Deployment

### Deploy Worker
```bash
cd api
npm run deploy
```

### Deploy Frontend to CF Pages
1. Push `frontend-v2/` to GitHub
2. Connect repo to Cloudflare Pages
3. Build settings:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Root directory**: `frontend-v2`
4. Environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL`
5. Deploy!

---

## CI/CD Pipeline

### Automatic Deployments

**Backend** → Cloudflare Workers
- Triggers: Changes to `api/**` or manual workflow dispatch
- Build: TypeScript compilation
- Deploy: `wrangler deploy` via GitHub Actions
- File: `.github/workflows/deploy-worker.yml`
- Status: Working manually, needs GitHub Actions debugging

**Frontend** → Cloudflare Pages
- Triggers: Every push to `main` (configured in CF Pages dashboard)
- Build command: `npm run build`
- Output directory: `dist`
- Preview: Every PR gets preview URL
- Status: Fully automated

---

## File Structure

```
clerk/
├── api/                        # Cloudflare Worker
│   ├── src/
│   │   ├── index.ts           # Main API (689 lines)
│   │   └── stripe-webhook.ts  # Stripe handler (167 lines)
│   ├── wrangler.toml          # Worker config
│   ├── .dev.vars              # Local secrets (not committed)
│   └── package.json
├── frontend-v2/                # Vite + React app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx    # Landing page
│   │   │   ├── Dashboard.tsx  # Dashboard
│   │   │   ├── SignInPage.tsx # Sign-in
│   │   │   └── SignUpPage.tsx # Sign-up
│   │   ├── App.tsx            # React Router setup
│   │   ├── main.tsx           # Entry point + ClerkProvider
│   │   └── index.css          # Tailwind directives
│   ├── .env                   # Env vars (not committed)
│   ├── .env.example           # Example env vars
│   ├── vite.config.ts         # Vite config
│   ├── tailwind.config.js     # Tailwind config
│   └── package.json
├── .github/workflows/
│   └── deploy-worker.yml      # CI/CD for Worker
└── README.md                  # This file
```

**Total Code**: ~2,000 lines TypeScript (856 backend, ~1,500 frontend)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vite + React 19 | Pure client-side SPA |
| **Hosting** | Cloudflare Pages | Static hosting |
| **Auth** | Clerk | User management + JWT |
| **Payments** | Stripe | Subscription billing |
| **API** | Cloudflare Workers | Serverless backend |
| **Storage** | Cloudflare KV | Usage counters + idempotency |
| **CI/CD** | GitHub Actions | Auto-deployment |

---

## Costs

### Current (Development)

| Service | Cost | Notes |
|---------|------|-------|
| Cloudflare Pages | **$0** | Unlimited static sites |
| Clerk | **$0** | Free up to 10k MAU |
| Stripe | **$0** | Pay-as-you-go (2.9% + 30¢ per transaction) |
| Cloudflare Workers | **$0** | 100k req/day free |
| Cloudflare KV | **$0** | 100k reads/day free |
| **Total** | **$0/month** | Until you hit free tier limits |

### Production (Estimated at 10k users)

| Service | Cost | Notes |
|---------|------|-------|
| Cloudflare Pages | **$0** | Stays free |
| Clerk | **$25/month** | 10k-50k MAU |
| Stripe | **2.9% + $0.30** | Per transaction |
| Cloudflare Workers | **$5/month** | Paid plan (10M req included) |
| **Total** | **~$30/month** | + Stripe fees |

**Scalability**: Can handle 10M requests/month for $5 on CF Workers. Pages scales infinitely.

---

## Security

### Implemented
- ✅ JWT verification on every request
- ✅ Stripe webhook signature verification
- ✅ Webhook idempotency (prevents duplicate processing)
- ✅ Environment variable validation
- ✅ Rate limiting (100 req/min)
- ✅ User data isolation (keyed by userId)
- ✅ CORS restrictions (dynamic origin checking)

### TODO (Production Hardening)
- [ ] Add security headers (CSP, X-Frame-Options, etc.)
- [ ] Set up error tracking (Sentry or CF error logging)
- [ ] Add request logging (Axiom/Logflare)
- [ ] Implement audit logs for tier changes
- [ ] Add CAPTCHA for sign-up (prevent bots)

---

## Testing Checklist

### Manual Testing Flow

1. ✅ **Sign Up**: Go to https://clerk-frontend.pages.dev → Click "Get Started Free"
2. ✅ **Email Verification**: Verify email (page shows correctly!)
3. ✅ **Dashboard**: Verify usage shows "0 / 5" for free tier
4. ✅ **Make Requests**: Click "Process Document" 5 times
5. ✅ **Hit Limit**: 6th click should show "Free tier limit reached"
6. ✅ **Upgrade**: Click "Upgrade to Pro" → Complete Stripe checkout
7. ✅ **Verify Upgrade**: Return to dashboard → should show "Unlimited • Pro Plan Active"
8. ✅ **Test Unlimited**: Click "Process Document" 20 times → all succeed
9. ✅ **Sign Out**: Click user avatar → "Sign out" → redirects to home

---

## Why Vite + React (not Next.js)

We started with Next.js but hit a critical blocker: Clerk's `<UserButton>` component uses server actions, which causes 405 errors when deployed as a static site to Cloudflare Pages.

**The Switch:**
- ❌ Next.js requires server runtime for Clerk components
- ✅ Vite + React is 100% client-side, perfect for CF Pages
- ✅ Smaller bundle size, faster dev experience
- ✅ Zero config, works out of the box

All functionality preserved, better performance, no hosting limitations.

---

## Next Steps / TODO

### High Priority
1. **Fix GitHub Actions workflow** - Worker deployment needs debugging (manual `wrangler deploy` works)
2. **Frontend deployment automation** - Already working via CF Pages dashboard, verify branch previews
3. **SEO optimization**:
   - Add meta tags for AI crawlers (schema.org, OpenGraph)
   - Implement robots.txt and sitemap.xml
   - Add proper page titles and descriptions for search engines
4. **Move to production Clerk keys** - Once DNS and custom domain fully configured

### Medium Priority
5. **Load testing** - Test rate limits and concurrent users
6. **Custom domain** - Point app.panacea-tech.net → CF Pages
7. **Monitoring** - Set up Axiom/Logflare for request logs
8. **Billing portal** - Stripe customer portal for cancellations
9. **E2E testing** - Playwright tests for full flow

### Low Priority
10. **Code organization** - Extract tier config to separate file
11. **Type safety** - Stricter TypeScript checks
12. **Caching strategy** - CF Cache API for static responses
13. **Analytics** - Add usage analytics dashboard

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

- **Deployment issues**: Check Cloudflare Pages logs or GitHub Actions
- **Auth problems**: Verify Clerk JWT template includes `plan` claim
- **Usage not incrementing**: Check KV binding in `wrangler.toml`
- **Stripe webhook fails**: Verify `STRIPE_WEBHOOK_SECRET` is set correctly and webhook endpoint is configured in Stripe dashboard

---

**Built with Claude Code** | October 2025
**Timeline**: Production-ready SaaS on Cloudflare in under a week
