import { NextRequest, NextResponse } from 'next/server';
import { updateLastVisitedSupabase } from '@/lib/services/supabaseHubService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    if (!userId) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }
    await updateLastVisitedSupabase(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update last visited:', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
}
