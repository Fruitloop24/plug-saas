# Cloudflare Workers Deployment Guide

**Time Estimate:** 20-30 minutes (first time)
**What You'll Deploy:** Your backend API to Cloudflare Workers (global edge network)

**📹 Video Guide:** [Watch Step 6 Setup Video](https://pansaasstorage.blob.core.windows.net/plug-saas-assets/step-6.mp4)

---

## What Cloudflare Workers Does

Cloudflare Workers is a serverless platform that runs your backend API code on Cloudflare's global edge network (300+ cities worldwide).

**Why it matters:**
-  **Global deployment** - Your API runs in data centers closest to your users
- = **Zero cold starts** - Always-on workers, no Lambda spin-up delays
- = **Free tier** - 100k requests/day free, then $5/mo for 10M requests
- = **Built-in security** - DDoS protection, security headers, rate limiting

Your API will be accessible at: `https://your-worker-name.workers.dev`

---

## Prerequisites

Before deploying, ensure you have:

 **Wrangler CLI installed** - Run `wrangler --version` to check
 **Cloudflare account** - Sign up at https://dash.cloudflare.com
 **Git initialized & GitHub repo ready** - Your project pushed to a GitHub repository (needed for Cloudflare Pages CI/CD)
 **All local development working** - Tested sign-up, upgrade, webhooks locally
 **Production API keys ready** - You'll need live Clerk and Stripe keys

---

## What You'll Do

This deployment process involves:

1. **Authenticate Wrangler** - Connect your CLI to your Cloudflare account
2. **Create KV Namespace** - Set up cloud storage for usage tracking
3. **Set Production Secrets** - Upload your API keys securely
4. **Deploy the Worker** - Push your code to the edge
5. **Verify Deployment** - Test your live API

---

## Step 1: Authenticate Wrangler with Cloudflare

### 1.1 Log In to Cloudflare

Open your terminal and run:

```bash
wrangler login
```

This will:
1. Open your browser
2. Ask you to log in to Cloudflare
3. Request permission to access your account
4. Save authentication token locally

**Expected output:**
```
Successfully logged in.
```

= **Troubleshooting:** If the browser doesn't open, the command will print a URL you can copy/paste.

---

## Step 2: Create KV Namespace (Usage Storage)

### 2.1 What is KV?

Cloudflare KV (Key-Value) is a global, low-latency data store. Your app uses it to track:
- User request counts (usage tracking)
- Billing period start/end dates
- Current plan status

**Why KV?** - It's fast, replicated globally, and included in the free tier (100k reads/day, 1k writes/day).

### 2.2 Create Production KV Namespace

Navigate to your API directory and create the namespace:

```bash
cd api
wrangler kv:namespace create USAGE_KV
```

**Expected output:**
```
< Creating namespace with title "pan-api-USAGE_KV"
( Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "USAGE_KV", id = "abc123def456..." }
```

** IMPORTANT:** Copy the `id` value (the long string like `abc123def456...`)

### 2.3 Update wrangler.toml with KV ID

Open `api/wrangler.toml` and find the `[[kv_namespaces]]` section:

**Before:**
```toml
[[kv_namespaces]]
binding = "USAGE_KV"
id = "YOUR_KV_NAMESPACE_ID"  #  Replace this
```

**After:**
```toml
[[kv_namespaces]]
binding = "USAGE_KV"
id = "abc123def456..."  #  Your actual KV namespace ID from above
```

= **What this does:** Binds your code's `env.USAGE_KV` variable to the actual KV namespace in production.

---

## Step 3: Set Production Secrets (API Keys)

### 3.1 Why Secrets?

Secrets are encrypted environment variables that:
- L **Never** appear in your code or Git history
- L **Can't** be read via the Cloudflare dashboard (write-only)
-  **Are** injected into your worker at runtime

**You'll set these secrets** (one command per secret):

| Secret Name | What It Is | Where to Get It |
|-------------|-----------|----------------|
| `CLERK_SECRET_KEY` | Clerk API secret | Clerk Dashboard  API Keys |
| `CLERK_PUBLISHABLE_KEY` | Clerk public key | Clerk Dashboard  API Keys |
| `CLERK_JWT_TEMPLATE` | JWT template name | Should be `pan-api` |
| `STRIPE_SECRET_KEY` | Stripe API secret | Stripe Dashboard  Developers  API Keys |
| `STRIPE_PRICE_ID_PRO` | Pro tier price ID | Stripe Dashboard  Products  Pro |
| `STRIPE_PRICE_ID_ENTERPRISE` | Enterprise price ID | Stripe Dashboard  Products  Enterprise |
| `STRIPE_PORTAL_CONFIG_ID` | Customer portal ID | Stripe Dashboard  Settings  Customer Portal |

### 3.2 Switch to Production Keys

 **IMPORTANT:** You need **live mode** keys for production, not test mode keys.

**Clerk Keys:**
- Go to https://dashboard.clerk.com
- Select your application
- Click **API Keys** in sidebar
- **Switch to "Production"** in top-right toggle
- Copy keys that start with `pk_live_...` and `sk_live_...`

**Stripe Keys:**
- Go to https://dashboard.stripe.com
- **Toggle OFF "Test mode"** in top-right (should show no banner)
- Click **Developers**  **API keys**
- Copy key that starts with `sk_live_...`

= **Stripe Price IDs:** Get these from Products page (make sure test mode is OFF).

### 3.3 Set Each Secret

Run these commands one at a time. Each will prompt you to paste the value:

```bash
# Clerk secrets
wrangler secret put CLERK_SECRET_KEY
# Paste your sk_live_... key, press Enter

wrangler secret put CLERK_PUBLISHABLE_KEY
# Paste your pk_live_... key, press Enter

wrangler secret put CLERK_JWT_TEMPLATE
# Type: pan-api
# Press Enter

# Stripe secrets
wrangler secret put STRIPE_SECRET_KEY
# Paste your sk_live_... key, press Enter

wrangler secret put STRIPE_PRICE_ID_PRO
# Paste your price_... ID, press Enter

wrangler secret put STRIPE_PRICE_ID_ENTERPRISE
# Paste your price_... ID, press Enter

wrangler secret put STRIPE_PORTAL_CONFIG_ID
# Paste your bpc_... ID, press Enter
```

**Expected output for each:**
```
( Success! Uploaded secret CLERK_SECRET_KEY
```

### 3.4 Optional: Set Allowed Origins

If you want to restrict CORS to specific domains:

```bash
wrangler secret put ALLOWED_ORIGINS
# Example value: https://yourdomain.com,https://www.yourdomain.com
# Press Enter
```

### 3.5 Verify Secrets Were Set

List all secrets to confirm:

```bash
wrangler secret list
```

**Expected output:**
```
[
  {
    "name": "CLERK_SECRET_KEY",
    "type": "secret_text"
  },
  {
    "name": "CLERK_PUBLISHABLE_KEY",
    "type": "secret_text"
  },
  ...
]
```

= **Note:** You can see secret **names**, but not their **values** (security feature).

---

## Step 4: Deploy Your Worker

### 4.1 Run the Deploy Command

From the `api/` directory:

```bash
npm run deploy
```

This command:
1. Bundles your TypeScript code
2. Uploads it to Cloudflare's network
3. Deploys to all 300+ edge locations globally
4. Returns your live worker URL

**Expected output:**
```
 wrangler 4.0.0
------------------
Total Upload: xx.xx KiB / gzip: xx.xx KiB
Uploaded pan-api (x.xx sec)
Published pan-api (x.xx sec)
  https://pan-api.your-subdomain.workers.dev
Current Deployment ID: abc123...
```

### 4.2 Copy Your Worker URL

**Your API is now live at:** `https://pan-api.your-subdomain.workers.dev`

 **Save this URL** - You'll need it for:
1. Frontend environment variables
2. Stripe webhook configuration (next setup step)
3. Testing your API

### 4.3 Test Your Deployed API

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

 **If you get this response** - Your worker is live and running!

L **If you get an error** - Check the troubleshooting section below.

---

## Step 5: Check Deployment Status

### 5.1 View Worker in Dashboard

= Go to: **Cloudflare Dashboard  Workers & Pages**

Direct link: https://dash.cloudflare.com/?to=/:account/workers

You should see your worker (`pan-api`) listed with:
-  Status: "Active"
-  Last deployed: Recent timestamp
-  Routes: `*.workers.dev/*`

### 5.2 Check Worker Logs (Real-Time)

Monitor your worker's logs in real-time:

```bash
wrangler tail
```

This shows:
- Incoming requests
- Console.log outputs
- Errors and exceptions
- Response times

= **Leave this running** while you test to see what's happening.

### 5.3 Test Authentication Flow

Try hitting a protected endpoint:

```bash
curl https://pan-api.your-subdomain.workers.dev/api/test
```

**Expected response (without auth):**
```json
{
  "error": "Unauthorized - No token provided"
}
```

 **This is correct!** - Your API is protecting routes that require authentication.

---

## Common Issues & Fixes

### L Issue: "KV namespace not found" error

**Cause:** KV namespace ID not set or incorrect in `wrangler.toml`

**Fix:**
1. Run `wrangler kv:namespace list` to see your namespaces
2. Copy the correct `id` value
3. Update `wrangler.toml`  `[[kv_namespaces]]`  `id = "..."`
4. Run `npm run deploy` again

---

### L Issue: "Unauthorized" for all requests

**Cause:** Missing `CLERK_SECRET_KEY` or wrong key

**Fix:**
1. Run `wrangler secret list` - verify CLERK_SECRET_KEY exists
2. Make sure you used **live** key (starts with `sk_live_`), not test key
3. Re-set the secret: `wrangler secret put CLERK_SECRET_KEY`
4. Worker automatically picks up new secret (no redeploy needed)

---

### L Issue: "Module not found" or build errors

**Cause:** Missing dependencies or TypeScript errors

**Fix:**
1. Run `npm install` in the `api/` directory
2. Run `npm run build` locally to check for TypeScript errors
3. Fix any errors shown
4. Run `npm run deploy` again

---

### L Issue: CORS errors from frontend

**Cause:** Worker not allowing your frontend domain

**Fix:**
1. If you set `ALLOWED_ORIGINS`, make sure it includes your frontend domain
2. Format: `https://yourdomain.com,https://www.yourdomain.com` (comma-separated, no spaces)
3. Update: `wrangler secret put ALLOWED_ORIGINS`
4. Or remove the secret to allow all origins (less secure): `wrangler secret delete ALLOWED_ORIGINS`

---

## Managing Your Deployment

### View Live Logs

Monitor production requests in real-time:

```bash
wrangler tail
```

**What you'll see:**
- Incoming request paths
- JWT verification results
- Usage tracking updates
- Errors and stack traces

Press `Ctrl+C` to stop.

### Redeploy After Changes

Made code changes? Deploy the update:

```bash
cd api
npm run deploy
```

**Deployment is instant** - Your changes go live in ~10 seconds.

 **Secrets persist** - You don't need to re-set secrets unless you're changing them.

### Update a Secret

Change an API key:

```bash
wrangler secret put STRIPE_SECRET_KEY
# Paste new value, press Enter
```

Secrets update immediately - no redeploy needed.

### Delete a Secret

Remove a secret:

```bash
wrangler secret delete STRIPE_WEBHOOK_SECRET
```

---

## Next Steps

 **Worker deployed and verified!**

**Your API is live at:** `https://pan-api.your-subdomain.workers.dev`

**Next:**
- Continue with the main setup guide to configure webhooks and deploy your frontend

---

## Need Help?

- = [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- =' [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- = [FAQ & Troubleshooting](../faq.md)

---

**< Your backend is live on the edge!**

Users worldwide will get ~50ms response times thanks to Cloudflare's global network.
