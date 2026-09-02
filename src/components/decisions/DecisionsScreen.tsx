'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { Decision } from '@/types';
import { formatRelativeTime } from '@/lib/dateUtils';
import { Scale, Plus, Bookmark, Calendar, CheckCircle2 } from 'lucide-react';

export function DecisionsScreen() {
  const { hubState, createDecision } = useHub();
  const [newTitle, setNewTitle] = useState('');
  const [newReason, setNewReason] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  if (!hubState) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newReason.trim()) return;

    await createDecision({
      title: newTitle.trim(),
      reason: newReason.trim(),
      project_id: selectedProjectId || null,
    });

    setNewTitle('');
    setNewReason('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Decisions Log
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Architectural and product choices with rationale
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Decision</span>
        </button>
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-2.5 animate-in fade-in duration-150"
        >
          <input
            type="text"
            placeholder="Decision title (e.g. Use PostGIS for spatial search)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-purple-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <textarea
            rows={3}
            placeholder="Why was this decision made? (Rationale, trade-offs, constraints)..."
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-purple-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">(No Project Link)</option>
              {hubState.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim() || !newReason.trim()}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Save Decision
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Decisions Timeline / Cards */}
      <div className="space-y-3">
        {hubState.decisions.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No decisions logged yet. Record important choices here.
          </div>
        ) : (
          hubState.decisions.map((decision) => (
            <div
              key={decision.id}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {decision.title}
                  </h3>
                </div>

                <span className="text-[10px] text-zinc-400 shrink-0">
                  {formatRelativeTime(decision.created_at)}
                </span>
              </div>

              <div className="pl-8">
                <div className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <span className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-0.5 text-[10px] uppercase">
                    Rationale / Context:
                  </span>
                  {decision.reason}
                </div>

                <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-400">
                  {decision.project_name && (
                    <span className="px-1.5 py-0.5 rounded-md font-medium text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {decision.project_name}
                    </span>
                  )}
                  <span>By {decision.author_name}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
