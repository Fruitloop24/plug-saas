# Project Installer Orchestrator v2.0

This directory contains an AI-driven installation framework for the Clerk-Stripe SaaS starter.

The **orchestrator** guides the high-level flow by invoking individual **agents** in sequence, each reading from one or more **knowledge bases** (reusable JSON or text files).

- Orchestrator reads `orchestration/coordinator.json` to determine phases and task order.
- Each agent (in `agents/`) has its own JSON config defining steps, tools, and referenced knowledge bases.
- Knowledge bases live under `base/` (large patterns, CLI snippets, templates).
- All operations are atomic: the orchestrator calls one agent at a time and waits for human approval between steps.

## 📦 Quick Start

1. Clone your repo:
   ```bash
   git clone <your-repo-url>
   cd clerk/mcp-agents
   ```
2. Open the orchestrator in your AI IDE:
   ```bash
   claude code orchestration/coordinator.json
   ```
3. Tell your AI assistant:
   ```text
   Run the orchestrator to perform full project setup.
   ```
4. The orchestrator will sequentially invoke:
   1. **onboarding-agent**
   2. **clerk-agent**
   3. **tiers-agent**
   4. **frontend-agent**
   5. **deployment-agent**
   6. **security-agent**

   After all phases, you can invoke **testing-agent** for end-to-end tests.

5. Follow prompts, supply API keys and other inputs as requested, and approve each step.

## 🤖 Agents & Knowledge Bases

| Agent             | Config Path                      | Knowledge Base(s)                          | Purpose                                                 |
|-------------------|----------------------------------|--------------------------------------------|---------------------------------------------------------|
| onboarding-agent  | agents/onboarding-agent.json     | base/project-config.json                   | Env setup & dependency install                         |
| clerk-agent       | agents/clerk-agent.json          | base/clerk-knowledge.json, project-config  | Clerk key retrieval & JWT template setup               |
| tiers-agent       | agents/tiers-agent.json          | base/tiers-knowledge.json, project-config, base/frontend-knowledge.json | Tier & Stripe setup; export frontend KB                |
| frontend-agent    | agents/frontend-agent.json       | base/vite-react-tailwind.txt, base/frontend-knowledge.json           | UI component generation & integration                   |
| deployment-agent  | agents/deployment-agent.json     | base/deployment-knowledge.json, project-config                         | GitHub CI/CD workflows & Pages deployment              |
| security-agent    | agents/security-agent.json       | base/security-knowledge.json               | Security audit (CORS, JWT, webhook, rate limits)       |
| testing-agent     | agents/testing-agent.json        | None                                       | E2E tests with Playwright                              |

## 🚦 Orchestrator Flow

The orchestrator (ITERATIVE mode) executes these phases, awaiting approval after each:

1. Onboarding
2. Clerk Configuration
3. Tier Setup
4. Frontend Integration
5. Deployment
6. Security Audit

After completing the orchestrator, run `testing-agent` for Playwright E2E tests.

## 🛠️ How It Works

- **Orchestrator**: Instructs the sequence and delegates to agents.
- **Agents**: Small JSON files in `agents/` describing each step.
- **Knowledge Bases**: Detailed prompts & templates in `base/`.
- **Human Approval**: Required at each agent step to ensure correctness.

## 📚 Folder Layout

```
mcp-agents/
├── base/           # Knowledge JSON/text files
├── agents/         # Agent configs (.json)
└── orchestration/  # Coordinator (coordinator.json)
```

## ⚙️ Adding New Agents

1. Add a KB file under `base/` (if needed).
2. Add your agent config under `agents/` with steps, KB refs, tools.
3. Register it in `orchestration/coordinator.json` and add a phase.
4. Commit and rerun the orchestrator or agent directly.
