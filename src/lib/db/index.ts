import fs from 'fs';
import path from 'path';
import { isSupabaseAdminConfigured, supabaseAdmin } from '../supabase/admin';
import {
  AuditLog,
  ContentDraft,
  FacebookPage,
  PostAnalytics,
  PostPublication,
  PublishingJob,
  ResearchTopic,
  ScheduledPost,
  SystemSettings,
} from '../types';

const DATA_DIR = process.env.VERCEL ? '/tmp/fb_auto_data' : path.join(process.cwd(), 'data');

function ensureDir(dirPath: string) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create directory:', err);
  }
}

function readLocalJson<T>(filename: string, fallback: T): T {
  try {
    ensureDir(DATA_DIR);
    const filepath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
  } catch (err) {
    console.warn(`Error reading ${filename}:`, err);
  }
  return fallback;
}

function writeLocalJson<T>(filename: string, data: T) {
  try {
    ensureDir(DATA_DIR);
    const filepath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`Error writing ${filename}:`, err);
  }
}

// Default initial system settings
const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  id: 'default',
  timezone: 'Asia/Karachi',
  postTimes: ['10:00', '15:00', '20:00'],
  language: 'english',
  autoPostingEnabled: true,
  aiProvider: 'gemini',
  aiModel: 'gemini-2.0-flash',
  imageGenerationEnabled: true,
  emergencyPaused: false,
};

// ==============================================================================
// 1. System Settings Repository
// ==============================================================================
export async function getSystemSettings(): Promise<SystemSettings> {
  if (isSupabaseAdminConfigured) {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    if (!error && data) {
      return {
        id: data.id,
        timezone: data.timezone,
        postTimes: data.post_times,
        language: data.language,
        autoPostingEnabled: data.auto_posting_enabled,
        aiProvider: data.ai_provider,
        aiModel: data.ai_model,
        imageGenerationEnabled: data.image_generation_enabled,
        emergencyPaused: data.emergency_paused,
        notificationWebhookUrl: data.notification_webhook_url,
        qstashScheduleId: data.qstash_schedule_id,
        updatedAt: data.updated_at,
      };
    }
  }
  return readLocalJson<SystemSettings>('settings.json', DEFAULT_SYSTEM_SETTINGS);
}

export async function updateSystemSettings(
  updates: Partial<SystemSettings>
): Promise<SystemSettings> {
  const current = await getSystemSettings();
  const merged: SystemSettings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseAdminConfigured) {
    await supabaseAdmin
      .from('system_settings')
      .upsert({
        id: 'default',
        timezone: merged.timezone,
        post_times: merged.postTimes,
        language: merged.language,
        auto_posting_enabled: merged.autoPostingEnabled,
        ai_provider: merged.aiProvider,
        ai_model: merged.aiModel,
        image_generation_enabled: merged.imageGenerationEnabled,
        emergency_paused: merged.emergencyPaused,
        notification_webhook_url: merged.notificationWebhookUrl,
        qstash_schedule_id: merged.qstashScheduleId,
        updated_at: merged.updatedAt,
      });
  }

  writeLocalJson('settings.json', merged);
  return merged;
}

// ==============================================================================
// 2. Facebook Pages Repository
// ==============================================================================
export async function getConnectedFacebookPage(): Promise<FacebookPage | null> {
  if (isSupabaseAdminConfigured) {
    const { data, error } = await supabaseAdmin
      .from('facebook_pages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (!error && data) {
      return {
        id: data.id,
        pageId: data.page_id,
        pageName: data.page_name,
        accessToken: data.access_token,
        category: data.category,
        followersCount: data.followers_count,
        likesCount: data.likes_count,
        tokenExpiresAt: data.token_expires_at,
        isActive: data.is_active,
        permissions: data.permissions || [],
        lastVerifiedAt: data.last_verified_at,
      };
    }
  }

  // Local fallback: checks process.env or local json
  const local = readLocalJson<FacebookPage | null>('facebook_page.json', null);
  if (local) return local;

  if (process.env.FB_PAGE_ID && process.env.FB_PAGE_ACCESS_TOKEN) {
    return {
      id: 'env-default',
      pageId: process.env.FB_PAGE_ID,
      pageName: 'Zia-ul-din AI Architect Page',
      accessToken: process.env.FB_PAGE_ACCESS_TOKEN,
      category: 'Science & Technology / AI Engineering',
      followersCount: 1420,
      isActive: true,
      permissions: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
      lastVerifiedAt: new Date().toISOString(),
    };
  }

  return null;
}

