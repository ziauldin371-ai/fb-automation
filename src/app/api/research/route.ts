import { NextRequest, NextResponse } from 'next/server';
import { getResearchTopics } from '@/lib/db';
import { runTopicResearchPipeline } from '@/lib/research';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const topics = await getResearchTopics(category);
    return NextResponse.json({ success: true, topics });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const freshTopics = await runTopicResearchPipeline();
    return NextResponse.json({
      success: true,
      message: `Successfully executed research pipeline. Discovered and verified ${freshTopics.length} AI topics.`,
      topics: freshTopics,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
