import { NextResponse } from 'next/server';
import { checkFacebookConnection } from '@/lib/facebook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const fbStatus = await checkFacebookConnection();

  const envHealth = {
    hasFbPageId: Boolean(process.env.FB_PAGE_ID),
    hasFbToken: Boolean(process.env.FB_PAGE_ACCESS_TOKEN),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    hasCronSecret: Boolean(process.env.CRON_SECRET),
  };

  return NextResponse.json({
    success: true,
    facebook: fbStatus,
    environment: envHealth,
  });
}
