'use client';

import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  BarChart3,
  Compass,
  Settings,
  Terminal,
  PauseCircle,
  PlayCircle,
  Radio,
} from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'studio'
  | 'calendar'
  | 'published'
  | 'analytics'
  | 'sources'
  | 'settings'
  | 'logs';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  emergencyPaused: boolean;
  onToggleEmergencyPause: () => void;
}

export function Navigation({
  activeTab,
  onTabChange,
  emergencyPaused,
  onToggleEmergencyPause,
}: NavigationProps) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'studio', label: 'Content Studio', icon: Sparkles },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'published', label: 'Published Posts', icon: CheckCircle2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sources', label: 'Sources & Trends', icon: Compass },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logs', label: 'Logs & Health', icon: Terminal },
  ] as const;

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10, 16, 30, 0.65)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: '79px',
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowX: 'auto',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px', padding: '8px 0' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                style={{
                  padding: '9px 16px',
                  whiteSpace: 'nowrap',
                  color: isActive ? '#f8fafc' : 'var(--text-muted)',
                  background: isActive ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Icon size={16} color={isActive ? 'var(--cyan-glow)' : 'currentColor'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Emergency Kill-Switch & Scheduler Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
          <button
            onClick={onToggleEmergencyPause}
            className="btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderColor: emergencyPaused ? 'rgba(244, 63, 94, 0.5)' : 'rgba(245, 158, 11, 0.3)',
              color: emergencyPaused ? '#fb7185' : '#f59e0b',
              background: emergencyPaused ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.08)',
            }}
            title={emergencyPaused ? 'Resume automated publishing' : 'Emergency pause all automated publishing'}
          >
            {emergencyPaused ? (
              <>
                <PlayCircle size={15} />
                <span>Resume Autonomous Engine</span>
              </>
            ) : (
              <>
                <PauseCircle size={15} />
                <span>Emergency Pause</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
