'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { KnowledgeStatus } from '@/types';
import { formatRelativeTime } from '@/lib/dateUtils';
import { Plus, CheckCircle2, BookMarked, Target } from 'lucide-react';

export function KnowledgeScreen() {
  const { hubState, createKnowledge, updateKnowledge } = useHub();
  const { t } = useI18n();
  const [newTopic, setNewTopic] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  if (!hubState) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    await createKnowledge({
      topic: newTopic.trim(),
      notes: newNotes.trim() || undefined,
      project_id: selectedProjectId || null,
      status: 'learning',
    });

    setNewTopic('');
    setNewNotes('');
    setIsAdding(false);
  };

  const statusConfigs: Record<KnowledgeStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
    learning: { label: t.knowledge.learning, icon: BookMarked, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    to_learn: { label: t.knowledge.toLearn, icon: Target, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    mastered: { label: t.knowledge.mastered, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.knowledge.title}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t.knowledge.subtitle}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.knowledge.newTopic}</span>
        </button>
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5 animate-in fade-in duration-150"
        >
          <input
            type="text"
            placeholder={t.knowledge.title}
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <textarea
            rows={3}
            placeholder={t.work.taskDesc}
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-2 py-1 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
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
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-700"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={!newTopic.trim()}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                {t.knowledge.saveTopic}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Topics list */}
      <div className="space-y-3">
        {(['learning', 'to_learn', 'mastered'] as const).map((statusKey) => {
          const list = hubState.knowledge.filter((k) => k.status === statusKey);
          const config = statusConfigs[statusKey];
          const Icon = config.icon;

          return (
            <div key={statusKey} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className={`p-1 rounded-xl ${config.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {config.label}
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold">
                  {list.length}
                </span>
              </div>

              {list.length === 0 ? (
                <div className="py-2.5 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
                  {config.label}
                </div>
              ) : (
                <div className="space-y-2">
                  {list.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {item.topic}
                        </h4>

                        {/* Status Switcher */}
                        <div className="flex items-center gap-1 shrink-0">
                          {item.status !== 'learning' && (
                            <button
                              onClick={() => updateKnowledge(item.id, { status: 'learning' })}
                              className="px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full transition"
                            >
                              {t.knowledge.learning}
                            </button>
                          )}
                          {item.status !== 'mastered' && (
                            <button
                              onClick={() => updateKnowledge(item.id, { status: 'mastered' })}
                              className="px-2 py-0.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full transition"
                            >
                              {t.knowledge.mastered}
                            </button>
                          )}
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                          {item.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-400">
                        <div className="flex items-center gap-2">
                          {item.project_name && (
                            <span className="px-1.5 py-0.5 rounded-full font-medium text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {item.project_name}
                            </span>
                          )}
                          <span>{item.user_name}</span>
                        </div>
                        <span>{formatRelativeTime(item.updated_at)}</span>
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
