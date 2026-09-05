'use client';

import React, { useState, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { errorText } from '@/lib/errorMessages';
import {
  X,
  ShieldCheck,
  User,
  Users,
  UserPlus,
  UserMinus,
  Mail,
  Trash2,
  Loader2,
  Crown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { useConfirm } from '../common/ConfirmProvider';

export function TeamManagementModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    hubState,
    activeWorkspace,
    workspaceMembers,
    isWorkspaceAdmin,
    inviteMember,
    removeMember,
    updateMemberRole,
    refreshHub,
  } = useHub();
  const { t } = useI18n();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<'members' | 'invite' | 'pending'>('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [workspaceInvitations, setWorkspaceInvitations] = useState<any[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load workspace invitations when modal opens or tab changes to pending
  useEffect(() => {
    if (isOpen && activeWorkspace && (activeTab === 'pending' || isWorkspaceAdmin)) {
      fetchWorkspaceInvitations();
    }
  }, [isOpen, activeWorkspace?.id, activeTab]);

  const fetchWorkspaceInvitations = async () => {
    if (!activeWorkspace) return;
    try {
      setIsLoadingInvites(true);
      const res = await fetch(`/api/workspaces/invitations?workspaceId=${activeWorkspace.id}`);
      if (res.ok) {
        const data = await res.json();
        setWorkspaceInvitations(data);
      }
    } catch (err) {
      console.error('Failed to load invitations:', err);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  if (!isOpen || !hubState) return null;

  const currentUser = hubState.currentUser;
  const currentWorkspaceName = activeWorkspace?.name || 'Không gian làm việc';

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isInviting) return;

    try {
      setIsInviting(true);
      setInviteMessage(null);
      const res = await inviteMember(inviteEmail.trim(), inviteRole);
      if (res.success) {
        setInviteMessage({ text: `Đã gửi lời mời thành công tới ${inviteEmail.trim()}`, isError: false });
        setInviteEmail('');
        fetchWorkspaceInvitations();
      } else {
        setInviteMessage({ text: errorText(t.errors, res.error), isError: true });
      }
    } catch (err: any) {
      setInviteMessage({ text: errorText(t.errors, err), isError: true });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvite = async (invitationId: string) => {
    try {
      setActionLoadingId(invitationId);
      const res = await fetch(`/api/workspaces/invitations/${invitationId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setWorkspaceInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      }
    } catch (err) {
      console.error('Failed to cancel invite:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'member') => {
    try {
      setActionLoadingId(userId);
      await updateMemberRole(userId, newRole);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    const ok = await confirm({
      title: t.dialog.removeMemberTitle,
      message: t.dialog.removeMemberMessage.replace('{name}', userName),
      confirmLabel: t.dialog.removeMemberConfirm,
      icon: UserMinus,
    });
    if (!ok) return;
    try {
      setActionLoadingId(userId);
      await removeMember(userId);
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = workspaceInvitations.filter((i) => i.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {currentWorkspaceName}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Quản lý thành viên và phân quyền trong nhóm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-5 bg-white dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thành viên ({hubState.users.length})</span>
          </button>

          {isWorkspaceAdmin && (
            <>
              <button
                onClick={() => setActiveTab('invite')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'invite'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Mời thành viên</span>
              </button>

              <button
                onClick={() => setActiveTab('pending')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'pending'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Lời mời đã gửi</span>
                {pendingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              {hubState.users.map((member) => {
                const isMe = member.id === currentUser.id;
                const memberRoleInfo = workspaceMembers.find((m) => m.user_id === member.id);
                const isOwner = activeWorkspace?.owner_id === member.id;
                const isLead = isOwner || memberRoleInfo?.role === 'admin' || member.role === 'admin';
                const isLoadingAction = actionLoadingId === member.id;

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                      isLead
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800/40'
                        : 'bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <UserAvatar avatar={member.avatar_url || member.avatar} name={member.name} size="lg" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {member.name}
                          </span>
                          {isMe && (
                            <span className="text-xs px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full font-medium">
                              {t.common.you}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {member.email}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                          <span>{member.location || 'Việt Nam'}</span>
                          <span>•</span>
                          <span>{member.timezone || 'UTC+7'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Role Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs ${
                          isLead
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {isLead ? <Crown className="w-3 h-3 text-amber-300" /> : <User className="w-3 h-3" />}
                        <span>{isLead ? 'Trưởng nhóm' : 'Thành viên'}</span>
                      </span>

                      {/* Admin Actions */}
                      {isWorkspaceAdmin && !isMe && !isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRoleChange(member.id, isLead ? 'member' : 'admin')}
                            disabled={isLoadingAction}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition disabled:opacity-50"
                          >
                            {isLoadingAction ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : isLead ? (
                              'Hạ quyền'
                            ) : (
                              'Lên Trưởng nhóm'
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            disabled={isLoadingAction}
                            title="Xóa khỏi nhóm"
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: INVITE MEMBER */}
          {activeTab === 'invite' && (
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-300">
                💡 <strong>Cơ chế mời:</strong> Nhập địa chỉ email của người bạn muốn mời. Khi người đó đăng nhập vào Hub, thông báo lời mời sẽ tự động xuất hiện để họ chấp nhận.
              </div>

              {inviteMessage && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                    inviteMessage.isError
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {inviteMessage.isError ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{inviteMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Vai trò trong không gian
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInviteRole('member')}
                    className={`p-3 rounded-xl border text-left transition ${
                      inviteRole === 'member'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <User className="w-3.5 h-3.5" />
                      <span>Thành viên</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Thực hiện công việc, tạo task và trao đổi.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInviteRole('admin')}
                    className={`p-3 rounded-xl border text-left transition ${
                      inviteRole === 'admin'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>Trưởng nhóm</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Quản lý thành viên, phân quyền và dự án.
                    </p>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!inviteEmail.trim() || isInviting}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow transition disabled:opacity-50"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi lời mời...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi lời mời tham gia</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PENDING INVITATIONS */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              {isLoadingInvites ? (
                <div className="flex items-center justify-center py-8 text-zinc-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Đang tải danh sách lời mời...</span>
                </div>
              ) : workspaceInvitations.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-400">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <span>Chưa có lời mời nào được gửi cho nhóm này.</span>
                </div>
              ) : (
                workspaceInvitations.map((inv) => {
                  const isPending = inv.status === 'pending';
                  const isCanceling = actionLoadingId === inv.id;

                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {inv.email}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium">
                            {inv.role === 'admin' ? 'Trưởng nhóm' : 'Thành viên'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(inv.created_at).toLocaleDateString('vi-VN')}
                          </span>
                          <span>•</span>
                          <span
                            className={
                              inv.status === 'pending'
                                ? 'text-amber-500 font-medium'
                                : inv.status === 'accepted'
                                ? 'text-emerald-500 font-medium'
                                : 'text-zinc-400'
                            }
                          >
                            {inv.status === 'pending'
                              ? 'Đang chờ chấp nhận'
                              : inv.status === 'accepted'
                              ? 'Đã chấp nhận'
                              : 'Đã từ chối'}
                          </span>
                        </div>
                      </div>

                      {isPending && (
                        <button
                          onClick={() => handleCancelInvite(inv.id)}
                          disabled={isCanceling}
                          className="px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition disabled:opacity-50"
                        >
                          {isCanceling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Hủy lời mời'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
          {t.team.adminNote}
        </div>
      </div>
    </div>
  );
}
