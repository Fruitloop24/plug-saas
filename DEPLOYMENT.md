# Deployment Instructions

## Cloudflare Pages nodejs_compat Flag Setup

The frontend uses `@cloudflare/next-on-pages` which requires the `nodejs_compat` compatibility flag.

### Option 1: Set in Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **pan-frontend** project
3. Go to **Settings** → **Functions**
4. Scroll to **Compatibility Flags**
5. Add the flag: `nodejs_compat` (no quotes, just the bare word)
6. Click **Save**
7. **Re-deploy** the application for changes to take effect

### Option 2: wrangler.toml (Already Configured)

The `frontend/wrangler.toml` file includes:
```toml
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
```

This should be automatically picked up by `wrangler pages deploy`, but due to known Cloudflare UI issues, you may need to set it manually in the dashboard as well.

## GitHub Actions Deployment

The project uses GitHub Actions for automatic deployment:

- **API Worker**: `.github/workflows/deploy-worker.yml`
  - Triggers on changes to `api/**`
  - Deploys to Cloudflare Workers

- **Frontend**: `.github/workflows/deploy-frontend.yml`
  - Triggers on changes to `frontend/**`
  - Builds with `@cloudflare/next-on-pages`
  - Deploys to Cloudflare Pages

### Required GitHub Secrets

Set these in your GitHub repository settings:

```
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_API_URL
```

## Troubleshooting

### Error: "no nodejs_compat compatibility flag set"

This means the compatibility flag isn't set in Cloudflare. Follow **Option 1** above to set it manually in the dashboard.

### Deployment Succeeds but Site Shows Error

1. Check that all environment variables are set in Cloudflare Pages settings
2. Verify the compatibility flag is set
3. Redeploy after making any changes

## Manual Deployment

### Frontend
```bash
cd frontend
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=pan-frontend
```

### API Worker
```bash
cd api
npm run deploy
```
