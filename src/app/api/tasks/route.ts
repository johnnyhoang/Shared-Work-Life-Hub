import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseTasks, createSupabaseTask } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignee_id = searchParams.get('assignee_id') || undefined;
    const creator_id = searchParams.get('creator_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const project_id = searchParams.get('project_id') || undefined;

    const tasks = await getSupabaseTasks({ assignee_id, creator_id, status, project_id });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to get tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = await createSupabaseTask(body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
