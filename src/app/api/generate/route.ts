import { NextRequest, NextResponse } from 'next/server';
import { generatePost } from '@/lib/ai/generator';
import { PostCategory, PostSlot } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slot = 'morning',
      category = 'fullstack_ai',
      customTopic,
      tone = 'Thought Leader & Architect',
      language = 'english',
      targetMarket = 'USA, UK & Worldwide',
    } = body;

    const result = await generatePost({
      slot: slot as PostSlot,
      category: category as PostCategory,
      customTopic,
      tone,
      language,
      targetMarket,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Error generating post preview:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate post' },
      { status: 500 }
    );
  }
}
