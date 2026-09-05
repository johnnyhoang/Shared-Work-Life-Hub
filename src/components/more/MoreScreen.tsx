'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { IdeasScreen } from '../ideas/IdeasScreen';
import { KnowledgeScreen } from '../knowledge/KnowledgeScreen';
import { DecisionsScreen } from '../decisions/DecisionsScreen';
import { TeamManagementModal } from '../team/TeamManagementModal';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { UserAvatar } from '../common/UserAvatar';
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
  Bell,
  Sparkles,
} from 'lucide-react';

type SubView = 'menu' | 'ideas' | 'knowledge' | 'decisions';

export function MoreScreen() {
  const { hubState } = useHub();
  const { t } = useI18n();
  const [subView, setSubView] = useState<SubView>('menu');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

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

      {/* Notification & Chat Integrations Card */}
      <div
        onClick={() => setIsNotificationModalOpen(true)}
        className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-pink-500/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-pink-950/40 border border-blue-200/80 dark:border-blue-900/60 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs transition cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {t.notifications.title}
              </h3>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Morning Digest</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Zalo, Slack, Discord, Telegram, Messenger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition">
          <span>{t.common.configure}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
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
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {item.count}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
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
                <div className="flex items-center gap-2.5 min-w-0 mb-1">
                  <UserAvatar
                    avatar={user.avatar_url || user.avatar}
                    name={user.name}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                      <span className="truncate">{user.name}</span>
                      {isLead && <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">
                      {isLead ? t.team.roleLead : t.team.roleMember}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
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

      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </div>
  );
}

