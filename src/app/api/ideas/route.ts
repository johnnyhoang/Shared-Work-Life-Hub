import { NextRequest, NextResponse } from 'next/server';
import { createIdea, getIdeas } from '@/lib/services/ideaService';
import { IdeaStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as IdeaStatus) || undefined;
    const project_id = searchParams.get('project_id') || undefined;
    const ideas = getIdeas({ status, project_id });
    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Failed to get ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idea = createIdea(body);
    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error('Failed to create idea:', error);
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
  }
}
