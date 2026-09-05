import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteFileFromB2, getPresignedDownloadUrl } from '@/lib/services/b2StorageService';

export const dynamic = 'force-dynamic';

export async function GET(
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

    const { data: attachment, error } = await supabase
      .from('sw_attachments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !attachment) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    // Generate presigned download url (valid 1 hour)
    const downloadUrl = await getPresignedDownloadUrl(attachment.storage_path, 3600);

    return NextResponse.json({ downloadUrl, file_name: attachment.file_name });
  } catch (error: any) {
    console.error('Failed to get download URL:', error);
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
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

    // Get attachment record to verify permission and storage_path
    const { data: attachment, error: getErr } = await supabase
      .from('sw_attachments')
      .select('*')
      .eq('id', id)
      .single();

    if (getErr || !attachment) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    // Check permissions: either uploader or workspace admin
    if (attachment.uploaded_by !== user.id) {
      const { data: member } = await supabase
        .from('sw_workspace_members')
        .select('role')
        .eq('workspace_id', attachment.workspace_id)
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: ws } = await supabase
        .from('sw_workspaces')
        .select('owner_id')
        .eq('id', attachment.workspace_id)
        .maybeSingle();

      const isAdmin = member?.role === 'admin' || ws?.owner_id === user.id;

      if (!isAdmin) {
        return NextResponse.json(
          { error: 'forbidden' },
          { status: 403 }
        );
      }
    }

    // Delete file from Backblaze B2
    if (attachment.storage_path) {
      await deleteFileFromB2(attachment.storage_path);
    }

    // Delete record from Supabase DB
    const { error: delErr } = await supabase
      .from('sw_attachments')
      .delete()
      .eq('id', id);

    if (delErr) throw delErr;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete attachment:', error);
    return NextResponse.json(
      { error: 'delete_failed' },
      { status: 500 }
    );
  }
}
