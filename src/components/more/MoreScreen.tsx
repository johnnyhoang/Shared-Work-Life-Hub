'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { IdeasScreen } from '../ideas/IdeasScreen';
import { KnowledgeScreen } from '../knowledge/KnowledgeScreen';
import { DecisionsScreen } from '../decisions/DecisionsScreen';
import { TeamManagementModal } from '../team/TeamManagementModal';
import {
  Lightbulb,
  BookOpen,
  Scale,
  Users,
  Clock,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  User,
} from 'lucide-react';

type SubView = 'menu' | 'ideas' | 'knowledge' | 'decisions';

export function MoreScreen() {
  const { hubState, switchUser } = useHub();
  const { t, language } = useI18n();
  const [subView, setSubView] = useState<SubView>('menu');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  if (!hubState) return null;

  const { currentUser } = hubState;

  if (subView === 'ideas') {
    return (
      <div>
        <button
          onClick={() => setSubView('menu')}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.common.more}</span>
        </button>
        <IdeasScreen />
      </div>
    );
  }

  if (subView === 'knowledge') {
    return (
      <div>
        <button
          onClick={() => setSubView('menu')}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.common.more}</span>
        </button>
        <KnowledgeScreen />
      </div>
    );
  }

  if (subView === 'decisions') {
    return (
      <div>
        <button
          onClick={() => setSubView('menu')}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.common.more}</span>
        </button>
        <DecisionsScreen />
      </div>
    );
  }

  const modules = [
    {
      id: 'ideas' as const,
      label: t.ideas.title,
      desc: t.ideas.subtitle,
      icon: Lightbulb,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
      count: hubState.ideas.length,
    },
    {
      id: 'knowledge' as const,
      label: t.knowledge.title,
      desc: t.knowledge.subtitle,
      icon: BookOpen,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
      count: hubState.knowledge.length,
    },
    {
      id: 'decisions' as const,
      label: t.decisions.title,
      desc: t.decisions.subtitle,
      icon: Scale,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
      count: hubState.decisions.length,
    },
  ];

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.common.more}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t.home.teamOverview}
        </p>
      </div>

      {/* Modules List */}
      <div className="space-y-2.5">
        {modules.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setSubView(item.id)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {item.label}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {item.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>
          );
        })}
      </div>

      {/* Team Management Card */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {t.team.title} ({hubState.users.length} {t.team.memberCount})
            </h3>
          </div>

          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.team.changeRole}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {hubState.users.map((user) => {
            const isCurrent = user.id === currentUser.id;
            const isLead = user.role === 'admin';
            return (
              <div
                key={user.id}
                className={`p-3 rounded-xl border transition ${
                  isCurrent
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                    : 'bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{user.avatar || '👤'}</span>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isLead && <ShieldCheck className="w-3 h-3 text-blue-600" />}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {isLead ? t.team.roleLead : t.team.roleMember}
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => switchUser(user.id)}
                      className="px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition"
                    >
                      {language === 'vi' ? 'Xem' : 'View'}
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                  <Clock className="w-3 h-3" />
                  <span>{user.location} • {user.timezone}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </div>
  );
}
