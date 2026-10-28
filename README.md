# NexusPulse | Production-Grade AI Facebook Content Automation Platform

> **Engineered for Zia-ul-din** — *Full Stack AI Engineer \| Automation Architect \| LLMs & Python*  
> **Tech Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase PostgreSQL, Meta Graph API v20.0, Upstash QStash & Vercel Edge Crons.

---

## 🚀 Key Architectural Capabilities

### 1. Facebook Profile URL Analysis & Meta Graph API Policy
* **URL Analyzed**: `https://www.facebook.com/profile.php?id=61596194632492`
* **Official Verification**: This URL represents a **Personal Facebook User Profile** (`Zia Ul Din`).
* **Critical Meta Platform Policy**: Meta Graph API strictly **prohibits programmatic posting to personal profiles** (endpoint `/me/feed` for personal profiles was deprecated in Graph API v3.0). Attempting automated publishing to personal profiles violates Meta's Terms of Service and will be blocked by Meta with Error Code `100` / `200`.
* **The Supported Production Solution**:
  1. Automated publishing is exclusively supported for **Facebook Pages** using Page Access Tokens with permissions: `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`.
  2. Create a dedicated Facebook Page at [facebook.com/pages/create](https://www.facebook.com/pages/create) (e.g., *"Zia-ul-din | Full Stack AI & Automation Architect"*).
  3. Enter your Page ID in the platform's **Settings** tab. The platform includes a live Meta Target Verification engine that verifies whether any provided ID is a valid Page.

---

## 🕒 The 3 Daily Thought-Leadership Content Tracks

Configured by default in **`Asia/Karachi`** timezone (customizable without editing source code):

| Slot | Schedule | Content Category | Domain Focus & Depth |
| :--- | :--- | :--- | :--- |
| **Slot 1** | `10:00 AM PKT` | **Category A: Trending AI** | Breaking model releases, agentic capabilities, developer tools, and timely AI discussions. |
| **Slot 2** | `03:00 PM PKT` | **Category B: Practical Expertise** | Real-world tutorials, workflows, code concepts, Python microservices, autonomous FinBots, and self-healing n8n/Make automations. |
| **Slot 3** | `08:00 PM PKT` | **Category C: Business Value** | Contrarian technical viewpoints, common architecture mistakes, classical ML + Generative AI hybrids, auditable governance evidence engines, and engagement questions. |

---

## 🌐 24/7 Laptop-Off Cloud Autonomy

The system operates autonomously even when your laptop is shut down or offline:

```mermaid
flowchart TD
    subgraph Cloud_Schedulers [Managed 24/7 Cloud Schedulers]
        QS[Upstash QStash / Webhook Trigger] --> WORKER[/api/cron/worker]
        VC[Vercel Serverless Edge Crons] --> WORKER
    end

    subgraph Platform_Core [Next.js App Engine on Vercel]
        WORKER --> DEDUP{Idempotency Check\npost_YYYY-MM-DD_slot_X}
        DEDUP -->|Already Published| SKIP[Abort Duplicate Run]
        DEDUP -->|New Slot| LOCK[Acquire Distributed Job Lock]
        
        LOCK --> RESEARCH[Automated Trend Pipeline\nHackerNews / arXiv / Curated]
        RESEARCH --> LLM[AI Synthesis Engine\nGemini 2.0 / OpenAI / Fallback]
        LLM --> VALIDATOR[Quality & Anti-Hype Validation]
        VALIDATOR --> META_CHECK{Verify Facebook Page Target}
        
        META_CHECK -->|Personal Profile| BLOCK[Block & Alert in Dashboard]
        META_CHECK -->|Verified Page| PUBLISH[POST /v20.0/page-id/feed]
    end

    PUBLISH --> FB_PAGE[Official Facebook Business Page]
    PUBLISH --> RECEIPT[(Supabase PostgreSQL / Audit Store)]
```

---

## 🗄️ Database Schema & Supabase Setup

The production schema is located at [`supabase/migrations/20261029000000_init_schema.sql`](./supabase/migrations/20261029000000_init_schema.sql):

1. **`system_settings`**: Timezone (`Asia/Karachi`), publishing times (`["10:00", "15:00", "20:00"]`), language (`english`, `urdu`, `bilingual`), AI provider, emergency kill-switch.
2. **`facebook_pages`**: Page ID, Page Access Token, category, follower counts, token expiration.
3. **`research_topics`**: Source URLs, publication dates, relevance scores, verified trend flags.
4. **`content_drafts`**: Category, slot index, hook, content, quality score (0-100), duplicate hash.
5. **`scheduled_posts`**: Scheduled timestamp, slot index, status, unique idempotency key (`post_YYYY-MM-DD_slot_X`).
6. **`publishing_jobs`**: Distributed locks (`locked_at`, `locked_by`), retry counters, exponential backoff.
7. **`post_publications`**: Official Graph API receipts, Facebook Post ID, Facebook Post URL.
8. **`post_analytics`**: Reach, impressions (marked pending review until Meta review), reactions, comments, shares.
9. **`audit_logs`**: Permanent event history.

### Running Supabase Migrations
1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** -> **New Query**.
3. Paste the contents of [`supabase/migrations/20261029000000_init_schema.sql`](./supabase/migrations/20261029000000_init_schema.sql).
4. Click **Run**. All tables, indexes, constraints, and RLS policies will be created immediately.

---

## 🔑 Environment Variables Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your variables:

```env
# Meta Facebook Graph API (Must be a Facebook Page, not Personal Profile)
FB_PAGE_ID=your_facebook_page_id
FB_PAGE_ACCESS_TOKEN=your_page_access_token

# AI Generation Engine
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_optional_openai_key

# Supabase PostgreSQL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash QStash & Cloud Scheduler
QSTASH_TOKEN=your_qstash_token
CRON_SECRET=your_super_secret_cron_token

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## 🚀 2-Minute Vercel Deployment

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete production facebook ai automation platform"
   git push origin main
   ```
2. Import the project in [Vercel](https://vercel.com).
3. In **Settings -> Environment Variables**, add:
   - `FB_PAGE_ID`
   - `FB_PAGE_ACCESS_TOKEN`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`
4. Click **Deploy**. Vercel will deploy the platform and automatically activate the 3 daily cloud crons via [`vercel.json`](./vercel.json).

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run production build & type check
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to access the cockpit.
