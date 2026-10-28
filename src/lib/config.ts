import { ScheduleSlotConfig, SystemSettings } from './types';

export const APP_CONFIG = {
  name: 'NexusPulse AI Autoposter',
  version: '1.0.0',
  author: 'Zia-ul-din',
  authorTitle: 'Full Stack AI & Automation Architect',
  fbGraphApiVersion: 'v20.0',
  fbGraphBaseUrl: 'https://graph.facebook.com/v20.0',
};

export const DEFAULT_SLOTS: ScheduleSlotConfig[] = [
  {
    id: 'morning',
    title: 'Slot 1: UK & Europe Morning Tech Intel',
    timeUtc: '08:00',
    timeLocal: '09:00 AM London | 04:00 AM NY/EST | 01:00 PM PKT',
    category: 'fullstack_ai',
    topicFocus: 'Production LLM Architecture, Next.js Full Stack AI, Context/Retrieval (RAG) & Enterprise Governance',
    enabled: true,
  },
  {
    id: 'afternoon',
    title: 'Slot 2: US East & UK Midday Power Slot',
    timeUtc: '13:00',
    timeLocal: '09:00 AM NY/EST | 02:00 PM London | 06:00 PM PKT',
    category: 'ai_automation',
    topicFocus: 'Agentic Workflows, n8n & Make Automations, FinBots, Multi-step Webhook Integrations',
    enabled: true,
  },
  {
    id: 'evening',
    title: 'Slot 3: Silicon Valley (US West) & Global Primetime',
    timeUtc: '18:00',
    timeLocal: '11:00 AM SF/PST | 02:00 PM NY/EST | 07:00 PM London',
    category: 'trending_ai',
    topicFocus: 'Trending AI Breakthroughs, Machine Learning & Predictive Analytics (Python, Scikit-learn, Hugging Face)',
    enabled: true,
  },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  id: 'default',
  timezone: 'UTC',
  postTimes: ['08:00', '13:00', '18:00'],
  language: 'english',
  targetAudience: 'USA, UK & Worldwide (US/UK Tech Founders, CTOs & Software Architects)',
  autoPostingEnabled: true,
  aiProvider: 'gemini',
  aiModel: 'gemini-2.0-flash',
  imageGenerationEnabled: true,
  emergencyPaused: false,
  slots: DEFAULT_SLOTS,
  includeHashtags: true,
  signatureLine: '— Zia Ul Din | Full Stack AI & Automation Architect',
};

