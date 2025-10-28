# GitHub Actions Auto-Deploy Setup

This guide shows you how to enable automatic Worker deployment when you push to your repository.

---

## What This Does

The repository includes a GitHub Actions workflow (`.github/workflows/deploy-worker.yml`) that automatically deploys your Cloudflare Worker when you push changes to the `main` branch.

**Without this setup:** You manually run `wrangler deploy` from the api/ folder.

**With this setup:** Push to main → Worker automatically deploys.

---

## Prerequisites

- You've already deployed your Worker manually at least once (following the [Cloudflare deployment guide](cloudflare.md))
- Your repository is pushed to GitHub
- You have access to your Cloudflare dashboard

---

## Setup Steps

### 1. Get Your Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Use the **"Edit Cloudflare Workers"** template
4. Configure permissions:
   - **Account** → Your account → **Cloudflare Workers:Edit**
   - **Zone** → All zones (or specific zone) → **Workers Routes:Edit** (if using custom domains)
5. Click **"Continue to summary"** → **"Create Token"**
6. **Copy the token** (you won't see it again!)

**📖 Official Cloudflare docs:** [Creating API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

### 2. Get Your Cloudflare Account ID

1. Go to your [Cloudflare dashboard](https://dash.cloudflare.com/)
2. Click on **Workers & Pages** in the sidebar
3. Your **Account ID** is shown in the right sidebar (or in the URL: `dash.cloudflare.com/<ACCOUNT_ID>/workers`)
4. Copy the Account ID

### 3. Add Secrets to Your GitHub Repository

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **"New repository secret"**

**Add these two secrets:**

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: [Your API token from step 1]

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: [Your Account ID from step 2]

**📖 GitHub docs:** [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

---

## Verify It Works

1. Make a small change to your Worker code (e.g., add a comment in `api/src/index.ts`)
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Test GitHub Actions deployment"
   git push origin main
   ```
3. Go to your repo → **Actions** tab
4. You should see the workflow running
5. Wait for it to complete (green checkmark = success!)
6. Your Worker is now deployed with the latest changes

---

## Troubleshooting

### Workflow fails with "Authentication error"
- Double-check your `CLOUDFLARE_API_TOKEN` secret
- Make sure the token has the correct permissions (Edit Cloudflare Workers)
- Token might have expired - create a new one

### Workflow fails with "Account ID not found"
- Verify your `CLOUDFLARE_ACCOUNT_ID` is correct
- Copy it directly from the Cloudflare dashboard URL

### Workflow doesn't trigger
- Make sure you're pushing to the `main` branch (not `master` or other)
- Check that `.github/workflows/deploy-worker.yml` exists in your repo
- The workflow only triggers on changes to `api/**` or the workflow file itself

---

## What the Workflow Does

The GitHub Action:
1. Checks out your code
2. Installs Node.js dependencies
3. Installs Wrangler CLI
4. Deploys your Worker to Cloudflare using your API token
5. Reports success/failure

**View the workflow file:** `.github/workflows/deploy-worker.yml` in your repository

---

## Alternative: Manual Deployment

Don't want auto-deploy? No problem! Just deploy manually whenever you need:

```bash
cd api
wrangler deploy
```

This gives you full control over when deployments happen.

---

## Related Documentation

- [Cloudflare Workers Deployment](cloudflare.md) - Initial Worker setup
- [Frontend Deployment](frontend-deploy.md) - Cloudflare Pages setup (no secrets needed!)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - Official GitHub docs

---

**Questions?** Open a GitHub issue or check the [FAQ](../information/faq.md).
