# Deploy Worker to Cloudflare

Automate backend deployment to Cloudflare Workers with environment validation!

**What this does:**
1. Reads `api/.dev.vars` to extract your secrets
2. Validates all required secrets are present
3. Creates a KV namespace for usage tracking (if needed)
4. Sets production secrets in Cloudflare
5. Deploys your worker to the edge (300+ cities)
6. Returns your live worker URL

---

## Prerequisites Check

Before starting, verify:
- ✅ `wrangler` CLI installed: Run `wrangler --version`
- ✅ Cloudflare account created at https://dash.cloudflare.com
- ✅ `api/.dev.vars` file exists with your API keys
- ✅ Backend local development tested (`npm run dev` works)

---

## Step 1: Prepare wrangler.toml

The `api/wrangler.toml` file needs your KV namespace ID. This stores usage tracking data.

**Option A: Already have KV namespace ID?**
Skip to Step 2.

**Option B: First time deploying?**
Run this command to create the KV namespace:

```bash
cd api
wrangler kv:namespace create USAGE_KV
```

**Copy the output ID** (looks like: `2b116f97974a4461a03f91792198cefc`)

Then update `api/wrangler.toml`:

**Before:**
```toml
[[kv_namespaces]]
binding = "USAGE_KV"
id = "YOUR_KV_NAMESPACE_ID"
```

**After:**
```toml
[[kv_namespaces]]
binding = "USAGE_KV"
id = "2b116f97974a4461a03f91792198cefc"  # Your actual ID from above
```

Save the file. ✅

---

## Step 2: Validate Your Secrets

Read `api/.dev.vars` and validate these are present:

**Required Clerk secrets:**
- `CLERK_SECRET_KEY=sk_` (starts with sk_)
- `CLERK_PUBLISHABLE_KEY=pk_` (starts with pk_)
- `CLERK_JWT_TEMPLATE=pan-api`

**Required Stripe secrets:**
- `STRIPE_SECRET_KEY=sk_` (starts with sk_)
- `STRIPE_WEBHOOK_SECRET=whsec_`
- `STRIPE_PRICE_ID_*` for each paid tier (e.g., `STRIPE_PRICE_ID_PRO=price_`)

**Also required:**
- `STRIPE_PORTAL_CONFIG_ID=bpc_`

**Show validation results in this format:**

If all present:
```
✅ SECRETS VALIDATION PASSED

Backend (api/.dev.vars):
✅ CLERK_SECRET_KEY: Valid
✅ CLERK_PUBLISHABLE_KEY: Valid
✅ CLERK_JWT_TEMPLATE: Valid (pan-api)
✅ STRIPE_SECRET_KEY: Valid
✅ STRIPE_WEBHOOK_SECRET: Valid
✅ STRIPE_PRICE_ID_PRO: Valid
✅ STRIPE_PRICE_ID_ENTERPRISE: Valid
✅ STRIPE_PORTAL_CONFIG_ID: Valid

Ready to deploy! Proceeding to Step 3...
```

If missing:
```
❌ SECRETS VALIDATION FAILED

Backend (api/.dev.vars):
✅ CLERK_SECRET_KEY: Valid
❌ CLERK_PUBLISHABLE_KEY: Missing
✅ CLERK_JWT_TEMPLATE: Valid
❌ STRIPE_SECRET_KEY: Missing

📖 Fix these before continuing:
- Clerk setup: docs/platforms/clerk.md
- Stripe setup: docs/platforms/stripe.md

Stop here - user must fix missing secrets in api/.dev.vars
```

---

## Step 3: Ensure Wrangler Login

Check if user is logged in to Cloudflare:

```bash
wrangler whoami
```

**If successful:** Shows account email and continues to Step 4

**If fails:** Show this message:
```
⚠️ NOT LOGGED IN TO CLOUDFLARE

Run this command:
wrangler login

This will:
1. Open your browser
2. Ask you to log in to Cloudflare
3. Save authentication locally

Then return here and we'll deploy!
```

Stop here if login needed - user must complete it.

---

## Step 4: Set Production Secrets

For each secret in `api/.dev.vars`, set it in Cloudflare using wrangler.

**Extract these from dev.vars and run (one per secret):**

