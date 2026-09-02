'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { IdeaStatus } from '@/types';
import { formatRelativeTime } from '@/lib/dateUtils';
import {
  Plus,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Calendar,
} from 'lucide-react';

export function IdeasScreen() {
  const { hubState, createIdea, updateIdea, convertIdea } = useHub();
  const { t, language } = useI18n();
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  if (!hubState) return null;

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createIdea({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      project_id: selectedProjectId || null,
      status: 'idea',
    });

    setNewTitle('');
    setNewDesc('');
    setIsQuickAdding(false);
  };

  const stages: { status: IdeaStatus; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { status: 'idea', label: t.ideas.rawIdeas, icon: Sparkles, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { status: 'maybe', label: t.ideas.maybe, icon: HelpCircle, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { status: 'planned', label: t.ideas.planned, icon: Calendar, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
    { status: 'converted', label: t.ideas.converted, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
  ];

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.ideas.title}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t.ideas.subtitle}
          </p>
        </div>

        <button
          onClick={() => setIsQuickAdding(!isQuickAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.ideas.newIdea}</span>
        </button>
      </div>

      {/* Quick Add Form Drawer */}
      {isQuickAdding && (
        <form
          onSubmit={handleQuickAdd}
          className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2.5 animate-in fade-in duration-150"
        >
          <input
            type="text"
            placeholder={t.ideas.title}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <textarea
            rows={2}
            placeholder={t.work.taskDesc}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">{t.common.noProject}</option>
              {hubState.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsQuickAdding(false)}
                className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-700"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                {t.ideas.saveIdea}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Stage Sections */}
      <div className="space-y-4">
        {stages.map((stage) => {
          const stageIdeas = hubState.ideas.filter((i) => i.status === stage.status);
          const Icon = stage.icon;

          return (
            <div key={stage.status} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className={`p-1 rounded-lg ${stage.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {stage.label}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold">
                  {stageIdeas.length}
                </span>
              </div>

              {stageIdeas.length === 0 ? (
                <div className="py-2.5 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
                  {stage.label}
                </div>
              ) : (
                <div className="space-y-2">
                  {stageIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {idea.title}
                        </h4>
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {formatRelativeTime(idea.created_at)}
                        </span>
                      </div>

                      {idea.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {idea.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px]">
                        <div className="flex items-center gap-2">
                          {idea.project_name && (
                            <span className="px-1.5 py-0.5 rounded-md font-medium text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {idea.project_name}
                            </span>
                          )}
                          <span className="text-zinc-400 text-[10px]">
                            {idea.creator_name}
                          </span>
                        </div>

                        {/* Actions */}
                        {idea.status !== 'converted' ? (
                          <div className="flex items-center gap-1.5">
                            {idea.status === 'idea' && (
                              <button
                                onClick={() => updateIdea(idea.id, { status: 'maybe' })}
                                className="px-2 py-0.5 text-[10px] font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition"
                              >
                                → {t.ideas.maybe}
                              </button>
                            )}
                            {idea.status === 'maybe' && (
                              <button
                                onClick={() => updateIdea(idea.id, { status: 'planned' })}
                                className="px-2 py-0.5 text-[10px] font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition"
                              >
                                → {t.ideas.planned}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const target = hubState.users[0]?.id || hubState.currentUser.id;
                                convertIdea(idea.id, target);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition flex items-center gap-1 shadow-2xs"
                            >
                              <span>{t.ideas.convertToTask}</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t.ideas.convertedBadge}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
