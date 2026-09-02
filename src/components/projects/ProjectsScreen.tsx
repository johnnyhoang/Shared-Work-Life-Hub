'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import {
  FolderKanban,
  Lightbulb,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function ProjectsScreen() {
  const {
    hubState,
    setSelectedProject,
    createProject,
    createIdea,
    openQuickAction,
  } = useHub();
  const { t, language } = useI18n();

  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'ideas'>('projects');

  if (!hubState) return null;

  const { projects, ideas } = hubState;

  const handleAddProject = () => {
    const name = prompt(language === 'vi' ? 'Tên dự án mới:' : 'New Project Name:');
    if (name && name.trim()) {
      createProject({
        name: name.trim(),
      });
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            {language === 'vi' ? 'Không gian chung' : 'Hub Space'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {language === 'vi'
              ? 'Dự án, ý tưởng & ghi chú làm việc của Team'
              : 'Projects, ideas & notes for collaboration'}
          </p>
        </div>

        <button
          onClick={() => {
            if (activeSubTab === 'projects') {
              handleAddProject();
            } else {
              openQuickAction('idea');
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{activeSubTab === 'projects' ? t.projects.newProject : t.ideas.newIdea}</span>
        </button>
      </div>

      {/* 2 Subtabs: Projects & Ideas */}
      <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs font-bold w-fit">
        <button
          onClick={() => setActiveSubTab('projects')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
            activeSubTab === 'projects'
              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>{t.projects.title} ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ideas')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
            activeSubTab === 'ideas'
              ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{t.ideas.title} ({ideas.length})</span>
        </button>
      </div>

      {/* Projects List View */}
      {activeSubTab === 'projects' && (
        <div className="space-y-2.5">
          {projects.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6 space-y-2">
              <p className="text-xs font-medium text-zinc-500">
                {language === 'vi' ? 'Chưa có dự án nào. Bấm nút "+ Dự án mới" để bắt đầu!' : 'No projects yet. Click "+ New Project" to start!'}
              </p>
            </div>
          ) : (
            projects.map((proj) => {
              const activeCount = proj.active_tasks || 0;
              const totalCount = proj.total_tasks || 0;

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                      style={{ backgroundColor: proj.color || '#3b82f6' }}
                    >
                      {proj.name.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {proj.name}
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {activeCount} {language === 'vi' ? 'việc đang làm' : 'active tasks'} • {totalCount} {language === 'vi' ? 'tổng số' : 'total'}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Ideas List View */}
      {activeSubTab === 'ideas' && (
        <div className="space-y-2">
          {ideas.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6 space-y-2">
              <p className="text-xs font-medium text-zinc-500">
                {language === 'vi' ? 'Chưa có ý tưởng nào được ghi lại.' : 'No ideas recorded yet.'}
              </p>
            </div>
          ) : (
            ideas.map((idea) => (
              <div
                key={idea.id}
                className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    💡 {idea.title}
                  </span>
                  {idea.project_name && (
                    <span className="px-1.5 py-0.2 rounded-md font-bold text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {idea.project_name}
                    </span>
                  )}
                </div>
                {idea.description && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {idea.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
