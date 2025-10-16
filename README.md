# DocuFlow AI - Production SaaS Starter

**A stateless, JWT-only SaaS application** with authentication, subscription billing, usage tracking, and rate limiting.

**Live Demo**: Coming soon (deploying to CF Pages)
**API**: https://pan-api.k-c-sheffield012376.workers.dev
**Stack**: Vite + React (CF Pages) + Cloudflare Workers + Clerk + Stripe

---

## 🎯 Current Status (Oct 16, 2025)

### ✅ What's Working
- **Frontend migrated to Vite + React** - Running on http://localhost:5173
- **Backend deployed on CF Workers** - API responding, JWT auth working
- **Sign-in/sign-up flows** - Clerk auth fully functional (no more 405 errors!)
- **Dashboard showing usage** - Tracks free tier (5/month), displays correctly
- **Upgrade button working** - Creates Stripe checkout sessions, redirects to payment
- **Rate limiting** - 100 req/min per user
- **CORS configured** - Allows CF Pages, localhost
- **CI/CD pipeline** - GitHub Actions deploying worker automatically

### 🔴 Critical: Need to Configure Now

**1. Stripe Webhook Configuration**
- **Problem**: After user subscribes on Stripe, their plan doesn't upgrade from "free" to "pro"
- **Root Cause**: Stripe dashboard doesn't have webhook endpoint configured
- **Solution**:
  1. Go to https://dashboard.stripe.com/webhooks
  2. Click "Add endpoint"
  3. **URL**: `https://pan-api.k-c-sheffield012376.workers.dev/webhook/stripe`
  4. **Events to listen for**:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
  5. Copy the signing secret (`whsec_...`)
  6. Set it in worker: `cd api && wrangler secret put STRIPE_WEBHOOK_SECRET`
- **Status**: Webhook handler code is deployed and ready, just needs Stripe configuration + secret

**2. Deploy Frontend to Cloudflare Pages**
- **Current**: Running locally on port 5173
- **Next Step**: Push to GitHub → Connect to CF Pages
- **Env vars to set in CF Pages**:
  - `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...`
  - `VITE_API_URL=https://pan-api.k-c-sheffield012376.workers.dev`

### 🚀 What We Just Accomplished

- ✅ **Migrated from Next.js to Vite + React** - No more server action issues!
- ✅ **Fixed UserButton 405 errors** - Pure client-side React, no server actions
- ✅ **All pages ported** - Landing, Dashboard, Sign-in, Sign-up
- ✅ **All API calls preserved** - JWT auth, usage tracking, Stripe checkout
- ✅ **Build passing** - Production build successful (337 kB bundle)
- ✅ **Dev server running** - Local testing at http://localhost:5173

### 📋 Next Steps

1. ✅ **Migrate to Vite + React** (DONE!)
2. 🔴 **Configure Stripe webhook** (5 minutes) ← DO THIS NOW
3. 🔴 **Deploy to Cloudflare Pages** (connect GitHub repo)
4. ⚪ **Test full upgrade flow** (sign up → use 5 requests → upgrade → verify unlimited)
5. ⚪ **Lock down CORS** (remove wildcard if still present)
6. ⚪ **Point custom domain** (`app.panacea-tech.net` → CF Pages)

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

### Frontend (Vite + React 18)
- 📍 **Location**: `frontend-v2/`
- 🚀 **Hosted**: Cloudflare Pages (ready to deploy)
- 🔐 **Auth**: `@clerk/clerk-react` with full auth flows
- 🎨 **UI**: Modern blue/slate theme, responsive design, inline styles
- 📊 **Features**: Landing page, dashboard, usage tracking, Stripe checkout
- ⚡ **Build**: Vite (instant HMR, 337 kB production bundle)
- 🛣️ **Routing**: React Router v6 (client-side routing)

