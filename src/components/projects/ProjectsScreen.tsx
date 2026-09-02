'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { GitHubImportModal } from './GitHubImportModal';
import {
  FolderKanban,
  Lightbulb,
  Plus,
  ArrowRight,
} from 'lucide-react';

export function ProjectsScreen() {
  const {
    hubState,
    setSelectedProject,
    createProject,
    openQuickAction,
  } = useHub();
  const { t, language } = useI18n();

  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'ideas'>('projects');
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

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
    <>
      <div className="space-y-5 pb-20 md:pb-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {language === 'vi' ? 'Không gian chung' : 'Hub Space'}
            </h1>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-0.5">
              {language === 'vi'
                ? 'Dự án, ý tưởng & ghi chú làm việc của Team'
                : 'Projects, ideas & notes for collaboration'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* GitHub Connect Button */}
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xs transition shrink-0"
              title="Import projects from GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>{language === 'vi' ? 'Import GitHub' : 'GitHub'}</span>
            </button>

            {/* Standard Add Button */}
            <button
              onClick={() => {
                if (activeSubTab === 'projects') {
                  handleAddProject();
                } else {
                  openQuickAction('idea');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl shadow-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{activeSubTab === 'projects' ? t.projects.newProject : t.ideas.newIdea}</span>
            </button>
          </div>
        </div>

        {/* 2 Subtabs: Projects & Ideas */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs sm:text-sm font-bold w-fit">
          <button
            onClick={() => setActiveSubTab('projects')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition ${
              activeSubTab === 'projects'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>{t.projects.title} ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ideas')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition ${
              activeSubTab === 'ideas'
                ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs font-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>{t.ideas.title} ({ideas.length})</span>
          </button>
        </div>

        {/* Projects List View */}
        {activeSubTab === 'projects' && (
          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="py-14 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 space-y-3">
                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                  {language === 'vi' ? 'Chưa có dự án nào.' : 'No projects yet.'}
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setIsGitHubModalOpen(true)}
                    className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-zinc-900 dark:bg-zinc-700 hover:bg-black rounded-2xl shadow-xs transition"
                  >
                    {language === 'vi' ? 'Import từ GitHub' : 'Import from GitHub'}
                  </button>
                  <button
                    onClick={handleAddProject}
                    className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xs transition"
                  >
                    {t.projects.newProject}
                  </button>
                </div>
              </div>
            ) : (
              projects.map((proj) => {
                const activeCount = proj.active_tasks || 0;
                const totalCount = proj.total_tasks || 0;
                const isGitHub = proj.icon === 'github' || proj.description?.includes('github.com');

                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj)}
                    className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-black shrink-0"
                        style={{ backgroundColor: isGitHub ? '#24292e' : (proj.color || '#3b82f6') }}
                      >
                        {isGitHub ? (
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                        ) : (
                          proj.name.charAt(0)
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {proj.name}
                          </h3>
                          {isGitHub && (
                            <span className="px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                              GitHub
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {activeCount} {language === 'vi' ? 'việc đang làm' : 'active tasks'} • {totalCount} {language === 'vi' ? 'tổng số việc' : 'total tasks'}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-zinc-400 shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Ideas List View */}
        {activeSubTab === 'ideas' && (
          <div className="space-y-2.5">
            {ideas.length === 0 ? (
              <div className="py-14 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 space-y-2">
                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                  {language === 'vi' ? 'Chưa có ý tưởng nào được ghi lại.' : 'No ideas recorded yet.'}
                </p>
              </div>
            ) : (
              ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                      💡 {idea.title}
                    </span>
                    {idea.project_name && (
                      <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {idea.project_name}
                      </span>
                    )}
                  </div>
                  {idea.description && (
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {idea.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <GitHubImportModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />
    </>
  );
}
