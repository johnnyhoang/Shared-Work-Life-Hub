import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseComments, addSupabaseComment } from '@/lib/services/supabaseMutations';
import { EntityType } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entity_type = searchParams.get('entity_type') as EntityType;
    const entity_id = searchParams.get('entity_id');

    if (!entity_type || !entity_id) {
      return NextResponse.json({ error: 'entity_type and entity_id are required' }, { status: 400 });
    }

    const comments = await getSupabaseComments(entity_type, entity_id);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Failed to get comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const comment = await addSupabaseComment(body);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
