import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseHubState } from '@/lib/services/supabaseHubService';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const state = await getSupabaseHubState();
    return NextResponse.json(state);
  } catch (error) {
    console.error('Failed to get hub state from Supabase:', error);
    return NextResponse.json({ error: 'Failed to fetch hub state' }, { status: 500 });
  }
}
