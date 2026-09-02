import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseHubState } from '@/lib/services/supabaseHubService';
import { getHubState } from '@/lib/services/hubService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const state = await getSupabaseHubState();
      if (state) {
        return NextResponse.json(state);
      }
    }

    // Fallback to local SQLite if Supabase not configured yet
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const state = getHubState(userId);
    return NextResponse.json(state);
  } catch (error) {
    console.error('Failed to get hub state:', error);
    return NextResponse.json({ error: 'Failed to fetch hub state' }, { status: 500 });
  }
}
