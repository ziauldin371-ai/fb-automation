'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Key,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { FacebookIcon } from './icons/FacebookIcon';
import { FBPageStatus, SystemSettings } from '@/lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fbStatus: FBPageStatus;
  settings: SystemSettings;
  onUpdateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  onRefreshFbStatus: () => Promise<void>;
}

export function SettingsModal({
  isOpen,
  onClose,
  fbStatus,
  settings,
  onUpdateSettings,
  onRefreshFbStatus,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'facebook' | 'vercel' | 'ai'>('facebook');
  const [isTestingFb, setIsTestingFb] = useState(false);
  const [autoPosting, setAutoPosting] = useState(settings.autoPostingEnabled);

  if (!isOpen) return null;

  const handleTestFb = async () => {
    setIsTestingFb(true);
    await onRefreshFbStatus();
    setIsTestingFb(false);
  };

  const handleToggleAuto = async (enabled: boolean) => {
    setAutoPosting(enabled);
    await onUpdateSettings({ autoPostingEnabled: enabled });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#0c111d',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary-glow)',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>System Configuration & Vercel Guide</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Facebook Graph API, AI Models & Autonomous Cloud Posting Setup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="tab-list" style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('facebook')}
            className={`tab-btn ${activeTab === 'facebook' ? 'active' : ''}`}
          >
            <FacebookIcon size={16} color="#0084ff" />
            <span>Facebook Page Integration</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vercel')}
            className={`tab-btn ${activeTab === 'vercel' ? 'active' : ''}`}
          >
            <Cloud size={16} />
            <span>Vercel 24/7 Cloud Cron</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          >
            <Key size={16} />
            <span>AI Model Settings</span>
          </button>
        </div>

        {/* Tab 1: Facebook Page Integration */}
        {activeTab === 'facebook' && (
          <div>
            {/* Live Connection Status Card */}
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: fbStatus.connected
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${
                  fbStatus.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'
                }`,
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {fbStatus.connected ? (
                  <CheckCircle2 size={24} color="#10b981" />
                ) : (
                  <AlertTriangle size={24} color="#f59e0b" />
                )}
                <div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 700 }}>
                    {fbStatus.connected
                      ? `Connected to: ${fbStatus.pageName}`
                      : 'Facebook Not Connected (Running in Simulation Mode)'}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {fbStatus.connected
                      ? `Page ID: ${fbStatus.pageId} • Followers: ${fbStatus.followers?.toLocaleString()}`
                      : fbStatus.error || 'Set FB_PAGE_ID & FB_PAGE_ACCESS_TOKEN in .env.local or Vercel'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleTestFb}
                disabled={isTestingFb}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <RefreshCw size={12} className={isTestingFb ? 'animate-spin' : ''} />
                <span>Test Connection</span>
              </button>
            </div>

            {/* Step-by-Step Meta Token Guide */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
              }}
            >
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '12px', color: 'var(--cyan-glow)' }}>
                How to get your Permanent Facebook Page Access Token:
              </h4>

              <ol style={{ paddingLeft: '20px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                <li>
                  Go to{' '}
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#38bdf8', textDecoration: 'underline' }}
                  >
                    Meta for Developers
                  </a>{' '}
                  and click <strong>Create App</strong> (Select &quot;Business&quot; or &quot;Other&quot;).
                </li>
                <li>
                  In your App Dashboard, navigate to <strong>Tools &rarr; Graph API Explorer</strong>.
                </li>
                <li>
                  Under <strong>User or Page</strong>, select your Facebook Page.
                </li>
                <li>
                  Add the required permissions in the sidebar:
                  <div style={{ display: 'flex', gap: '6px', margin: '4px 0', flexWrap: 'wrap' }}>
                    <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#a5b4fc', fontSize: '0.75rem' }}>pages_manage_posts</code>
                    <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#a5b4fc', fontSize: '0.75rem' }}>pages_read_engagement</code>
                    <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#a5b4fc', fontSize: '0.75rem' }}>pages_show_list</code>
                  </div>
                </li>
                <li>Click <strong>Generate Access Token</strong> and approve access to your Page.</li>
                <li>
                  To make the token permanent (never expire), copy the Page Access Token and paste it into Meta&apos;s{' '}
                  <a
                    href="https://developers.facebook.com/tools/debug/accesstoken/"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#38bdf8', textDecoration: 'underline' }}
                  >
                    Access Token Debugger
                  </a>{' '}
                  and click &quot;Extend Access Token&quot;.
                </li>
                <li>
                  Add to your project <code style={{ color: '#34d399' }}>.env.local</code> and to Vercel Environment Variables:
                  <pre
                    style={{
                      background: '#090d16',
                      padding: '10px',
                      borderRadius: '6px',
                      marginTop: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.78rem',
                    }}
                  >
                    {`FB_PAGE_ID=your_facebook_page_id\nFB_PAGE_ACCESS_TOKEN=EAA...your_token`}
                  </pre>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Vercel 24/7 Cloud Cron */}
        {activeTab === 'vercel' && (
          <div>
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                marginBottom: '18px',
              }}
            >
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#a5b4fc' }}>
                Why it keeps posting when your PC is turned off:
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.5' }}>
                When deployed to Vercel, the <code style={{ color: 'var(--cyan-glow)' }}>vercel.json</code> file instructs Vercel&apos;s global edge network to trigger your Next.js API route <code style={{ color: 'var(--cyan-glow)' }}>/api/cron/auto-post</code> 3 times every single day.
                The execution is 100% cloud serverless—your computer does NOT need to stay on.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
              }}
            >
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
                Deploying to Vercel in 2 Minutes:
              </h4>
              <ol style={{ paddingLeft: '20px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                <li>Push this repository to GitHub or run <code style={{ color: '#38bdf8' }}>npx vercel</code>.</li>
                <li>Import the repository into your Vercel Dashboard.</li>
                <li>
                  In <strong>Settings &rarr; Environment Variables</strong>, add:
                  <div style={{ marginTop: '6px' }}>
                    <code style={{ display: 'block', background: '#090d16', padding: '8px', borderRadius: '4px', color: '#34d399', fontSize: '0.76rem', lineHeight: '1.6' }}>
                      {`FB_PAGE_ID=...\nFB_PAGE_ACCESS_TOKEN=...\nGEMINI_API_KEY=...\nCRON_SECRET=super_secret_token_here`}
                    </code>
                  </div>
                </li>
                <li>Click <strong>Deploy</strong>. Vercel automatically activates the 3 Cron jobs!</li>
              </ol>

              {/* Autonomous Killswitch Toggle */}
              <div
                style={{
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Master Autonomous Switch:</span>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                    Pause or resume all 3 daily automated cron postings instantly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAuto(!autoPosting)}
                  className={autoPosting ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                >
                  {autoPosting ? 'Autonomous Active (ON)' : 'Paused (OFF)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Model Settings */}
        {activeTab === 'ai' && (
          <div>
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
              }}
            >
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '8px' }}>
                AI Generation Providers
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                The engine uses Google Gemini 2.0 / 1.5 Flash (free tier available) or OpenAI GPT-4o-mini to synthesize deep technical posts according to your architecture persona.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={14} color="var(--cyan-glow)" />
                    <span>Google Gemini API</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Get your free API key at{' '}
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#38bdf8' }}
                    >
                      Google AI Studio
                    </a>{' '}
                    and set <code style={{ color: '#34d399' }}>GEMINI_API_KEY</code>.
                  </p>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={14} color="#10b981" />
                    <span>OpenAI API (Fallback)</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Set <code style={{ color: '#34d399' }}>OPENAI_API_KEY</code> for automated failover.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Close Footer */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
