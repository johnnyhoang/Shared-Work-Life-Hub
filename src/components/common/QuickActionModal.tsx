'use client';

import React, { useState, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { TaskPriority } from '@/types';
import {
  X,
  CheckSquare,
  Lightbulb,
} from 'lucide-react';

export function QuickActionModal() {
  const {
    isQuickActionOpen,
    closeQuickAction,
    quickActionInitialType,
    hubState,
    createTask,
    createIdea,
  } = useHub();
  const { t, language } = useI18n();

  const [type, setType] = useState<'task' | 'idea'>('task');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isQuickActionOpen) {
      setType(quickActionInitialType === 'idea' ? 'idea' : 'task');
      if (hubState) {
        setAssigneeId(hubState.currentUser.id);
      }
    }
  }, [isQuickActionOpen, quickActionInitialType, hubState]);

  if (!isQuickActionOpen || !hubState) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    if (type === 'task') {
      await createTask({
        title: title.trim(),
        description: desc.trim() || undefined,
        assignee_id: assigneeId || hubState.currentUser.id,
        project_id: projectId || null,
        priority,
        due_date: dueDate || null,
        status: 'todo',
      });
    } else {
      await createIdea({
        title: title.trim(),
        description: desc.trim() || undefined,
        project_id: projectId || null,
        status: 'idea',
      });
    }

    setTitle('');
    setDesc('');
    setIsSubmitting(false);
    closeQuickAction();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setType('task')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                type === 'task'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Công việc' : 'Task'}</span>
            </button>

            <button
              type="button"
              onClick={() => setType('idea')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                type === 'idea'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Ý tưởng' : 'Idea'}</span>
            </button>
          </div>

          <button
            onClick={closeQuickAction}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'task' ? (language === 'vi' ? 'Tên việc cần làm...' : 'Task title...') : (language === 'vi' ? 'Tiêu đề ý tưởng...' : 'Idea title...')}
            autoFocus
            required
            className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={language === 'vi' ? 'Ghi chú thêm (tùy chọn)...' : 'Additional notes (optional)...'}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          {type === 'task' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  {t.work.assignee}
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  {hubState.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.avatar || '👤'} {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  {t.work.dueDate}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          {/* Project Tag */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              {t.work.project}
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              <option value="">{t.common.noProject}</option>
              {hubState.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={closeQuickAction}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              {isSubmitting ? '...' : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
