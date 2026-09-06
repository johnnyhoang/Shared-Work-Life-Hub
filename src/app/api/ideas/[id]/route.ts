import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateSupabaseIdea, convertSupabaseIdea } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (body.action === 'convert') {
      const result = await convertSupabaseIdea(id, body.assignee_id, user.id);
      return NextResponse.json(result);
    }

    // Actor comes from the session, never from the request body.
    const updates = { ...body };
    delete updates.actor_id;
    const idea = await updateSupabaseIdea(id, updates, user.id);
    return NextResponse.json(idea);
  } catch (error) {
    console.error('Failed to update idea:', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
}
