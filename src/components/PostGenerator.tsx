'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  Share2,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { FacebookIcon } from './icons/FacebookIcon';
import { PostCategory, PostSlot } from '@/lib/types';

interface PostGeneratorProps {
  onPublishPost: (postData: {
    content: string;
    topic: string;
    category: PostCategory;
    slot: PostSlot;
  }) => Promise<void>;
  isPublishing: boolean;
}

export function PostGenerator({ onPublishPost, isPublishing }: PostGeneratorProps) {
  const [slot, setSlot] = useState<PostSlot>('morning');
  const [category, setCategory] = useState<PostCategory>('fullstack_ai');
  const [customTopic, setCustomTopic] = useState('');
  const [tone, setTone] = useState('Thought Leader & Architect');
  const [generatedContent, setGeneratedContent] = useState('');
  const [activeTopic, setActiveTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);

  // Generate preview
  const handleGenerate = async () => {
    setIsGenerating(true);
    setPublishSuccessMessage(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot,
          category,
          customTopic: customTopic.trim() || undefined,
          tone,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedContent(data.data.content);
        setActiveTopic(data.data.topic);
      }
    } catch (err) {
      console.error('Failed to generate post:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedContent.trim()) return;
    setPublishSuccessMessage(null);
    await onPublishPost({
      content: generatedContent,
      topic: activeTopic || customTopic || 'Custom AI Architecture Post',
      category,
      slot,
    });
    setPublishSuccessMessage('Post successfully submitted to Facebook pipeline!');
    setTimeout(() => setPublishSuccessMessage(null), 5000);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.18rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--cyan-glow)" />
            <span>AI Content Studio & Facebook Publisher</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Generate and preview posts tailored to your full-stack AI, automation, and LLM architecture expertise.
          </p>
        </div>

        <div className="tab-list">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`tab-btn ${!showPreview ? 'active' : ''}`}
          >
            <Sliders size={14} />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`tab-btn ${showPreview ? 'active' : ''}`}
          >
            <Eye size={14} />
            <span>Facebook Preview</span>
          </button>
        </div>
      </div>

      {/* Generation Parameters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '16px',
        }}
      >
        {/* Category */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Target Expertise Domain:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PostCategory)}
            className="input-field"
          >
            <option value="fullstack_ai">Full Stack AI & Context RAG</option>
            <option value="ai_automation">AI Automation & n8n / Make</option>
            <option value="trending_ai">Trending AI & Predictive Analytics</option>
            <option value="llm_agents">LLM Autonomous Agents & FinBots</option>
            <option value="data_science">Python & Data Science Mentorship</option>
          </select>
        </div>

        {/* Schedule Slot */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Daily Slot:
          </label>
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value as PostSlot)}
            className="input-field"
          >
            <option value="morning">Morning (Architecture & RAG)</option>
            <option value="afternoon">Afternoon (Agentic Automation)</option>
            <option value="evening">Evening (AI Trends & Analytics)</option>
            <option value="manual">Ad-hoc / Manual Spotlight</option>
          </select>
        </div>

        {/* Custom Angle / Topic */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Specific Topic or Project Angle (Optional - leave empty for auto-trending synthesis):
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Building our Governance Evidence Engine with Next.js & decoupled webhooks"
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
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        {/* Editor Box */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              POST CONTENT (Markdown & Emojis supported)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {generatedContent.length} characters
            </span>
          </div>
          <textarea
            value={generatedContent}
            onChange={(e) => setGeneratedContent(e.target.value)}
            placeholder="Click 'Generate Post' above or write your own thought-leadership post here..."
            className="textarea-field"
            rows={12}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-secondary"
              style={{ fontSize: '0.84rem' }}
            >
              <RefreshCw size={14} />
              <span>Regenerate Angle</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={!generatedContent.trim() || isPublishing}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #0084ff 0%, #00c6ff 100%)',
                boxShadow: '0 4px 15px rgba(0, 132, 255, 0.4)',
              }}
            >
              {isPublishing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Publishing to FB...</span>
                </>
              ) : (
                <>
                  <FacebookIcon size={16} color="#ffffff" />
                  <span>Publish Directly to Facebook</span>
                </>
              )}
            </button>
          </div>

          {publishSuccessMessage && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{publishSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Live Facebook Post Card Preview */}
        {showPreview && (
          <div>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FacebookIcon size={14} color="#0084ff" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                LIVE FACEBOOK FEED MOCKUP
              </span>
            </div>

            <div className="fb-mock-card">
              <div className="fb-mock-header">
                <div className="fb-mock-avatar">Z</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.96rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Zia-ul-din</span>
                    <span style={{ fontSize: '0.72rem', color: '#0084ff' }}>● Follow</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#b0b3b8' }}>
                    Full Stack AI & Automation Architect • Just now • 🌐
                  </div>
                </div>
              </div>

              <div className="fb-mock-body">
                {generatedContent || (
                  <span style={{ color: '#888', fontStyle: 'italic' }}>
                    Your generated post preview will render here with authentic Facebook feed formatting...
                  </span>
                )}
              </div>

              <div className="fb-mock-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <ThumbsUp size={16} />
                  <span>Like</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <MessageSquare size={16} />
                  <span>Comment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <Share2 size={16} />
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
