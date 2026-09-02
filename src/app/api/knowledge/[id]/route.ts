import { NextRequest, NextResponse } from 'next/server';
import { updateKnowledge } from '@/lib/services/knowledgeService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { actor_id, ...updates } = body;
    const updated = updateKnowledge(id, updates, actor_id || 'usr_johnny');
    if (!updated) {
      return NextResponse.json({ error: 'Knowledge item not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update knowledge item:', error);
    return NextResponse.json({ error: 'Failed to update knowledge item' }, { status: 500 });
  }
}
