# Pan Landing Project Overview for Claude

## 🎯 Goal

Build a **token-only authenticated landing page** with **Clerk for identity** and **Stripe for paid tiers**, using **Cloudflare Workers (Wrangler)** as the backend. All user data will be isolated per user via `userId` claims from Clerk JWT. No sessions or cookies — **JWT only**.

---

## 🧩 Core Components

| Component                        | Purpose                                                                       |       |
| -------------------------------- | ----------------------------------------------------------------------------- | ----- |
| **Clerk**                        | Authentication + JWT issuing. Public metadata holds `plan: free               | pro`. |
| **Stripe**                       | Subscription billing. Webhook updates Clerk user metadata.                    |       |
| **Cloudflare Workers**           | Stateless API backend. Verifies JWTs on every request.                        |       |
| **Frontend (Next.js or Static)** | Calls `getToken()` and hits Worker APIs with `Authorization: Bearer <token>`. |       |

---

## ✅ Accounts & Keys (Already Available)

* Clerk account ✅
* Stripe account ✅
* Cloudflare account ✅

Make sure we can retrieve API keys for each. We'll place them in environment variables using **Wrangler secrets**.

---

## 📂 Recommended GitHub Base Template

> **Clerk + Next.js Example** → starting point for frontend
> Repo Source:

```
https://github.com/clerk/javascript/tree/main/examples/nextjs
```

Optional future upgrade → use Stripe + Clerk SaaS starter

```
https://github.com/clerkinc/nextjs-subscription-payments
```

---

## ⚙️ CLI Setup Commands

```bash
# Clerk CLI
yarn global add @clerk/clerk-cli # or: npm i -g @clerk/clerk-cli
clerk login

# Cloudflare Workers CLI
npm i -g wrangler
wrangler login
```

Then Claude should:

* **Initialize a Clerk JWT template** (`pan-api`) for token-only flow.
* **Initialize a Worker project** using `wrangler init`.

---

## 🌐 Environment Variables (Wrangler Secrets)

Claude should instruct to set:

| Variable Name           | Source                       |
| ----------------------- | ---------------------------- |
| `CLERK_SECRET_KEY`      | Clerk Dashboard → API Keys   |
| `CLERK_PUBLISHABLE_KEY` | Frontend usage only          |
| `STRIPE_SECRET_KEY`     | Stripe Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | After webhook setup          |
| `CLERK_JWT_TEMPLATE`    | Will be `pan-api`            |

Command Format:

```bash
wrangler secret put CLERK_SECRET_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

---

## 🧠 Philosophy / Structure Notes

* **Stateless / token-only** — Every request must include valid Clerk-issued JWT.
* **UserId isolation** — Every database table, KV, or D1 storage should key off `userId`. No cross-contamination.
* **Plan Gating** — Expensive routes (like `/api/data`) should check JWT claims for `plan === "pro"`.
* **Stripe Webhook** updates `public_metadata.plan` in Clerk → new JWT reflects new access.

---

## 📌 Next Steps for Claude

Claude should:

1. **Generate folder structure** for Worker project.
2. **Include env setup steps and keys placeholders**.
3. **Reference the GitHub repo for frontend** and instruct how to clone.
4. **Prepare templated `.env` or Wrangler secret instructions**.
5. **Document workflow for token issuing (getToken)**.
6. **Set plan states: `free` or `pro`** and explain gating.

---

## 🚀 Execution Order (Claude Agent Should Follow)

1. ✅ Confirm Clerk + Stripe keys available
2. 🛠️ Install Clerk CLI → `clerk login`
3. 🧾 Create JWT template `pan-api`
4. 🌩️ Install Wrangler → `wrangler login`
5. 📦 `wrangler init pan-landing-worker`
6. 🔐 Insert secrets via `wrangler secret put ...`
7. 📎 Link frontend to backend via Bearer token
8. 🎛️ Add Stripe webhook & billing tier explanation

---

## 🎙️ Tone for Claude Agent

Use **short commands**, assume familiarity with terminals. Provide **directory trees** and **copy-ready secrets commands**. Do NOT generate code unless asked — focus on structure and control.

---

👉 **Claude should wait for command confirmation (`PROCEED`) before generating scaffolding or writing files.**

---

## 📋 MASTER TODO: Production Deployment Checklist

### ✅ Completed Foundation (v1.0)
- [x] JWT-only authentication with Clerk
- [x] Stripe subscription payments with webhooks
- [x] Cloudflare Workers API (503 lines TypeScript)
- [x] Usage tracking with KV storage
- [x] Rate limiting (100 req/min per user)
- [x] Monthly usage reset for free tier
- [x] Environment variable validation
- [x] Webhook signature verification
- [x] Modern UI with blue/slate theme
- [x] GitHub Actions CI/CD for auto-deployment
- [x] Cloudflare Pages deployment with nodejs_compat
- [x] Sign-in/sign-out flows working

---

### 🔴 CRITICAL: Pre-Production (Must Complete)

#### 1. **Security Headers** 🔒
- [ ] Add security headers to Worker responses
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: interest-cohort=()`
  - Location: `api/src/index.ts` - add to corsHeaders
