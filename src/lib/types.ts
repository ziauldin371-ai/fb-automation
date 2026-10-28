export type PostCategory =
  | 'trending_ai'
  | 'practical_expertise'
  | 'business_value'
  | 'fullstack_ai'
  | 'ai_automation'
  | 'llm_agents'
  | 'data_science';

export type SlotIndex = 1 | 2 | 3;

export type PostSlot = 'morning' | 'afternoon' | 'evening' | 'manual';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export type ScheduledStatus = 'pending' | 'processing' | 'published' | 'failed' | 'cancelled';

export type PostStatus = 'published' | 'queued' | 'failed' | 'draft';

export interface Post {
  id: string;
  content: string;
  topic: string;
  category: PostCategory;
  slot: PostSlot;
  status: PostStatus;
  facebookPostId?: string;
  facebookPostUrl?: string;
  createdAt: string;
  publishedAt?: string;
  errorMessage?: string;
  hashtags: string[];
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  source: 'cron' | 'manual' | 'facebook' | 'ai';
  message: string;
  details?: any;
}

export interface SystemSettings {
  id: string;
  timezone: string; // e.g. "Asia/Karachi"
  postTimes: string[]; // e.g. ["10:00", "15:00", "20:00"]
  language: 'english' | 'urdu' | 'bilingual';
  autoPostingEnabled: boolean;
  aiProvider: 'gemini' | 'openai' | 'groq' | 'hybrid';
  aiModel: string;
  imageGenerationEnabled: boolean;
  emergencyPaused: boolean;
  notificationWebhookUrl?: string;
  qstashScheduleId?: string;
  updatedAt?: string;
  slots?: ScheduleSlotConfig[];
  includeHashtags?: boolean;
  signatureLine?: string;
  targetAudience?: string;
}

export interface FacebookPage {
  id: string;
  pageId: string;
  pageName: string;
  accessToken: string;
  category?: string;
  followersCount: number;
  likesCount?: number;
  tokenExpiresAt?: string;
  isActive: boolean;
  permissions: string[];
  lastVerifiedAt?: string;
  createdAt?: string;
}

export interface ResearchTopic {
  id: string;
  title: string;
  summary: string;
  category: 'trending_ai' | 'practical_expertise' | 'business_value';
  sourceUrl?: string;
  sourceName: string;
  publishedAt?: string;
  researchTimestamp: string;
  relevanceScore: number;
  isVerifiedTrend: boolean; // false = 'editorial_recommendation'
  status: 'approved' | 'used' | 'archived' | 'excluded';
  metadata?: Record<string, any>;
}

export interface ContentDraft {
  id: string;
  topicId?: string;
  category: 'trending_ai' | 'practical_expertise' | 'business_value';
  slotIndex: SlotIndex;
  title: string;
  hook: string;
  content: string;
  hashtags: string[];
  imageUrl?: string;
  imagePrompt?: string;
  language: 'en' | 'ur' | 'bilingual';
  qualityScore: number;
  duplicateHash?: string;
  status: 'draft' | 'approved' | 'rejected' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledPost {
  id: string;
  draftId: string;
  scheduledAt: string; // ISO String in UTC
  slotIndex: SlotIndex;
  status: ScheduledStatus;
  idempotencyKey: string; // 'post_YYYY-MM-DD_slot_X'
  targetPageId?: string;
  createdAt: string;
  updatedAt: string;
  draft?: ContentDraft;
  publication?: PostPublication;
}

export interface PublishingJob {
  id: string;
  scheduledPostId: string;
  attemptCount: number;
  maxAttempts: number;
  nextRetryAt?: string;
  lockedAt?: string;
  lockedBy?: string;
  status: JobStatus;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostPublication {
  id: string;
  scheduledPostId?: string;
  pageId: string;
  fbPostId: string;
  fbPostUrl: string;
  contentSnapshot: string;
  category: string;
  publishedAt: string;
  responsePayload?: any;
}

export interface PostAnalytics {
  id: string;
  fbPostId: string;
  reach?: number | null;
  impressions?: number | null;
  reactions: number;
  comments: number;
  shares: number;
  metricsAvailable: boolean;
  lastSyncedAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  jobId?: string;
  eventType: string;
  source: 'scheduler' | 'research' | 'ai_engine' | 'facebook_api' | 'user';
  status: 'info' | 'success' | 'warn' | 'error';
  message: string;
  payload?: any;
  createdAt: string;
}

export interface FBPageStatus {
  connected: boolean;
  isProfileDetected?: boolean;
  pageId?: string;
  pageName?: string;
  category?: string;
  likes?: number;
  followers?: number;
  error?: string;
  tokenExpires?: string;
  permissions?: string[];
}

export interface ScheduleSlotConfig {
  id: PostSlot;
  slotIndex?: SlotIndex;
  title: string;
  timeUtc?: string; // e.g. "08:00"
  timeLocal?: string; // e.g. "01:00 PM PKT / 09:00 AM UK"
  timeStr?: string; // e.g. "10:00"
  timezone?: string; // e.g. "Asia/Karachi"
  category: any;
  categoryLabel?: string;
  topicFocus: string;
  enabled: boolean;
  lastRunAt?: string;
}
