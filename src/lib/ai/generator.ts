import { SlotIndex } from '../types';
import { buildPromptForCategory, CategoryKey } from './prompts';
import { validatePostContent, ValidationResult } from './validator';

export interface GenerateOptions {
  slotIndex: SlotIndex;
  category: CategoryKey;
  topic: string;
  sourceUrl?: string;
  language?: 'english' | 'urdu' | 'bilingual';
  targetMarket?: string;
  existingPosts?: string[];
}

export interface GeneratedPost {
  title: string;
  hook: string;
  content: string;
  hashtags: string[];
  imageUrl?: string;
  imagePrompt?: string;
  category: CategoryKey;
  slotIndex: SlotIndex;
  qualityScore: number;
  validation: ValidationResult;
  provider: 'gemini' | 'openai' | 'expert_synthesis';
}

export async function generatePost(options: {
  slot?: string;
  category?: string;
  customTopic?: string;
  tone?: string;
  language?: 'english' | 'urdu' | 'bilingual';
  targetMarket?: string;
}) {
  const slotIndex: SlotIndex =
    options.slot === 'afternoon' || options.slot === '2'
      ? 2
      : options.slot === 'evening' || options.slot === '3'
      ? 3
      : 1;

  const category: CategoryKey =
    options.category === 'practical_expertise'
      ? 'practical_expertise'
      : options.category === 'business_value'
      ? 'business_value'
      : 'trending_ai';

  const res = await generateContentForSlot({
    slotIndex,
    category,
    topic: options.customTopic || 'Architecting Enterprise AI & Automation',
    language: options.language || 'english',
    targetMarket: options.targetMarket || 'USA, UK & Worldwide',
  });

  return {
    content: res.content,
    topic: options.customTopic || res.title,
    category: res.category,
    hashtags: res.hashtags,
    provider: res.provider,
    hook: res.hook,
    imageUrl: res.imageUrl,
    imagePrompt: res.imagePrompt,
    qualityScore: res.qualityScore,
    validation: res.validation,
  };
}

export async function generateContentForSlot(
  options: GenerateOptions
): Promise<GeneratedPost> {
  const { slotIndex, category, topic, sourceUrl, language = 'english', targetMarket = 'USA, UK & Worldwide', existingPosts = [] } = options;

  const prompt = buildPromptForCategory(category, slotIndex, topic, sourceUrl, language, targetMarket);
  let rawText = '';
  let provider: 'gemini' | 'openai' | 'expert_synthesis' = 'expert_synthesis';

  // 1. Try Google Gemini API
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 80) {
          rawText = text;
          provider = 'gemini';
        }
      }
    } catch (err) {
      console.warn('Gemini generation error, testing secondary providers:', err);
    }
  }

  // 2. Try OpenAI API if Gemini was not available or failed
  if (!rawText && process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          rawText = text;
          provider = 'openai';
        }
      }
    } catch (err) {
      console.warn('OpenAI generation error:', err);
    }
  }

  // 3. Fallback High-Quality Expert Synthesis
  if (!rawText) {
    rawText = getCuratedSynthesis(category, slotIndex, topic, language);
    provider = 'expert_synthesis';
  }

  // Extract Image Prompt if present
  let imagePrompt = '';
  const imgMatch = rawText.match(/\[IMAGE_PROMPT:\s*([^\]]+)\]/i);
  if (imgMatch) {
    imagePrompt = imgMatch[1].trim();
    rawText = rawText.replace(/\[IMAGE_PROMPT:[^\]]+\]/i, '').trim();
  }

  // Extract Hook (First non-empty line)
  const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
  const hook = lines[0] || 'Architecting Enterprise AI Systems';

  // Extract Viral Hashtags (5 to 7 high-velocity tags)
  const tagMatches = rawText.match(/#[a-zA-Z0-9_]+/g);
  let hashtags = tagMatches ? Array.from(new Set(tagMatches)).slice(0, 7) : [];
  if (hashtags.length < 5) {
    const viralFallbacks = [
      '#AIArchitecture',
      '#FullStackAI',
      '#LLMOps',
      '#NextJS',
      '#Python',
      '#EnterpriseAI',
      '#TechTrends',
    ];
    for (const tag of viralFallbacks) {
      if (!hashtags.includes(tag) && hashtags.length < 6) {
        hashtags.push(tag);
      }
    }
  }

  // Clean Post Content
  let cleanedContent = rawText.trim();
  if (cleanedContent.startsWith('```') && cleanedContent.endsWith('```')) {
    cleanedContent = cleanedContent.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
  }

  // Generate dynamic branded visual card URL featuring Zia Ul Din badge & exact theme
  const encodedTitle = encodeURIComponent(topic.slice(0, 60));
  const encodedCat = encodeURIComponent(category.replace('_', ' ').toUpperCase());
  const encodedHook = encodeURIComponent(hook.slice(0, 95));
  const imageUrl = `/api/og?title=${encodedTitle}&category=${encodedCat}&hook=${encodedHook}`;

  // Validate Content
  const validation = validatePostContent(cleanedContent, existingPosts);

  return {
    title: `Slot ${slotIndex}: ${topic}`,
    hook,
    content: cleanedContent,
    hashtags,
    imageUrl,
    imagePrompt: imagePrompt || `Dark brushed steel architectural graphic for ${topic} with Zia Ul Din signature theme`,
    category,
    slotIndex,
    qualityScore: validation.score,
    validation,
    provider,
  };
}

