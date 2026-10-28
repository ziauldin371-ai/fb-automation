import { NextRequest, NextResponse } from 'next/server';
import { executeScheduledPublication } from '@/lib/scheduler/worker';
import { SlotIndex } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleAutoPost(req);
}

export async function POST(req: NextRequest) {
  return handleAutoPost(req);
}

async function handleAutoPost(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slotStr = searchParams.get('slot');

  let slotIndex: SlotIndex | undefined = undefined;
  if (slotStr === 'morning' || slotStr === '1') slotIndex = 1;
  else if (slotStr === 'afternoon' || slotStr === '2') slotIndex = 2;
  else if (slotStr === 'evening' || slotStr === '3') slotIndex = 3;

  const result = await executeScheduledPublication(slotIndex);

  return NextResponse.json({
    success: result.success,
    slot: result.slotIndex,
    idempotencyKey: result.idempotencyKey,
    postId: result.fbPostId,
    postUrl: result.fbPostUrl,
    message: result.message,
    isSimulated: result.isSimulated,
    error: result.error,
  });
}