export async function upsertFacebookPage(page: Partial<FacebookPage>): Promise<FacebookPage> {
  const current = (await getConnectedFacebookPage()) || {
    id: `page-${Date.now()}`,
    pageId: page.pageId || '',
    pageName: page.pageName || 'Zia-ul-din AI Page',
    accessToken: page.accessToken || '',
    followersCount: 0,
    isActive: true,
    permissions: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
  };

  const updated: FacebookPage = {
    ...current,
    ...page,
    lastVerifiedAt: new Date().toISOString(),
  };

  if (isSupabaseAdminConfigured) {
    await supabaseAdmin.from('facebook_pages').upsert(
      {
        page_id: updated.pageId,
        page_name: updated.pageName,
        access_token: updated.accessToken,
        category: updated.category,
        followers_count: updated.followersCount,
        likes_count: updated.likesCount,
        token_expires_at: updated.tokenExpiresAt,
        is_active: updated.isActive,
        permissions: updated.permissions,
        last_verified_at: updated.lastVerifiedAt,
      },
      { onConflict: 'page_id' }
    );
  }

  writeLocalJson('facebook_page.json', updated);
  return updated;
}

// ==============================================================================
// 3. Research Topics Repository
// ==============================================================================
export async function getResearchTopics(category?: string): Promise<ResearchTopic[]> {
  if (isSupabaseAdminConfigured) {
    let query = supabaseAdmin
      .from('research_topics')
      .select('*')
      .order('research_timestamp', { ascending: false });
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        title: d.title,
        summary: d.summary,
        category: d.category,
        sourceUrl: d.source_url,
        sourceName: d.source_name,
        publishedAt: d.published_at,
        researchTimestamp: d.research_timestamp,
        relevanceScore: Number(d.relevance_score || 0.95),
        isVerifiedTrend: d.is_verified_trend,
        status: d.status,
        metadata: d.metadata,
      }));
    }
  }

  const list = readLocalJson<ResearchTopic[]>('research_topics.json', getInitialResearchTopics());
  if (category) return list.filter((t) => t.category === category);
  return list;
}

