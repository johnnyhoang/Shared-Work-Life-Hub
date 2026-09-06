import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateLastVisitedSupabase } from '@/lib/services/supabaseHubService';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Only ever stamp your own visit.
    await updateLastVisitedSupabase(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update last visited:', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
}
