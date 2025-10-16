# Agent System v2.0

**One-at-a-time agent execution with human approval between steps**

---

## 📁 Structure
```
mcp-agents/
├── base/                           # Knowledge bases (reusable across agents)
│   └── cloudflare-workers.txt      # Official CF Workers patterns (100KB)
│
├── agents/                         # Agent configurations (task-specific)
│   ├── frontend-agent.json         # React components, Tailwind, Clerk
│   ├── cf-specialist.json          # CF Workers/Pages deployment
│   ├── security-agent.json         # Fix security blockers
│   ├── testing-agent.json          # E2E tests with Playwright
│   └── deployment-agent.json       # [DEPRECATED] Use cf-specialist instead
│
├── orchestration/                  # Execution coordinator
│   └── orchestrator.json           # One-at-a-time execution model
│
└── README.md                       # This file
```

---

## 🎯 How It Works

### 1. Base Knowledge (Large Prompts)
- **Purpose:** Store reusable knowledge that multiple agents reference
- **Example:** `cloudflare-workers.txt` contains 100KB of official CF patterns
- **Usage:** Agents read these files FIRST before executing tasks

### 2. Agent Configs (Small JSON Files)
- **Purpose:** Define what each agent does and how it does it
- **Format:** JSON with task descriptions, tools, typical workflows
- **Usage:** Claude reads agent config to understand its role

### 3. Orchestrator (Execution Coordinator)
- **Purpose:** Coordinates agents one-at-a-time with human approval
- **Mode:** ITERATIVE (not autonomous)
- **Usage:** Defines phases, tasks, and approval gates

---

## 🚀 Usage

### Starting a Session
```bash
# You tell Claude what to do:
"Run security-agent to fix CORS wildcard (task 1.1)"

# Claude:
1. Reads mcp-agents/agents/security-agent.json
2. Sees task is at api/src/index.ts:26
3. Fixes the code (replaces '*' with dynamic origin check)
4. Shows you the diff
5. Waits for your approval

# You review and approve:
"Looks good, test it"

# Claude tests:
curl -H "Origin: https://evil.com" http://localhost:8787/api/usage
# Returns CORS error ✓

"Test passed. Approved."

# Claude moves to next task:
"Task 1.1 complete. Ready for task 1.2 (webhook secret)?"
```

### Execution Flow
```
┌─────────────────┐
│  Human Request  │  "Run security-agent, fix CORS"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Read Config    │  security-agent.json
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Execute Task   │  Fix code, show diff
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Wait Approval  │  Human reviews
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Human Decides  │  "Approved" or "Fix XYZ"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next Task or   │  Iterate until phase complete
│  Iterate        │
└─────────────────┘
```

---

## 🤖 Available Agents

### security-agent
**Purpose:** Fix critical security blockers before production
**Specialty:** CORS, webhook verification, env validation
**Invoke for:**
- Fix CORS wildcard (BLOCKER_1)
- Enforce webhook secret (BLOCKER_2)
- Add startup env validation (BLOCKER_3)

**Config:** `agents/security-agent.json`
**Base knowledge:** None (uses project-specific knowledge)

---

### frontend-agent
**Purpose:** Generate React components and UI
**Specialty:** React, Tailwind, Clerk integration, accessibility
**Invoke for:**
- Create landing page
- Build dashboard
- Port components from Next.js
- Generate new UI components

**Config:** `agents/frontend-agent.json`
**Base knowledge:** None (React patterns are standard)

---

### cf-specialist
**Purpose:** Deploy to Cloudflare Workers and Pages
**Specialty:** Wrangler, CF Pages, secrets management, CF best practices
**Invoke for:**
- Deploy worker to production
- Set up CF Pages
- Manage secrets via wrangler
- Fix CF-specific issues
- Create GitHub Actions workflows

**Config:** `agents/cf-specialist.json`
**Base knowledge:** `base/cloudflare-workers.txt` ← **Always reads this first**

---

### testing-agent
**Purpose:** Write E2E tests with Playwright
**Specialty:** Playwright, user journey testing, critical flow validation
**Invoke for:**
- Test upgrade flow (sign up → limit → upgrade → unlimited)
- Test rate limiting
- Test auth integration
- Write Playwright test suites

