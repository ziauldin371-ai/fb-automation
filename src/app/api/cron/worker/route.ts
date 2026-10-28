import { NextRequest, NextResponse } from 'next/server';
import { executeScheduledPublication } from '@/lib/scheduler/worker';
import { SlotIndex } from '@/lib/types';
import { addAuditLog } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleWorkerTrigger(req);
}

export async function POST(req: NextRequest) {
  return handleWorkerTrigger(req);
}

async function handleWorkerTrigger(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const qstashSignature = req.headers.get('upstash-signature');

  // Verify authorization secret if configured
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const customSecretHeader = req.headers.get('x-cron-secret');
    if (customSecretHeader !== cronSecret && !qstashSignature) {
      await addAuditLog({
        eventType: 'UNAUTHORIZED_TRIGGER_ATTEMPT',
        source: 'scheduler',
        status: 'warn',
        message: 'Rejected unauthorized call to /api/cron/worker.',
      });
      return NextResponse.json({ error: 'Unauthorized scheduler trigger' }, { status: 401 });
    }
  }

  const { searchParams } = new URL(req.url);
  const slotParam = searchParams.get('slot');
  let targetSlotIndex: SlotIndex | undefined = undefined;

  if (slotParam) {
    const parsed = parseInt(slotParam, 10);
    if (parsed === 1 || parsed === 2 || parsed === 3) {
      targetSlotIndex = parsed as SlotIndex;
    }
  }

  try {
    const result = await executeScheduledPublication(targetSlotIndex);

    return NextResponse.json({
      success: result.success,
      slotIndex: result.slotIndex,
      idempotencyKey: result.idempotencyKey,
      fbPostId: result.fbPostId,
      fbPostUrl: result.fbPostUrl,
      message: result.message,
      isSimulated: result.isSimulated,
    });
  } catch (err: any) {
    console.error('Fatal scheduler worker error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Worker execution failed' },
      { status: 500 }
    );
  }
}
