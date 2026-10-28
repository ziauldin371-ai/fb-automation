'use client';

import React, { useState } from 'react';
import { Bot, Zap, CloudLightning, ShieldCheck, Play, RefreshCw, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onTriggerCron: (slot?: string) => Promise<void>;
  onOpenSettings: () => void;
  onOpenLogs: () => void;
  isTriggering: boolean;
  autoEnabled: boolean;
}

export function Header({
  onTriggerCron,
  onOpenSettings,
  onOpenLogs,
  isTriggering,
  autoEnabled,
}: HeaderProps) {
  const [slotSelect, setSlotSelect] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(6, 8, 14, 0.85)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Logo & Author Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              position: 'relative',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #e2e8f0',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
              background: '#0f172a',
              flexShrink: 0,
            }}
          >
            <img
              src="/brand-avatar.png"
              alt="Zia Ul Din"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                NexusPulse <span style={{ color: 'var(--cyan-glow)', fontWeight: 500 }}>AI AutoPoster</span>
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontWeight: 600,
                }}
              >
                v1.0 Vercel Cloud
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Zia Ul Din • Full Stack AI & Automation Architect
            </p>
          </div>
        </div>

        {/* System Autonomous Status & Cloud Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Autonomous Status Badge */}
          <div className="badge-autonomous">
            <span className="pulse-dot"></span>
            <span>{autoEnabled ? 'Vercel Autonomous 24/7 Active' : 'Autonomous Paused'}</span>
          </div>

          {/* Quick Manual Cron Trigger */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '2px 4px 2px 10px',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Run Slot:</span>
            <select
              value={slotSelect}
              onChange={(e) => setSlotSelect(e.target.value as any)}
              className="select-field"
              style={{
                padding: '6px 8px',
                fontSize: '0.8rem',
                border: 'none',
                background: 'transparent',
              }}
            >
              <option value="morning" style={{ background: '#0f172a' }}>Morning (AI Architecture)</option>
              <option value="afternoon" style={{ background: '#0f172a' }}>Afternoon (Automation/n8n)</option>
              <option value="evening" style={{ background: '#0f172a' }}>Evening (Trends & Data)</option>
            </select>
            <button
              onClick={() => onTriggerCron(slotSelect)}
              disabled={isTriggering}
              className="btn-primary"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
              title="Manually trigger the Vercel Cron routine right now"
            >
              {isTriggering ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  <span>Test Cron Now</span>
                </>
              )}
            </button>
          </div>

          {/* Settings & Logs Buttons */}
          <button
            onClick={onOpenSettings}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.84rem' }}
          >
            <ShieldCheck size={16} />
            <span>FB & API Keys</span>
          </button>

          <button
            onClick={onOpenLogs}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.84rem' }}
          >
            <CloudLightning size={16} />
            <span>Live Logs</span>
          </button>
        </div>
      </div>
    </header>
  );
}
