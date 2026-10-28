'use client';

import React from 'react';
import { Calendar, CheckCircle2, TrendingUp, Cloud, AlertCircle } from 'lucide-react';
import { FacebookIcon } from './icons/FacebookIcon';
import { FBPageStatus } from '@/lib/types';

interface StatsOverviewProps {
  stats: {
    todayCount: number;
    totalPublished: number;
    streakDays: number;
    failedCount: number;
  };
  fbStatus: FBPageStatus;
}

export function StatsOverview({ stats, fbStatus }: StatsOverviewProps) {
  const dailyTarget = 3;
  const progressPercent = Math.min(100, Math.round((stats.todayCount / dailyTarget) * 100));

  return (
    <div className="stats-grid" style={{ marginBottom: '28px' }}>
      {/* Daily Progress Card */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            TODAY&apos;S QUOTA
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
            }}
          >
            <Calendar size={18} />
          </div>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800 }}>{stats.todayCount}</span>
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 3 posts</span>
        </div>
        {/* Progress Bar */}
        <div
          style={{
            marginTop: '12px',
            height: '6px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
              borderRadius: '999px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <p style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Morning • Afternoon • Evening
        </p>
      </div>

      {/* Lifetime Published Card */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            TOTAL PUBLISHED
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
            }}
          >
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800 }}>{stats.totalPublished}</span>
          <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600 }}>
            {stats.failedCount === 0 ? '100% Success Rate' : `${stats.failedCount} Failed`}
          </span>
        </div>
        <p style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Continuous Thought Leadership Pipeline
        </p>
      </div>

      {/* Facebook Page Status */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            FACEBOOK PAGE
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: fbStatus.connected ? 'rgba(0, 132, 255, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: fbStatus.connected ? '#0084ff' : '#f59e0b',
            }}
          >
            <FacebookIcon size={18} color={fbStatus.connected ? '#0084ff' : '#f59e0b'} />
          </div>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {fbStatus.connected ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e4e6eb' }}>
                {fbStatus.pageName || 'Connected Page'}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {fbStatus.followers ? `${fbStatus.followers.toLocaleString()} Followers` : 'Ready to Publish'}
              </span>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} />
                <span>Test Mode / Simulation</span>
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Tokens needed for live Graph API
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cloud Autonomous Engine */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            VERCEL CLOUD ENGINE
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.12)',
              color: '#8b5cf6',
            }}
          >
            <Cloud size={18} />
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '1.02rem', color: '#c084fc' }}>
            System-Off Resilience
          </div>
          <p style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Vercel edge crons execute autonomously in the cloud even when your PC is turned off.
          </p>
        </div>
      </div>
    </div>
  );
}
