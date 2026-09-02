'use client';

import React, { useState, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import { getLocalTimeInTimezone } from '@/lib/dateUtils';
import { Clock, Moon, Sun, Users, Plus } from 'lucide-react';

export function Header() {
  const { hubState, activeUserId, switchUser, openQuickAction } = useHub();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  if (!hubState) return null;

  const currentUser = hubState.currentUser;
  const partnerUser = hubState.partnerUser;

  const userTime = getLocalTimeInTimezone(currentUser.timezone);
  const partnerTime = getLocalTimeInTimezone(partnerUser.timezone);

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & Dual Timezone */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
              Hub
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-zinc-300 dark:bg-zinc-700" />

          {/* Timezone Clocks */}
          <div className="flex items-center gap-2 text-xs">
            {/* Active User Time */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
              <span>{currentUser.flag}</span>
              <span>{currentUser.name}</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {userTime.time} {userTime.period}
              </span>
              {userTime.isNight ? (
                <Moon className="w-3 h-3 text-indigo-400" />
              ) : (
                <Sun className="w-3 h-3 text-amber-500" />
              )}
            </div>

            {/* Partner Time */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              <span>{partnerUser.flag}</span>
              <span>{partnerUser.name}</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                {partnerTime.time} {partnerTime.period}
              </span>
              {partnerTime.isNight ? (
                <Moon className="w-3 h-3 text-indigo-400" />
              ) : (
                <Sun className="w-3 h-3 text-amber-500" />
              )}
            </div>
          </div>
        </div>

        {/* Right side: Quick Action + Active User Switcher */}
        <div className="flex items-center gap-2">
          {/* Quick Create Button */}
          <button
            onClick={() => openQuickAction('task')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-full shadow-sm transition"
            aria-label="Create item"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Quick Add</span>
          </button>

          {/* User Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition"
              title="Switch active user"
            >
              <span className="text-sm">{currentUser.avatar}</span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[80px] truncate">
                {currentUser.name}
              </span>
              <Users className="w-3 h-3 text-zinc-400" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Viewing As
                  </div>
                  {hubState.users.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium' : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{user.avatar}</span>
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              {user.name} {user.flag}
                            </div>
                            <div className="text-[10px] text-zinc-400">{user.location}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
