import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseKnowledge, createSupabaseKnowledge } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const knowledge = await getSupabaseKnowledge();
    return NextResponse.json(knowledge);
  } catch (error) {
    console.error('Failed to get knowledge:', error);
    return NextResponse.json({ error: 'Failed to fetch knowledge' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const knowledge = await createSupabaseKnowledge(body);
    return NextResponse.json(knowledge, { status: 201 });
  } catch (error) {
    console.error('Failed to create knowledge:', error);
    return NextResponse.json({ error: 'Failed to create knowledge' }, { status: 500 });
  }
}
