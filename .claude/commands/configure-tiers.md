# Configure Pricing Tiers

Ask the user SIMPLE questions, update files, and CHECK for common gotchas!

**Ask directly (one question at a time):**

1. "How many tiers? (2-4)"
2. For EACH tier, ask in plain text:
   - "Tier X name? (lowercase, no spaces, e.g., free, pro, plus, business)"
   - "Display name? (e.g., Free, Pro, Plus, Enterprise)"
   - "Price? (dollars, just the number, e.g., 0, 29, 199)"
   - "Limit? (number like 10, 500, or type 'unlimited')"
   - "Features? (comma-separated list, e.g., 'API access, Email support, Analytics')"
   - "Stripe Price ID? (e.g., price_xxxxx or type 'none' for free tier)"
   - "Show Popular badge? (yes/no)"

**Default colors (DON'T ASK USER):**
- Free tier: slate
- Tier 2: cyan
- Tier 3: purple
- Tier 4: orange

**Update these files:**

Backend: `api/src/index.ts`
- Line ~50: UsageData plan type union
- Line ~33-34: Env STRIPE_PRICE_ID vars
- Line ~64: PlanTier type
- Line ~66: TIER_CONFIG object
- Line ~86: PRICE_ID_MAP object
- Line ~758: handleCreateCheckout - MUST use dynamic fallback, not hardcoded tier name

Frontend Dashboard: `frontend-v2/src/pages/Dashboard.tsx`
- Line ~26: TIER_DISPLAY object
- **IMPORTANT:** Only update TIER_DISPLAY object. Do NOT modify template hints, blue callout boxes, or [Your Metric Name Here] text. Those are intentional template messaging.

Frontend Landing: `frontend-v2/src/pages/Landing.tsx`
- Line ~15: TIER_STYLES object
- Line ~50: getTierFeatures function
- **IMPORTANT:** There's a `<DemoInstructions />` component above the pricing cards. Keep it there or move it to make sense with the new tier layout. It shows users how to try the demo with test card 4242 4242 4242 4242. DO NOT delete this component.

Frontend ChoosePlan: `frontend-v2/src/pages/ChoosePlanPage.tsx`
- Line ~79: getTierGradient function
- Line ~92: getFeatures function

Env vars: `api/.dev.vars`
- Add STRIPE_PRICE_ID_[TIERNAME] lines

**Icons:** 📄 Free, ⚡ Plus, 🚀 Business/Enterprise, ✨ Pro, 💎 Premium

**Convert:** "unlimited" → Infinity in code

**CRITICAL CHECKS (after updating):**

1. **Search for hardcoded tier fallbacks:**
   - `api/src/index.ts` line ~758: Should be `Object.keys(PRICE_ID_MAP)[0]` NOT `'pro'` or `'plus'`
   - `api/src/stripe-webhook.ts` lines ~91, ~123: Should fail explicitly if tier missing, NO fallbacks

2. **Verify .dev.vars:**
   - Check all STRIPE_PRICE_ID_* variables are present for paid tiers
   - Warn user to restart API server

3. **Check consistency:**
   - All tier names in TIER_CONFIG match PRICE_ID_MAP
   - All tier names match type unions (UsageData, PlanTier)
   - All tier names have frontend styling entries
   - **IMPORTANT:** Must add features to BOTH Landing.tsx AND ChoosePlanPage.tsx:
     - `Landing.tsx` line ~50: `getTierFeatures()` function
     - `ChoosePlanPage.tsx` line ~92: `getFeatures()` function
     - Features must include the limits (e.g., "13 documents/month")

4. **VALIDATE ENVIRONMENT VARIABLES (Fast check - just verify they exist):**

   **Quick validation rules:**
   - Backend file: `api/.dev.vars` must exist
   - Frontend file: `frontend-v2/.env` must exist
   - Backend must have these lines (grep for them):
     - `CLERK_SECRET_KEY=sk_`
     - `CLERK_PUBLISHABLE_KEY=pk_`
     - `CLERK_JWT_TEMPLATE=pan-api`
     - `STRIPE_SECRET_KEY=sk_`
     - `STRIPE_WEBHOOK_SECRET=whsec_`
     - For each paid tier: `STRIPE_PRICE_ID_[TIERNAME]=price_`
   - Frontend must have these lines:
     - `VITE_CLERK_PUBLISHABLE_KEY=pk_`
     - `VITE_API_URL=http://localhost:8787`

   **Use a single Read on each file** to check all variables at once. Don't run individual bash commands.

   **If validation passes:** Show green checkmarks for all
   **If validation fails:** Show red X for missing/invalid ones with link to docs

**Report format:**
```
✅ Done! Updated 3 tiers: free, pro, enterprise

✅ ENVIRONMENT VALIDATION PASSED
All required variables present in api/.dev.vars and frontend-v2/.env

⚠️ NEXT STEPS - Start 3 terminals:

Terminal 1 - Backend API:
cd api && npm run dev

Terminal 2 - Frontend:
cd frontend-v2 && npm run dev

Terminal 3 - Stripe Webhooks (CRITICAL):
stripe listen --forward-to http://localhost:8787/webhook/stripe

⚠️ IMPORTANT: After running Terminal 3, Stripe CLI outputs a webhook secret (whsec_...).
If you haven't already added it to api/.dev.vars, copy it and add:
STRIPE_WEBHOOK_SECRET=whsec_...

Then restart Terminal 1 (backend) to load the new secret.

Test the upgrade flow:
1. Open http://localhost:5173
2. Sign up → Click "Upgrade Plan"
3. Select Pro or Enterprise tier
4. Use test card: 4242 4242 4242 4242
5. Verify tier change after checkout
```

**If validation fails, show errors like:**
```
❌ ENVIRONMENT VALIDATION FAILED

Backend (api/.dev.vars):
✅ CLERK_SECRET_KEY: Valid
✅ CLERK_PUBLISHABLE_KEY: Valid
❌ CLERK_JWT_TEMPLATE: Missing or not 'pan-api'
✅ STRIPE_SECRET_KEY: Valid
❌ STRIPE_WEBHOOK_SECRET: Missing (required for webhooks)
❌ STRIPE_PRICE_ID_ENTERPRISE: Missing (required for paid tier)

Frontend (frontend-v2/.env):
✅ VITE_CLERK_PUBLISHABLE_KEY: Valid
❌ VITE_API_URL: Missing

📖 Fix these issues before running:
- Clerk setup: docs/platforms/clerk.md
- Stripe setup: docs/platforms/stripe.md
- Sample configs: docs/sample-files/backend-dev-vars-example.md
```
