'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import {
  Building2,
  ChevronDown,
  Plus,
  Check,
  Crown,
  UserCheck,
  Mail,
} from 'lucide-react';

export function WorkspaceSwitcher() {
  const {
    activeWorkspace,
    workspaces,
    pendingInvitations,
    switchWorkspace,
    isWorkspaceAdmin,
    openCreateWorkspace,
  } = useHub();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentWorkspaceName = activeWorkspace?.name || 'Không gian làm việc';

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group max-w-[200px] sm:max-w-[260px]"
          title={currentWorkspaceName}
        >
          <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase shadow-xs">
            {currentWorkspaceName.charAt(0) || 'W'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate block">
                {currentWorkspaceName}
              </span>
              {pendingInvitations.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                {isWorkspaceAdmin ? (
                  <>
                    <Crown className="w-2.5 h-2.5 text-amber-500" />
                    <span>Trưởng nhóm</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-2.5 h-2.5 text-slate-400" />
                    <span>Thành viên</span>
                  </>
                )}
              </span>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Không gian làm việc
              </span>
              {pendingInvitations.length > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                  <Mail className="w-2.5 h-2.5" />
                  {pendingInvitations.length} lời mời
                </span>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto py-1 px-1.5 space-y-0.5">
              {workspaces.map((ws) => {
                const isActive = ws.id === activeWorkspace?.id;
                return (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div
                        className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold uppercase ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {ws.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight">{ws.name}</p>
                        {ws.description && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
                            {ws.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800 px-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  openCreateWorkspace();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo không gian làm việc mới</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
