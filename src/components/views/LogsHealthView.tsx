'use client';

import React, { useState } from 'react';
import { Terminal, RefreshCw, CheckCircle2, AlertTriangle, AlertOctagon, Info, ShieldCheck, Cloud, Database } from 'lucide-react';
import { FacebookIcon } from '../icons/FacebookIcon';
import { AuditLog, FBPageStatus, SystemSettings } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface LogsHealthViewProps {
  logs: AuditLog[];
  settings: SystemSettings;
  fbStatus: FBPageStatus;
  onRefreshLogs: () => Promise<void>;
  isRefreshing: boolean;
}

export function LogsHealthView({
  logs,
  settings,
  fbStatus,
  onRefreshLogs,
  isRefreshing,
}: LogsHealthViewProps) {
  const [filterLevel, setFilterLevel] = useState<'all' | 'success' | 'warn' | 'error' | 'info'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'all') return true;
    return log.status === filterLevel;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', fontWeight: 600 }}>
            <CheckCircle2 size={12} /> SUCCESS
          </span>
        );
      case 'error':
        return (
          <span style={{ color: '#fb7185', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', fontWeight: 600 }}>
            <AlertOctagon size={12} /> ERROR
          </span>
        );
      case 'warn':
        return (
          <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', fontWeight: 600 }}>
            <AlertTriangle size={12} /> WARN
          </span>
        );
      default:
        return (
          <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', fontWeight: 600 }}>
            <Info size={12} /> INFO
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* System Health Status Grid */}
      <div className="stats-grid">
        {/* Scheduler Health */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLOUD SCHEDULER</span>
            <Cloud size={18} color="#8b5cf6" />
          </div>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-dot" />
            <span style={{ fontWeight: 700, fontSize: '1.02rem', color: '#c084fc' }}>
              {settings.emergencyPaused ? 'Emergency Paused' : 'Vercel + QStash Active'}
            </span>
          </div>
          <p style={{ marginTop: '6px', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            Schedule: 10:00, 15:00, 20:00 ({settings.timezone})
          </p>
        </div>

        {/* Database Health */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>DATABASE LAYER</span>
            <Database size={18} color="#10b981" />
          </div>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '1.02rem', color: '#34d399' }}>
              {isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Resilient Local Store'}
            </span>
          </div>
          <p style={{ marginTop: '6px', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            {isSupabaseConfigured ? 'Connected & Migrated' : 'Fallback active until Supabase credentials set'}
          </p>
        </div>

        {/* Meta Graph API Health */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>META GRAPH API</span>
            <FacebookIcon size={18} color={fbStatus.connected ? '#0084ff' : '#f59e0b'} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <span style={{ fontWeight: 700, fontSize: '1.02rem', color: fbStatus.connected ? '#38bdf8' : '#fbbf24' }}>
              {fbStatus.connected ? 'Page Target Verified' : 'Simulation Mode'}
            </span>
          </div>
          <p style={{ marginTop: '6px', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            Graph API v20.0 • Strict Page Policies Enforced
          </p>
        </div>
      </div>

      {/* Audit Log Terminal */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal size={22} color="var(--cyan-glow)" />
              <span>Durable Audit Log & Execution Receipts</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Audit receipts of automated scheduler triggers, duplicate checks, and Graph API responses.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['all', 'success', 'warn', 'error', 'info'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    border: '1px solid',
                    borderColor: filterLevel === lvl ? 'var(--cyan-glow)' : 'rgba(255, 255, 255, 0.1)',
                    background: filterLevel === lvl ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                    color: filterLevel === lvl ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={onRefreshLogs}
              disabled={isRefreshing}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh Logs</span>
            </button>
          </div>
        </div>

        {/* Logs Terminal */}
        <div
          style={{
            background: '#04060a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.8rem',
            lineHeight: '1.6',
            maxHeight: '480px',
            overflowY: 'auto',
          }}
        >
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
              No audit log entries matching current filter.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  padding: '10px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.74rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>
                    [{new Date(log.createdAt).toLocaleTimeString()} ({new Date(log.createdAt).toLocaleDateString()})]
                  </span>
                  <span>{getStatusBadge(log.status)}</span>
                  <span style={{ color: '#818cf8', fontWeight: 600 }}>[{log.source.toUpperCase()}]</span>
                  <span style={{ color: 'var(--cyan-glow)' }}>{log.eventType}</span>
                </div>
                <div style={{ color: '#e2e8f0', wordBreak: 'break-word', marginTop: '2px' }}>
                  {log.message}
                </div>
                {log.payload && (
                  <pre
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      overflowX: 'auto',
                    }}
                  >
                    {JSON.stringify(log.payload, null, 2)}
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
