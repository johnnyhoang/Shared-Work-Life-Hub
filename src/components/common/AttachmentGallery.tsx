'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Attachment, AttachmentEntityType } from '@/types';
import { ImageLightboxModal } from './ImageLightboxModal';
import { useConfirm } from './ConfirmProvider';
import { useI18n } from '@/lib/i18n';
import { errorText } from '@/lib/errorMessages';
import {
  Paperclip,
  Upload,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  File as FileIcon,
  Download,
  Trash2,
  Loader2,
  ZoomIn,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface AttachmentGalleryProps {
  entityType: AttachmentEntityType;
  entityId: string;
  workspaceId?: string | null;
  allowUpload?: boolean;
  className?: string;
  onAttachmentsChange?: (count: number) => void;
}

function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function isImageFile(mimeType: string, fileName: string): boolean {
  if (mimeType && mimeType.startsWith('image/')) return true;
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '');
}

function getFileIcon(mimeType: string, fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (mimeType.includes('pdf') || ext === 'pdf') {
    return <FileText className="w-6 h-6 text-rose-500" />;
  }
  if (
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    ['xls', 'xlsx', 'csv'].includes(ext || '')
  ) {
    return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
  }
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')
  ) {
    return <FileArchive className="w-6 h-6 text-amber-500" />;
  }
  if (
    mimeType.includes('javascript') ||
    mimeType.includes('json') ||
    mimeType.includes('html') ||
    ['js', 'ts', 'tsx', 'jsx', 'json', 'py', 'sql'].includes(ext || '')
  ) {
    return <FileCode className="w-6 h-6 text-purple-500" />;
  }
  return <FileIcon className="w-6 h-6 text-blue-500" />;
}

export function AttachmentGallery({
  entityType,
  entityId,
  workspaceId,
  allowUpload = true,
  className = '',
  onAttachmentsChange,
}: AttachmentGalleryProps) {
  const { t } = useI18n();
  const confirm = useConfirm();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lightbox states
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/attachments?entity_type=${entityType}&entity_id=${entityId}`
      );
      if (res.ok) {
        const data: Attachment[] = await res.json();
        setAttachments(data);
        onAttachmentsChange?.(data.length);
      }
    } catch (err) {
      console.error('Failed to load attachments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) {
      fetchAttachments();
    }
  }, [entityId, entityType]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entity_type', entityType);
        formData.append('entity_id', entityId);
        if (workspaceId) {
          formData.append('workspace_id', workspaceId);
        }

        const res = await fetch('/api/attachments', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'upload_failed');
        }
      }

      await fetchAttachments();
    } catch (err: any) {
      setError(errorText(t.errors, err));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string, fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm({
      title: t.dialog.deleteFileTitle,
      message: t.dialog.deleteFileMessage.replace('{name}', fileName),
      confirmLabel: t.common.delete,
      icon: Trash2,
    });
    if (!ok) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/attachments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== id));
        onAttachmentsChange?.(attachments.length - 1);
      } else {
        const data = await res.json();
        setError(errorText(t.errors, data.error));
      }
    } catch (err: any) {
      setError(errorText(t.errors, err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDirectDownload = async (attachment: Attachment, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(attachment.file_url);
      if (!res.ok) throw new Error('Direct fetch failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      try {
        const apiRes = await fetch(`/api/attachments/${attachment.id}`);
        if (apiRes.ok) {
          const { downloadUrl } = await apiRes.json();
          if (downloadUrl) {
            window.location.href = downloadUrl;
            return;
          }
        }
      } catch {}
      window.open(attachment.file_url, '_blank');
    }
  };

  // Filter image attachments for Lightbox
  const imageAttachments = attachments.filter((a) =>
    isImageFile(a.file_type, a.file_name)
  );
  const documentAttachments = attachments.filter(
    (a) => !isImageFile(a.file_type, a.file_name)
  );

  const openLightboxForImage = (attachment: Attachment) => {
    const idx = imageAttachments.findIndex((img) => img.id === attachment.id);
    if (idx !== -1) {
      setLightboxIndex(idx);
      setLightboxOpen(true);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Paperclip className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Tệp đính kèm {attachments.length > 0 && `(${attachments.length})`}
          </h4>
        </div>

        {allowUpload && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải lên...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Đính kèm tệp</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-zinc-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span>Đang tải tệp đính kèm...</span>
        </div>
      ) : attachments.length === 0 ? (
        allowUpload && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-6 text-center cursor-pointer transition group bg-zinc-50/50 dark:bg-zinc-900/30"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Nhấp để chọn tệp hoặc kéo thả tệp vào đây
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              Hỗ trợ hình ảnh, PDF, tài liệu Word, Excel, ZIP (tối đa 25MB)
            </p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {/* 1. Images Gallery Grid (Wide Thumbnails) */}
          {imageAttachments.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Hình ảnh ({imageAttachments.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {imageAttachments.map((img) => {
                  const isDeleting = deletingId === img.id;
                  return (
                    <div
                      key={img.id}
                      onClick={() => openLightboxForImage(img)}
                      className="group relative aspect-video sm:aspect-4/3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 cursor-pointer shadow-xs hover:shadow-xs transition-all hover:scale-[1.02]"
                    >
                      <img
                        src={img.file_url}
                        alt={img.file_name}
                        className="w-full h-full object-cover transition duration-200 group-hover:brightness-90"
                        loading="lazy"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/90 font-medium px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                            {formatBytes(img.file_size)}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleDelete(img.id, img.file_name, e)}
                            disabled={isDeleting}
                            className="p-1 rounded-xl bg-black/50 hover:bg-red-600 text-white transition disabled:opacity-50"
                            title="Xóa tệp"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-white">
                          <p className="text-xs font-semibold truncate pr-2">
                            {img.file_name}
                          </p>
                          <ZoomIn className="w-4 h-4 shrink-0 text-white/90" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Documents & Other Files Grid */}
          {documentAttachments.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Tài liệu & Tệp tin ({documentAttachments.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {documentAttachments.map((doc) => {
                  const isDeleting = deletingId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={(e) => handleDirectDownload(doc, e)}
                      className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 shadow-xs hover:shadow transition cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 group-hover:scale-105 transition">
                          {getFileIcon(doc.file_type, doc.file_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {doc.file_name}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {formatBytes(doc.file_size)} • {doc.uploader_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleDirectDownload(doc, e)}
                          className="p-1.5 rounded-xl text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                          title="Tải về ngay"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(doc.id, doc.file_name, e)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition disabled:opacity-50"
                          title="Xóa tệp"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox for Zooming Images with Next/Prev and Download */}
      <ImageLightboxModal
        images={imageAttachments}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
}
