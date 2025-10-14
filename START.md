# Pan Landing - Quick Start Guide

## Project Structure

```
/home/mini/Documents/clerk/
├── api/              # Cloudflare Worker backend
│   ├── src/
│   │   ├── index.ts           # Main Worker with JWT auth
│   │   └── stripe-webhook.ts  # Stripe subscription handler
│   ├── wrangler.toml          # Worker configuration
│   └── package.json
├── frontend/         # Next.js frontend
│   ├── src/app/dashboard/     # Dashboard page
│   ├── .env.local             # Environment variables
│   └── package.json
└── CLAUDE.md        # Project documentation
```

## What's Built

### Backend (Cloudflare Worker)
- **JWT Authentication** via Clerk
- **Usage Tracking** with KV (5 free, unlimited pro)
- **Plan Gating** (free vs pro tier)
- **Stripe Webhook** handler for subscription updates
- **Endpoints:**
  - `GET /health` - Health check
  - `POST /api/data` - Main API (requires JWT, counts usage)
  - `GET /api/usage` - Check usage stats (requires JWT)
  - `POST /webhook/stripe` - Stripe webhook (no auth)

### Frontend (Next.js)
- **Clerk Authentication** built-in
- **Dashboard Page** with:
  - User info display
  - Usage statistics
  - API request button (tests usage counting)
  - Upgrade prompt for free users

## Running Locally

### 1. Start the Worker API

```bash
cd /home/mini/Documents/clerk/api
npm run dev
```

This starts the Worker at `http://localhost:8787`

### 2. Start the Frontend

```bash
cd /home/mini/Documents/clerk/frontend
npm install
npm run dev
```

This starts Next.js at `http://localhost:3000`

### 3. Test the Flow

1. Go to `http://localhost:3000`
2. Sign up / Sign in with Clerk
3. Navigate to `/dashboard`
4. Click "Make API Request" 5 times (free tier limit)
5. 6th request should fail with "Free tier limit reached"

## Configuration

### Clerk Dashboard

1. **JWT Template** `pan-api` must include:
   ```json
   {
     "plan": "{{user.public_metadata.plan}}"
   }
   ```

2. **User Metadata**: All users default to `plan: "free"`

### Stripe (Future)

To enable paid subscriptions:

1. Create Stripe products (Pro plan)
2. Set up webhook endpoint pointing to your Worker
3. Add `STRIPE_WEBHOOK_SECRET` to Wrangler secrets
4. Implement checkout flow in frontend

## Deploying to Production

### Deploy Worker

```bash
cd /home/mini/Documents/clerk/api
npm run deploy
```

### Deploy Frontend to Cloudflare Pages

```bash
cd /home/mini/Documents/clerk/frontend
npx wrangler pages deploy .next --project-name=pan-frontend
```

Update `.env.local` with production Worker URL.

## Secrets Configured

- `CLERK_SECRET_KEY` ✅
- `STRIPE_SECRET_KEY` ✅
- `STRIPE_WEBHOOK_SECRET` (not yet - for production webhooks)

## Next Steps

1. Test locally
2. Add Stripe checkout flow
3. Style the frontend
4. Deploy to production
5. Set up Stripe webhook in production

## Testing Free → Pro Upgrade

Manually update user metadata in Clerk Dashboard:
- Set `public_metadata.plan` to `"pro"`
- User's next JWT will include `plan: "pro"`
- API will allow unlimited requests