export async function addResearchTopic(
  topic: Omit<ResearchTopic, 'id' | 'researchTimestamp'>
): Promise<ResearchTopic> {
  const newTopic: ResearchTopic = {
    ...topic,
    id: `topic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    researchTimestamp: new Date().toISOString(),
  };

  if (isSupabaseAdminConfigured) {
    await supabaseAdmin.from('research_topics').insert({
      id: newTopic.id,
      title: newTopic.title,
      summary: newTopic.summary,
      category: newTopic.category,
      source_url: newTopic.sourceUrl,
      source_name: newTopic.sourceName,
      published_at: newTopic.publishedAt,
      research_timestamp: newTopic.researchTimestamp,
      relevance_score: newTopic.relevanceScore,
      is_verified_trend: newTopic.isVerifiedTrend,
      status: newTopic.status,
    });
  }

  const list = readLocalJson<ResearchTopic[]>('research_topics.json', getInitialResearchTopics());
  list.unshift(newTopic);
  writeLocalJson('research_topics.json', list);
  return newTopic;
}

// ==============================================================================
// 4. Content Drafts Repository
// ==============================================================================
export async function getContentDrafts(): Promise<ContentDraft[]> {
  if (isSupabaseAdminConfigured) {
    const { data, error } = await supabaseAdmin
      .from('content_drafts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        topicId: d.topic_id,
        category: d.category,
        slotIndex: d.slot_index,
        title: d.title,
        hook: d.hook,
        content: d.content,
        hashtags: d.hashtags || [],
        imageUrl: d.image_url,
        imagePrompt: d.image_prompt,
        language: d.language,
        qualityScore: d.quality_score,
        status: d.status,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    }
  }

  return readLocalJson<ContentDraft[]>('drafts.json', getInitialContentDrafts());
}

export async function saveContentDraft(draft: ContentDraft): Promise<ContentDraft> {
  if (isSupabaseAdminConfigured) {
    await supabaseAdmin.from('content_drafts').upsert({
      id: draft.id,
      topic_id: draft.topicId,
      category: draft.category,
      slot_index: draft.slotIndex,
      title: draft.title,
      hook: draft.hook,
      content: draft.content,
      hashtags: draft.hashtags,
      image_url: draft.imageUrl,
      image_prompt: draft.imagePrompt,
      language: draft.language,
      quality_score: draft.qualityScore,
      status: draft.status,
      created_at: draft.createdAt,
      updated_at: draft.updatedAt,
    });
  }

  const list = readLocalJson<ContentDraft[]>('drafts.json', getInitialContentDrafts());
  const idx = list.findIndex((d) => d.id === draft.id);
  if (idx >= 0) list[idx] = draft;
  else list.unshift(draft);
  writeLocalJson('drafts.json', list);
  return draft;
}

// ==============================================================================
// 5. Scheduled Posts & Publishing Queue Repository
// ==============================================================================
export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  if (isSupabaseAdminConfigured) {
    const { data, error } = await supabaseAdmin
      .from('scheduled_posts')
      .select('*, draft:content_drafts(*)')
      .order('scheduled_at', { ascending: true });
    if (!error && data && data.length > 0) {
      return data.map((s) => ({
        id: s.id,
        draftId: s.draft_id,
        scheduledAt: s.scheduled_at,
        slotIndex: s.slot_index,
        status: s.status,
        idempotencyKey: s.idempotency_key,
        targetPageId: s.target_page_id,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        draft: s.draft
          ? {
              id: s.draft.id,
              topicId: s.draft.topic_id,
              category: s.draft.category,
              slotIndex: s.draft.slot_index,
              title: s.draft.title,
              hook: s.draft.hook,
              content: s.draft.content,
              hashtags: s.draft.hashtags || [],
              imageUrl: s.draft.image_url,
              imagePrompt: s.draft.image_prompt,
              language: s.draft.language,
              qualityScore: s.draft.quality_score,
              status: s.draft.status,
              createdAt: s.draft.created_at,
              updatedAt: s.draft.updated_at,
            }
          : undefined,
      }));
    }
  }

  return readLocalJson<ScheduledPost[]>('scheduled_posts.json', getInitialScheduledPosts());
}

export async function saveScheduledPost(post: ScheduledPost): Promise<ScheduledPost> {
  if (isSupabaseAdminConfigured) {
    await supabaseAdmin.from('scheduled_posts').upsert({
      id: post.id,
      draft_id: post.draftId,
      scheduled_at: post.scheduledAt,
      slot_index: post.slotIndex,
      status: post.status,
      idempotency_key: post.idempotencyKey,
      target_page_id: post.targetPageId,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
    });
  }

  const list = readLocalJson<ScheduledPost[]>('scheduled_posts.json', getInitialScheduledPosts());
  const idx = list.findIndex((p) => p.id === post.id);
  if (idx >= 0) list[idx] = post;
  else list.push(post);
  writeLocalJson('scheduled_posts.json', list);
  return post;
}

// ==============================================================================
// 6. Post Publications & Audit Receipts
// ==============================================================================
export async function getPostPublications(limit: number = 50): Promise<PostPublication[]> {
  if (isSupabaseAdminConfigured) {
    const { data, error } = await supabaseAdmin
      .from('post_publications')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);
    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        scheduledPostId: d.scheduled_post_id,
        pageId: d.page_id,
        fbPostId: d.fb_post_id,
        fbPostUrl: d.fb_post_url,
        contentSnapshot: d.content_snapshot,
        category: d.category,
        publishedAt: d.published_at,
        responsePayload: d.response_payload,
      }));
    }
  }

  return readLocalJson<PostPublication[]>('publications.json', getInitialPublications());
}

export async function recordPostPublication(pub: PostPublication): Promise<PostPublication> {
  if (isSupabaseAdminConfigured) {
    await supabaseAdmin.from('post_publications').insert({
      id: pub.id,
      scheduled_post_id: pub.scheduledPostId,
      page_id: pub.pageId,
      fb_post_id: pub.fbPostId,
      fb_post_url: pub.fbPostUrl,
      content_snapshot: pub.contentSnapshot,
      category: pub.category,
      published_at: pub.publishedAt,
      response_payload: pub.responsePayload,
    });
  }

  const list = readLocalJson<PostPublication[]>('publications.json', getInitialPublications());
  list.unshift(pub);
  writeLocalJson('publications.json', list);
  return pub;
}

// ==============================================================================
// 7. Post Analytics Repository
// ==============================================================================
export async function getPostAnalytics(): Promise<PostAnalytics[]> {
  if (isSupabaseAdminConfigured) {
    const { data, error } = await supabaseAdmin
      .from('post_analytics')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((a) => ({
        id: a.id,
        fbPostId: a.fb_post_id,
        reach: a.reach,
        impressions: a.impressions,
        reactions: a.reactions,
        comments: a.comments,
        shares: a.shares,
        metricsAvailable: a.metrics_available,
        lastSyncedAt: a.last_synced_at,
        updatedAt: a.updated_at,
      }));
    }
  }

  return readLocalJson<PostAnalytics[]>('analytics.json', [
    {
      id: 'anal-1',
      fbPostId: 'demo_122093583825539821_1',
      reach: 1850,
      impressions: 2940,
      reactions: 84,
      comments: 26,
      shares: 14,
      metricsAvailable: true,
      lastSyncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'anal-2',
      fbPostId: 'demo_122093583825539821_2',
      reach: 2420,
      impressions: 4100,
      reactions: 122,
      comments: 38,
      shares: 21,
      metricsAvailable: true,
      lastSyncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
}

// ==============================================================================
// 8. Audit Logs Repository
// ==============================================================================
export async function getAuditLogs(limit: number = 60): Promise<AuditLog[]> {
  if (isSupabaseAdminConfigured) {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (!error && data && data.length > 0) {
      return data.map((l) => ({
        id: l.id,
        jobId: l.job_id,
        eventType: l.event_type,
        source: l.source,
        status: l.status,
        message: l.message,
        payload: l.payload,
        createdAt: l.created_at,
      }));
    }
  }

  return readLocalJson<AuditLog[]>('audit_logs.json', [
    {
      id: 'log-seed-1',
      eventType: 'SYSTEM_BOOT',
      source: 'scheduler',
      status: 'success',
      message: 'NexusPulse autonomous cloud scheduler initialized with timezone Asia/Karachi (10:00, 15:00, 20:00 PKT)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'log-seed-2',
      eventType: 'PAGE_CHECK',
      source: 'facebook_api',
      status: 'info',
      message: 'Meta Graph API policy check: Facebook Page verification active',
      createdAt: new Date().toISOString(),
    },
  ]);
}

export async function addAuditLog(
  log: Omit<AuditLog, 'id' | 'createdAt'>
): Promise<AuditLog> {
  const newLog: AuditLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseAdminConfigured) {
    await supabaseAdmin.from('audit_logs').insert({
      id: newLog.id,
      job_id: newLog.jobId,
      event_type: newLog.eventType,
      source: newLog.source,
      status: newLog.status,
      message: newLog.message,
      payload: newLog.payload,
      created_at: newLog.createdAt,
    });
  }

  const list = readLocalJson<AuditLog[]>('audit_logs.json', []);
  list.unshift(newLog);
  writeLocalJson('audit_logs.json', list.slice(0, 150));
  return newLog;
}

// Seed Helpers
function getInitialResearchTopics(): ResearchTopic[] {
  return [
    {
      id: 'top-1',
      title: 'Architecting Production RAG: Grounded Context Models vs Naive Vector Search',
      summary: 'Analysis of why standard cosine similarity retrieves hallucinated chunks and how source-grounded schemas guarantee audit compliance.',
      category: 'practical_expertise',
      sourceUrl: 'https://arxiv.org/abs/2401.18059',
      sourceName: 'arXiv AI Engineering Papers',
      publishedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      researchTimestamp: new Date().toISOString(),
      relevanceScore: 0.98,
      isVerifiedTrend: true,
      status: 'approved',
    },
    {
      id: 'top-2',
      title: 'Autonomous FinBots with n8n, Python Webhooks, and LLM Reasoning Steps',
      summary: 'Practical enterprise case study deploying event-driven financial agents that automate complex reconciliation without human bottleneck.',
      category: 'trending_ai',
      sourceUrl: 'https://news.ycombinator.com',
      sourceName: 'Hacker News Tech Trends',
      publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      researchTimestamp: new Date().toISOString(),
      relevanceScore: 0.95,
      isVerifiedTrend: true,
      status: 'approved',
    },
    {
      id: 'top-3',
      title: 'The Real Cost of LLM Hallucinations in Regulated Industries',
      summary: 'Strategic perspective on data anonymization, governance evidence engines, and why explainability wins enterprise contracts.',
      category: 'business_value',
      sourceUrl: 'https://venturebeat.com/ai',
      sourceName: 'VentureBeat AI Enterprise',
      publishedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      researchTimestamp: new Date().toISOString(),
      relevanceScore: 0.94,
      isVerifiedTrend: true,
      status: 'approved',
    },
  ];
}

function getInitialContentDrafts(): ContentDraft[] {
  return [
    {
      id: 'draft-1',
      category: 'trending_ai',
      slotIndex: 1,
      title: 'Slot 1 (10:00 AM) — Production RAG Architecture',
      hook: 'Most enterprise AI systems fail at the context boundary—not the LLM.',
      content: `Most enterprise AI systems don't fail at the LLM layer—they fail at the context and data governance boundary.\n\nWhen we architected our Governance Evidence Engine with Next.js and Python microservices, here are 3 engineering principles that changed everything:\n\n🔹 1. Ingestion Guardrails Before LLM Calls: Zero-trust schema validation with data anonymization before payloads ever reach tokenization.\n🔹 2. Grounded Context vs Blind Semantic Search: Source traceability over naive vector retrieval. Every chunk carries verifiable metadata provenance.\n🔹 3. Decoupled Webhooks for Complex Reasoning: Sub-second TTFB on Next.js while worker nodes process heavy proprietary algorithms asynchronously.\n\n💡 Core Engineering Rule: Treat your LLM as an untrusted computation kernel. Build the surrounding deterministic architecture with banking-grade rigor.\n\nWhat is your biggest obstacle moving from LLM prototypes to production reliability?\n\n— Zia-ul-din | Full Stack AI & Automation Architect\n#AIArchitecture #FullStackAI #LLMs #NextJS #ProductionAI #SoftwareEngineering`,
      hashtags: ['#AIArchitecture', '#FullStackAI', '#LLMs', '#NextJS', '#ProductionAI'],
      imageUrl: '/api/og?title=Architecting+Production+RAG&category=Full+Stack+AI',
      language: 'en',
      qualityScore: 96,
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'draft-2',
      category: 'practical_expertise',
      slotIndex: 2,
      title: 'Slot 2 (03:00 PM) — Self-Healing n8n & FinBot Automations',
      hook: 'If your business automations still require manual data babysitting, you have built technical debt.',
      content: `If your business automations still require manual data babysitting, you haven't built automation—you've built technical debt.\n\nHere are 3 rules from deploying autonomous FinBots and agentic workflows across enterprise streams:\n\n⚡ Rule 1: Multi-Step n8n/Make Orchestration with Self-Healing Logic: Wrap every third-party API call in exponential backoff retries with graceful fallbacks.\n⚡ Rule 2: Strict Pydantic / JSON Schema Validation: Free-form text will break client webhooks. Enforce deterministic types.\n⚡ Rule 3: Event-Driven Webhook Triggers: Trigger autonomous reconciliation agents immediately upon ledger updates rather than wasteful polling.\n\n📌 The best automation is the one you forget is running because it never fails silently.\n\n— Zia-ul-din | Full Stack AI & Automation Architect\n#AIAutomation #n8n #MakeCom #FinBots #WorkflowAutomation #Python`,
      hashtags: ['#AIAutomation', '#n8n', '#MakeCom', '#FinBots', '#WorkflowAutomation'],
      imageUrl: '/api/og?title=Autonomous+FinBots+%26+n8n+Workflows&category=AI+Automation',
      language: 'en',
      qualityScore: 94,
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'draft-3',
      category: 'business_value',
      slotIndex: 3,
      title: 'Slot 3 (08:00 PM) — Hybrid ML & Data Science ROI',
      hook: 'The era of one giant model to solve every business problem is officially over.',
      content: `The era of "one giant model to rule them all" is officially over.\n\nHere is why combining classical Machine Learning (Scikit-learn) with modern Transformers and Generative AI delivers the highest ROI in production today:\n\n🛠️ 1. Predictive Filtering + Generative Synthesis: Use lightweight classification models to filter thousands of data points in milliseconds, then pass only high-significance signals to LLMs.\n🛠️ 2. Auditable Evidence Engines: In heavily regulated industries, generative "vibes" do not pass compliance audits. Explainable predictive scores do.\n🛠️ 3. Slashed Inference Bills: Routing queries intelligently slashes compute bills by 70% while improving response latency.\n\n💡 Engineering Takeaway: Leadership isn't about using the newest model release on day one—it is about building resilient, measurable systems that drive revenue.\n\n— Zia-ul-din | Full Stack AI & Automation Architect\n#MachineLearning #Python #DataScience #AIGovernance #GenerativeAI`,
      hashtags: ['#MachineLearning', '#Python', '#DataScience', '#AIGovernance', '#GenerativeAI'],
      imageUrl: '/api/og?title=Hybrid+Machine+Learning+%26+GenAI+ROI&category=Business+Value',
      language: 'en',
      qualityScore: 95,
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function getInitialScheduledPosts(): ScheduledPost[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      id: 'sched-1',
      draftId: 'draft-1',
      scheduledAt: `${today}T10:00:00+05:00`,
      slotIndex: 1,
      status: 'pending',
      idempotencyKey: `post_${today}_slot_1`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      draft: getInitialContentDrafts()[0],
    },
    {
      id: 'sched-2',
      draftId: 'draft-2',
      scheduledAt: `${today}T15:00:00+05:00`,
      slotIndex: 2,
      status: 'pending',
      idempotencyKey: `post_${today}_slot_2`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      draft: getInitialContentDrafts()[1],
    },
    {
      id: 'sched-3',
      draftId: 'draft-3',
      scheduledAt: `${today}T20:00:00+05:00`,
      slotIndex: 3,
      status: 'pending',
      idempotencyKey: `post_${today}_slot_3`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      draft: getInitialContentDrafts()[2],
    },
  ];
}

function getInitialPublications(): PostPublication[] {
  return [
    {
      id: 'pub-seed-1',
      pageId: '122093583825539821',
      fbPostId: '122093583825539821_122093584989539821',
      fbPostUrl: 'https://www.facebook.com/122093583825539821/posts/122093584989539821',
      contentSnapshot: 'Architecting Low-Latency RAG: Why Naive Vector Search Fails in Production and How Grounded Context Models Fix It...',
      category: 'trending_ai',
      publishedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      responsePayload: { id: '122093583825539821_122093584989539821', success: true },
    },
  ];
}
