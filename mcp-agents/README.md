# AI-Powered SaaS Installer

**Stop copying and pasting from setup guides. Let AI guide you through deployment.**

This installer uses specialized AI agents to automate the tedious parts of deploying a production SaaS. Instead of following a 20-step manual guide, you work with an AI orchestrator that:

- ✅ Guides you through environment configuration (local + production)
- ✅ Helps retrieve and configure Clerk authentication
- ✅ Automates Stripe product/price creation with CLI commands
- ✅ Generates GitHub Actions CI/CD workflows
- ✅ Audits security configuration (CORS, JWT, webhooks)

**The twist?** You stay in control. The AI shows you what it's doing, waits for your approval at every step, and explains the "why" behind each configuration.

---

## How It Works

Instead of manually configuring everything yourself, you:

### 1. Clone and Navigate

```bash
git clone <your-repo-url>
cd clerk/mcp-agents
```

### 2. Launch the AI Orchestrator

```bash
claude code orchestration/coordinator.json
```

### 3. Start the Setup Process

```text
Run the orchestrator to perform full project setup.
```

### 4. Work with AI Agents Step-by-Step

The orchestrator will invoke 6 specialized agents in sequence:

**🎯 Onboarding Agent** - Checks prerequisites, configures environment files
**🔐 Clerk Agent** - Guides Clerk API key setup and JWT template configuration
**💳 Tiers Agent** - Automates Stripe product/price creation via CLI
**🎨 Frontend Agent** - Provides guidance for UI component integration
**🚀 Deployment Agent** - Generates GitHub Actions workflows and deployment config
**🛡️ Security Agent** - Audits CORS, JWT verification, webhook security, rate limits

**At each step:**
- The AI explains what it's about to do
- Shows you the exact commands or code changes
- Waits for your approval before executing
- Validates that each step completed successfully

**Result:** A fully configured SaaS in ~30-45 minutes (vs 2-3 hours manually).

---

## Why This Approach?

### Traditional Setup (Manual)
❌ 2-3 hours copying/pasting environment variables and running commands
❌ Easy to miss steps or misconfigure secrets
❌ No validation until you test the entire system end-to-end
❌ Every developer repeats the same tedious process

### AI-Orchestrated Setup
✅ 30-45 minutes with AI handling repetitive configuration
✅ Step-by-step validation after each phase
✅ Built-in verification (checks Stripe CLI, validates secrets)
✅ Human approval for security-critical decisions
✅ Reusable - run individual agents later to modify configuration

---

## What Gets Automated (And What Doesn't)

### ✅ Automated by AI Agents

- **Environment Files**: Creating `.dev.vars` and `.env` files with proper structure
- **Stripe CLI**: Running `stripe products create` and `stripe prices create` commands
- **Wrangler Secrets**: Executing `wrangler secret put` commands for production
- **Webhook Setup**: Creating Stripe webhook endpoints via CLI
- **GitHub Workflows**: Generating `.github/workflows/deploy-worker.yml` files
- **Code Validation**: Checking that JWT templates and rate limiting are configured

### ⚠️ Still Requires Manual Steps

- **Account Creation**: You need Clerk, Stripe, and Cloudflare accounts (free tiers work)
- **API Keys**: Retrieving keys from Clerk and Stripe dashboards (agents guide you to the right URLs)
- **Cloudflare Pages**: Configuring the Pages dashboard (no CLI available for this)
- **Approval Gates**: You review and approve each automation step
- **Testing**: Running the final end-to-end tests to verify everything works

**Why the honesty?** Some SaaS configuration genuinely requires human judgment (like reviewing security settings). The AI makes the process faster and less error-prone, but doesn't eliminate your involvement entirely.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR                              │
│         (coordinator.json - Master Conductor)                │
│                                                               │
│  Execution Mode: ITERATIVE (one agent at a time)            │
│  Human Approval: Required after each step                   │
└────────┬────────┬────────┬────────┬────────┬────────────────┘
         │        │        │        │        │
    ┌────▼────┐ ┌─▼──────┐ ┌──────▼┐ ┌──────▼┐ ┌──────▼────┐
    │ONBOARDING│ │CLERK  │ │TIERS │ │FRONTEND│ │DEPLOYMENT│
    │  AGENT   │ │ AGENT │ │AGENT │ │ AGENT  │ │  AGENT   │
    └─────────┘ └───────┘ └──────┘ └────────┘ └──────────┘
         │         │        │        │         │
    ┌────▼─────────▼────────▼────────▼─────────▼────┐
    │       KNOWLEDGE BASES (Templates & Docs)       │
    ├────────────────────────────────────────────────┤
    │ • project-config.json  (file paths & secrets)  │
    │ • clerk-knowledge.json (API keys & JWT setup)  │
    │ • tiers-knowledge.json (Stripe CLI commands)   │
    │ • frontend-knowledge.json (UI components)      │
    │ • deployment-knowledge.json (GitHub Actions)   │
    │ • security-knowledge.json (security features)  │
    │ • cloudflare-workers.txt (reference docs)      │
    │ • vite-react-tailwind.txt (reference docs)     │
    └────────────────────────────────────────────────┘
