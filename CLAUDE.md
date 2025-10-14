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

## 📋 TODO: Improvements & Enhancements

### 🔴 Critical (Production Blockers)
- [ ] **Add environment variable validation at startup**
  - Validate all required env vars exist on worker init
  - Fail fast with clear error messages
  - Prevent silent failures in production
  - Location: `api/src/index.ts` (add validateEnv() function at startup)

### 🟡 Important (Before Scaling)
- [ ] **Implement rate limiting**
  - Use Cloudflare Rate Limiting bindings
  - Limit: 100 requests/minute per userId
  - Prevent API abuse and DDoS attacks
  - Location: `api/src/index.ts` (middleware before route handlers)

- [ ] **Add monthly usage reset for free tier**
  - Track currentPeriodStart and currentPeriodEnd in KV
  - Reset usageCount on the 1st of each month
  - Keep historical usage data for analytics
  - Location: `api/src/index.ts` handleDataRequest()

- [ ] **Configure CORS for production**
  - Replace wildcard `*` with specific domains
  - Whitelist production frontend URL
  - Add staging environment support
  - Location: `api/src/index.ts:26` (corsHeaders object)

### 🟢 Nice to Have (Iterative Improvements)
- [ ] **Add monitoring and logging**
  - Integrate Sentry for error tracking
  - Add LogFlare for request/response logging
  - Set up alerts for webhook failures
  - Track key metrics (usage, conversions, errors)

- [ ] **Implement usage analytics**
  - Track API usage patterns per user
  - Monitor free-to-pro conversion rates
  - Dashboard for admin usage insights
  - Export usage data for billing reconciliation

- [ ] **Add unit and integration tests**
  - Jest for worker unit tests
  - Test JWT verification flow
  - Test webhook event handling
  - Mock Clerk/Stripe APIs for integration tests

- [ ] **Fix KV race condition**
  - Evaluate Durable Objects for atomic counters
  - Or implement optimistic locking with retry logic
  - Edge case: concurrent requests bypassing free tier limit
  - Location: `api/src/index.ts:114-168` handleDataRequest()

- [ ] **Add API request/response validation**
  - Validate request body schemas
  - Set maximum request size limits
  - Add timeout configurations
  - Return structured error responses

- [ ] **Create admin dashboard**
  - View all users and their usage stats
  - Manually upgrade/downgrade users
  - View webhook event history
  - Export user data for compliance

### 📊 Current Status
- **Agent Rating:** 7.5/10
- **Foundation Quality:** 8.5/10
- **Extensibility:** 9/10
- **Lines of Code:** 370 (TypeScript)
- **Production Ready:** After critical items completed

### 🎯 To Reach 9/10 Rating
Complete all **Critical** items + 2-3 **Important** items (rate limiting, usage reset, CORS).
