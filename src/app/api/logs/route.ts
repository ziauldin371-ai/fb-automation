import { NextRequest, NextResponse } from 'next/server';
import { getLogs } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const logs = getLogs(limit);
  return NextResponse.json({ success: true, logs });
}
