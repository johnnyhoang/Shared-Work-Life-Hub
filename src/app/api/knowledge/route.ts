import { NextRequest, NextResponse } from 'next/server';
import { createKnowledge, getKnowledgeList } from '@/lib/services/knowledgeService';
import { KnowledgeStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as KnowledgeStatus) || undefined;
    const project_id = searchParams.get('project_id') || undefined;
    const items = getKnowledgeList({ status, project_id });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to get knowledge:', error);
    return NextResponse.json({ error: 'Failed to fetch knowledge' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const item = createKnowledge(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create knowledge:', error);
    return NextResponse.json({ error: 'Failed to create knowledge' }, { status: 500 });
  }
}
