'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { formatRelativeTime } from '@/lib/dateUtils';
import { Activity as ActivityIcon, FolderKanban, CheckSquare, Lightbulb, BookOpen, Scale, MessageSquare } from 'lucide-react';
import { EntityType } from '@/types';

export function ActivityFeedScreen() {
  const { hubState, setSelectedTask, setSelectedProject } = useHub();
  const { t } = useI18n();

  const [actorFilter, setActorFilter] = useState<'all' | 'mine' | 'partner'>('all');
  const [entityFilter, setEntityFilter] = useState<'all' | EntityType>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'since_visit' | '24h' | '7d'>('all');

  if (!hubState) return null;

  const currentUserId = hubState.currentUser.id;
  const now = Date.now();

  const filteredActivities = hubState.recentActivities.filter((act) => {
    if (actorFilter === 'mine' && act.actor_id !== currentUserId) return false;
    if (actorFilter === 'partner' && act.actor_id === currentUserId) return false;

    if (entityFilter !== 'all' && act.entity_type !== entityFilter) return false;

    if (timeFilter === 'since_visit') {
      const visitTime = new Date(hubState.currentUser.last_visited_at).getTime();
      const actTime = new Date(act.created_at).getTime();
      if (actTime < visitTime) return false;
    } else if (timeFilter === '24h') {
      const actTime = new Date(act.created_at).getTime();
      if (now - actTime > 24 * 60 * 60 * 1000) return false;
    } else if (timeFilter === '7d') {
      const actTime = new Date(act.created_at).getTime();
      if (now - actTime > 7 * 24 * 60 * 60 * 1000) return false;
    }

    return true;
  });

  const entityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    task: CheckSquare,
    project: FolderKanban,
    idea: Lightbulb,
    knowledge: BookOpen,
    decision: Scale,
    comment: MessageSquare,
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.feed.title}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t.feed.subtitle}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
        {/* Actor Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-zinc-400 w-12">{t.common.who}</span>
          {(['all', 'mine', 'partner'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActorFilter(tab)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                actorFilter === tab
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {tab === 'all' ? t.feed.everyone : tab === 'mine' ? t.feed.myChanges : t.feed.partnerChanges}
            </button>
          ))}
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-zinc-400 w-12">{t.common.when}</span>
          {[
            { id: 'all', label: t.feed.allTime },
            { id: 'since_visit', label: t.feed.sinceVisit },
            { id: '24h', label: t.feed.last24h },
            { id: '7d', label: t.feed.last7d },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id as typeof timeFilter)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                timeFilter === tab.id
                  ? 'bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Entity Type Filter */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 w-12">{t.common.type}</span>
          {(['all', 'task', 'project', 'idea', 'knowledge', 'decision'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setEntityFilter(type)}
              className={`px-2 py-0.5 rounded-md text-[11px] capitalize transition ${
                entityFilter === type
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {type === 'all' ? t.common.all : type}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-2">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            {t.feed.noActivities}
          </div>
        ) : (
          filteredActivities.map((act) => {
            const Icon = entityIcons[act.entity_type] || ActivityIcon;

            return (
              <div
                key={act.id}
                onClick={() => {
                  if (act.entity_type === 'task') {
                    const task = hubState.tasks.find((t) => t.id === act.entity_id);
                    if (task) setSelectedTask(task);
                  } else if (act.entity_type === 'project' && act.project_id) {
                    const project = hubState.projects.find((p) => p.id === act.project_id);
                    if (project) setSelectedProject(project);
                  }
                }}
                className="group flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition cursor-pointer"
              >
                <div className="text-xl mt-0.5">{act.actor_avatar || '👤'}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {act.summary}
                    </span>
                    <span className="text-[10px] text-zinc-400 shrink-0">
                      {formatRelativeTime(act.created_at)}
                    </span>
                  </div>

                  {act.details && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {act.details}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-[11px]">
                    <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 uppercase tracking-wide">
                      <Icon className="w-3 h-3 text-blue-500" />
                      <span>{act.entity_type}</span>
                    </span>

                    {act.project_name && (
                      <>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                          {act.project_name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
