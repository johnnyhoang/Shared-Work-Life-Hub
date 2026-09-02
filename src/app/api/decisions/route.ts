import { NextRequest, NextResponse } from 'next/server';
import { createDecision, getDecisions } from '@/lib/services/decisionService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id') || undefined;
    const items = getDecisions({ project_id });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to get decisions:', error);
    return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const item = createDecision(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create decision:', error);
    return NextResponse.json({ error: 'Failed to create decision' }, { status: 500 });
  }
}
