import { NextRequest, NextResponse } from 'next/server';
import { updateSupabaseKnowledge } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const knowledge = await updateSupabaseKnowledge(id, body);
    return NextResponse.json(knowledge);
  } catch (error) {
    console.error('Failed to update knowledge:', error);
    return NextResponse.json({ error: 'Failed to update knowledge' }, { status: 500 });
  }
}
