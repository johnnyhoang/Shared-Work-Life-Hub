import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inviteMemberToWorkspace } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    // If workspaceId provided, get all invitations for that workspace (for admin management)
    if (workspaceId) {
      const { data: invites, error } = await supabase
        .from('sw_workspace_invitations')
        .select(`
          *,
          inviter:sw_profiles!sw_workspace_invitations_invited_by_fkey(name)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(invites || []);
    }

    // Otherwise get invitations for the current user's email
    const { data: userInvites, error } = await supabase
      .from('sw_workspace_invitations')
      .select(`
        *,
        workspace:sw_workspaces(name),
        inviter:sw_profiles!sw_workspace_invitations_invited_by_fkey(name)
      `)
      .ilike('email', user.email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(userInvites || []);
  } catch (error: any) {
    console.error('Failed to get invitations:', error);
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
    const workspaceId = body.workspace_id || body.workspaceId;
    const email = body.email?.trim();
    const role = body.role || 'member';

    if (!workspaceId || !email) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const invite = await inviteMemberToWorkspace({
      workspaceId,
      email,
      role: role as 'admin' | 'member',
      invitedBy: user.id,
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error: any) {
    console.error('Failed to invite member:', error);
    return NextResponse.json({ error: 'invite_failed' }, { status: 500 });
  }
}
