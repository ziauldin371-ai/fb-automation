'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  ThumbsUp,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { FacebookIcon } from '../icons/FacebookIcon';
import { CategoryKey } from '@/lib/ai/prompts';
import { SlotIndex } from '@/lib/types';

interface ContentStudioViewProps {
  onPublishDirect: (data: {
    content: string;
    topic: string;
    category: CategoryKey;
    slotIndex: SlotIndex;
    imageUrl?: string;
  }) => Promise<void>;
  isPublishing: boolean;
}

export function ContentStudioView({ onPublishDirect, isPublishing }: ContentStudioViewProps) {
  const [category, setCategory] = useState<CategoryKey>('trending_ai');
  const [slotIndex, setSlotIndex] = useState<SlotIndex>(1);
  const [language, setLanguage] = useState<'english' | 'urdu' | 'bilingual'>('english');
  const [targetMarket, setTargetMarket] = useState('USA, UK & Worldwide');
  const [customTopic, setCustomTopic] = useState('');
  const [content, setContent] = useState('');
  const [hook, setHook] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('preview');
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPublishSuccessMessage(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: slotIndex === 1 ? 'morning' : slotIndex === 2 ? 'afternoon' : 'evening',
          category,
          customTopic: customTopic.trim() || undefined,
          language,
          targetMarket,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setContent(data.data.content);
        setHook(data.data.hook || '');
        setHashtags(data.data.hashtags || []);
        setImageUrl(data.data.imageUrl || '');
        setImagePrompt(data.data.imagePrompt || '');
        setQualityScore(data.data.qualityScore || 95);
        setWarnings(data.data.validation?.warnings || []);
      }
    } catch (err) {
      console.error('Failed to generate draft:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) return;
    setPublishSuccessMessage(null);
    await onPublishDirect({
      content,
      topic: customTopic || hook || 'AI Architecture Thought Leadership',
      category,
      slotIndex,
      imageUrl,
    });
    setPublishSuccessMessage('Draft published directly to verified Facebook Page!');
    setTimeout(() => setPublishSuccessMessage(null), 5000);
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} color="var(--cyan-glow)" />
            <span>AI Content Studio & Synthesis Cockpit</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Engineer high-impact, grounded posts tailored to your full-stack AI, LLM, and automation expertise.
          </p>
        </div>

        <div className="tab-list">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`tab-btn ${viewMode === 'editor' ? 'active' : ''}`}
          >
            <Sliders size={14} />
            <span>Studio Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`tab-btn ${viewMode === 'preview' ? 'active' : ''}`}
          >
            <Eye size={14} />
            <span>Facebook Feed Mockup</span>
          </button>
        </div>
      </div>

      {/* Synthesis Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Category */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Content Track:
          </label>
          <select
            value={category}
            onChange={(e) => {
              const val = e.target.value as CategoryKey;
              setCategory(val);
              if (val === 'trending_ai') setSlotIndex(1);
              else if (val === 'practical_expertise') setSlotIndex(2);
              else setSlotIndex(3);
            }}
            className="input-field"
          >
            <option value="trending_ai">Category A: Trending AI & Breaking Tools</option>
            <option value="practical_expertise">Category B: Practical Workflows & Code</option>
            <option value="business_value">Category C: Engagement & Business Value</option>
          </select>
        </div>

        {/* Slot Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Target Publishing Slot:
          </label>
          <select
            value={slotIndex}
            onChange={(e) => setSlotIndex(parseInt(e.target.value, 10) as SlotIndex)}
            className="input-field"
          >
            <option value={1}>Slot 1 (08:00 UTC | 09:00 AM London) — UK/EU Morning Intel</option>
            <option value={2}>Slot 2 (13:00 UTC | 09:00 AM NY/EST | 02:00 PM UK) — US/UK Power Slot</option>
            <option value={3}>Slot 3 (18:00 UTC | 11:00 AM SF/PST | 02:00 PM NY) — Silicon Valley Primetime</option>
          </select>
        </div>

        {/* Target Market & Audience */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Target Audience:
          </label>
          <select
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            className="input-field"
          >
            <option value="USA, UK & Worldwide">USA, UK & Worldwide (Global Tech Leaders)</option>
            <option value="USA Silicon Valley & Enterprise Tech">USA Silicon Valley & Enterprise Tech</option>
            <option value="UK & European Tech Ecosystem">UK & London Tech Ecosystem</option>
            <option value="Global Emerging AI Markets">Global Emerging AI Markets</option>
          </select>
        </div>

        {/* Language Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Language & Tone:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="input-field"
          >
            <option value="english">English (US/UK Professional Executive)</option>
            <option value="urdu">Urdu (Regional Script)</option>
            <option value="bilingual">Bilingual (English with Urdu Summary)</option>
          </select>
        </div>

        {/* Custom Angle / Topic */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Custom Research Topic / Breakthrough Angle:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Why naive vector search breaks in production RAG and how source-grounded models fix it"
              className="input-field"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Generate Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Facebook Feed Mockup Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'preview' ? '1.1fr 1fr' : '1fr', gap: '24px' }}>
        {/* Editor Side */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              POST CONTENT (Markdown, Short Paragraphs & Emojis)
            </span>
            {qualityScore !== null && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: qualityScore >= 90 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: qualityScore >= 90 ? '#34d399' : '#fbbf24',
                  fontWeight: 600,
                }}
              >
                Quality Score: {qualityScore}/100
              </span>
            )}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Click 'Generate Post' above or write your own thought-leadership insight..."
            className="textarea-field"
            rows={14}
          />

          {/* Warnings Bar */}
          {warnings.length > 0 && (
            <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <AlertTriangle size={14} /> Quality Optimization Notes:
              </div>
              <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-secondary"
              style={{ fontSize: '0.82rem' }}
            >
              <RefreshCw size={13} />
              <span>Regenerate Fresh Angle</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={!content.trim() || isPublishing}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #0084ff 0%, #00c6ff 100%)', boxShadow: '0 4px 15px rgba(0, 132, 255, 0.4)' }}
            >
              {isPublishing ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Publishing to Page...</span>
                </>
              ) : (
                <>
                  <FacebookIcon size={16} color="#ffffff" />
                  <span>Publish to Facebook Page Now</span>
                </>
              )}
            </button>
          </div>

          {publishSuccessMessage && (
            <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{publishSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Live Mockup Side */}
        {viewMode === 'preview' && (
          <div>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FacebookIcon size={14} color="#0084ff" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                AUTHENTIC FACEBOOK PAGE FEED MOCKUP
              </span>
            </div>

            <div className="fb-mock-card">
              <div className="fb-mock-header">
                <img
                  src="/brand-avatar.png"
                  alt="Zia Ul Din"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #e2e8f0',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.96rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Zia Ul Din</span>
                    <span style={{ fontSize: '0.7rem', color: '#0084ff' }}>● Verified Page</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#b0b3b8' }}>
                    Full Stack AI Engineer | Automation Architect • Just now • 🌐
                  </div>
                </div>
              </div>

              <div className="fb-mock-body" style={{ whiteSpace: 'pre-wrap' }}>
                {content || (
                  <span style={{ color: '#888', fontStyle: 'italic' }}>
                    Your generated post preview will render here with authentic Facebook feed formatting and mobile paragraph spacing...
                  </span>
                )}
              </div>

              {/* Dynamic Branded Visual Banner with Zia Ul Din portrait & theme */}
              {imageUrl && (
                <div style={{ marginTop: '14px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)', background: '#0a0e17' }}>
                  <img
                    src={imageUrl}
                    alt="Branded Post Graphic"
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                  />
                </div>
              )}

              <div className="fb-mock-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <ThumbsUp size={15} />
                  <span>Like</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <MessageSquare size={15} />
                  <span>Comment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <Share2 size={15} />
                  <span>Share</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
