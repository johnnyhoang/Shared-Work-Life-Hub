'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import { formatRelativeTime } from '@/lib/dateUtils';
import { Activity as ActivityIcon, ArrowRight } from 'lucide-react';

export function RecentActivitySection() {
  const { hubState, setActiveTab, setSelectedTask, setSelectedProject } = useHub();

  if (!hubState) return null;

  const activities = hubState.recentActivities.slice(0, 5);

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Recent Activity
          </h3>
        </div>
        <button
          onClick={() => setActiveTab('feed')}
          className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
        >
          <span>Full feed</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2.5">
        {activities.map((activity) => (
          <div
            key={activity.id}
            onClick={() => {
              if (activity.entity_type === 'task') {
                const task = hubState.tasks.find((t) => t.id === activity.entity_id);
                if (task) setSelectedTask(task);
              } else if (activity.entity_type === 'project' && activity.project_id) {
                const project = hubState.projects.find((p) => p.id === activity.project_id);
                if (project) setSelectedProject(project);
              }
            }}
            className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition cursor-pointer"
          >
            <span className="text-base mt-0.5">{activity.actor_avatar || '👤'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
                {activity.summary}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                {activity.project_name && (
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {activity.project_name}
                  </span>
                )}
                {activity.project_name && <span>•</span>}
                <span>{formatRelativeTime(activity.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
