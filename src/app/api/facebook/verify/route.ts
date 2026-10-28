import { NextRequest, NextResponse } from 'next/server';
import { verifyFacebookTarget } from '@/lib/facebook';
import { upsertFacebookPage } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetId, accessToken, saveIfValid } = body;

    if (!targetId || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Both targetId and accessToken are required.' },
        { status: 400 }
      );
    }

    const verification = await verifyFacebookTarget(targetId, accessToken);

    if (verification.isValidPage && saveIfValid) {
      await upsertFacebookPage({
        pageId: verification.targetId,
        pageName: verification.pageName || 'Zia-ul-din AI Page',
        accessToken,
        category: verification.category,
        followersCount: verification.followers || 0,
        isActive: true,
      });
    }

    return NextResponse.json({
      success: true,
      verification,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
