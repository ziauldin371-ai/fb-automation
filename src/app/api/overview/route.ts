import { NextResponse } from 'next/server';
import {
  getAuditLogs,
  getConnectedFacebookPage,
  getPostAnalytics,
  getPostPublications,
  getScheduledPosts,
  getSystemSettings,
} from '@/lib/db';
import { checkFacebookConnection } from '@/lib/facebook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [settings, fbPage, scheduled, publications, analytics, logs] = await Promise.all([
      getSystemSettings(),
      getConnectedFacebookPage(),
      getScheduledPosts(),
      getPostPublications(50),
      getPostAnalytics(),
      getAuditLogs(15),
    ]);

    const fbLiveStatus = await checkFacebookConnection();

    // Calculate today's posts in configured timezone
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayPublished = publications.filter((p) => p.publishedAt.slice(0, 10) === todayStr);

    // Sum engagement metrics
    const totalReactions = analytics.reduce((acc, a) => acc + (a.reactions || 0), 0);
    const totalComments = analytics.reduce((acc, a) => acc + (a.comments || 0), 0);
    const totalShares = analytics.reduce((acc, a) => acc + (a.shares || 0), 0);
    const totalReach = analytics.reduce((acc, a) => acc + (a.reach || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        settings,
        facebook: {
          storedPage: fbPage,
          liveStatus: fbLiveStatus,
        },
        stats: {
          todayPublishedCount: todayPublished.length,
          dailyTarget: 3,
          lifetimePublishedCount: publications.length,
          pendingScheduledCount: scheduled.filter((s) => s.status === 'pending').length,
          failedCount: scheduled.filter((s) => s.status === 'failed').length,
          totalReactions,
          totalComments,
          totalShares,
          totalReach,
          schedulerHealth: settings.emergencyPaused
            ? 'paused'
            : settings.autoPostingEnabled
            ? 'healthy'
            : 'disabled',
        },
        scheduled,
        recentPublications: publications.slice(0, 10),
        recentLogs: logs,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
