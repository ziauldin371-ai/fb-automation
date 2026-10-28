'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Navigation, ActiveTab } from '@/components/Navigation';
import { OverviewView } from '@/components/views/OverviewView';
import { ContentStudioView } from '@/components/views/ContentStudioView';
import { CalendarView } from '@/components/views/CalendarView';
import { PublishedPostsView } from '@/components/views/PublishedPostsView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { SourcesTrendsView } from '@/components/views/SourcesTrendsView';
import { SettingsView } from '@/components/views/SettingsView';
import { LogsHealthView } from '@/components/views/LogsHealthView';
import { SettingsModal } from '@/components/SettingsModal';
import { LogsModal } from '@/components/LogsModal';
import {
  AuditLog,
  FBPageStatus,
  PostAnalytics,
  PostPublication,
  ResearchTopic,
  ScheduledPost,
  SystemSettings,
} from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/config';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [settings, setSettings] = useState<SystemSettings>({
    id: 'default',
    timezone: 'UTC',
    postTimes: ['08:00', '13:00', '18:00'],
    language: 'english',
    targetAudience: 'USA, UK & Worldwide (US/UK Tech Founders, CTOs & Software Architects)',
    autoPostingEnabled: true,
    aiProvider: 'gemini',
    aiModel: 'gemini-2.0-flash',
    imageGenerationEnabled: true,
    emergencyPaused: false,
  });
  const [fbStatus, setFbStatus] = useState<FBPageStatus>({ connected: false });
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([]);
  const [publications, setPublications] = useState<PostPublication[]>([]);
  const [analytics, setAnalytics] = useState<PostAnalytics[]>([]);
  const [researchTopics, setResearchTopics] = useState<ResearchTopic[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState({
    todayPublishedCount: 0,
    dailyTarget: 3,
    lifetimePublishedCount: 0,
    pendingScheduledCount: 0,
    failedCount: 0,
    totalReactions: 0,
    totalComments: 0,
    totalShares: 0,
    totalReach: 0,
    schedulerHealth: 'healthy',
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warn'; message: string } | null>(null);

  // Load dashboard overview & repositories
  const loadDashboardData = async () => {
    try {
      // 1. Fetch aggregated overview
      const overviewRes = await fetch('/api/overview');
      if (overviewRes.ok) {
        const data = await overviewRes.json();
        if (data.data) {
          if (data.data.settings) setSettings(data.data.settings);
          if (data.data.facebook?.liveStatus) setFbStatus(data.data.facebook.liveStatus);
          if (data.data.stats) setStats(data.data.stats);
          if (data.data.scheduled) setScheduled(data.data.scheduled);
          if (data.data.recentPublications) setPublications(data.data.recentPublications);
          if (data.data.recentLogs) setLogs(data.data.recentLogs);
        }
      }

      // 2. Fetch research topics
      const topicsRes = await fetch('/api/research');
      if (topicsRes.ok) {
        const topicsData = await topicsRes.json();
        if (topicsData.topics) setResearchTopics(topicsData.topics);
      }
    } catch (err) {
      console.warn('Dashboard poll error:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 25000); // 25s background synchronization
    return () => clearInterval(interval);
  }, []);

  const showToast = (type: 'success' | 'error' | 'warn', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  // Trigger Cloud Cron Routine Manually
  const handleTriggerSlot = async (slotIndex?: number | string) => {
    setIsTriggering(true);
    try {
      let url = '/api/cron/worker';
      if (slotIndex) url += `?slot=${slotIndex}`;

      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(
          'success',
          `Slot ${data.slotIndex || slotIndex} published successfully! Post ID: ${data.fbPostId}`
        );
      } else {
        showToast('error', data.error || data.message || 'Slot trigger failed.');
      }
      await loadDashboardData();
    } catch (err: any) {
      showToast('error', `Scheduler network error: ${err.message}`);
    } finally {
      setIsTriggering(false);
    }
  };

  // Direct Publish from Studio
  const handlePublishDirect = async (postData: {
    content: string;
    topic: string;
    category: any;
    slotIndex: any;
    imageUrl?: string;
  }) => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manualContent: postData.content,
          customTopic: postData.topic,
          category: postData.category,
          slot: postData.slotIndex === 1 ? 'morning' : postData.slotIndex === 2 ? 'afternoon' : 'evening',
          publishNow: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Post published to Facebook Page successfully!');
        await loadDashboardData();
      } else {
        showToast('error', data.error || 'Publishing failed.');
      }
    } catch (err: any) {
      showToast('error', `Publishing error: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Run automated research pipeline
  const handleRunResearch = async () => {
    setIsResearching(true);
    try {
      const res = await fetch('/api/research', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', data.message);
        if (data.topics) setResearchTopics(data.topics);
      } else {
        showToast('error', data.error || 'Research pipeline reported an error.');
      }
    } catch (err: any) {
      showToast('error', `Research error: ${err.message}`);
    } finally {
      setIsResearching(false);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (updates: Partial<SystemSettings>) => {
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        showToast('success', 'Settings updated successfully.');
      }
    } catch (err: any) {
      showToast('error', `Error saving settings: ${err.message}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Toggle emergency pause kill-switch
  const handleToggleEmergencyPause = async () => {
    const nextVal = !settings.emergencyPaused;
    await handleUpdateSettings({ emergencyPaused: nextVal });
    showToast(
      nextVal ? 'warn' : 'success',
      nextVal
        ? 'Emergency Pause activated: all autonomous publishing stopped.'
        : 'Autonomous publishing resumed.'
    );
  };

  // Verify Facebook Target
  const handleVerifyFacebook = async (targetId: string, accessToken: string) => {
    try {
      const res = await fetch('/api/facebook/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, accessToken, saveIfValid: true }),
      });
      const data = await res.json();
      if (data.verification?.isValidPage) {
        showToast('success', 'Verified and connected official Facebook Page!');
      } else {
        showToast('warn', data.verification?.diagnosticMessage || 'Verification failed.');
      }
      await loadDashboardData();
    } catch (err: any) {
      showToast('error', `Verification network error: ${err.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header */}
      <Header
        onTriggerCron={(slot) => handleTriggerSlot(slot === 'morning' ? 1 : slot === 'afternoon' ? 2 : 3)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenLogs={() => setIsLogsModalOpen(true)}
        isTriggering={isTriggering}
        autoEnabled={settings.autoPostingEnabled && !settings.emergencyPaused}
      />

      {/* 2. Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        emergencyPaused={settings.emergencyPaused}
        onToggleEmergencyPause={handleToggleEmergencyPause}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '140px',
            right: '24px',
            zIndex: 99,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background:
              notification.type === 'success'
                ? '#065f46'
                : notification.type === 'warn'
                ? '#78350f'
                : '#991b1b',
            color: '#ffffff',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.6)',
            border: `1px solid ${
              notification.type === 'success'
                ? '#34d399'
                : notification.type === 'warn'
                ? '#fbbf24'
                : '#f87171'
            }`,
            fontSize: '0.88rem',
            fontWeight: 600,
            maxWidth: '460px',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {notification.message}
        </div>
      )}

      {/* 3. Main SaaS Views */}
      <main style={{ flex: 1, maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '28px 24px' }}>
        {activeTab === 'overview' && (
          <OverviewView
            stats={stats}
            settings={settings}
            fbStatus={fbStatus}
            scheduled={scheduled}
            recentPublications={publications}
            onTriggerSlot={handleTriggerSlot}
            onNavigateToStudio={() => setActiveTab('studio')}
            isTriggering={isTriggering}
          />
        )}

        {activeTab === 'studio' && (
          <ContentStudioView
            onPublishDirect={handlePublishDirect}
            isPublishing={isPublishing}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            scheduled={scheduled}
            settings={settings}
            onTriggerSlot={handleTriggerSlot}
            isTriggering={isTriggering}
          />
        )}

        {activeTab === 'published' && (
          <PublishedPostsView publications={publications} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView analytics={analytics} publications={publications} />
        )}

        {activeTab === 'sources' && (
          <SourcesTrendsView
            topics={researchTopics}
            onRunResearch={handleRunResearch}
            isResearching={isResearching}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            fbStatus={fbStatus}
            onUpdateSettings={handleUpdateSettings}
            onVerifyFacebook={handleVerifyFacebook}
            isSaving={isSavingSettings}
          />
        )}

        {activeTab === 'logs' && (
          <LogsHealthView
            logs={logs}
            settings={settings}
            fbStatus={fbStatus}
            onRefreshLogs={loadDashboardData}
            isRefreshing={false}
          />
        )}
      </main>

      {/* Settings Modal (Quick Access) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        fbStatus={fbStatus}
        settings={settings as any}
        onUpdateSettings={handleUpdateSettings as any}
        onRefreshFbStatus={loadDashboardData}
      />

      {/* Logs Modal (Quick Access) */}
      <LogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={logs as any}
        onRefreshLogs={loadDashboardData}
      />

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.82rem',
          background: 'rgba(6, 8, 14, 0.95)',
        }}
      >
        <p>
          NexusPulse AI Facebook Platform • Engineered for <strong>Zia-ul-din</strong> (Full Stack AI Engineer | Automation Architect | LLMs & Python)
        </p>
        <p style={{ marginTop: '4px' }}>
          Durable Cloud Scheduler powered by Next.js, Supabase PostgreSQL, Upstash QStash & Vercel Serverless Edge Crons.
        </p>
      </footer>
    </div>
  );
}
