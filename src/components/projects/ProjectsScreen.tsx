'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { Project, ProjectStatus } from '@/types';
import { formatRelativeTime } from '@/lib/dateUtils';
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  ListTodo,
  Clock,
  ArrowRight,
} from 'lucide-react';

export function ProjectsScreen() {
  const { hubState, setSelectedProject, openQuickAction } = useHub();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('active');

  if (!hubState) return null;

  const filteredProjects = hubState.projects.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Projects
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Containers for shared goals and systems
          </p>
        </div>

        <button
          onClick={() => {
            const name = prompt('Enter Project Name:');
            if (name && name.trim()) {
              const desc = prompt('Short description (optional):') || '';
              // Create project via context
              // (will trigger quick action or direct creation)
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 text-xs font-medium w-fit">
        {(['active', 'paused', 'archived', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1 rounded-lg capitalize transition ${
              statusFilter === tab
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredProjects.map((project) => {
          const totalTasks = project.total_tasks || 0;
          const completedTasks = project.completed_tasks || 0;
          const activeTasks = project.active_tasks || 0;
          const progressPercent =
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-sm transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs font-bold text-xs"
                      style={{ backgroundColor: project.color || '#3b82f6' }}
                    >
                      {project.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {project.name}
                      </h3>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400">
                        {project.status}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-zinc-400 group-hover:translate-x-0.5 transition">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>

                {project.description && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Progress & Task Counts */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {activeTasks} active
                    </span>
                    <span>•</span>
                    <span>{completedTasks} done</span>
                  </div>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: project.color || '#3b82f6',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                  <span>Updated {formatRelativeTime(project.updated_at)}</span>
                  <span>{totalTasks} total tasks</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