**Config:** `agents/testing-agent.json`
**Base knowledge:** None (Playwright docs are standard)

---

## 📖 Base Knowledge

### cloudflare-workers.txt
- **Size:** ~100KB
- **Source:** Official Cloudflare Workers prompt
- **Maintained by:** Cloudflare team
- **Contains:**
  - Workers best practices
  - Security guidelines
  - Example patterns (WebSockets, KV, D1, Queues, etc.)
  - wrangler CLI usage
  - Static Assets configuration
  - Performance optimization

**Usage:**
```json
// In cf-specialist.json:
{
  "base_knowledge": {
    "path": "../base/cloudflare-workers.txt",
    "usage": "Read this FIRST before any CF-related task"
  }
}
```

---

## 🎭 Execution Modes

### ITERATIVE (Current)
- **Human approval required after each task**
- **Best for:** Active development, learning, quality control
- **Workflow:** Task → Review → Approve → Next task

### AUTONOMOUS (Future)
- **Agent runs multiple tasks without approval**
- **Best for:** Repetitive deployments, CI/CD, batch operations
- **Workflow:** Phase → Execute all tasks → Report results

**Current mode set in:** `orchestration/orchestrator.json`

---

## 🛠️ Tools Available

Agents have access to:
- **bash:** Execute commands (wrangler, npm, git, curl)
- **view:** Read files (configs, code, base knowledge)
- **str_replace:** Edit files (fix bugs, update config)
- **file_create:** Create files (components, tests, workflows)

---

## 📝 Adding New Agents

### 1. Create Agent Config
```bash
touch mcp-agents/agents/my-agent.json
```

### 2. Define Agent Structure
```json
{
  "agent_name": "my-agent",
  "version": "1.0.0",
  "description": "What this agent does",
  "role": "Its role (e.g., Backend Engineer)",
  
  "base_knowledge": {
    "path": "../base/knowledge-file.txt",  // Optional
    "usage": "When to read this"
  },
  
  "typical_tasks": [
    {
      "task": "Task name",
      "steps": ["Step 1", "Step 2"],
      "estimated_time": "15 minutes"
    }
  ],
  
  "tools_required": ["bash", "file_create", "str_replace"]
}
```

### 3. Register in Orchestrator
Edit `orchestration/orchestrator.json`:
```json
{
  "available_agents": {
    "my-agent": {
      "config_path": "../agents/my-agent.json",
      "base_knowledge": "../base/knowledge-file.txt",
      "specialty": "What it's good at"
    }
  }
}
```

---

## 📚 Adding Base Knowledge

### When to Add:
- You find yourself explaining the same patterns repeatedly
- Official documentation is too large to paste every time
- Multiple agents need the same knowledge

### How to Add:
```bash
# 1. Create knowledge file
touch mcp-agents/base/my-knowledge.md

# 2. Add content (best practices, examples, patterns)

# 3. Reference in agent config:
{
  "base_knowledge": {
    "path": "../base/my-knowledge.md"
  }
}
```

---

## 🎯 Design Principles

1. **One task at a time** - No autonomous 4-hour runs
2. **Human approval gates** - Review before proceeding
3. **Composable knowledge** - Base knowledge + agent config
4. **Minimal duplication** - Share knowledge via base files
5. **Version controlled** - All configs in git
6. **Self-documenting** - JSON structure explains itself

---

## 🚦 Current Status

### ✅ Complete
- Security agent (fix 3 blockers)
- Frontend agent (React components)
- CF specialist (deployment)
- Testing agent (Playwright E2E)
- Orchestrator (one-at-a-time execution)

### 🚧 In Progress
- Migrating frontend from Next.js to React
- Deploying to CF Pages

### 📋 TODO
- Add GitHub Actions workflow
- Write E2E tests
- Add monitoring/logging

---

## 📞 Support

**Questions?** Check:
1. Agent config JSON (explains what it does)
2. Base knowledge file (if agent references one)
3. Orchestrator execution plan
4. Root README.md (project overview)

**Want to modify an agent?**
1. Edit the JSON config
2. Test with a single task
3. Iterate based on results
4. Commit changes to git

---

**Built with:** Claude Code + Agent orchestration
**Timeline:** Started Oct 2025
**Philosophy:** Iterative execution > Autonomous chaos