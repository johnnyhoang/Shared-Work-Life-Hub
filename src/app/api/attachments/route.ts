import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadFileToB2, getPresignedDownloadUrl } from '@/lib/services/b2StorageService';
import { Attachment } from '@/types';

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

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const { data: rawAttachments, error } = await supabase
      .from('sw_attachments')
      .select(`
        *,
        uploader:sw_profiles!sw_attachments_uploaded_by_fkey(name, avatar_url)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const attachments: Attachment[] = await Promise.all(
      (rawAttachments || []).map(async (a: any) => {
        let signedUrl = a.file_url;
        if (a.storage_path) {
          try {
            // Generate presigned URL valid for 24 hours for private bucket viewing
            signedUrl = await getPresignedDownloadUrl(a.storage_path, 86400);
          } catch {
            signedUrl = a.file_url;
          }
        }

        return {
          id: a.id,
          workspace_id: a.workspace_id,
          entity_type: a.entity_type,
          entity_id: a.entity_id,
          file_name: a.file_name,
          file_size: Number(a.file_size || 0),
          file_type: a.file_type,
          file_url: signedUrl,
          storage_path: a.storage_path,
          uploaded_by: a.uploaded_by,
          uploader_name: a.uploader?.name || 'Thành viên',
          uploader_avatar: a.uploader?.avatar_url || '👤',
          created_at: a.created_at,
        };
      })
    );

    return NextResponse.json(attachments);
  } catch (error: any) {
    console.error('Failed to get attachments:', error);
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entity_type') as string | null;
    const entityId = formData.get('entity_id') as string | null;
    const workspaceId = formData.get('workspace_id') as string | null;

    if (!file || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'invalid_request' },
        { status: 400 }
      );
    }

    // Limit file size to 25MB
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'file_too_large' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Backblaze B2
    const { fileUrl, storagePath } = await uploadFileToB2({
      fileBuffer: buffer,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      entityType,
      entityId,
    });

    // Save attachment record in Supabase
    const { data: record, error: dbErr } = await supabase
      .from('sw_attachments')
      .insert({
        workspace_id: workspaceId || null,
        entity_type: entityType,
        entity_id: entityId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        file_url: fileUrl,
        storage_path: storagePath,
        uploaded_by: user.id,
      })
      .select(`
        *,
        uploader:sw_profiles!sw_attachments_uploaded_by_fkey(name, avatar_url)
      `)
      .single();

    if (dbErr) {
      console.error('Failed to save attachment metadata to DB:', dbErr);
      throw dbErr;
    }

    const attachment: Attachment = {
      id: record.id,
      workspace_id: record.workspace_id,
      entity_type: record.entity_type,
      entity_id: record.entity_id,
      file_name: record.file_name,
      file_size: Number(record.file_size || 0),
      file_type: record.file_type,
      file_url: record.file_url,
      storage_path: record.storage_path,
      uploaded_by: record.uploaded_by,
      uploader_name: record.uploader?.name || 'Thành viên',
      uploader_avatar: record.uploader?.avatar_url || '👤',
      created_at: record.created_at,
    };

    return NextResponse.json(attachment, { status: 201 });
  } catch (error: any) {
    console.error('Failed to upload attachment:', error);
    return NextResponse.json(
      { error: 'upload_failed' },
      { status: 500 }
    );
  }
}
