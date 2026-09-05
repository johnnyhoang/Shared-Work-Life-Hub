'use client';

import React, { useState, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import {
  X,
  Search,
  Check,
  Loader2,
  ExternalLink,
  Star,
  Code,
  FolderPlus,
} from 'lucide-react';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stars: number;
  updated_at: string;
}

export function GitHubImportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { createProject, hubState } = useHub();
  const { language } = useI18n();

  const [username, setUsername] = useState('johnnyhoang');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [filterText, setFilterText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [importingId, setImportingId] = useState<number | null>(null);
  const [importedIds, setImportedIds] = useState<Set<number>>(new Set());

  // Existing project names
  const existingNames = new Set(
    (hubState?.projects || []).map((p) => p.name.toLowerCase())
  );

  const fetchRepos = async (userToFetch: string) => {
    if (!userToFetch.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/github/repos?username=${encodeURIComponent(userToFetch.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch repositories');
      }
      setRepos(data.repos || []);
      localStorage.setItem('hub_github_username', userToFetch.trim());
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error fetching GitHub repositories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const savedUser = localStorage.getItem('hub_github_username') || 'johnnyhoang';
      setUsername(savedUser);
      fetchRepos(savedUser);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImportSingle = async (repo: GitHubRepo) => {
    try {
      setImportingId(repo.id);
      await createProject({
        name: repo.name,
        description: repo.description ? `${repo.description} (${repo.html_url})` : repo.html_url,
        color: '#24292e',
        icon: 'github',
        status: 'active',
      });
      setImportedIds((prev) => new Set([...prev, repo.id]));
    } catch (err) {
      console.error(err);
    } finally {
      setImportingId(null);
    }
  };

  const filteredRepos = repos.filter((r) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.language && r.language.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {language === 'vi' ? 'Kết nối & Import từ GitHub' : 'Import from GitHub'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {language === 'vi'
                  ? 'Chọn repositories từ tài khoản GitHub để thêm vào danh sách dự án'
                  : 'Select repositories from your GitHub account to add as projects'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Fetch Bar */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchRepos(username);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                github.com/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username hoặc organization"
                className="w-full pl-24 pr-3 py-2.5 text-xs sm:text-sm font-bold rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{language === 'vi' ? 'Tải Repos' : 'Fetch'}</span>
            </button>
          </form>

          {repos.length > 0 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={language === 'vi' ? 'Lọc theo tên hoặc ngôn ngữ...' : 'Filter repos by name or language...'}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}
        </div>

        {/* Body: List of Repos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-semibold text-center">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs sm:text-sm font-bold text-zinc-500">
                {language === 'vi' ? 'Đang tải danh sách Repositories từ GitHub...' : 'Loading repositories from GitHub...'}
              </p>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="py-12 text-center text-xs sm:text-sm text-zinc-400">
              {language === 'vi'
                ? 'Không tìm thấy repository nào. Hãy thử nhập username khác!'
                : 'No repositories found.'}
            </div>
          ) : (
            filteredRepos.map((repo) => {
              const isAlreadyAdded = existingNames.has(repo.name.toLowerCase());
              const isJustImported = importedIds.has(repo.id);
              const isImporting = importingId === repo.id;

              return (
                <div
                  key={repo.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 hover:border-zinc-300 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {repo.name}
                      </span>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-blue-600 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {repo.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-1.5">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      {repo.language && (
                        <span className="flex items-center gap-1 font-semibold text-zinc-600 dark:text-zinc-300">
                          <Code className="w-3 h-3" />
                          <span>{repo.language}</span>
                        </span>
                      )}
                      {repo.stars > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{repo.stars}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {isAlreadyAdded || isJustImported ? (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'vi' ? 'Đã thêm' : 'Added'}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleImportSingle(repo)}
                      disabled={isImporting}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition shrink-0"
                    >
                      {isImporting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FolderPlus className="w-3.5 h-3.5" />
                      )}
                      <span>{language === 'vi' ? 'Thêm vào Hub' : 'Add to Hub'}</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
