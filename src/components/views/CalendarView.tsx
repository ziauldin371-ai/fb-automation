'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduledPost, SystemSettings } from '@/lib/types';

interface CalendarViewProps {
  scheduled: ScheduledPost[];
  settings: SystemSettings;
  onTriggerSlot: (slotIndex: number) => Promise<void>;
  isTriggering: boolean;
}

export function CalendarView({ scheduled, settings, onTriggerSlot, isTriggering }: CalendarViewProps) {
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  // Compute reference date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + selectedDayOffset);
  const targetDateStr = targetDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const slots = [
    {
      index: 1,
      title: 'Slot 1: Morning Trend',
      time: settings.postTimes[0] || '10:00 AM',
      category: 'Category A: Trending AI',
      color: '#38bdf8',
    },
    {
      index: 2,
      title: 'Slot 2: Afternoon How-To',
      time: settings.postTimes[1] || '03:00 PM',
      category: 'Category B: Practical Expertise',
      color: '#818cf8',
    },
    {
      index: 3,
      title: 'Slot 3: Evening Discussion',
      time: settings.postTimes[2] || '08:00 PM',
      category: 'Category C: Business Value',
      color: '#f472b6',
    },
  ];

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={22} color="var(--cyan-glow)" />
            <span>Autonomous Publishing Calendar</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Daily 3-slot autonomous publishing queue synchronized to {settings.timezone}.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setSelectedDayOffset((prev) => prev - 1)}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '0.92rem', padding: '0 8px', color: '#f8fafc' }}>
            {selectedDayOffset === 0 ? 'Today — ' : selectedDayOffset === 1 ? 'Tomorrow — ' : ''}
            {targetDateStr}
          </span>
          <button
            onClick={() => setSelectedDayOffset((prev) => prev + 1)}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 3 Slot Timeline Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {slots.map((slot) => {
          const matchedPost = scheduled.find((s) => s.slotIndex === slot.index);
          const isPublished = matchedPost?.status === 'published';
          const isFailed = matchedPost?.status === 'failed';

          return (
            <div
              key={slot.index}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '22px',
                background: 'rgba(11, 17, 33, 0.55)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: slot.color }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    minWidth: '100px',
                  }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: slot.color }}>
                    {slot.time}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Slot {slot.index}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: slot.color }}>
                      {slot.category}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: isPublished
                          ? 'rgba(16, 185, 129, 0.15)'
                          : isFailed
                          ? 'rgba(244, 63, 94, 0.15)'
                          : 'rgba(56, 189, 248, 0.12)',
                        color: isPublished ? '#34d399' : isFailed ? '#fb7185' : '#38bdf8',
                        fontWeight: 600,
                      }}
                    >
                      {isPublished ? '✓ Published to Facebook' : isFailed ? '✕ Publishing Error' : '○ Scheduled Cloud Queue'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginTop: '4px' }}>
                    {matchedPost?.draft?.title || slot.title}
                  </h3>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '720px' }}>
                    {matchedPost?.draft?.content?.slice(0, 160) || 'Durable cloud job queued. Will generate and publish automatically at scheduled time.'}...
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => onTriggerSlot(slot.index)}
                  disabled={isTriggering}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  <Play size={13} fill="currentColor" />
                  <span>Execute Slot Now</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