```

**How it works:**
1. **Orchestrator** reads `coordinator.json` to determine the sequence of agents
2. **Agents** are specialized JSON configs that define steps, tools, and knowledge bases
3. **Knowledge Bases** contain templates, CLI commands, and documentation links
4. **Human Approval** is required between each agent transition

---

## Quick Start

### Prerequisites

- Node.js 20+
- Claude Code CLI installed
- Free accounts: Clerk, Stripe, Cloudflare (all have free tiers)

### Launch the Orchestrator

```bash
cd /path/to/clerk/mcp-agents
claude code orchestration/coordinator.json
```

### Tell Claude to Start

```text
Run the orchestrator to perform full project setup.
```

### Follow the Prompts

The orchestrator will guide you through:

1. **Onboarding** - Environment setup & dependency install
2. **Clerk Configuration** - API keys & JWT template
3. **Tier Setup** - Stripe products, prices, webhooks
4. **Frontend Integration** - UI component guidance
5. **Deployment** - GitHub Actions & Cloudflare Pages
6. **Security Audit** - CORS, JWT, webhooks, rate limits

After each phase, you'll review the changes and approve before proceeding.

---

## Agents Reference

| Agent | Purpose | What It Automates | Knowledge Base(s) |
|-------|---------|-------------------|-------------------|
| **onboarding-agent** | Initial project setup | Prerequisite checks, env file creation, npm install | project-config.json |
| **clerk-agent** | Authentication config | Clerk key retrieval, JWT template setup, secret storage | clerk-knowledge.json |
| **tiers-agent** | Subscription tiers | Stripe product/price creation, webhook setup, backend refactoring | tiers-knowledge.json, frontend-knowledge.json |
| **frontend-agent** | UI component guidance | Component generation, Tailwind styling, Clerk integration | vite-react-tailwind.txt, frontend-knowledge.json |
| **deployment-agent** | CI/CD pipeline | GitHub Actions workflow generation, Pages configuration | deployment-knowledge.json |
| **security-agent** | Security audit | CORS validation, JWT verification checks, webhook security | security-knowledge.json |
| **testing-agent** | E2E testing | Playwright test setup (optional, run after orchestrator) | None |

---

## Who Is This For?

**Scenario 1: Solo Founder**
You're a designer/PM who can read code but don't want to spend a weekend configuring APIs. The AI installer gets you to MVP fast so you can focus on product-market fit.

**Scenario 2: Development Team**
Your team needs consistent staging/production environments. The orchestrator ensures everyone follows the same setup process with zero configuration drift.

**Scenario 3: Learning & Experimentation**
You want to understand production SaaS architecture. The AI explains each step as it executes, teaching you Clerk, Stripe, and Cloudflare Workers patterns.

**Scenario 4: Consultant/Agency**
You build SaaS products for clients. The orchestrator lets you deliver production-ready infrastructure in under an hour instead of billing days for setup.

---

## Folder Structure

```
mcp-agents/
├── orchestration/
│   └── coordinator.json       # Master orchestrator (defines phase sequence)
│
├── agents/                    # Individual agent configurations
│   ├── onboarding-agent.json
│   ├── clerk-agent.json
│   ├── tiers-agent.json
│   ├── frontend-agent.json
│   ├── deployment-agent.json
│   ├── security-agent.json
│   ├── testing-agent.json
│   └── cf-specialist.json     # Supplementary (not in main flow)
│
└── base/                      # Knowledge bases (reusable templates & docs)
    ├── project-config.json            # File paths & secret definitions
    ├── clerk-knowledge.json           # Clerk API keys & JWT setup
    ├── tiers-knowledge.json           # Stripe CLI commands & templates
    ├── frontend-knowledge.json        # UI component templates
    ├── deployment-knowledge.json      # GitHub Actions workflows
    ├── security-knowledge.json        # Security feature documentation
    ├── cloudflare-workers.txt         # Large reference doc (~40KB)
    └── vite-react-tailwind.txt        # Large reference doc (~19KB)
