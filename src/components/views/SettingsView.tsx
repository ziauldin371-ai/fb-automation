'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Key,
  Globe,
  Clock,
  Radio,
} from 'lucide-react';
import { FacebookIcon } from '../icons/FacebookIcon';
import { FBPageStatus, SystemSettings } from '@/lib/types';

interface SettingsViewProps {
  settings: SystemSettings;
  fbStatus: FBPageStatus;
  onUpdateSettings: (updates: Partial<SystemSettings>) => Promise<void>;
  onVerifyFacebook: (targetId: string, accessToken: string) => Promise<void>;
  isSaving: boolean;
}

export function SettingsView({
  settings,
  fbStatus,
  onUpdateSettings,
  onVerifyFacebook,
  isSaving,
}: SettingsViewProps) {
  const [targetId, setTargetId] = useState(fbStatus.pageId || '');
  const [accessToken, setAccessToken] = useState('');
  const [timezone, setTimezone] = useState(settings.timezone || 'UTC');
  const [slot1Time, setSlot1Time] = useState(settings.postTimes[0] || '08:00');
  const [slot2Time, setSlot2Time] = useState(settings.postTimes[1] || '13:00');
  const [slot3Time, setSlot3Time] = useState(settings.postTimes[2] || '18:00');
  const [language, setLanguage] = useState(settings.language || 'english');
  const [targetAudience, setTargetAudience] = useState(
    settings.targetAudience || 'USA, UK & Worldwide (US/UK Tech Founders, CTOs & Software Architects)'
  );
  const [aiProvider, setAiProvider] = useState(settings.aiProvider || 'gemini');
  const [autoPostingEnabled, setAutoPostingEnabled] = useState(settings.autoPostingEnabled);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const handleTestAndSaveFb = async () => {
    if (!targetId.trim()) return;
    setIsVerifying(true);
    setVerificationFeedback(null);
    try {
      const res = await fetch('/api/facebook/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: targetId.trim(),
          accessToken: accessToken.trim() || undefined,
          saveIfValid: true,
        }),
      });
      const data = await res.json();
      if (data.verification) {
        setVerificationFeedback(data.verification.diagnosticMessage);
      }
    } catch (err: any) {
      setVerificationFeedback(`Verification request failed: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    await onUpdateSettings({
      timezone,
      postTimes: [slot1Time, slot2Time, slot3Time],
      language,
      targetAudience,
      aiProvider,
      autoPostingEnabled,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. Facebook Page Integration & Compliance */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FacebookIcon size={22} color="#0084ff" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            Official Facebook Page Connection & Meta Compliance
          </h3>
        </div>

        {/* Warning about Personal Profiles vs Pages */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            marginBottom: '20px',
            fontSize: '0.84rem',
            color: '#e2e8f0',
            lineHeight: '1.6',
          }}
        >
          <div style={{ fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} /> Meta Graph API Policy Requirement:
          </div>
          <p style={{ marginTop: '4px' }}>
            Automated feed publishing is supported <strong>only on Facebook Pages</strong> with a Page Access Token (<code style={{ color: 'var(--cyan-glow)' }}>pages_manage_posts</code>). Personal profiles (e.g. <code style={{ color: '#fb7185' }}>profile.php?id=61596194632492</code>) cannot be published to programmatically per Meta Developer Terms.
          </p>
          <p style={{ marginTop: '6px' }}>
            To connect your brand: create an official Page at{' '}
            <a
              href="https://www.facebook.com/pages/create"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#38bdf8', textDecoration: 'underline' }}
            >
              facebook.com/pages/create
            </a>{' '}
            (e.g., &quot;Zia-ul-din | Full Stack AI & Automation Architect&quot;) and scan below to connect with 1 click.
          </p>
        </div>

        {/* Live Token Scanner Card */}
        <div
          style={{
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
                Meta Developer Token Scanner
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Inspects permissions, user identity, and automatically pulls managed Facebook Pages.
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                setIsVerifying(true);
                try {
                  const res = await fetch('/api/facebook/scan-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: accessToken || undefined }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setVerificationFeedback(
                      `Meta User: ${data.user.name} (ID: ${data.user.id}) | App: ${data.tokenMeta?.appName || 'page automation'} | Valid: ${data.tokenMeta?.isValid ? 'YES' : 'NO'}\n` +
                      `Scopes: ${data.tokenMeta?.scopes?.join(', ') || 'none'}\n` +
                      `Pages Found: ${data.pagesCount} ${data.pagesCount === 0 ? '(Create a Page at facebook.com/pages/create to link here)' : ''}`
                    );
                    if (data.pages && data.pages.length > 0) {
                      setTargetId(data.pages[0].id);
                    }
                  } else {
                    setVerificationFeedback(`Token Scan Error: ${data.error}`);
                  }
                } catch (e: any) {
                  setVerificationFeedback(`Scan failed: ${e.message}`);
                } finally {
                  setIsVerifying(false);
                }
              }}
              disabled={isVerifying}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} className={isVerifying ? 'animate-spin' : ''} />
              <span>Inspect Active Token</span>
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span>👤 Account: <strong>Zia Ul Din</strong></span>
            <span>🔑 Permissions: <strong style={{ color: '#10b981' }}>pages_manage_posts, pages_read_engagement, pages_show_list</strong></span>
            <span>📱 App: <strong>page automation (1763106664995505)</strong></span>
          </div>
        </div>

        {/* Input Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Facebook Page ID:
            </label>
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="e.g. 122093583825539821"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Page Access Token (Permanent or Long-Lived):
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAAZADiUJ32rEBSwPVz3eVwOnZBwHrrapb5PZCEZA5jl9ed7g5ClIIv7isf82ZBj3HKQ..."
              className="input-field"
            />
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Status: {fbStatus.connected ? '✓ Connected to Page' : 'Token Loaded — Awaiting Page Link'}
          </span>

          <button
            onClick={handleTestAndSaveFb}
            disabled={isVerifying}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.84rem' }}
          >
            {isVerifying ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Verifying with Meta API...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>Verify & Connect Page</span>
              </>
            )}
          </button>
        </div>

        {verificationFeedback && (
          <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
            {verificationFeedback}
          </div>
        )}
      </div>

      {/* 2. Autonomous Scheduling & Timezone */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Clock size={22} color="var(--cyan-glow)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Publishing Timezone & Daily Schedule</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Publishing Timezone:
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="select-field"
              style={{ width: '100%' }}
            >
              <option value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="America/New_York">America/New_York (EST, UTC-5)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
              <option value="UTC">UTC (Universal Time)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Slot 1 Time (Category A - Trends):
            </label>
            <input
              type="text"
              value={slot1Time}
              onChange={(e) => setSlot1Time(e.target.value)}
              placeholder="10:00"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Slot 2 Time (Category B - How-To):
            </label>
            <input
              type="text"
              value={slot2Time}
              onChange={(e) => setSlot2Time(e.target.value)}
              placeholder="15:00"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Slot 3 Time (Category C - Value):
            </label>
            <input
              type="text"
              value={slot3Time}
              onChange={(e) => setSlot3Time(e.target.value)}
              placeholder="20:00"
              className="input-field"
            />
          </div>
        </div>

        {/* Master Auto-Posting Switch */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Autonomous 3-Daily Posting Master Switch:</span>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              When enabled, Vercel Crons & QStash automatically execute on schedule without user interaction.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoPostingEnabled(!autoPostingEnabled)}
            className={autoPostingEnabled ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 18px', fontSize: '0.82rem' }}
          >
            {autoPostingEnabled ? '✓ Enabled' : '✕ Disabled'}
          </button>
        </div>
      </div>

      {/* 3. AI Provider & Language Settings */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Key size={22} color="#10b981" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>AI Provider & Language Engine</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              AI Generation Provider:
            </label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value as any)}
              className="select-field"
              style={{ width: '100%' }}
            >
              <option value="gemini">Google Gemini 2.0 / 1.5 Flash (Recommended)</option>
              <option value="openai">OpenAI GPT-4o-mini</option>
              <option value="hybrid">Hybrid (Gemini Primary + OpenAI Failover)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Target Market & Audience Focus:
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="select-field"
              style={{ width: '100%' }}
            >
              <option value="USA, UK & Worldwide (US/UK Tech Founders, CTOs & Software Architects)">
                USA, UK & Worldwide (US/UK Tech Founders, CTOs & Software Architects)
              </option>
              <option value="USA Silicon Valley & Enterprise Tech Leaders">
                USA Silicon Valley & Enterprise Tech Leaders
              </option>
              <option value="UK & London High-Growth Tech Ecosystem">
                UK & London High-Growth Tech Ecosystem
              </option>
              <option value="Global Emerging AI & Developer Community">
                Global Emerging AI & Developer Community
              </option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Content Language & Tone:
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="select-field"
              style={{ width: '100%' }}
            >
              <option value="english">English (US/UK Technical Executive)</option>
              <option value="urdu">Urdu (Regional Script)</option>
              <option value="bilingual">Bilingual (English with Urdu Summary)</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSaveGeneralSettings}
            disabled={isSaving}
            className="btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.88rem' }}
          >
            {isSaving ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
