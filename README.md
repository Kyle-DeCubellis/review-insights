# Review Insights

AI-powered Shopify review analytics. Classifies reviews by theme and sentiment using Claude, then surfaces insights via a live dashboard and daily Slack digests.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (Postgres) via Drizzle ORM
- **AI**: Claude Sonnet (`claude-sonnet-4-6`) for classification
- **Deployment**: Vercel (cron jobs built-in)
- **Review Source**: Judge.me API

## Architecture

```
Judge.me API → [cron: fetch-reviews] → reviews table
                                          ↓
reviews table → [cron: classify-reviews] → Claude API → classifications table
                                                              ↓
classifications → [cron: send-digests] → Slack webhook
                                    ↓
                         GET /api/dashboard/[storeId]
                                    ↓
                         React Dashboard (charts + tables)
```

## Database Schema

| Table             | Purpose                                |
|-------------------|----------------------------------------|
| `stores`          | Store credentials, tier, Slack webhook |
| `reviews`         | Raw review text from Judge.me          |
| `classifications` | Claude's theme + sentiment labels      |
| `digests`         | Daily sentiment summaries              |

## Cron Schedule (vercel.json)

| Job               | Schedule         | Purpose                            |
|-------------------|------------------|------------------------------------|
| fetch-reviews     | Every hour       | Pull new reviews from Judge.me     |
| classify-reviews  | Every 30 minutes | Run Claude on unclassified reviews |
| send-digests      | 8 AM daily       | Send Slack digest                  |

## Theme Taxonomy

Reviews are classified into one of 24 themes:

- **C_ prefix**: Cross-category (quality, durability, fit/comfort, performance, design, shipping, packaging, customer service, value)
- **P_ prefix**: Product-specific variants of the same concepts

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, ANTHROPIC_API_KEY, CRON_SECRET
```

### 3. Push database schema

```bash
npm run db:push
```

### 4. Test the classifier

```bash
npm run test:classify
```

### 5. Run dev server

```bash
npm run dev
```

### 6. Deploy to Vercel

```bash
vercel deploy
```

## API Endpoints

| Method | Path                             | Description                        |
|--------|----------------------------------|------------------------------------|
| GET    | `/api/dashboard/[storeId]`       | Dashboard data (sentiment, themes) |
| GET    | `/api/cron/fetch-reviews`        | Trigger review fetch (cron)        |
| GET    | `/api/cron/classify-reviews`     | Trigger classification (cron)      |
| GET    | `/api/cron/send-digests`         | Send Slack digests (cron)          |
| GET    | `/api/oauth/authorize`           | Start Judge.me OAuth flow          |
| GET    | `/api/oauth/callback`            | Handle OAuth callback              |
| PATCH  | `/api/stores/[storeId]/settings` | Update category + Slack webhook    |

All cron endpoints require `Authorization: Bearer <CRON_SECRET>` header.

## Environment Variables

| Variable                | Required | Description                         |
|-------------------------|----------|-------------------------------------|
| `DATABASE_URL`          | Yes      | Supabase Postgres connection string  |
| `ANTHROPIC_API_KEY`     | Yes      | Anthropic API key                   |
| `CRON_SECRET`           | Yes      | Secret for cron endpoint auth       |
| `JUDGEME_CLIENT_ID`     | OAuth    | Judge.me OAuth client ID            |
| `JUDGEME_CLIENT_SECRET` | OAuth    | Judge.me OAuth client secret        |
| `JUDGEME_REDIRECT_URI`  | OAuth    | OAuth callback URL                  |
| `NEXT_PUBLIC_APP_URL`   | Yes      | Your app's public URL               |

## What's Next

- Stripe billing (Starter $29/mo, Pro $99/mo, Enterprise custom)
- CSV import for historical reviews
- Email onboarding sequence
- More granular theme breakdown per product SKU
- Competitor benchmarking
