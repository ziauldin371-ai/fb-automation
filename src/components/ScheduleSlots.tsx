'use client';

import React from 'react';
import { Sun, CloudSun, Moon, Play, CheckCircle2, Clock } from 'lucide-react';
import { ScheduleSlotConfig } from '@/lib/types';

interface ScheduleSlotsProps {
  slots: ScheduleSlotConfig[];
  onTriggerSlot: (slotId: string) => Promise<void>;
  isTriggering: boolean;
}

export function ScheduleSlots({ slots, onTriggerSlot, isTriggering }: ScheduleSlotsProps) {
  const getSlotIcon = (id: string) => {
    switch (id) {
      case 'morning':
        return <Sun size={20} color="#38bdf8" />;
      case 'afternoon':
        return <CloudSun size={20} color="#818cf8" />;
      case 'evening':
        return <Moon size={20} color="#f472b6" />;
      default:
        return <Clock size={20} color="#10b981" />;
    }
  };

  const getSlotColorClass = (id: string) => {
    switch (id) {
      case 'morning':
        return 'morning';
      case 'afternoon':
        return 'afternoon';
      case 'evening':
        return 'evening';
      default:
        return '';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
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
            <span>Autonomous Daily Posting Schedule</span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                fontWeight: 600,
              }}
            >
              3 Posts / Day
            </span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Configured in <code style={{ color: 'var(--cyan-glow)' }}>vercel.json</code> to trigger serverlessly even when the system is off.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '16px',
        }}
      >
        {slots.map((slot) => (
          <div key={slot.id} className={`slot-card ${getSlotColorClass(slot.id)}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {getSlotIcon(slot.id)}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{slot.title}</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} />
                    <span>{slot.timeUtc} UTC ({slot.timeLocal})</span>
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontWeight: 600,
                }}
              >
                Active
              </span>
            </div>

            <div style={{ marginTop: '14px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                Domain Track
              </span>
              <p
                style={{
                  fontSize: '0.84rem',
                  color: 'var(--text-main)',
                  marginTop: '4px',
                  lineHeight: '1.45',
                }}
              >
                {slot.topicFocus}
              </p>
            </div>

            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                {slot.lastRunAt ? `Last run: ${new Date(slot.lastRunAt).toLocaleTimeString()}` : 'Scheduled Cloud Run'}
              </span>
              <button
                onClick={() => onTriggerSlot(slot.id)}
                disabled={isTriggering}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <Play size={12} fill="currentColor" />
                <span>Run Slot Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
