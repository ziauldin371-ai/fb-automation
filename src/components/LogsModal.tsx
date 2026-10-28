'use client';

import React, { useState } from 'react';
import { X, CloudLightning, RefreshCw, Terminal, CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { SystemLog } from '@/lib/types';

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SystemLog[];
  onRefreshLogs: () => Promise<void>;
}

export function LogsModal({ isOpen, onClose, logs, onRefreshLogs }: LogsModalProps) {
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'info'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshLogs();
    setIsRefreshing(false);
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'success':
        return (
          <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> SUCCESS
          </span>
        );
      case 'error':
        return (
          <span style={{ color: '#fb7185', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertOctagon size={13} /> ERROR
          </span>
        );
      case 'warn':
        return (
          <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={13} /> WARN
          </span>
        );
      default:
        return (
          <span style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={13} /> INFO
          </span>
        );
    }
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
          maxWidth: '840px',
          maxHeight: '90vh',
          background: '#090d16',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--cyan-glow)',
              }}
            >
              <Terminal size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Live Autonomous Execution Logs</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Vercel Cron triggers, AI synthesis, and Facebook Graph API audit events
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '6px', borderRadius: '50%' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          {(['all', 'success', 'error', 'info'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                border: '1px solid',
                borderColor: filter === lvl ? 'var(--cyan-glow)' : 'rgba(255, 255, 255, 0.1)',
                background: filter === lvl ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: filter === lvl ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Logs Terminal Window */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            background: '#04060a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.8rem',
            lineHeight: '1.6',
            minHeight: '360px',
            maxHeight: '500px',
          }}
        >
          {filteredLogs.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px 0' }}>
              No log records match current filter.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  padding: '8px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span style={{ fontWeight: 600 }}>{getLevelBadge(log.level)}</span>
                  <span style={{ color: '#818cf8', textTransform: 'uppercase' }}>[{log.source}]</span>
                </div>
                <div style={{ color: '#e2e8f0', wordBreak: 'break-word', marginTop: '2px' }}>
                  {log.message}
                </div>
                {log.details && (
                  <pre
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      overflowX: 'auto',
                    }}
                  >
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
