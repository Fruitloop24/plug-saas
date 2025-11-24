<div align="center">

<h1>
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Electric%20Plug.png" alt="Plug" width="50" height="50" />
  plug-saas
</h1>

### No DB. No Cost. Just Plug In Your Product.

**Production-ready SaaS infrastructure with Auth, Billing, and Usage Tracking built-in.**

**Customize your landing page, pricing tiers, and features with AI-powered configuration.**

[🚀 Live Demo](https://clerk-frontend.pages.dev) • [⚡ Quick Start](#quick-start)

[![GitHub stars](https://img.shields.io/github/stars/Fruitloop24/plug-saas?style=social)](https://github.com/Fruitloop24/plug-saas/stargazers)

---

**$0 hosting until 10k users** • **Deploy in 15 minutes** • **Global edge network (300+ cities)**

### 🎬 Watch It In Action

<div align="center">

**[🎥 What is Plug-SaaS?](https://pub-55b8a70d0dfd4d62880e0bdd35d82251.r2.dev/plug-saas-promo-bg.mp4)** • **[⚡ Clone to Live Testing in 10 Minutes](https://pub-55b8a70d0dfd4d62880e0bdd35d82251.r2.dev/clone-local-test.mp4)** • **[🌍 Deploy to the Global Edge](https://pub-55b8a70d0dfd4d62880e0bdd35d82251.r2.dev/deploy-worker-pages.mp4)**

</div>

</div>

---

## This is a Complete, Working SaaS Application

**[👉 Try the live demo now](https://clerk-frontend.pages.dev)** - See it in action:

1. Sign up with Google
2. Upgrade to Pro (use test card `4242 4242 4242 4242`)
3. Click "Process Document" to test usage tracking
4. Watch the dashboard update in real-time
5. Access billing portal to manage subscription

That's **auth + billing + usage tracking + customer portal**. All working. Right now.

**The "Process Document" button is where YOUR product logic goes.** Everything else is already built.

---

## What You Get vs What You Add

### ✅ You Get (Complete & Working)
- Landing page with pricing
- Clerk authentication (email + OAuth)
- Stripe checkout + subscriptions
- Usage tracking with monthly resets
- Dashboard with real-time counter
- Customer billing portal
- Rate limiting (100 req/min)
- Edge deployment (300+ cities)
- CI/CD pipeline
- **Zero database maintenance** - No DB needed for auth/billing

### 🎯 You Add (Your Product)
Replace the "Process Document" button with your actual logic:
```typescript
// api/src/index.ts - around line 650
const result = await yourFunction(userId, plan, requestBody);
// That's it. Auth, billing, usage tracking already handled.
```

---

## Who This Is For

**Got an app?** Deploy this, wire it up, start charging.
**Got an API?** Same deal. 15 minutes to connect.
**Got an idea?** Build your thing, plug it in later. The hard part's done.
**Got nothing but ambition?** Clone this, figure out your product while your competitors are still setting up Stripe.

**Perfect for:**
- Indie hackers who've built the 10th auth system and are done with that
- Developers with APIs that need monetization yesterday
- Teams who'd rather ship features than debug webhooks
- Anyone allergic to $150/month hosting bills before their first customer

---

## ✨ The Hard Parts, Already Built

<table>
<tr>
<td width="50%">

### 🎨 Complete Frontend Template
**Working React template included**: Pricing pages, protected routes, customer portal, dashboard, tier cards. All wired up and ready to use.

</td>
<td width="50%">

### 🤖 AI-Assisted Setup & Deployment
**Configured via Claude Code commands**: Answer questions, we handle the rest.
- `/configure-tiers` - Frontend routes, pricing cards, backend limits, Stripe setup
- `/deploy-worker` - Validates secrets, creates KV, deploys API, generates webhook URL

**[See commands →](https://github.com/Fruitloop24/plug-saas/blob/master/.claude/commands/)**

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Stateless JWT Authentication
User's plan lives in the token. **Zero database lookups** for authorization.

**[🔍 Architecture deep dive →](https://github.com/Fruitloop24/plug-saas/blob/master/docs/features/architecture.md)**

</td>
<td width="50%">

### 💳 Subscription Billing
Stripe integration with webhooks, customer portal, and tier management.

**[💰 Cost breakdown →](https://github.com/Fruitloop24/plug-saas/blob/master/docs/features/cost-breakdown.md)**

</td>
</tr>
<tr>
<td width="50%">

### 📊 Usage Limits & Tracking
Per-tier request limits with monthly resets. Built-in enforcement.

**[🏗️ Architecture guide →](https://github.com/Fruitloop24/plug-saas/blob/master/docs/features/architecture.md)**

</td>
<td width="50%">

### 🌍 Global Edge Deployment
Runs in **300+ cities**. ~50ms response times worldwide. Zero cold starts.

**[📐 How it works →](https://github.com/Fruitloop24/plug-saas/blob/master/docs/features/architecture.md)**

</td>
</tr>
<tr>
<td width="50%">

### 🛡️ Security Hardening
Rate limiting, webhook verification, CORS, security headers. **Built-in.**

**[🔒 Security guide →](https://github.com/Fruitloop24/plug-saas/blob/master/docs/information/security.md)**

</td>
<td width="50%">

### 💵 $0 Hosting Costs
**Free until 10k+ users** on Cloudflare's free tier. Then ~$31/month.

**[📈 See cost breakdown →](https://github.com/Fruitloop24/plug-saas/blob/master/docs/features/cost-breakdown.md)**

</td>
</tr>
</table>

## What Makes This Different

**1. Your Product Plugs In**

This template is the infrastructure layer. You provide the product logic:

```typescript
// api/src/index.ts - Add your endpoint

if (url.pathname === '/api/your-feature' && request.method === 'POST') {
  // JWT already verified, userId and plan available
  // Tier limits already checked

  // YOUR CODE HERE
  const result = await yourBusinessLogic(userId, plan);

  // Usage automatically tracked
  return new Response(JSON.stringify({ result }), { status: 200 });
}
```

The JWT, usage tracking, and tier enforcement are already wired up. You write the features.

**2. Edge-Native Architecture**

Your API runs globally, not in a single region. Cloudflare deploys your code to 300+ cities. Users in Tokyo, London, and New York all get ~50ms response times.

**Zero cold starts.** No Lambda spin-up delays. Always-on Workers.

**3. No Database Until You Need One**

- **User identity** → Clerk stores it
- **Subscription status** → Stripe stores it
- **Usage counters** → Cloudflare KV (key-value store)

You only add a database when YOU need to store YOUR app's data (documents, files, posts, etc.). Not for auth/billing infrastructure.

**JWT as Single Source of Truth:**

Traditional SaaS: `Request → Verify auth → Query DB for plan → Check limits → Process`

This template: `Request → Verify JWT (plan included) → Check limits → Process`

**No database lookups.** The user's subscription tier is embedded in their JWT. When they upgrade, Stripe webhooks update Clerk metadata, and the next JWT automatically includes the new plan.

**📖 Deep dive:** [Architecture Guide](https://github.com/Fruitloop24/plug-saas/blob/master/docs/features/architecture.md)

---

## Quick Start

### Prerequisites

Before you begin, make sure you have:

- **Node.js 20+** installed
- **Wrangler CLI** - Cloudflare's deployment tool: `npm install -g wrangler`
- **Stripe CLI** - For webhook testing: [Install guide](https://stripe.com/docs/stripe-cli#install)
- **Accounts created** (all free to start):
  - Cloudflare account (free tier)
  - Clerk account (free up to 10k users)
  - Stripe account (test mode)

### 1. Clone & Install

**📹 Video Guide:** [Watch Step 1 Setup Video](https://pub-55b8a70d0dfd4d62880e0bdd35d82251.r2.dev/Step-1.mp4)

**Open your terminal and run these commands:**

**a) Clone the repository**
```bash
git clone https://github.com/Fruitloop24/plug-saas.git
cd plug-saas
```

**b) Install backend dependencies**
```bash
cd api
npm install
cd ..
```

**c) Install frontend dependencies**
```bash
cd frontend-v2
npm install
cd ..
```

**✅ Now open the project in VS Code (or your preferred IDE/editor) to continue with configuration:**
```bash
code .
```

**d) Rename the example configuration files (IMPORTANT - required for the app to work):**

In your IDE, locate and rename these files by removing `.example` from the filename:
- `api/.dev.vars.example` → rename to `api/.dev.vars`
- `frontend-v2/.env.example` → rename to `frontend-v2/.env`

These files will be filled in with your API keys in the next steps.

### 2. Set Up Clerk Authentication

Clerk handles all user authentication and JWT tokens for this application.

**📹 Video Guide:** [Watch Step 2 Setup Video](https://pub-55b8a70d0dfd4d62880e0bdd35d82251.r2.dev/step-2.mp4)

**📖 Follow the detailed setup guide:** [Clerk Setup Guide](https://github.com/Fruitloop24/plug-saas/blob/master/docs/platforms/clerk.md)

This guide will walk you through:
- Creating your Clerk application
- Setting up the JWT template (required for tier system)
- Getting your API keys

**✅ When complete, add your Clerk keys to the config files you renamed in Step 1:**

**📋 See complete examples:** [Backend .dev.vars](https://github.com/Fruitloop24/plug-saas/blob/master/docs/sample-files/backend-dev-vars-example.md) | [Frontend .env](https://github.com/Fruitloop24/plug-saas/blob/master/docs/sample-files/frontend-env-example.md)

Your `api/.dev.vars` should look like this:
```bash
# Clerk Configuration
CLERK_SECRET_KEY=sk_test_abc123...      # From Clerk Dashboard
CLERK_PUBLISHABLE_KEY=pk_test_xyz789... # From Clerk Dashboard
CLERK_JWT_TEMPLATE=pan-api              # Exact value (must match template name)

```

Your `frontend-v2/.env` should look like this:
```bash
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xyz789... # Same as above
VITE_API_URL=http://localhost:8787           # Local backend URL
```

### 3. Set Up Stripe Payments

Stripe handles all payment processing and subscription billing for this application.

**📹 Video Guide:** [Watch Step 3 Setup Video](https://pub-55b8a70d0dfd4d62880e0bdd35d82251.r2.dev/step-3.mp4)

**📖 Follow the detailed setup guide:** [Stripe Setup Guide](https://github.com/Fruitloop24/plug-saas/blob/master/docs/platforms/stripe.md)

This guide will walk you through:
- Getting your Stripe API keys
- Creating products for each paid tier (Pro, Enterprise, etc.)
- Setting up the Customer Portal for subscription management
- Getting your Price IDs and Portal Configuration ID

**📋 See complete backend config:** [Backend .dev.vars Example](https://github.com/Fruitloop24/plug-saas/blob/master/docs/sample-files/backend-dev-vars-example.md)

**✅ When complete, you should have:**

Your `api/.dev.vars` should now look like this:
```bash
# Clerk Configuration (from Step 2)
CLERK_SECRET_KEY=sk_test_abc123...
CLERK_PUBLISHABLE_KEY=pk_test_xyz789...
CLERK_JWT_TEMPLATE=pan-api

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_def456...           # From Stripe Dashboard
STRIPE_PRICE_ID_PRO=price_1Abc23DEfg45HIjk    # Pro tier product price ID

# Add a STRIPE_PRICE_ID for each paid tier you created in Stripe
# The variable name should match whatever you named your tiers/products
STRIPE_PRICE_ID_ENTERPRISE=price_1Xyz98WVut76 # Enterprise tier product price ID (if applicable)

STRIPE_PORTAL_CONFIG_ID=bpc_1SK6M             # For customer subscription management
```

### 4. Configure Your Pricing Tiers

The default template includes a complete multi-tier system (Free, Pro, Enterprise) with frontend routes, pricing cards, and backend enforcement. Customize it in minutes:

**📹 Video Guide:** [Watch Step 4-5 Setup Video](https://pub-55b8a70d0dfd4d62880e0bdd35d82251.r2.dev/step-4-5.mp4) (includes Step 5: Run Locally)

**Run the configuration command:**
```
/configure-tiers
```

Answer questions about your tiers (name, price, limit, features), and it automatically updates:
- ✅ Backend tier limits and Stripe integration
- ✅ Frontend pricing cards and routes
- ✅ Dashboard tier displays
- ✅ All environment variables

Works with Claude Code, Gemini CLI, Codex CLI, or DeepSeek. [See the command →](.claude/commands/configure-tiers.md)

**Prefer manual setup?** Follow the [Manual Tier Setup Guide](./docs/sample-files/manual-tier-setup.md) for step-by-step instructions.

---

### 5. Run Locally (3 Terminals)

**Terminal 1 - Backend:**
```bash
cd api && npm run dev
# http://localhost:8787
```

**Terminal 2 - Frontend:**
```bash
cd frontend-v2 && npm run dev
# http://localhost:5173
```

**Terminal 3 - Stripe Webhooks (Local Testing):**
```bash
stripe listen --forward-to http://localhost:8787/webhook/stripe
```

**⚠️ IMPORTANT:** After running this command, the Stripe CLI will output a webhook signing secret starting with `whsec_...`

Copy this secret and add it to your `api/.dev.vars` file:
```bash
STRIPE_WEBHOOK_SECRET=whsec_... # Paste the value from the terminal
```

Then restart Terminal 1 (the backend server) for the change to take effect.

### 5. Test End-to-End

1. Open http://localhost:5173
2. Sign up with email
3. Make 5 free requests (hit the limit)
4. Click "Upgrade to Pro"
5. Use test card: `4242 4242 4242 4242`
6. Verify unlimited access after refresh

**It works!** 🎉

---

## Deploy to Production

Once local development is working, you're ready to deploy your SaaS to production.

### 6. Deploy Backend API (Cloudflare Workers)

Deploy your API to Cloudflare's global edge network (300+ cities) in minutes:

**📹 Video Guide:** [Watch Step 6 Setup Video](https://pub-55b8a70d0dfd4d62880e0bdd35d82251.r2.dev/step-6.mp4)

**Run the deployment command:**
```
/deploy-worker
```

The command handles all the tedious parts:
- ✅ Validates all your Clerk & Stripe environment variables
- ✅ Creates your KV namespace for usage tracking
- ✅ Sets all production secrets securely in Cloudflare
- ✅ Deploys your Worker to the edge
- ✅ Returns your live API URL
- ✅ Generates your webhook endpoint URL for Step 7

Works with Claude Code, Gemini CLI, Codex CLI, or DeepSeek. [See the command →](.claude/commands/deploy-worker.md)

**✅ When complete:**
- Your API is live at: `https://your-worker.workers.dev`
- All secrets configured securely
- KV namespace created and bound
- Ready to configure Stripe webhooks (Step 7)

**Prefer manual control?** Follow the [Cloudflare Workers Deployment Guide](./docs/deployments/cloudflare.md) for step-by-step instructions.

**⭐ Optional - Auto-Deploy with GitHub Actions:**

This repo includes GitHub Actions for automatic Worker deployment on push. To enable it, you'll need to add Cloudflare secrets to your repository.

**📖 See setup guide:** [GitHub Actions Auto-Deploy](./docs/deployments/github.md)

---

### 7. Configure Production Webhooks

Set up real production webhooks so Stripe can notify your API when subscriptions are created, updated, or cancelled. You'll use the webhook URL from Step 6.

**📹 Video Guide:** [Watch Step 7 Setup Video](https://pub-55b8a70d0dfd4d62880e0bdd35d82251.r2.dev/step-7.mp4)

**📖 Follow the deployment guide:** [Stripe Webhooks Deployment](./docs/deployments/stripe-deploy.md)

This guide walks you through:
- Migrating your Stripe products from test mode to live mode
- Updating environment variables with live Stripe keys and Price IDs
- Creating a production webhook endpoint in Stripe (using your URL from Step 6)
- Testing webhook delivery and the full upgrade flow

**✅ When complete:**
- All products in Stripe live mode with correct metadata
- Live Stripe keys and Price IDs configured in your worker
- Production webhook endpoint live and receiving events
- Real-time subscription updates working (upgrade/downgrade/cancel)

---

### 8. Deploy Frontend

Deploy your React frontend to Cloudflare Pages for global access and fast load times.

**📹 Video Guide:** [Watch Step 8 Setup Video](https://pub-55b8a70d0dfd4d62880e0bdd35d82251.r2.dev/step-8.mp4)

**📖 Follow the deployment guide:** [Cloudflare Pages Frontend Deployment](./docs/deployments/frontend-deploy.md)

This guide walks you through:
- Pushing your code to GitHub and connecting your repository
- Creating a Cloudflare Pages project
- Configuring build settings for Vite
- Adding production environment variables (live Clerk keys and API URL)
- Verifying your live frontend connects to your backend API

**✅ When complete:**
- Your frontend is live at: `https://your-project.pages.dev`
- Connected to your production backend from Step 6
- Automatic deployments on every git push
- Full authentication and subscription flows working end-to-end

---

## Architecture

Want to understand how the stateless JWT architecture works? How Stripe webhooks sync with Clerk? How usage tracking works without a database?

**📖 Read the complete architecture guide:** [Architecture Guide](./docs/features/architecture.md)

This guide covers:
- JWT as single source of truth (how plan metadata flows)
- Complete data flow diagrams (sign-up → upgrade → tier enforcement)
- Webhook integration architecture (Stripe → Clerk sync)
- Usage tracking with Cloudflare KV
- Why this approach scales without a database

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vite + React 19 | Pure client-side SPA |
| **Frontend Hosting** | Cloudflare Pages | Static CDN (free, unlimited) |
| **Auth** | Clerk | User management + JWT issuance |
| **Payments** | Stripe | Subscriptions + webhooks + portal |
| **API** | Cloudflare Workers | Serverless edge functions |
| **Storage** | Cloudflare KV | Usage counters (key-value store) |
| **CSS** | Tailwind CSS v3 | Utility-first styling |
| **CI/CD** | GitHub Actions | Automated Worker deployment |

---

## Cost Breakdown

**$0/month until 10,000+ users. Then ~$31/month. At 100k users: ~$109/month.**

Compare that to typical SaaS stacks costing $75-150/month from day one.

**📖 See the complete cost analysis:** [Cost Breakdown & Comparison](./docs/features/cost-breakdown.md)

This guide includes:
- Detailed cost breakdown at every scale (0-100k+ users)
- What triggers each cost increase (so you can forecast)
- Comparisons to other stacks (Vercel, AWS, Firebase, other SaaS templates)
- Cost optimization strategies (batch operations, caching, aggregation)
- Real-world cost projections with revenue scenarios
- Hidden costs you avoid (database maintenance, CDN, SSL, monitoring)

**TL;DR:** Infrastructure costs ~3% of revenue instead of 15%. More money for building your product.

---

## Testing

**📖 See the complete testing guide:** [Testing Guide](./docs/testing.md)

The testing guide covers:
- Setting up local development with Stripe webhooks
- End-to-end flow testing (sign up → upgrade → usage tracking)
- Test card numbers for different payment scenarios
- Webhook verification and debugging

**Important Note:** The specific test cases in the guide are examples. Since you'll be replacing the "Process Document" logic with your own product functionality, your actual tests will differ. Use the guide as a framework for testing the infrastructure (auth, billing, usage tracking), then add tests specific to your product logic.

---

## File Structure

**Backend:** `api/` - Cloudflare Worker with JWT auth + Stripe webhooks (~1,020 lines)
**Frontend:** `frontend-v2/` - React + Vite SPA (~1,500 lines)
**Docs:** `docs/` - Complete setup and deployment guides

**📖 See the complete project structure:** [Project File Structure](https://github.com/Fruitloop24/plug-saas/blob/master/docs/sample-files/project-file-structure.md)

This guide includes:
- Full directory tree with explanations
- Key files and what they do
- Environment variables reference
- Build artifacts and gitignored files
- Common file operations (adding pages, endpoints, tiers)

---

## FAQ

Got questions about the template? How to customize it? What works with what?

**📖 Read the complete FAQ:** [Frequently Asked Questions](./docs/information/faq.md)

Common topics covered:
- Framework compatibility (Next.js, Vue, Svelte, React Native)
- Alternative payment providers (Paddle, LemonSqueezy, PayPal)
- Platform alternatives (Vercel Edge, Netlify, Deno Deploy)
- Adding a database (when and how)
- Troubleshooting common issues
- Security best practices
- Performance optimization

---

## Security

**Small attack surface. No servers to hack. Enterprise-grade security included for free.**

Built-in: JWT verification, webhook signing, rate limiting, security headers, PCI compliance.
Cloudflare: DDoS protection, WAF, Bot Fight Mode, IP restrictions, Access policies - all free.

**📖 Read the complete security guide:** [Security Guide](./docs/information/security.md)

This guide covers:
- Why edge deployment means fewer vulnerabilities (no servers to SSH into!)
- All 8 built-in security features explained (with code locations)
- **Cloudflare's 11 free security features** (DDoS, WAF, Bot Fight, Rate Limiting, Access, and more)
- Security best practices and monitoring
- Incident response procedures
- Compliance (SOC 2, ISO 27001, PCI DSS, GDPR)

---

## Work Together

### 🚀 Need Help?

Stuck on setup? Want custom features? Need it deployed ASAP?

**I offer paid consulting and setup services:**
- Complete deployment and configuration
- Custom tier structures and integrations
- Additional payment providers or databases
- Architecture consulting and optimization

**Contact:** [kc@panacea-tech.net](mailto:kc@panacea-tech.net)

### ⭐ Show Support

- **Star this repo** - Helps others discover it
- **Fork and build** - Make something awesome
- **Share it** - Help other builders find this

### 💬 Get Involved

- **Questions?** Open a GitHub issue or email me
- **Bug?** Submit an issue with details
- **Built something cool?** Share it!
- **Want to contribute?** PRs welcome

### 🤝 Open to Opportunities

Interested in partnerships, revenue shares, or white-label licensing?

**Let's talk:** [kc@panacea-tech.net](mailto:kc@panacea-tech.net)

---

## Known Limitations

This template is optimized for speed and simplicity. We've identified some trade-offs:

**📖 Read the full analysis:** [Known Limitations & Trade-Offs](./docs/information/limitations.md)

- KV eventual consistency (pay-per-use apps)
- Multi-dashboard observability
- No built-in CRM or customer success tools
- Single-region KV writes
- No testing suite

**Found something we missed?** [Let us know](mailto:kc@panacea-tech.net) - we're always improving this template.

---

## License

MIT - Use this template for commercial or personal SaaS projects.

---

## Acknowledgments

**Built with:**
- [Claude Code](https://claude.com/claude-code) - AI pair programming
- [Gemini CLI](https://ai.google.dev/) - AI assistance
- [Codex CLI](https://openai.com/codex) - AI code generation
- [DeepSeek](https://www.deepseek.com/) - AI development
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge compute
- [Clerk](https://clerk.com/) - Authentication
- [Stripe](https://stripe.com/) - Payments

**Contributors:**
- Claude Code
- Gemini CLI
- Codex CLI
- DeepSeek
- ChatGPT (OpenAI)

---

## Documentation

### Core Guides

- **[Architecture Guide](./docs/features/architecture.md)** - How JWT routing works, data flow diagrams, and system design
- **[Cost Breakdown](./docs/features/cost-breakdown.md)** - Detailed cost analysis at every scale, pricing comparisons
- **[Security Guide](./docs/information/security.md)** - Built-in security features + Cloudflare's free enterprise protections
- **[Testing Guide](./docs/testing.md)** - End-to-end testing checklist, 3-terminal local setup
- **[FAQ](./docs/information/faq.md)** - Common issues, troubleshooting, best practices
- **[Known Limitations](./docs/information/limitations.md)** - Trade-offs and upgrade paths as you scale

### Platform Setup Guides

- **[Clerk Setup](./docs/platforms/clerk.md)** - Authentication configuration and JWT template setup
- **[Stripe Setup](./docs/platforms/stripe.md)** - Payment processing and subscription configuration

### Deployment Guides

- **[Cloudflare Workers (Backend)](./docs/deployments/cloudflare.md)** - Deploy your API to the edge
- **[Stripe Webhooks Setup](./docs/deployments/stripe-deploy.md)** - Production webhook configuration
- **[Frontend Deployment](./docs/deployments/frontend-deploy.md)** - Deploy to Cloudflare Pages
- **[GitHub Actions CI/CD](./docs/deployments/github.md)** - Automated deployment pipeline

### Configuration & Reference

- **[Manual Tier Setup](./docs/sample-files/manual-tier-setup.md)** - Add/modify pricing tiers manually
- **[Project File Structure](./docs/sample-files/project-file-structure.md)** - Complete directory layout and file organization
- **[Backend Config Example](./docs/sample-files/backend-dev-vars-example.md)** - Sample environment variables (.dev.vars)
- **[Frontend Config Example](./docs/sample-files/frontend-env-example.md)** - Sample frontend environment (.env)

---

**⭐ If this template saves you time, consider starring the repo!**
