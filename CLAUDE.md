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