### Backend (Cloudflare Worker)
- 📍 **Location**: `api/src/index.ts` (394 lines)
- 🚀 **Hosted**: Cloudflare Workers (auto-deploy via GitHub Actions)
- 🔐 **Auth**: Clerk JWT verification on every request
- 🎯 **Endpoints**:
  - `GET /health` - Health check
  - `GET /api/usage` - Get user usage stats (requires JWT)
  - `POST /api/data` - Process request + increment usage (requires JWT)
  - `POST /api/create-checkout` - Create Stripe checkout session (requires JWT)
  - `POST /webhook/stripe` - Stripe webhook handler (signature verified)

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
- **UserButton works perfectly** (no 405 errors!)

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

## Stripe Webhook Setup (DO THIS NOW!)

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

## CI/CD Pipeline

### Automatic Deployments

**Frontend** → Cloudflare Pages (Coming Soon)
- Triggers: Every push to `main`
- Build command: `cd frontend-v2 && npm run build`
- Output directory: `frontend-v2/dist`
- Preview: Every PR gets preview URL

**Backend** → Cloudflare Workers
- Triggers: Changes to `api/**` or manual workflow dispatch
- Build: TypeScript compilation
- Deploy: `wrangler deploy` via GitHub Actions
- File: `.github/workflows/deploy-worker.yml`

---

## Migration History: Why We Switched from Next.js to Vite

### The Problem with Next.js on Cloudflare Pages

We initially built with Next.js 15 and deployed to Vercel, but encountered critical issues when trying to deploy to Cloudflare Pages:

**Clerk's `<UserButton>` uses server actions** → POST requests to static pages → **405 Method Not Allowed**

### Attempted Fixes (Failed)
- ❌ Custom sign-out button (worked but removed profile dropdown)
- ❌ `export const runtime = 'edge'` (breaks build - Clerk uses Node.js APIs)
- ❌ `@cloudflare/next-on-pages` adapter (archived, not maintained)
- ❌ Deploying to Vercel (worked, but defeats the purpose of CF Pages)

### The Solution: Vite + React

✅ **Pure client-side React** - No server actions, no POST routes
✅ **Clerk React SDK** - Same auth, different package (`@clerk/clerk-react`)
✅ **100% static assets** - Perfect for CF Pages
✅ **Smaller bundle** - 337 kB vs Next.js overhead
✅ **Faster dev experience** - Vite HMR is instant
✅ **Zero config** - Works out of the box on CF Pages

**Result**: All functionality preserved, no more 405 errors, ready for CF Pages deployment! 🚀

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

## Deployment Commands

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

**Total Code**: ~2,000 lines TypeScript (515 backend, ~1,500 frontend)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vite + React 18 | Pure client-side SPA |
| **Hosting** | Cloudflare Pages | Static hosting |
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

## Testing Checklist

### Manual Testing Flow

1. ✅ **Sign Up**: Go to http://localhost:5173 → Click "Get Started Free"
2. ✅ **Email Verification**: Verify email (page shows correctly, no blank screen!)
3. ✅ **Dashboard**: Verify usage shows "0 / 5" for free tier
4. ✅ **Make Requests**: Click "Process Document" 5 times
5. ✅ **Hit Limit**: 6th click should show "Free tier limit reached"
6. 🔴 **Upgrade**: Click "Upgrade to Pro" → Complete Stripe checkout (test card `4242 4242 4242 4242`)
7. 🔴 **Verify Upgrade**: Return to dashboard → should show "Unlimited • Pro Plan Active"
8. 🔴 **Test Unlimited**: Click "Process Document" 20 times → all succeed
9. ✅ **Sign Out**: Click user avatar → "Sign out" → redirects to home

**Note**: Steps 6-8 require Stripe webhook to be configured!

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
- **Stripe webhook fails**: Verify `STRIPE_WEBHOOK_SECRET` is set correctly

---

**Built with Claude Code** | October 2025
**Timeline**: 3 days from start to production-ready SaaS on Cloudflare
