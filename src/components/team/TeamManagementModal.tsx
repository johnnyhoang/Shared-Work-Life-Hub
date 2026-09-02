'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { UserRole } from '@/types';
import { X, ShieldCheck, User, Users, Check, ArrowRight } from 'lucide-react';

export function TeamManagementModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { hubState, refreshHub } = useHub();
  const { t, language } = useI18n();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isOpen || !hubState) return null;

  const currentUser = hubState.currentUser;
  const isCurrentUserAdmin = currentUser.role === 'admin';

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingId(userId);
      const res = await fetch('/api/team/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        await refreshHub();
      }
    } catch (err) {
      console.error('Failed to change role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              {t.team.title} ({hubState.users.length} {t.team.memberCount})
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Member List */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {hubState.users.map((member) => {
            const isMe = member.id === currentUser.id;
            const isLead = member.role === 'admin';

            return (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  isLead
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-800/40'
                    : 'bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{member.avatar || '👤'}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {member.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] text-zinc-400">({language === 'vi' ? 'Bạn' : 'You'})</span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {member.email}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                      <span>{member.location}</span>
                      <span>•</span>
                      <span>{member.timezone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Role Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      isLead
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {isLead ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    <span>{isLead ? t.team.roleLead : t.team.roleMember}</span>
                  </span>

                  {/* Admin actions */}
                  {isCurrentUserAdmin && !isMe && (
                    <button
                      onClick={() => handleRoleChange(member.id, isLead ? 'member' : 'admin')}
                      disabled={updatingId === member.id}
                      className="px-2 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition"
                    >
                      {isLead ? t.team.makeMember : t.team.makeLead}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 text-center text-[11px] text-zinc-500">
          {language === 'vi'
            ? 'Trưởng nhóm (Lead) có quyền phân công dự án, quản lý quyền hạn và điều phối toàn bộ thành viên.'
            : 'Team Leads have full permissions to manage project scopes, member roles, and assignments.'}
        </div>
      </div>
    </div>
  );
}