- [ ] Add Content-Security-Policy header
  - Define CSP for frontend
  - Restrict script sources, frame ancestors
- [ ] Add Strict-Transport-Security (HSTS)
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`

#### 2. **Custom Cloudflare Domain** 🌐
- [ ] Set up custom domain for API worker
  - Configure `api.yourdomain.com` in CF dashboard
  - Update CORS to allow production domain
  - Update Clerk allowed origins
  - Update Stripe webhook URL
- [ ] Set up custom domain for frontend
  - Configure `app.yourdomain.com` or `yourdomain.com`
  - Update environment variables across all services
  - Add to GitHub secrets

#### 3. **Production CORS Configuration** 🔐
- [ ] Replace wildcard CORS origin in Worker
  - Current: `env.FRONTEND_URL || 'http://localhost:3000'`
  - Update to strict production domain only
  - Location: `api/src/index.ts:113-117`
  - Keep localhost for development only via env check

#### 4. **Stripe Webhook as Separate Route** ⚡
- [ ] Current setup: Webhook is part of main worker ✅ (ALREADY DONE)
  - Webhook handler: `api/src/stripe-webhook.ts` (121 lines)
  - Route: `/webhook/stripe` in main worker
  - **Decision:** Keep as-is OR split to separate worker?
  - **Recommendation:** Keep combined - simpler deployment, shared secrets
- [ ] Deploy webhook endpoint to production
  - Configure Stripe webhook in dashboard
  - Point to: `https://api.yourdomain.com/webhook/stripe`
  - Add webhook secret to CF secrets: `wrangler secret put STRIPE_WEBHOOK_SECRET`
  - Test with Stripe CLI: `stripe trigger checkout.session.completed`

#### 5. **Environment Secrets Audit** 🔑
- [ ] Verify all secrets in Cloudflare Workers
  ```bash
  wrangler secret put CLERK_SECRET_KEY
  wrangler secret put CLERK_PUBLISHABLE_KEY
  wrangler secret put STRIPE_SECRET_KEY
  wrangler secret put STRIPE_WEBHOOK_SECRET
  wrangler secret put STRIPE_PRICE_ID
  wrangler secret put FRONTEND_URL
  ```
- [ ] Verify GitHub secrets for CI/CD
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_API_URL`
- [ ] Verify Cloudflare Pages environment variables
  - Go to Pages → Settings → Environment variables
  - Add all `NEXT_PUBLIC_*` vars

#### 6. **Deployment URLs & Health Checks** 🏥
- [ ] Test API worker deployment
  - URL: `https://pan-api.YOUR-SUBDOMAIN.workers.dev`
  - Health check: `curl https://pan-api.YOUR-SUBDOMAIN.workers.dev/health`
  - Expected: `{"status":"ok"}`
- [ ] Test frontend deployment
  - URL: `https://pan-frontend.pages.dev`
  - Check sign-in flow works
  - Check dashboard loads
  - Check Stripe checkout works
- [ ] Monitor GitHub Actions deployments
  - URL: `https://github.com/Fruitloop24/clerk/actions`
  - Ensure both workflows pass

---

### 🟡 IMPORTANT: Post-Launch (Week 1)

#### 7. **Monitoring & Observability** 📊
- [ ] Set up error tracking
  - Add Sentry to Worker: `wrangler tail --format json`
  - Add Sentry to Frontend: `@sentry/nextjs`
  - Track: token verification failures, webhook failures, rate limits
- [ ] Add logging with Logflare/Axiom
  - Log all API requests with userId
  - Log Stripe webhook events
  - Log usage counter increments
  - Set up alerts for 500 errors
- [ ] Create monitoring dashboard
  - Cloudflare Analytics for Worker
  - Cloudflare Web Analytics for Pages
  - Track: requests/day, errors, latency

