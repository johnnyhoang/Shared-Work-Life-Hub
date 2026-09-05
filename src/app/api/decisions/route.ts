import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseDecisions, createSupabaseDecision } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const decisions = await getSupabaseDecisions();
    return NextResponse.json(decisions);
  } catch (error) {
    console.error('Failed to get decisions:', error);
    return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const decision = await createSupabaseDecision(body);
    return NextResponse.json(decision, { status: 201 });
  } catch (error) {
    console.error('Failed to create decision:', error);
    return NextResponse.json({ error: 'Failed to create decision' }, { status: 500 });
  }
}
