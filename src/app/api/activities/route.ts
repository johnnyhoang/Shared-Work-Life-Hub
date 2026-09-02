import { NextRequest, NextResponse } from 'next/server';
import { getActivities } from '@/lib/services/activityService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const actor_id = searchParams.get('actor_id') || undefined;
    const entity_type = searchParams.get('entity_type') || undefined;
    const project_id = searchParams.get('project_id') || undefined;
    const since = searchParams.get('since') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const activities = getActivities({ actor_id, entity_type, project_id, since, limit });
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Failed to get activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
