import { NextRequest, NextResponse } from 'next/server';
import { upsertFacebookPage, updateSystemSettings } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { pageId, pageName, pageAccessToken, category, followersCount } = await req.json();

    if (!pageId || !pageAccessToken) {
      return NextResponse.json(
        { success: false, error: 'Both pageId and pageAccessToken are required.' },
        { status: 400 }
      );
    }

    // 1. Verify Page can be accessed with this token
    const verifyRes = await fetch(
      `https://graph.facebook.com/v20.0/${pageId}?fields=id,name,category,followers_count&access_token=${pageAccessToken}`
    );
    const verifyData = await verifyRes.json();

    if (verifyData.error) {
      return NextResponse.json({
        success: false,
        error: `Meta Graph API error: ${verifyData.error.message}`,
      }, { status: 400 });
    }

    // 2. Persist in database
    await upsertFacebookPage({
      pageId: verifyData.id || pageId,
      pageName: verifyData.name || pageName || 'Zia-ul-din AI Page',
      accessToken: pageAccessToken,
      category: verifyData.category || category,
      followersCount: verifyData.followers_count || followersCount || 0,
      isActive: true,
    });

    // 3. Update active settings
    await updateSystemSettings({
      autoPostingEnabled: true,
    });

    // 4. Update .env.local if possible
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf-8');
        envContent = envContent.replace(/FB_PAGE_ID=.*/g, `FB_PAGE_ID=${pageId}`);
        envContent = envContent.replace(/FB_PAGE_ACCESS_TOKEN=.*/g, `FB_PAGE_ACCESS_TOKEN=${pageAccessToken}`);
        fs.writeFileSync(envPath, envContent, 'utf-8');
      }
    } catch (e) {
      console.warn('Could not update .env.local automatically:', e);
    }

    // Set environment variables for current process
    process.env.FB_PAGE_ID = pageId;
    process.env.FB_PAGE_ACCESS_TOKEN = pageAccessToken;

    return NextResponse.json({
      success: true,
      message: `Successfully connected Facebook Page: ${verifyData.name} (ID: ${pageId}). Automated posting is now ACTIVE!`,
      page: {
        id: pageId,
        name: verifyData.name,
        category: verifyData.category,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