```bash
# Clerk secrets
wrangler secret put CLERK_SECRET_KEY
# Paste value from dev.vars, press Enter

wrangler secret put CLERK_PUBLISHABLE_KEY
# Paste value from dev.vars, press Enter

wrangler secret put CLERK_JWT_TEMPLATE
# Paste: pan-api
# Press Enter

# Stripe secrets
wrangler secret put STRIPE_SECRET_KEY
# Paste value from dev.vars, press Enter

wrangler secret put STRIPE_WEBHOOK_SECRET
# Paste value from dev.vars, press Enter

wrangler secret put STRIPE_PORTAL_CONFIG_ID
# Paste value from dev.vars, press Enter
```

**For each STRIPE_PRICE_ID_* in dev.vars, also run:**
```bash
wrangler secret put STRIPE_PRICE_ID_PRO
# (or STRIPE_PRICE_ID_ENTERPRISE, etc. - same format)
# Paste the price_* value, press Enter
```

✅ All secrets should show: `Successfully uploaded secret [NAME]`

---

## Step 5: Deploy Your Worker

From the `api/` directory, deploy to Cloudflare:

```bash
cd api
npm run deploy
```

**Expected output includes:**
```
Uploaded pan-api (x.xx sec)
Published pan-api (x.xx sec)
  https://pan-api.your-subdomain.workers.dev
```

✅ **COPY YOUR WORKER URL** - You'll need this next!

---

## Step 6: Verify Deployment

Test the health check endpoint:

```bash
curl https://pan-api.your-subdomain.workers.dev/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-25T12:34:56.789Z"
}
```

✅ If you see this - Your worker is live!

---

## Step 7: Update Frontend Environment

After successful deployment, automatically update `frontend-v2/.env` with your worker URL:

1. Parse the worker URL from the deployment output (e.g., `https://pan-api.abc123.workers.dev`)
2. Update `frontend-v2/.env` by replacing:
   ```
   VITE_API_URL=http://localhost:8787
   ```
   with:
   ```
   VITE_API_URL=https://pan-api.abc123.workers.dev
   ```
3. Show the user what was updated

**Expected output:**
```
✅ FRONTEND UPDATED

Updated frontend-v2/.env:
VITE_API_URL=https://pan-api.abc123.workers.dev

Your frontend will now connect to your live worker!
Restart your frontend dev server to pick up the change.
```

---

## Success! ✅

Your API is now deployed globally on Cloudflare Workers.

```
🌍 DEPLOYMENT COMPLETE

Your live worker URL:
https://pan-api.your-subdomain.workers.dev

All secrets deployed securely ✅
KV namespace configured ✅
Frontend .env updated ✅
```

---

## ⚠️ Next Steps (IMPORTANT)

**1. Restart Your Frontend**

Your frontend .env has been updated automatically. Restart your frontend development server:

```bash
cd frontend-v2
npm run dev
```

It will now connect to your live worker!

**2. Configure Stripe Webhooks**

Your worker is live, but Stripe doesn't know where to send webhook notifications yet.

📖 **Next in README:** Step 7 - [Configure Production Webhooks](../deployments/stripe-deploy.md)

This will:
- Point Stripe to: `https://pan-api.your-subdomain.workers.dev/webhook/stripe`
- Enable real subscription updates (upgrades, downgrades, cancellations)
- Complete the payment flow for your users

**3. Deploy Your Frontend**

Once webhooks work, deploy your React frontend to Cloudflare Pages.

📖 **Step 8 in README:** [Cloudflare Pages Frontend Deployment](../deployments/frontend-deploy.md)

---

## Troubleshooting

**"KV namespace not found"**
- Make sure you updated `api/wrangler.toml` with the correct KV namespace ID from Step 1
- Redeploy: `npm run deploy`

**"Unauthorized" errors on requests**
- Verify you set CLERK_SECRET_KEY correctly in Step 4
- Make sure it starts with `sk_live_` (live key, not test key)
- Re-set it: `wrangler secret put CLERK_SECRET_KEY`

**"Module not found" during deploy**
- Run `npm install` in `api/` directory
- Run `npm run build` to check for TypeScript errors
- Fix any errors shown
- Try `npm run deploy` again

**Still having issues?**
- 📖 [Full Deployment Guide](../deployments/cloudflare.md)
- 📖 [Troubleshooting FAQ](../information/faq.md)

---

**Your backend is now on the global edge!** 🌍
