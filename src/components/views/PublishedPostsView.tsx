'use client';

import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, Search, Filter, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import { FacebookIcon } from '../icons/FacebookIcon';
import { PostPublication } from '@/lib/types';

interface PublishedPostsViewProps {
  publications: PostPublication[];
}

export function PublishedPostsView({ publications }: PublishedPostsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = publications.filter((pub) => {
    const matchesSearch = pub.contentSnapshot.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || pub.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={22} color="#10b981" />
            <span>Published Posts & Meta Receipts</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Audit log of verified publications to your Facebook Page with Graph API receipts.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search published posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '34px', width: '240px', fontSize: '0.84rem' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-field"
            style={{ fontSize: '0.84rem' }}
          >
            <option value="all">All Categories</option>
            <option value="trending_ai">Category A: Trending AI</option>
            <option value="practical_expertise">Category B: Practical Expertise</option>
            <option value="business_value">Category C: Business Value</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
          <FacebookIcon size={36} color="#0084ff" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, fontSize: '0.98rem' }}>No published posts found</p>
          <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
            Posts will appear here as soon as the autonomous scheduler publishes them to Facebook.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((pub) => (
            <div
              key={pub.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                background: 'rgba(11, 17, 33, 0.45)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src="/brand-avatar.png"
                      alt="Zia Ul Din"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid #e2e8f0',
                      }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#f8fafc' }}>Zia Ul Din</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600 }}>
                    ✓ Published via Graph API
                  </span>
                  <span style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.12)', color: '#a5b4fc', fontWeight: 600 }}>
                    {pub.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Published {new Date(pub.publishedAt).toLocaleDateString()} at{' '}
                    {new Date(pub.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <a
                  href={pub.fbPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '6px' }}
                >
                  <FacebookIcon size={14} color="#0084ff" />
                  <span>Open Facebook Post</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: '1.6', whiteSpace: 'pre-wrap', background: 'rgba(0, 0, 0, 0.2)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                {pub.contentSnapshot}
              </p>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                <span>Meta Post ID: <code style={{ color: 'var(--cyan-glow)' }}>{pub.fbPostId}</code></span>
                <span style={{ color: '#34d399' }}>✓ Permanent Receipt Verified</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
