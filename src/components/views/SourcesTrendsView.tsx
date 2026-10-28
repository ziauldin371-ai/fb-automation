'use client';

import React, { useState } from 'react';
import { Compass, RefreshCw, ExternalLink, CheckCircle2, BookmarkCheck, Sparkles, AlertCircle } from 'lucide-react';
import { ResearchTopic } from '@/lib/types';

interface SourcesTrendsViewProps {
  topics: ResearchTopic[];
  onRunResearch: () => Promise<void>;
  isResearching: boolean;
}

export function SourcesTrendsView({ topics, onRunResearch, isResearching }: SourcesTrendsViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = topics.filter(
    (t) => filterCategory === 'all' || t.category === filterCategory
  );

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={22} color="var(--cyan-glow)" />
            <span>Automated Research Pipeline & Trend Evidence</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Source-grounded AI topic research with verified publication timestamps and citations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="select-field"
            style={{ fontSize: '0.84rem' }}
          >
            <option value="all">All Domains</option>
            <option value="trending_ai">Category A: Trending AI</option>
            <option value="practical_expertise">Category B: Practical Expertise</option>
            <option value="business_value">Category C: Business Value</option>
          </select>

          <button
            onClick={onRunResearch}
            disabled={isResearching}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          >
            {isResearching ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Run Fresh Research</span>
              </>
            )}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-dim)' }}>
          No research topics found. Click &quot;Run Fresh Research&quot; to fetch live AI trends.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map((topic) => (
            <div
              key={topic.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                background: 'rgba(11, 17, 33, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: topic.isVerifiedTrend
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(99, 102, 241, 0.15)',
                      color: topic.isVerifiedTrend ? '#34d399' : '#a5b4fc',
                      fontWeight: 600,
                    }}
                  >
                    {topic.isVerifiedTrend ? '✓ Verified Industry Trend' : '★ Editorial Recommendation'}
                  </span>

                  <span style={{ fontSize: '0.74rem', color: 'var(--cyan-glow)', fontWeight: 600 }}>
                    Relevance: {Math.round(topic.relevanceScore * 100)}%
                  </span>
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', lineHeight: '1.45' }}>
                  {topic.title}
                </h3>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5' }}>
                  {topic.summary}
                </p>
              </div>

              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.76rem',
                  color: 'var(--text-dim)',
                }}
              >
                <span>Source: {topic.sourceName}</span>
                {topic.sourceUrl && (
                  <a
                    href={topic.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <span>View Evidence</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
