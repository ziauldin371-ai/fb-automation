import { NextRequest, NextResponse } from 'next/server';
import { generatePost } from '@/lib/ai/generator';
import { publishToFacebookPage } from '@/lib/facebook';
import { addLog, getPosts, savePost } from '@/lib/storage';
import { Post, PostCategory, PostSlot } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const posts = getPosts();
    return NextResponse.json({ success: true, posts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slot = 'manual',
      category = 'fullstack_ai',
      customTopic,
      publishNow = true,
      manualContent,
    } = body;

    let content = manualContent;
    let topic = customTopic || 'Custom AI Engineering Insight';
    let hashtags: string[] = [];

    // If no manual content was passed, generate using the AI engine
    if (!content) {
      const generated = await generatePost({
        slot: slot as PostSlot,
        category: category as PostCategory,
        customTopic,
      });
      content = generated.content;
      topic = generated.topic;
      hashtags = generated.hashtags;
    } else {
      const tagMatches = content.match(/#[a-zA-Z0-9_]+/g);
      hashtags = tagMatches ? Array.from(new Set(tagMatches)) : [];
    }

    let publishResult = { success: false, postId: undefined, postUrl: undefined, error: undefined, isSimulated: false };

    if (publishNow) {
      publishResult = (await publishToFacebookPage(content)) as any;
    }

    const post: Post = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content,
      topic,
      category: category as PostCategory,
      slot: slot as PostSlot,
      status: publishNow ? (publishResult.success ? 'published' : 'failed') : 'queued',
      facebookPostId: publishResult.postId,
      facebookPostUrl: publishResult.postUrl,
      createdAt: new Date().toISOString(),
      publishedAt: publishNow && publishResult.success ? new Date().toISOString() : undefined,
      errorMessage: publishResult.error,
      hashtags,
    };

    savePost(post);

    addLog({
      level: publishNow && !publishResult.success ? 'error' : 'success',
      source: 'manual',
      message: publishNow
        ? `Manual post ${publishResult.success ? 'published' : 'failed'} to Facebook`
        : 'New post saved to queue',
      details: { id: post.id, topic: post.topic },
    });

    return NextResponse.json({
      success: true,
      post,
      publishResult,
    });
  } catch (err: any) {
    console.error('Error creating post:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
