# Configure Pricing Tiers

**STEP 1: ASK QUESTIONS (one at a time)**

1. How many tiers? (2-4)
2. For EACH tier ask:
   - Tier name? (lowercase, no spaces, e.g., free, pro, business)
   - Display name? (e.g., Free, Pro, Business)
   - Price? (dollars, just number, e.g., 0, 29, 99)
   - Limit? (number or 'unlimited', e.g., 5, 100, unlimited)
   - Features? (comma-separated, e.g., 'API access, Email support')
   - Stripe Price ID? (price_xxxxx or 'none' for free tier)
   - Popular badge? (yes/no)

**STEP 2: UPDATE EVERYTHING**

**Backend: api/src/index.ts**

1. Line ~50 - Update UsageData plan with ALL tier names:
   ```typescript
   plan: 'free' | 'developer' | 'enterprise';  // USE ALL COLLECTED TIER NAMES
   ```

2. Line ~63 - Update PlanTier type with ALL tier names:
   ```typescript
   type PlanTier = 'free' | 'developer' | 'enterprise';  // USE ALL COLLECTED TIER NAMES
   ```

3. Line ~33-34 - Add Env STRIPE_PRICE_ID for PAID tiers only:
   ```typescript
   STRIPE_PRICE_ID_DEVELOPER?: string;  // ADD FOR EACH PAID TIER
   STRIPE_PRICE_ID_ENTERPRISE?: string;
   ```

4. Line ~65-81 - Update TIER_CONFIG with ALL tier data (name, price, limit):
   ```typescript
   const TIER_CONFIG: Record<string, { limit: number; price: number; name: string }> = {
     free: { name: 'Free', price: 0, limit: 5 },  // USE COLLECTED VALUES
     developer: { name: 'Developer', price: 50, limit: 100 },  // USE COLLECTED VALUES
     enterprise: { name: 'Enterprise', price: 200, limit: Infinity }  // USE COLLECTED VALUES (convert 'unlimited' to Infinity)
   };
   ```

5. Line ~86-89 - Update PRICE_ID_MAP with PAID tiers only:
   ```typescript
   const PRICE_ID_MAP: Record<string, (env: Env) => string> = {
     developer: (env) => env.STRIPE_PRICE_ID_DEVELOPER || '',  // PAID TIERS ONLY
     enterprise: (env) => env.STRIPE_PRICE_ID_ENTERPRISE || ''
   };
   ```

**Frontend: frontend-v2/src/pages/Dashboard.tsx**

Line ~26-50 - Update TIER_DISPLAY with ALL tiers (colors: tier1=slate, tier2=cyan, tier3=purple, tier4=orange):
```typescript
const TIER_DISPLAY: Record<string, {...}> = {
  free: { gradient: 'from-slate-500 to-slate-600', shadow: 'shadow-slate-500/30', badge: 'bg-slate-100 text-slate-600', icon: '📄' },
  developer: { gradient: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/30', badge: 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white', icon: '⚡' },
  enterprise: { gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/30', badge: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white', icon: '🚀' }
};  // USE ALL COLLECTED TIER NAMES
```

**Frontend: frontend-v2/src/pages/Landing.tsx**

1. Line ~15-47 - Update TIER_STYLES with ALL tiers (set highlighted=true if popular=yes):
   ```typescript
   const TIER_STYLES: Record<string, {...}> = {
     free: { ...colors, highlighted: false },  // USE ALL COLLECTED TIER NAMES, SET highlighted FROM USER ANSWER
     developer: { ...colors, highlighted: true },  // highlighted=true if user said "yes" to popular badge
     enterprise: { ...colors, highlighted: false }
   };
   ```

2. Line ~50-71 - Update getTierFeatures with ALL tiers AND their features:
   ```typescript
   const getTierFeatures = (tier: Tier): string[] => {
     const features: string[] = [];

     // Add limit as FIRST feature
     if (tier.limit === 'unlimited') {
       features.push('Unlimited documents');
     } else {
       features.push(`${tier.limit} documents/month`);  // USE COLLECTED LIMIT
     }

     // Add ALL user features for EACH tier
     if (tier.id === 'free') {
       features.push('API access');  // SPLIT USER'S COMMA-SEPARATED FEATURES
       features.push('Email support');  // AND ADD EACH ONE
     } else if (tier.id === 'developer') {
       features.push('Advanced API');  // USE COLLECTED FEATURES FOR THIS TIER
       features.push('Priority support');
     } else if (tier.id === 'enterprise') {
       features.push('Custom API');  // USE COLLECTED FEATURES FOR THIS TIER
       features.push('Dedicated support');
     }

     return features;
   };
   ```

**Frontend: frontend-v2/src/pages/ChoosePlanPage.tsx**

1. Line ~79-90 - Update getTierGradient with ALL tiers:
   ```typescript
   const getTierGradient = (tierId: string) => {
     switch (tierId) {
       case 'free': return 'bg-white border-2 border-slate-200';
       case 'developer': return 'bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700';
       case 'enterprise': return 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700';
       default: return 'bg-gradient-to-br from-blue-500 to-blue-600';
     }  // USE ALL COLLECTED TIER NAMES
   };
   ```

2. Line ~92-109 - Update getFeatures with ALL tiers AND their features:
   ```typescript
   const getFeatures = (tier: Tier) => {
     const limitText = tier.limit === 'unlimited' ? 'Unlimited requests' : `${tier.limit} requests/month`;
     const features: string[] = [limitText];  // LIMIT IS FIRST

     // Add ALL user features for EACH tier
     if (tier.id === 'free') {
       features.push('API access');  // SPLIT USER'S COMMA-SEPARATED FEATURES
       features.push('Email support');  // AND ADD EACH ONE
     } else if (tier.id === 'developer') {
       features.push('Advanced API');  // USE COLLECTED FEATURES FOR THIS TIER
       features.push('Priority support');
     } else if (tier.id === 'enterprise') {
       features.push('Custom API');  // USE COLLECTED FEATURES FOR THIS TIER
       features.push('Dedicated support');
     }

     return features;
   };
   ```

**Env: api/.dev.vars**

Add STRIPE_PRICE_ID for PAID tiers only:
```
STRIPE_PRICE_ID_DEVELOPER=price_1SKpMg2L5f0FfOp2d6zGtYbW  # USE COLLECTED PRICE ID
STRIPE_PRICE_ID_ENTERPRISE=price_1SKpLH2L5f0FfOp2CU2X4CJU  # USE COLLECTED PRICE ID
```

**STEP 3: VALIDATE**

```bash
grep -n "usageCount >=" api/src/index.ts
grep -n "const getTierFeatures" frontend-v2/src/pages/Landing.tsx -A 30
grep -n "const getFeatures" frontend-v2/src/pages/ChoosePlanPage.tsx -A 30
```

**STEP 4: REPORT**

✅ Updated 3 tiers: free, developer, enterprise
✅ All tier names updated in backend types
✅ All tier configs updated (name, price, limit)
✅ All tier features updated in Landing.tsx
✅ All tier features updated in ChoosePlanPage.tsx
✅ All tier styles updated
✅ All Stripe Price IDs added to .dev.vars

⚠️ RESTART API SERVER: cd api && npm run dev
