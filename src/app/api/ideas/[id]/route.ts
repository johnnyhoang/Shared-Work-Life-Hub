import { NextRequest, NextResponse } from 'next/server';
import { convertIdeaToTask, getIdeaById, updateIdea } from '@/lib/services/ideaService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idea = getIdeaById(id);
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }
  return NextResponse.json(idea);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, actor_id, assignee_id, ...updates } = body;

    if (action === 'convert') {
      const task = convertIdeaToTask(id, {
        assignee_id: assignee_id || actor_id || 'usr_johnny',
        actor_id: actor_id || 'usr_johnny',
      });
      return NextResponse.json({ success: true, task });
    }

    const updated = updateIdea(id, updates, actor_id || 'usr_johnny');
    if (!updated) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update idea:', error);
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
  }
}