```

---

## Coordination Rules

The orchestrator follows strict rules to ensure safety and transparency:

1. ✅ **Never Skip Approval** - Always wait for human approval after each task
2. ✅ **Read Config First** - Always read agent config before invoking
3. ✅ **Read Knowledge Bases** - If agent references base knowledge, read it first
4. ✅ **Show Diffs** - Always show code changes before waiting for approval
5. ✅ **Test After Fix** - Run verification after each configuration step
6. ✅ **One Task at a Time** - Complete one task fully before moving to next

---

## Adding New Agents (Advanced)

Want to add custom agents? Here's the process:

### 1. Create a Knowledge Base (Optional)

Add a JSON or text file to `base/` with templates or documentation:

```json
{
  "my_feature": {
    "command": "example-cli create --name {{name}}",
    "docs": "https://example.com/docs"
  }
}
```

### 2. Create an Agent Config

Add a JSON file to `agents/` with your agent's steps:

```json
{
  "agent_name": "my-agent",
  "version": "1.0.0",
  "description": "Configure my custom feature",
  "knowledge_bases": ["../base/my-knowledge.json"],
  "steps": [
    {
      "id": "0_welcome",
      "title": "Welcome",
      "description": "Explain what this agent does"
    },
    {
      "id": "1_execute",
      "title": "Run Configuration",
      "description": "Execute the CLI command from knowledge base",
      "tool_to_run": ["example-cli create --name myapp"]
    }
  ]
}
```

### 3. Register in Orchestrator

Edit `orchestration/coordinator.json` to add your agent:

```json
{
  "available_agents": {
    "my-agent": {
      "config_path": "../agents/my-agent.json",
      "knowledge_bases": ["../base/my-knowledge.json"],
      "priority": "MEDIUM",
      "specialty": "Custom feature configuration"
    }
  },
  "execution_phases": [
    {
      "phase_id": "7_custom",
      "phase_name": "Custom Feature",
      "agent": "my-agent",
      "description": "Configure custom feature"
    }
  ]
}
```

### 4. Test Your Agent

Run the orchestrator or invoke your agent directly to test it.

---

## Troubleshooting

**Agent fails to read knowledge base:**
- Check that the `knowledge_bases` path is correct (relative to agent config)
- Ensure the JSON is valid (use `jsonlint` or similar)

**Stripe CLI commands fail:**
- Verify `STRIPE_SECRET_KEY` is set in your environment
- Run `stripe login` to authenticate
- Check that you have network access to Stripe API

**Wrangler secrets fail:**
- Make sure you're in the `api/` directory
- Authenticate with `wrangler login`
- Check that `wrangler.toml` is properly configured

**Orchestrator skips an agent:**
- Review `coordinator.json` execution_phases
- Ensure the agent is registered in `available_agents`
- Check that all required knowledge bases exist

---

## Best Practices

### For Users

- ✅ **Review Every Change** - Don't blindly approve; understand what each step does
- ✅ **Keep Keys Secret** - Never commit `.dev.vars` or `.env` files to git
- ✅ **Test Locally First** - Verify everything works locally before deploying to production
- ✅ **Save Agent Logs** - Keep terminal output for debugging if issues arise

### For Agent Developers

- ✅ **Small, Focused Agents** - Each agent should do one thing well
- ✅ **Clear Descriptions** - Every step should explain the "why" not just the "what"
- ✅ **Error Handling** - Provide helpful error messages and recovery steps
- ✅ **Idempotency** - Agents should be safe to run multiple times

---

## Success Metrics

After running the orchestrator, you should have:

- ✅ **Backend**: Cloudflare Worker with all secrets configured
- ✅ **Frontend**: React app ready to deploy on Cloudflare Pages
- ✅ **Auth**: Clerk integration complete with JWT template
- ✅ **Billing**: Stripe products, prices, and webhook endpoint created
- ✅ **CI/CD**: GitHub Actions workflows ready to deploy on push
- ✅ **Security**: Hardened configuration audited by security-agent

**Final validation:** Run the app locally and complete an end-to-end test (sign up → free tier → upgrade → billing portal).

---

## What Makes This Unique?

Most "automation tools" are either:
- **Too opaque** - Black box that does things without explaining
- **Too rigid** - Can't adapt to your specific needs
- **Too automated** - No human oversight for critical decisions

This AI installer is different:

1. **Transparent** - Shows you every command and code change
2. **Flexible** - Knowledge bases can be customized for your needs
3. **Educational** - Explains the "why" behind each configuration
4. **Safe** - Human approval required at every step
5. **Modular** - Run individual agents to update specific configurations

**It's infrastructure automation that teaches you as it works.**

---

## Questions & Support

**Common Questions:**

**Q: Can I run agents individually?**
A: Yes! Each agent can be invoked directly: `claude code agents/clerk-agent.json`

**Q: What if an agent fails mid-execution?**
A: The orchestrator is idempotent - you can re-run from the beginning and it will skip completed steps.

**Q: Can I customize the knowledge bases?**
A: Absolutely! Edit any JSON file in `base/` to match your specific requirements.

**Q: Does this work with other frameworks (Next.js, etc.)?**
A: The current agents are optimized for Vite + React + Cloudflare, but you can create custom agents for other stacks.

**Need help?** Open an issue in the main repository or check the inline documentation in agent configs.

---

## Acknowledgments

This AI installer architecture was developed to solve a real problem: setting up production SaaS infrastructure is tedious and error-prone. By combining:

- **Specialized AI agents** (domain experts)
- **Knowledge bases** (reusable templates)
- **Human-in-the-loop approval** (safety + transparency)

...we created a system that's faster than manual setup but safer than full automation.

**Built with**:
- [Claude Code](https://claude.com/claude-code) - AI orchestration
- [MCP Architecture](https://modelcontextprotocol.io) - Agent coordination pattern

---

**⭐ If this installer saved you time, consider starring the repo!**

---

## Related Documentation

- **[Main Project README](../README.md)** - Complete SaaS starter documentation
- **[Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)** - Edge compute platform
- **[Clerk Authentication](https://clerk.com/docs)** - Auth provider docs
- **[Stripe API](https://stripe.com/docs)** - Payment processing docs
