import { NextRequest, NextResponse } from 'next/server';
import { updateLastVisited } from '@/lib/services/hubService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    updateLastVisited(userId);
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to update visit:', error);
    return NextResponse.json({ error: 'Failed to update visit' }, { status: 500 });
  }
}
