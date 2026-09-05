import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
} from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    let workspaceId: string | null = null;
    let memberUserId: string | null = null;

    // Check query params
    const { searchParams } = new URL(request.url);
    workspaceId = searchParams.get('workspaceId') || searchParams.get('workspace_id');
    memberUserId = searchParams.get('userId') || searchParams.get('user_id') || searchParams.get('member_id');

    // Check json body if not in query params
    if (!workspaceId || !memberUserId) {
      try {
        const body = await request.json();
        workspaceId = workspaceId || body.workspace_id || body.workspaceId;
        memberUserId = memberUserId || body.member_id || body.user_id || body.userId;
      } catch {
        // no body
      }
    }

    if (!workspaceId || !memberUserId) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const result = await removeWorkspaceMember({
      workspaceId,
      userId: memberUserId,
      callerId: user.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to remove workspace member:', error);
    return NextResponse.json({ error: 'member_update_failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const workspaceId = body.workspace_id || body.workspaceId;
    const userId = body.member_id || body.user_id || body.userId;
    const role = body.role;

    if (!workspaceId || !userId || !role) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const result = await updateWorkspaceMemberRole({
      workspaceId,
      userId,
      role: role as 'admin' | 'member',
      callerId: user.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to update workspace member role:', error);
    return NextResponse.json({ error: 'member_update_failed' }, { status: 500 });
  }
}
