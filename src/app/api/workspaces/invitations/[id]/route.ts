import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { respondToWorkspaceInvitation } from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const isAccept = body.accept !== undefined ? Boolean(body.accept) : body.action === 'accept';

    const result = await respondToWorkspaceInvitation({
      invitationId: id,
      accept: isAccept,
      userId: user.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to respond to invitation:', error);
    return NextResponse.json({ error: 'invite_failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('sw_workspace_invitations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to cancel invitation:', error);
    return NextResponse.json({ error: 'invite_failed' }, { status: 500 });
  }
}
