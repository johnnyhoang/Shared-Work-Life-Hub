import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSupabaseWorkspace } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { data: memberRecords } = await supabase
      .from('sw_workspace_members')
      .select('*, workspace:sw_workspaces(*)')
      .eq('user_id', user.id);

    const { data: ownedWorkspaces } = await supabase
      .from('sw_workspaces')
      .select('*')
      .eq('owner_id', user.id);

    const wsMap = new Map();

    (ownedWorkspaces || []).forEach((w: any) => {
      wsMap.set(w.id, {
        id: w.id,
        name: w.name,
        slug: w.slug,
        owner_id: w.owner_id,
        role: 'admin',
        created_at: w.created_at,
      });
    });

    (memberRecords || []).forEach((m: any) => {
      if (m.workspace) {
        wsMap.set(m.workspace.id, {
          id: m.workspace.id,
          name: m.workspace.name,
          slug: m.workspace.slug,
          owner_id: m.workspace.owner_id,
          role: m.role || (m.workspace.owner_id === user.id ? 'admin' : 'member'),
          created_at: m.workspace.created_at,
        });
      }
    });

    return NextResponse.json(Array.from(wsMap.values()));
  } catch (error: any) {
    console.error('Failed to get workspaces:', error);
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const ws = await createSupabaseWorkspace(name, user.id, description);
    return NextResponse.json(ws, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create workspace:', error);
    return NextResponse.json({ error: 'workspace_create_failed' }, { status: 500 });
  }
}
