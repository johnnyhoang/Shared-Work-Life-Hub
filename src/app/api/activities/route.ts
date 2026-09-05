import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseActivities } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const activities = await getSupabaseActivities();
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Failed to get activities:', error);
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}
