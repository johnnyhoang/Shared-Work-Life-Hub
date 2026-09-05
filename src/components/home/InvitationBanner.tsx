'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { Mail, Check, X, Building2, Loader2, Crown, UserCheck } from 'lucide-react';

export function InvitationBanner() {
  const { pendingInvitations, respondInvitation } = useHub();
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!pendingInvitations || pendingInvitations.length === 0) return null;

  const handleRespond = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      setProcessingId(invitationId);
      await respondInvitation(invitationId, action);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      {pendingInvitations.map((inv) => {
        const isProcessing = processingId === inv.id;
        const workspaceName = inv.workspace?.name || 'Không gian nhóm';
        const inviterName = inv.inviter?.name || 'Một thành viên';

        return (
          <div
            key={inv.id}
            className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20 border border-indigo-200/70 dark:border-indigo-800/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs flex-shrink-0">
                <Mail className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Lời mời tham gia không gian nhóm
                  </h4>
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {inv.role === 'admin' ? (
                      <>
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span>Trưởng nhóm</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3 text-slate-500" />
                        <span>Thành viên</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  <span className="font-semibold text-slate-900 dark:text-white">{inviterName}</span> đã mời bạn tham gia vào{' '}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">"{workspaceName}"</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleRespond(inv.id, 'decline')}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-xs disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>Từ chối</span>
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleRespond(inv.id, 'accept')}
                className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs hover:shadow disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Chấp nhận</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
