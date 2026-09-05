import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseProjects, createSupabaseProject } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const projects = await getSupabaseProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to get projects:', error);
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = await createSupabaseProject(body);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
}
