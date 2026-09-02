'use client';

import React, { useState, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import { Task, TaskPriority, TaskStatus, Comment } from '@/types';
import { formatDueDate, formatRelativeTime } from '@/lib/dateUtils';
import {
  X,
  Trash2,
  Send,
  User,
  Calendar,
  Flag,
  FolderKanban,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export function TaskDetailModal() {
  const {
    selectedTask,
    setSelectedTask,
    hubState,
    updateTask,
    deleteTask,
    fetchComments,
    addComment,
  } = useHub();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description || '');
      setStatus(selectedTask.status);
      setPriority(selectedTask.priority);
      setAssigneeId(selectedTask.assignee_id);
      setProjectId(selectedTask.project_id);
      setDueDate(selectedTask.due_date ? selectedTask.due_date.split('T')[0] : '');

      // Load comments
      fetchComments('task', selectedTask.id).then(setComments);
    }
  }, [selectedTask, fetchComments]);

  if (!selectedTask || !hubState) return null;

  const handleSaveField = (updates: Partial<Task>) => {
    updateTask(selectedTask.id, updates);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    const created = await addComment('task', selectedTask.id, newComment.trim());
    if (created) {
      setComments((prev) => [...prev, created]);
      setNewComment('');
    }
    setIsSubmittingComment(false);
  };

  const statuses: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'inbox', label: 'Inbox', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
    { id: 'todo', label: 'Todo', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
    { id: 'done', label: 'Done', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  ];

  const priorities: { id: TaskPriority; label: string }[] = [
    { id: 'urgent', label: 'Urgent' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Task Details
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (confirm('Delete this task?')) {
                  deleteTask(selectedTask.id);
                }
              }}
              className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg transition"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedTask(null)}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status Tabs */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Status
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {statuses.map((s) => {
                const isActive = status === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setStatus(s.id);
                      handleSaveField({ status: s.id });
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition text-center ${
                      isActive
                        ? 'ring-2 ring-blue-500 ' + s.color
                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleSaveField({ title })}
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleSaveField({ description })}
              placeholder="Add extra context, links or requirements..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 resize-none"
            />
          </div>

          {/* Grid: Assignee, Priority, Project, Due Date */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Assignee */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => {
                  setAssigneeId(e.target.value);
                  handleSaveField({ assignee_id: e.target.value });
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hubState.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.avatar} {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  const p = e.target.value as TaskPriority;
                  setPriority(p);
                  handleSaveField({ priority: p });
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Project
              </label>
              <select
                value={projectId || ''}
                onChange={(e) => {
                  const pid = e.target.value ? e.target.value : null;
                  setProjectId(pid);
                  handleSaveField({ project_id: pid });
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">(No Project)</option>
                {hubState.projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleSaveField({ due_date: e.target.value || null });
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Comments & Activity</span>
              <span className="text-[11px] font-normal text-zinc-500">
                ({comments.length})
              </span>
            </h5>

            {/* Comment list */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="text-xs text-zinc-400 py-2 text-center">
                  No comments yet. Leave a note or update for your partner.
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                        <span>{c.user_avatar || '👤'}</span>
                        <span>{c.user_name || 'User'}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {formatRelativeTime(c.created_at)}
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 text-[11px] whitespace-pre-wrap">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2 mt-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
