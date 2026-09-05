import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseIdeas, createSupabaseIdea } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const ideas = await getSupabaseIdeas();
    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Failed to get ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idea = await createSupabaseIdea(body);
    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error('Failed to create idea:', error);
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
  }
}