#### 8. **Testing Suite** 🧪
- [ ] Add unit tests for Worker
  - Test JWT verification flow
  - Test usage increment logic
  - Test billing period reset
  - Test rate limiting
  - Mock Clerk/Stripe APIs
- [ ] Add integration tests
  - Test full sign-up → usage → upgrade flow
  - Test webhook handling
  - Test CORS headers
- [ ] Add load testing
  - Simulate 1000 concurrent users
  - Test rate limiting under load
  - Verify KV performance

#### 9. **Documentation** 📚
- [ ] Add API documentation
  - OpenAPI/Swagger spec for endpoints
  - Document request/response schemas
  - Add rate limit headers
  - Add error code reference
- [ ] Create deployment runbook
  - Step-by-step production deployment
  - Rollback procedures
  - Incident response guide
- [ ] Add developer onboarding guide
  - How to add new endpoints
  - How to modify tier limits
  - How to add new Stripe products

---

### 🟢 ENHANCEMENTS: Scaling & Growth

#### 10. **Performance Optimizations** ⚡
- [ ] Fix KV race condition for usage counting
  - Current: Potential for concurrent requests to bypass limit
  - Solution: Use Durable Objects for atomic counters
  - Alternative: Optimistic locking with retry logic
  - Location: `api/src/index.ts:219-288` (handleDataRequest)
- [ ] Add request/response caching
  - Cache usage stats for 30 seconds
  - Cache Clerk user lookups
  - Use Cloudflare Cache API
- [ ] Optimize JWT verification
  - Cache JWKS keys
  - Reduce Clerk API calls

#### 11. **Feature Additions** ✨
- [ ] Add usage analytics dashboard
  - Track API usage patterns per user
  - Monitor free-to-pro conversion rates
  - Export usage data for billing reconciliation
- [ ] Add admin dashboard
  - View all users and usage stats
  - Manually upgrade/downgrade users
  - View webhook event history
  - Export user data for GDPR compliance
- [ ] Add email notifications
  - Send email when user hits 80% of free tier
  - Send receipt after Stripe payment
  - Send welcome email on sign-up
  - Use Resend/SendGrid API

#### 12. **Business Features** 💰
- [ ] Add multiple pricing tiers
  - Starter: 5 requests/month (free)
  - Pro: Unlimited requests ($29/mo)
  - Team: Unlimited + collaboration ($99/mo)
  - Update Stripe products
  - Update JWT claims to support tier names
- [ ] Add usage-based billing
  - Track usage beyond free tier
  - Charge per additional request
  - Integrate with Stripe metered billing
- [ ] Add team/organization support
  - Shared usage pool for team members
  - Team admin dashboard
  - Invite system

---

### 📊 Current Status (Oct 14, 2025)

**Lines of Code:**
- API Worker: 503 lines (index.ts: 382, stripe-webhook.ts: 121)
- Frontend: ~1500 lines (Next.js components)
- Total: ~2000 lines TypeScript

**Architecture Quality:**
- ✅ JWT-only, stateless, no database (Clerk + Stripe only)
- ✅ User isolation via userId claims
- ✅ Rate limiting + usage tracking
- ✅ Webhook signature verification
- ✅ Environment validation
- ✅ Auto-deployment via GitHub Actions

**Production Readiness:**
- Foundation: ✅ COMPLETE
- Security Headers: ⏸️ PENDING
- Custom Domain: ⏸️ PENDING
- Monitoring: ⏸️ PENDING
- **Overall Rating: 8.5/10** (Foundation ready, needs production hardening)

**Deployment URLs:**
- API Worker: `https://pan-api.YOUR-SUBDOMAIN.workers.dev`
- Frontend: `https://pan-frontend.pages.dev`
- GitHub: `https://github.com/Fruitloop24/clerk`

---

### 🎯 Next Immediate Steps

1. Add security headers to Worker responses
2. Set up custom CF domain (api.yourdomain.com)
3. Configure production CORS
4. Deploy Stripe webhook endpoint
5. Test full production flow
6. Set up monitoring/error tracking

**Target:** Production-ready within 24 hours after domain setup.

---

### 💡 Philosophy Validation

✅ **JWT-only auth** - No sessions, no cookies
✅ **No database** - Clerk for identity, Stripe for payments, KV for usage
✅ **User isolation** - All data keyed by userId from JWT
✅ **Stateless workers** - Scale to millions with zero config
✅ **Separation of concerns** - Auth/billing completely separate from app logic

**This is the cleanest SaaS starter architecture possible.** 🚀
