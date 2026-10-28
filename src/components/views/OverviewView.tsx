'use client';

import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Play,
  Cloud,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Share2,
  Eye,
  Sparkles,
} from 'lucide-react';
import { FacebookIcon } from '../icons/FacebookIcon';
import { FBPageStatus, PostPublication, ScheduledPost, SystemSettings } from '@/lib/types';

interface OverviewViewProps {
  stats: {
    todayPublishedCount: number;
    dailyTarget: number;
    lifetimePublishedCount: number;
    pendingScheduledCount: number;
    failedCount: number;
    totalReactions: number;
    totalComments: number;
    totalShares: number;
    totalReach: number;
    schedulerHealth: string;
  };
  settings: SystemSettings;
  fbStatus: FBPageStatus;
  scheduled: ScheduledPost[];
  recentPublications: PostPublication[];
  onTriggerSlot: (slotIndex: number) => Promise<void>;
  onNavigateToStudio: () => void;
  isTriggering: boolean;
}

export function OverviewView({
  stats,
  settings,
  fbStatus,
  scheduled,
  recentPublications,
  onTriggerSlot,
  onNavigateToStudio,
  isTriggering,
}: OverviewViewProps) {
  const quotaPercent = Math.min(100, Math.round((stats.todayPublishedCount / 3) * 100));

  const slotDescriptions = [
    {
      index: 1,
      title: 'Slot 1: UK & Europe Morning Tech Intel',
      time: settings.postTimes[0] ? `${settings.postTimes[0]} UTC (09:00 AM London | 04:00 AM NY)` : '08:00 UTC',
      category: 'Category A: Trending AI (US/UK Focus)',
      focus: 'Frontier LLM reasoning shifts, token economics, and breaking engineering tools.',
      color: '#38bdf8',
    },
    {
      index: 2,
      title: 'Slot 2: US East Coast & UK Midday Power Slot',
      time: settings.postTimes[1] ? `${settings.postTimes[1]} UTC (09:00 AM NY/EST | 02:00 PM UK)` : '13:00 UTC',
      category: 'Category B: Practical Expertise',
      focus: 'Autonomous agents, n8n/Make orchestrations, Python microservices, and self-healing webhooks.',
      color: '#818cf8',
    },
    {
      index: 3,
      title: 'Slot 3: Silicon Valley (US West) & Global Primetime',
      time: settings.postTimes[2] ? `${settings.postTimes[2]} UTC (11:00 AM SF/PST | 02:00 PM NY)` : '18:00 UTC',
      category: 'Category C: Business Value',
      focus: 'High-ROI architectures, hybrid ML+LLMs, and why naive RAG fails at enterprise scale.',
      color: '#f472b6',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Target Audience & Global Reach Banner */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontWeight: 800,
            }}
          >
            🌍
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
                Primary Target Audience: USA, UK & Worldwide
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Global Tech Alignment
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Calibrated for London (BST/GMT), New York (EST), & Silicon Valley (PST). Native US/UK executive engineering tone enabled.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(15, 23, 42, 0.6)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
            🇬🇧 09:00 AM London
          </span>
          <span style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(15, 23, 42, 0.6)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
            🇺🇸 09:00 AM New York
          </span>
          <span style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(15, 23, 42, 0.6)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
            🇺🇸 11:00 AM San Francisco
          </span>
        </div>
      </div>
      {/* Profile Notice Banner if Personal Profile was entered */}
      {fbStatus.isProfileDetected && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <AlertCircle size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.96rem' }}>
              Meta API Notice: Personal Profile URL Detected (ID: 61596194632492)
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#e2e8f0', marginTop: '4px', lineHeight: '1.5' }}>
              Meta Platform Policy strictly limits programmatic posting to <strong>Facebook Pages</strong>. Automated publishing to personal user profiles is unsupported. Please connect a Facebook Page or convert your brand into a Page in Settings to enable live feed posting.
            </p>
          </div>
        </div>
      )}

      {/* Top Stat Row */}
      <div className="stats-grid">
        {/* Daily Quota */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              TODAY&apos;S PUBLISHING SLOTS
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800 }}>{stats.todayPublishedCount}</span>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/ 3 published</span>
          </div>
          <div style={{ marginTop: '10px', height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${quotaPercent}%`, background: 'linear-gradient(90deg, #4f46e5, #06b6d4)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
          </div>
          <p style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Schedule: 10:00 AM • 3:00 PM • 8:00 PM ({settings.timezone})
          </p>
        </div>

        {/* Facebook Page Status */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              FACEBOOK DESTINATION
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: fbStatus.connected ? 'rgba(0, 132, 255, 0.15)' : 'rgba(245, 158, 11, 0.15)' }}>
              <FacebookIcon size={18} color={fbStatus.connected ? '#0084ff' : '#f59e0b'} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            {fbStatus.connected ? (
              <>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e4e6eb' }}>
                  {fbStatus.pageName || 'Zia-ul-din AI Page'}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>
                  ✓ Official Meta Graph API Ready
                </p>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#f59e0b' }}>
                  Simulation / Setup Mode
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Safe test runs enabled until live Page token added.
                </p>
              </>
            )}
          </div>
          <p style={{ marginTop: '8px', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            Graph API v20.0 • Verified Permissions
          </p>
        </div>

        {/* Autonomous Cloud Engine */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              INDEPENDENT CLOUD CRON
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              <Cloud size={18} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#c084fc' }}>
              Vercel + QStash Ready
            </div>
            <p style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>
              ✓ Laptop-Off Resilience Active
            </p>
          </div>
          <p style={{ marginTop: '8px', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            Triggers 24/7 independently of local computer.
          </p>
        </div>

        {/* Total Engagement */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              TOTAL ENGAGEMENT
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800 }}>
              {(stats.totalReactions + stats.totalComments + stats.totalShares).toLocaleString()}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600 }}>
              Across {stats.lifetimePublishedCount} Posts
            </span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <span>👍 {stats.totalReactions} Likes</span>
            <span>💬 {stats.totalComments} Comments</span>
            <span>↗ {stats.totalShares} Shares</span>
          </div>
        </div>
      </div>

      {/* Autonomous Daily Schedule Slots */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Autonomous Daily Publishing Queue</span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600 }}>
                Active in {settings.timezone}
              </span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Three high-impact posts published autonomously every day with unique idempotency keys and duplicate prevention.
            </p>
          </div>

          <button onClick={onNavigateToStudio} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
            <Sparkles size={14} color="var(--cyan-glow)" />
            <span>Open Content Studio</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {slotDescriptions.map((slot) => {
            const isFilledToday = stats.todayPublishedCount >= slot.index;
            return (
              <div
                key={slot.index}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  background: 'rgba(15, 23, 42, 0.55)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: slot.color }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: slot.color }}>
                      {slot.category}
                    </span>
                    <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginTop: '2px' }}>{slot.title}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <Clock size={13} />
                      <span>{slot.time} ({settings.timezone})</span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: isFilledToday ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      color: isFilledToday ? '#34d399' : '#38bdf8',
                      fontWeight: 600,
                    }}
                  >
                    {isFilledToday ? 'Published Today' : 'Scheduled Queue'}
                  </span>
                </div>

                <p style={{ marginTop: '14px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {slot.focus}
                </p>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Idempotency: post_today_slot_{slot.index}
                  </span>
                  <button
                    onClick={() => onTriggerSlot(slot.index)}
                    disabled={isTriggering}
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    <Play size={12} fill="currentColor" />
                    <span>Run Slot Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Published Receipts */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Recent Published Activity</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Official Facebook Graph API publishing receipts with verified post IDs.
        </p>

        {recentPublications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
            No posts published yet. Trigger a slot above or schedule your first post.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentPublications.slice(0, 5).map((pub) => (
              <div
                key={pub.id}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 18px',
                  background: 'rgba(10, 16, 30, 0.4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600 }}>
                      ✓ Published
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {new Date(pub.publishedAt).toLocaleDateString()} at{' '}
                      {new Date(pub.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#e2e8f0', marginTop: '6px', maxWidth: '780px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pub.contentSnapshot}
                  </p>
                </div>

                <a
                  href={pub.fbPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px' }}
                >
                  <FacebookIcon size={13} color="#0084ff" />
                  <span>View on Facebook</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
