import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || process.env.FB_PAGE_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided or configured in environment.' },
        { status: 400 }
      );
    }

    // 1. Inspect User /me
    const meRes = await fetch(`https://graph.facebook.com/v20.0/me?fields=id,name&access_token=${token}`);
    const meData = await meRes.json();

    if (meData.error) {
      return NextResponse.json({
        success: false,
        error: meData.error.message,
        code: meData.error.code,
      }, { status: 400 });
    }

    // 2. Debug Token for Scopes & Expiration
    let debugData: any = null;
    try {
      const debugRes = await fetch(`https://graph.facebook.com/v20.0/debug_token?input_token=${token}&access_token=${token}`);
      const debugJson = await debugRes.json();
      if (debugJson.data) {
        debugData = debugJson.data;
      }
    } catch (e) {
      // Ignore debug failure if app secret not present
    }

    // 3. Query Managed Pages (/me/accounts)
    const accountsRes = await fetch(`https://graph.facebook.com/v20.0/me/accounts?fields=id,name,access_token,category,tasks,followers_count&access_token=${token}`);
    const accountsData = await accountsRes.json();

    const pages = accountsData.data || [];

    return NextResponse.json({
      success: true,
      user: {
        id: meData.id,
        name: meData.name,
      },
      tokenMeta: debugData ? {
        appId: debugData.app_id,
        appName: debugData.application,
        isValid: debugData.is_valid,
        expiresAt: debugData.expires_at ? new Date(debugData.expires_at * 1000).toISOString() : null,
        scopes: debugData.scopes || [],
      } : null,
      pagesCount: pages.length,
      pages: pages.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        tasks: p.tasks,
        followersCount: p.followers_count || 0,
        hasPageToken: !!p.access_token,
      })),
      hasConnectedPage: pages.length > 0,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
