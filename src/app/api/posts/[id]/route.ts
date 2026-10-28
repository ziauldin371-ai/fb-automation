import { NextRequest, NextResponse } from 'next/server';
import { publishToFacebookPage } from '@/lib/facebook';
import { addLog, deletePost, getPostById, updatePost } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = getPostById(id);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, post });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deletePost(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  addLog({
    level: 'info',
    source: 'manual',
    message: `Post ${id} removed from records`,
  });
  return NextResponse.json({ success: true, message: 'Post deleted successfully' });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = getPostById(id);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action || 'retry';

  if (action === 'retry') {
    const publishResult = await publishToFacebookPage(post.content);
    const updated = updatePost(id, {
      status: publishResult.success ? 'published' : 'failed',
      facebookPostId: publishResult.postId,
      facebookPostUrl: publishResult.postUrl,
      publishedAt: publishResult.success ? new Date().toISOString() : undefined,
      errorMessage: publishResult.error,
    });

    addLog({
      level: publishResult.success ? 'success' : 'error',
      source: 'facebook',
      message: `Retry publishing post ${id}: ${publishResult.success ? 'Success' : publishResult.error}`,
    });

    return NextResponse.json({ success: true, post: updated, publishResult });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
