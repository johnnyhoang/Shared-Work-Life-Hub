import { NextRequest, NextResponse } from 'next/server';
import { updateSupabaseIdea, convertSupabaseIdea } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'convert') {
      const { assignee_id, actor_id } = body;
      const result = await convertSupabaseIdea(id, assignee_id, actor_id);
      return NextResponse.json(result);
    }

    const { actor_id, ...updates } = body;
    const idea = await updateSupabaseIdea(id, updates, actor_id);
    return NextResponse.json(idea);
  } catch (error) {
    console.error('Failed to update idea:', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
}
