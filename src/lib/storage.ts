import fs from 'fs';
import path from 'path';
import { Post, SystemLog, SystemSettings } from './types';
import { DEFAULT_SETTINGS } from './config';

// Data directory handling for local and Vercel environments
const DATA_DIR = process.env.VERCEL ? '/tmp/fb_auto_data' : path.join(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// In-memory cache for fast access & serverless warm execution
let memoryPosts: Post[] = [];
let memorySettings: SystemSettings = { ...DEFAULT_SETTINGS };
let memoryLogs: SystemLog[] = [];
let initialized = false;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create data dir, using in-memory state:', err);
  }
}

function loadInitialData(): void {
  if (initialized) return;
  ensureDataDir();

  try {
    if (fs.existsSync(POSTS_FILE)) {
      const data = fs.readFileSync(POSTS_FILE, 'utf-8');
      memoryPosts = JSON.parse(data);
    } else {
      // Seed initial high-quality demo post
      memoryPosts = [
        {
          id: 'seed-post-1',
          content: `Most production AI applications don't fail at the LLM layer—they fail at the context & data governance boundary.\n\nHere is the exact architectural pattern we use when building high-stakes AI engines with Next.js and Python microservices:\n\n🔹 1. Ingestion Guardrails Before LLM Calls: Zero-trust schema validation with data anonymization.\n🔹 2. Grounded Context vs Blind Semantic Search: Source traceability over naive vector retrieval.\n🔹 3. Decoupled Webhooks for Complex Reasoning: Sub-second TTFB on Next.js frontend with asynchronous workers.\n\nWhat is the biggest bottleneck you have encountered taking LLM prototypes to enterprise production?\n\n— Zia-ul-din | Full Stack AI & Automation Architect\n#AIArchitecture #FullStackAI #LLMs #NextJS #ProductionAI`,
          topic: 'Architecting Low-Latency RAG & Enterprise Context Pipelines',
          category: 'fullstack_ai',
          slot: 'morning',
          status: 'published',
          facebookPostId: 'demo_123456789_published',
          facebookPostUrl: 'https://facebook.com',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          hashtags: ['#AIArchitecture', '#FullStackAI', '#LLMs', '#NextJS', '#ProductionAI'],
          engagement: { likes: 38, comments: 12, shares: 7 },
        },
      ];
      savePostsToDisk();
    }
  } catch (err) {
    console.warn('Error reading posts file:', err);
  }

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      memorySettings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.warn('Error reading settings file:', err);
  }

  try {
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, 'utf-8');
      memoryLogs = JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading logs file:', err);
  }

  initialized = true;
}

function savePostsToDisk(): void {
  try {
    ensureDataDir();
    fs.writeFileSync(POSTS_FILE, JSON.stringify(memoryPosts, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing posts to disk:', err);
  }
}

function saveSettingsToDisk(): void {
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(memorySettings, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing settings to disk:', err);
  }
}

function saveLogsToDisk(): void {
  try {
    ensureDataDir();
    fs.writeFileSync(LOGS_FILE, JSON.stringify(memoryLogs.slice(0, 200), null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing logs to disk:', err);
  }
}

export function getPosts(): Post[] {
  loadInitialData();
  return [...memoryPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPostById(id: string): Post | undefined {
  loadInitialData();
  return memoryPosts.find((p) => p.id === id);
}

export function savePost(post: Post): Post {
  loadInitialData();
  const existingIdx = memoryPosts.findIndex((p) => p.id === post.id);
  if (existingIdx >= 0) {
    memoryPosts[existingIdx] = post;
  } else {
    memoryPosts.unshift(post);
  }
  savePostsToDisk();
  return post;
}

export function updatePost(id: string, updates: Partial<Post>): Post | null {
  loadInitialData();
  const index = memoryPosts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  memoryPosts[index] = { ...memoryPosts[index], ...updates };
  savePostsToDisk();
  return memoryPosts[index];
}

export function deletePost(id: string): boolean {
  loadInitialData();
  const initialLen = memoryPosts.length;
  memoryPosts = memoryPosts.filter((p) => p.id !== id);
  if (memoryPosts.length !== initialLen) {
    savePostsToDisk();
    return true;
  }
  return false;
}

export function getSettings(): SystemSettings {
  loadInitialData();
  return { ...memorySettings };
}

export function updateSettings(newSettings: Partial<SystemSettings>): SystemSettings {
  loadInitialData();
  memorySettings = { ...memorySettings, ...newSettings };
  saveSettingsToDisk();
  return { ...memorySettings };
}

export function addLog(log: Omit<SystemLog, 'id' | 'timestamp'>): SystemLog {
  loadInitialData();
  const entry: SystemLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  memoryLogs.unshift(entry);
  if (memoryLogs.length > 200) memoryLogs = memoryLogs.slice(0, 200);
  saveLogsToDisk();
  return entry;
}

export function getLogs(limit: number = 50): SystemLog[] {
  loadInitialData();
  return memoryLogs.slice(0, limit);
}

export function getTodayStats(): {
  todayCount: number;
  totalPublished: number;
  streakDays: number;
  failedCount: number;
} {
  loadInitialData();
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPosts = memoryPosts.filter(
    (p) => p.publishedAt && p.publishedAt.slice(0, 10) === todayStr && p.status === 'published'
  );
  const totalPublished = memoryPosts.filter((p) => p.status === 'published').length;
  const failedCount = memoryPosts.filter((p) => p.status === 'failed').length;

  return {
    todayCount: todayPosts.length,
    totalPublished,
    streakDays: Math.max(1, Math.min(totalPublished, 14)),
    failedCount,
  };
}
