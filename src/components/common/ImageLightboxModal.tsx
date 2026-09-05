'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Attachment } from '@/types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileImage,
} from 'lucide-react';

interface ImageLightboxModalProps {
  images: Attachment[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ImageLightboxModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
}: ImageLightboxModalProps) {
  const currentImage = images[currentIndex];

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onIndexChange]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    onIndexChange((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentImage) return null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(currentImage.file_url);
      if (!res.ok) throw new Error('Direct fetch failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentImage.file_name || 'image.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      try {
        const apiRes = await fetch(`/api/attachments/${currentImage.id}`);
        if (apiRes.ok) {
          const { downloadUrl } = await apiRes.json();
          if (downloadUrl) {
            window.location.href = downloadUrl;
            return;
          }
        }
      } catch {}
      window.open(currentImage.file_url, '_blank');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-between bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="w-full max-w-5xl flex items-center justify-between py-2 text-white/90 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 min-w-0 pr-4">
          <div className="p-1.5 bg-white/10 rounded-xl">
            <FileImage className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold truncate text-white">
              {currentImage.file_name}
            </p>
            <p className="text-xs text-white/60">
              {currentIndex + 1} / {images.length}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
            title="Tải ảnh về máy"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải về</span>
          </button>

          <a
            href={currentImage.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title="Mở tab mới"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-red-400 transition"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="relative flex-1 w-full max-w-5xl flex items-center justify-center p-2 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={currentImage.id}
          src={currentImage.file_url}
          alt={currentImage.file_name}
          className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl transition-transform animate-in zoom-in-95 duration-200"
        />

        {/* Prev Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm transition-transform active:scale-90 hover:scale-105 shadow-2xl"
            title="Ảnh trước (Mũi tên trái)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm transition-transform active:scale-90 hover:scale-105 shadow-2xl"
            title="Ảnh sau (Mũi tên phải)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Strip */}
      {images.length > 1 && (
        <div
          className="w-full max-w-2xl flex items-center justify-center space-x-2 py-2 overflow-x-auto z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => onIndexChange(idx)}
              className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                idx === currentIndex
                  ? 'border-indigo-500 scale-105 shadow-xs ring-2 ring-indigo-400/50'
                  : 'border-white/30 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.file_url}
                alt={img.file_name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
