'use client';

import React from 'react';
import {
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { FacebookIcon } from './icons/FacebookIcon';
import { Post } from '@/lib/types';

interface PostsHistoryProps {
  posts: Post[];
  onRetryPost: (id: string) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  isRetrying: string | null;
}

export function PostsHistory({ posts, onRetryPost, onDeletePost, isRetrying }: PostsHistoryProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '0.74rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={12} />
            Published
          </span>
        );
      case 'failed':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#fb7185',
              fontSize: '0.74rem',
              fontWeight: 600,
            }}
          >
            <XCircle size={12} />
            Failed
          </span>
        );
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              fontSize: '0.74rem',
              fontWeight: 600,
            }}
          >
            <Clock size={12} />
            Queued
          </span>
        );
    }
  };

  const getSlotLabel = (slot: string) => {
    switch (slot) {
      case 'morning':
        return 'Morning (Slot 1)';
      case 'afternoon':
        return 'Afternoon (Slot 2)';
      case 'evening':
        return 'Evening (Slot 3)';
      default:
        return 'Manual';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
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
            <span>Content History & Audit Trail</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
              }}
            >
              {posts.length} entries
            </span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Permanent record of automated and manually triggered posts with Facebook Graph API receipts.
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            color: 'var(--text-muted)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <FacebookIcon size={32} color="#0084ff" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ fontWeight: 600 }}>No posts recorded yet.</p>
          <p style={{ fontSize: '0.82rem', marginTop: '4px', color: 'var(--text-dim)' }}>
            Trigger a slot above or run your first AI post from the studio!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 20px',
                background: 'rgba(11, 17, 33, 0.45)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Header Info */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {getStatusBadge(post.status)}
                  <span
                    style={{
                      fontSize: '0.74rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#a5b4fc',
                      fontWeight: 600,
                    }}
                  >
                    {getSlotLabel(post.slot)}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {new Date(post.createdAt).toLocaleDateString()} at{' '}
                    {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {post.facebookPostUrl && (
                    <a
                      href={post.facebookPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                    >
                      <FacebookIcon size={12} color="#0084ff" />
                      <span>View on FB</span>
                      <ExternalLink size={11} />
                    </a>
                  )}

                  {post.status === 'failed' && (
                    <button
                      onClick={() => onRetryPost(post.id)}
                      disabled={isRetrying === post.id}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                    >
                      <RefreshCw size={12} className={isRetrying === post.id ? 'animate-spin' : ''} />
                      <span>Retry</span>
                    </button>
                  )}

                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#fb7185' }}
                    title="Delete post record"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Topic Title */}
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                {post.topic}
              </h4>

              {/* Content Preview */}
              <p
                style={{
                  fontSize: '0.86rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.55',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                {post.content}
              </p>

              {/* Error reason if failed */}
              {post.errorMessage && (
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '0.76rem',
                    color: '#fb7185',
                    background: 'rgba(244, 63, 94, 0.1)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                  }}
                >
                  Error: {post.errorMessage}
                </div>
              )}

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {post.hashtags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--cyan-glow)',
                        background: 'rgba(6, 182, 212, 0.08)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
