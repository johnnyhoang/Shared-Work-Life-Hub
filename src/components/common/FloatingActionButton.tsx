'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import { Plus } from 'lucide-react';

export function FloatingActionButton() {
  const { openQuickAction } = useHub();

  return (
    <button
      onClick={() => openQuickAction('task')}
      className="md:hidden fixed bottom-18 right-4 z-40 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition"
      aria-label="Quick Add"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
