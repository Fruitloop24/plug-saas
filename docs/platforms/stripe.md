# Stripe Setup Guide

**Time Estimate:** 10 minutes
**What You'll Configure:** Payment processing and subscription management

**📹 Video Guide:** [Watch Step 3 Setup Video](https://pansaasstorage.blob.core.windows.net/plug-saas-assets/step-3.mp4)

---

## What Stripe Does in This Template

Stripe handles all payment and subscription logic:
- Processes credit card payments
- Manages recurring subscriptions (monthly billing)
- Provides customer portal for users to manage their subscriptions
- Sends webhooks when subscriptions are created, updated, or cancelled

Your backend receives these webhooks and updates the user's tier in Clerk automatically.

---

## What You'll Get from Stripe

By the end of this guide, you'll have:

- ✅ **Secret Key** (starts with `sk_test_...`)
- ✅ **Price ID** for each paid tier (starts with `price_...`)
- ✅ **Portal Configuration ID** (starts with `bpc_...`)

These go in your config files → See [Backend ENV Example](../sample-files/backend-dev-vars-example.md)

---

## Step 1: Switch to Test Mode

### 1.1 Log In to Stripe

📍 Go to: **https://dashboard.stripe.com**

Sign in or create a free account if you don't have one.

### 1.2 Enable Test Mode

Look in the **top-right corner** of the dashboard for a toggle switch.

Make sure it says **"TEST MODE"** (you should see a test mode banner at the top).

⚠️ **Important:** Always use test mode for local development. You'll switch to live mode only when deploying to production.

In test mode, you can use test credit card numbers and no real money is processed.

---

## Step 2: Get Your Secret Key

### 2.1 Navigate to API Keys

📍 Click **"Developers"** in the top navigation → Click **"API keys"**

Direct link: **https://dashboard.stripe.com/test/apikeys**

### 2.2 Copy Your Secret Key

Look for **"Secret key"** in the "Standard keys" section.

- It starts with `sk_test_` (for test mode)
- Click **"Reveal test key"** if it's hidden
- Click the copy button

**Keep this key secret** - it's used by your backend to create checkout sessions and process webhooks.

You'll add this to:
- `api/dev.env` as `STRIPE_SECRET_KEY`

💡 You'll get production keys (`sk_live_`) later during deployment.

---

## Step 3: Create ONE Product with Multiple Prices

⚠️ **IMPORTANT: For upgrade/downgrade with proration to work, all your tier prices MUST be on the SAME product.**

You'll create ONE product (e.g., "SaaS Subscription") and add multiple prices to it (Free, Pro, Developer, etc.).

### 3.1 Create the Product

📍 Click **"Product catalog"** in the left sidebar → Click **"Add product"**

Direct link: **https://dashboard.stripe.com/test/products**

Fill in:
- **Name:** `Your SaaS Subscription` (or your product name)
- **Description:** (optional) `Subscribe to access premium features`
- **Price:** `$0.00` USD, Monthly, Recurring (this will be your Free tier)

Click **"Add product"** to save.

### 3.2 Go Back and Edit the Product

1. Go back to **Product catalog**
2. Click on the product you just created
3. Click the **"Edit"** button (top right corner)

Now you'll see the full product editor with the Pricing section.

### 3.3 Add Your Tier Prices

In the edit view, find the **Pricing** section and add each tier:

1. Click **"Add another price"**
2. Set: `$20.00` USD, Monthly, Recurring → This is your **Pro** tier
3. Click **"Add another price"** again
4. Set: `$50.00` USD, Monthly, Recurring → This is your **Developer** tier

Click **"Save"** when done.

### 3.4 Get the Price IDs (CRITICAL)

You should now have ONE product with multiple prices:
```
Product: "Your SaaS Subscription" (prod_xxx)
  ├── Free:      $0/month   → price_abc123
  ├── Pro:       $20/month  → price_def456
  └── Developer: $50/month  → price_ghi789
```

Copy EACH **Price ID** (starts with `price_`). Add them to `api/.dev.vars`:
```bash
STRIPE_PRICE_ID_FREE=price_xxx
STRIPE_PRICE_ID_PRO=price_yyy
STRIPE_PRICE_ID_DEVELOPER=price_zzz
```

⚠️ Copy **PRICE IDs** (start with `price_`), NOT the Product ID (starts with `prod_`)

### Why One Product with Multiple Prices?

This enables **automatic proration** when users upgrade or downgrade:

- **Upgrade (Pro → Developer):** User pays the prorated difference
- **Downgrade (Developer → Pro):** User gets credit on next invoice
- **No duplicate subscriptions:** Existing subscription is updated, not replaced

---

## Step 4: Enable Customer Portal

The Customer Portal lets your users manage their own subscriptions (update payment method, cancel, view invoices).

### 4.1 Navigate to Customer Portal Settings

📍 Click **"Settings"** in the top navigation → **"Billing"** → **"Customer portal"**

Direct link: **https://dashboard.stripe.com/test/settings/billing/portal**

### 4.2 Activate the Portal

Click the **"Activate"** button (or it might say "Activate test link" in test mode)

### 4.3 Configure Portal Settings (Optional)

You can customize what users can do in the portal:

**Default settings are fine for now:**
- ✅ Update payment methods
- ✅ Cancel subscriptions
- ✅ View invoices

Click **"Save"** if you made any changes.

### 4.4 Get the Portal Configuration ID

After activating, look for the **Configuration ID** at the top of the page.

It looks like: `bpc_1Abc23DEfg45HIjk` (starts with `bpc_`)

Click the copy button.

You'll add this to:
- `api/dev.env` as `STRIPE_PORTAL_CONFIG_ID`

💡 This ID tells Stripe which portal configuration to use when your users click "Manage Billing" in your app.

---

## Step 5: Webhooks (You'll Set This Up During Testing)

You don't need to configure webhooks right now.

When you get to the "Test Locally" step in the main README, you'll use the Stripe CLI to forward webhooks to your local server.

**For now, just note:** You'll need to run this command later:
```bash
stripe listen --forward-to http://localhost:8787/webhook/stripe
```

This will give you a webhook secret that starts with `whsec_...`

---

## What You Have Now

You should have collected these values:

### One Product with Multiple Prices:
1. **STRIPE_SECRET_KEY** = `sk_test_abc123...` (your actual key)
2. **STRIPE_PRICE_ID_FREE** = `price_xxx...` (Free tier - $0/month)
3. **STRIPE_PRICE_ID_PRO** = `price_yyy...` (Pro tier - $20/month)
4. **STRIPE_PRICE_ID_DEVELOPER** = `price_zzz...` (Developer tier - $50/month)
5. **STRIPE_PORTAL_CONFIG_ID** = `bpc_def456...` (your actual config ID)

All price IDs should be from the **same product**.

### Where These Go

**Backend** (`api/.dev.vars`):
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# All prices from ONE product (enables proration)
STRIPE_PRICE_ID_FREE=price_YOUR_FREE_ID
STRIPE_PRICE_ID_PRO=price_YOUR_PRO_ID
STRIPE_PRICE_ID_DEVELOPER=price_YOUR_DEV_ID

STRIPE_PORTAL_CONFIG_ID=bpc_YOUR_ID_HERE
```

📋 **See complete example:** [Backend ENV File](../sample-files/backend-dev-vars-example.md)

---

## Common Mistakes to Avoid

### ❌ Copied Product ID Instead of Price ID
**Wrong:** `prod_abc123...` (product ID)
**Correct:** `price_xyz789...` (price ID)

**Where to find it:** On the product page, scroll to "Pricing" section - the ID under the price amount.

### ❌ Created Separate Products for Each Tier
**Wrong:** Pro Product, Developer Product, Enterprise Product (separate products)
**Correct:** ONE product with multiple prices (Free, Pro, Developer prices)

**Why it matters:** Proration only works when switching between prices on the SAME product. Separate products = no proration, potential duplicate subscriptions.

### ❌ Used Live Mode Keys for Local Dev
**Check:** Your secret key should start with `sk_test_` (not `sk_live_`)
**Check:** Top-right corner shows "TEST MODE" banner

### ❌ Forgot to Activate Customer Portal
**Symptom:** Users click "Manage Billing" and get an error
**Fix:** Go to Settings → Billing → Customer portal → Click "Activate"

### ❌ Can't Find "Add Another Price" Button
**Fix:** You must EDIT the product after creating it:
1. Go to Product catalog
2. Click on your product
3. Click **Edit** (top right)
4. Now you'll see the option to add more prices

---

## Testing Your Stripe Setup

You can't fully test until you've configured webhooks (which happens during the "Test Locally" step).

But you can verify your setup:

✅ **Check you're in test mode** (banner at top)  
✅ **Check you have products** (Go to Products, see your tiers listed)  
✅ **Check you copied price IDs** (They start with `price_` not `prod_`)  
✅ **Check portal is active** (Settings → Billing → Customer portal shows "Active")

---

## Next Steps

✅ **Stripe is configured!**

You now have:
- Payment processing ready
- Products created for each paid tier
- Customer portal enabled for subscription management

**Next:** Add these values to your config files, then continue with the remaining setup steps in the main README.

📋 **See where to add these:** [Backend ENV File](../sample-files/backend-dev-vars-example.md)

---

## Need Help?

- 📖 [Stripe Official Documentation](https://stripe.com/docs)
- 💳 [Test Card Numbers](https://stripe.com/docs/testing) (for testing payments later)
- 🔔 [Webhooks Guide](https://stripe.com/docs/webhooks) (you'll set these up during testing)
- 💬 [FAQ](../information/faq.md) - Common questions and troubleshooting