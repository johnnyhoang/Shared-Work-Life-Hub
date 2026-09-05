import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseHubState } from '@/lib/services/supabaseHubService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;

    const state = await getSupabaseHubState(workspaceId);
    return NextResponse.json(state);
  } catch (error) {
    console.error('Failed to get hub state from Supabase:', error);
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}