function getCuratedSynthesis(
  category: CategoryKey,
  slotIndex: SlotIndex,
  topic: string,
  language: 'english' | 'urdu' | 'bilingual'
): string {
  const templates: Record<CategoryKey, string> = {
    trending_ai: `⚡ Zia Ul Din | Full Stack AI & Automation Architect
──────────────────────────────────────
🔥 90% of engineers building with LLMs make the exact same $50,000 mistake in production:

They treat LLMs like deterministic APIs instead of probabilistic systems requiring grounded context engineering.

When you expand context windows to 1M+ tokens without provenance tracking, naive vector search breaks down under real-world load. Hallucinations spike, latency doubles, and compute bills skyrocket.

Here is the exact architectural blueprint high-performing engineering teams in Silicon Valley and London use right now:

🔹 1. Strict Schema Enforcement:
Never let unvalidated natural language touch your database layer. Enforce Pydantic / Zod schemas at the gate.

🔹 2. Grounded Evidence Lineage:
Every retrieved fact must map to an auditable document chunk hash before synthesis. Zero-trust context is mandatory.

🔹 3. Decoupled Asynchronous Workers:
Heavy evaluations belong on background workers—never on your client-facing Next.js thread. Sub-second TTFB wins.

💡 The winners in AI aren't those using the largest models—they are the architects who build the cleanest, most resilient pipelines.

👇 What is the single biggest bottleneck your team has hit taking LLMs from prototype to production? Drop your perspective below—I'm breaking down solutions in the comments.

— Zia Ul Din | Full Stack AI & Automation Architect
#AIArchitecture #FullStackAI #LLMOps #NextJS #Python #EnterpriseAI #TechTrends
[IMAGE_PROMPT: Clean minimalist dark brushed steel diagram showing Next.js microservices connecting to vector database and LLM kernel]`,

    practical_expertise: `⚡ Zia Ul Din | Full Stack AI & Automation Architect
──────────────────────────────────────
⚡ If your automated workflows break every time an external API hiccups, you haven't built automation—you've built technical debt.

Over the past year architecting autonomous agents and FinBots across complex enterprise streams, here are the 3 non-negotiable rules that took our automation reliability to 99.9%:

🛠️ Rule 1: Self-Healing Webhooks with Exponential Backoff:
Never trigger flat API calls. Wrap every n8n/Make node in retry logic with automated dead-letter queues and fallback routing.

🛠️ Rule 2: Deterministic Structured Payloads:
LLMs are creative; webhooks need precision. Force strict JSON schemas with deterministic field types before passing AI decisions downstream.

🛠️ Rule 3: Event-Driven Triggers Over Polling Crons:
Polling databases every 5 minutes wastes compute. Trigger autonomous workflows instantly upon data mutations.

📌 The best automation is invisible: it runs silently in the background and self-heals before human intervention is ever needed.

💬 Are you primarily orchestrating with n8n, Make, or custom Python microservices? Let's debate your production stack below.

— Zia Ul Din | Full Stack AI & Automation Architect
#Automation #n8n #Python #FinBots #AIArchitecture #SoftwareEngineering #DevOps
[IMAGE_PROMPT: Sleek flowchart demonstrating event-driven n8n webhook routing to Python microservice with self-healing retry node]`,

    business_value: `⚡ Zia Ul Din | Full Stack AI & Automation Architect
──────────────────────────────────────
🚀 The dirty secret of enterprise AI: Running giant frontier models on every single user query is burning millions in wasted compute.

The highest-ROI AI companies today aren't using one giant model for everything. They are deploying hybrid architectures that combine classical Machine Learning (Scikit-learn) with specialized LLM routers.

Here is the exact cost-to-performance breakdown:

⚡ 1. 70% Cheaper Inference:
Use a lightweight Scikit-learn classifier (running in <5ms) to filter 90% of requests, routing only complex queries to frontier LLMs.

⚡ 2. Zero-Trust Explainability:
In regulated finance and enterprise operations, 'black box vibes' fail audits. Classical ML gives you verifiable mathematical certainty.

⚡ 3. Sub-Second Latency:
Users won't wait 8 seconds for a response. Intelligent routing drops latency by 4x while preserving response quality.

💡 Real AI leadership isn't about using the newest model release on day one—it's about building resilient unit economics that actually scale.

👉 How is your team balancing inference cost versus response latency right now? Drop your architecture perspective below.

— Zia Ul Din | Full Stack AI & Automation Architect
#MachineLearning #GenerativeAI #Python #DataScience #AIGovernance #TechLeadership #StartupTech
[IMAGE_PROMPT: Benchmark comparison chart showing cost reduction and latency improvement using hybrid classical ML with LLM router]`,
  };

  let content = templates[category] || templates.trending_ai;

  if (language === 'bilingual') {
    content += `\n\nاردو خلاصہ:\nیہ پوسٹ اے آئی آرکیٹیکچر، خودکار نظام اور ایل ایل ایم سسٹمز کی صنعتی تیاری اور بہتری پر روشنی ڈالتی ہے۔`;
  }

  return content;
}
