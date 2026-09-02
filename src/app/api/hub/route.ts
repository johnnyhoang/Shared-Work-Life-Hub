import { NextRequest, NextResponse } from 'next/server';
import { getHubState } from '@/lib/services/hubService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const state = getHubState(userId);
    return NextResponse.json(state);
  } catch (error) {
    console.error('Failed to get hub state:', error);
    return NextResponse.json({ error: 'Failed to fetch hub state' }, { status: 500 });
  }
}
