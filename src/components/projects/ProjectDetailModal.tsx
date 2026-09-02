'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { Project, ProjectStatus } from '@/types';
import { TaskCard } from '../work/TaskCard';
import { formatRelativeTime } from '@/lib/dateUtils';
import {
  X,
  Plus,
} from 'lucide-react';

type ProjectTab = 'tasks' | 'ideas' | 'knowledge' | 'decisions' | 'activity' | 'overview';

export function ProjectDetailModal() {
  const {
    selectedProject,
    setSelectedProject,
    hubState,
    updateProject,
    openQuickAction,
  } = useHub();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<ProjectTab>('tasks');

  if (!selectedProject || !hubState) return null;

  const projectTasks = hubState.tasks.filter((t) => t.project_id === selectedProject.id);
  const projectIdeas = hubState.ideas.filter((i) => i.project_id === selectedProject.id);
  const projectKnowledge = hubState.knowledge.filter((k) => k.project_id === selectedProject.id);
  const projectDecisions = hubState.decisions.filter((d) => d.project_id === selectedProject.id);
  const projectActivities = hubState.recentActivities.filter((a) => a.project_id === selectedProject.id);

  const tabs: { id: ProjectTab; label: string; count?: number }[] = [
    { id: 'tasks', label: t.projects.tabTasks, count: projectTasks.length },
    { id: 'ideas', label: t.projects.tabIdeas, count: projectIdeas.length },
    { id: 'knowledge', label: t.projects.tabKnowledge, count: projectKnowledge.length },
    { id: 'decisions', label: t.projects.tabDecisions, count: projectDecisions.length },
    { id: 'activity', label: t.projects.tabActivity, count: projectActivities.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: selectedProject.color || '#3b82f6' }}
            >
              {selectedProject.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {selectedProject.name}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setSelectedProject(null)}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">
                  {projectTasks.length} {t.projects.totalTasks}
                </span>
                <button
                  onClick={() => openQuickAction('task')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.work.newTask}</span>
                </button>
              </div>

              {projectTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  {t.projects.noTasks}
                </div>
              ) : (
                <div className="space-y-2">
                  {projectTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ideas Tab */}
          {activeTab === 'ideas' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">
                  {t.ideas.title}
                </span>
                <button
                  onClick={() => openQuickAction('idea')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.ideas.newIdea}</span>
                </button>
              </div>

              {projectIdeas.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  {t.projects.noIdeas}
                </div>
              ) : (
                <div className="space-y-2">
                  {projectIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {idea.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                          {idea.status}
                        </span>
                      </div>
                      {idea.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {idea.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Knowledge Tab */}
          {activeTab === 'knowledge' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">
                  {t.knowledge.title}
                </span>
                <button
                  onClick={() => openQuickAction('knowledge')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.knowledge.newTopic}</span>
                </button>
              </div>

              {projectKnowledge.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  {t.projects.noKnowledge}
                </div>
              ) : (
                <div className="space-y-2">
                  {projectKnowledge.map((k) => (
                    <div
                      key={k.id}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {k.topic}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          {k.status.replace('_', ' ')}
                        </span>
                      </div>
                      {k.notes && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap mt-1">
                          {k.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Decisions Tab */}
          {activeTab === 'decisions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">
                  {t.decisions.title}
                </span>
                <button
                  onClick={() => openQuickAction('decision')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.decisions.newDecision}</span>
                </button>
              </div>

              {projectDecisions.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  {t.projects.noDecisions}
                </div>
              ) : (
                <div className="space-y-2">
                  {projectDecisions.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {d.title}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {formatRelativeTime(d.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {d.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-2">
              {projectActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  {t.projects.noActivity}
                </div>
              ) : (
                projectActivities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs"
                  >
                    <span>{a.actor_avatar || '👤'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {a.summary}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {formatRelativeTime(a.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
