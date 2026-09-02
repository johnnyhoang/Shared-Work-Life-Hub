'use client';

import React, { useState, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import { TaskPriority, TaskStatus, IdeaStatus, KnowledgeStatus } from '@/types';
import {
  X,
  CheckSquare,
  Lightbulb,
  Scale,
  BookOpen,
  Send,
  Plus,
} from 'lucide-react';

export function QuickActionModal() {
  const {
    isQuickActionOpen,
    closeQuickAction,
    quickActionInitialType,
    hubState,
    createTask,
    createIdea,
    createDecision,
    createKnowledge,
  } = useHub();

  const [activeType, setActiveType] = useState<'task' | 'idea' | 'decision' | 'knowledge'>('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskProject, setTaskProject] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Idea form state
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [ideaProject, setIdeaProject] = useState('');

  // Decision form state
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionProject, setDecisionProject] = useState('');

  // Knowledge form state
  const [knowledgeTopic, setKnowledgeTopic] = useState('');
  const [knowledgeNotes, setKnowledgeNotes] = useState('');
  const [knowledgeProject, setKnowledgeProject] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isQuickActionOpen) {
      setActiveType(quickActionInitialType || 'task');
      if (hubState) {
        setTaskAssignee(hubState.currentUser.id);
      }
    }
  }, [isQuickActionOpen, quickActionInitialType, hubState]);

  if (!isQuickActionOpen || !hubState) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (activeType === 'task' && taskTitle.trim()) {
      await createTask({
        title: taskTitle.trim(),
        description: taskDesc.trim() || undefined,
        assignee_id: taskAssignee || hubState.currentUser.id,
        project_id: taskProject || null,
        priority: taskPriority,
        due_date: taskDueDate || null,
        status: 'todo',
      });
      setTaskTitle('');
      setTaskDesc('');
    } else if (activeType === 'idea' && ideaTitle.trim()) {
      await createIdea({
        title: ideaTitle.trim(),
        description: ideaDesc.trim() || undefined,
        project_id: ideaProject || null,
        status: 'idea',
      });
      setIdeaTitle('');
      setIdeaDesc('');
    } else if (activeType === 'decision' && decisionTitle.trim() && decisionReason.trim()) {
      await createDecision({
        title: decisionTitle.trim(),
        reason: decisionReason.trim(),
        project_id: decisionProject || null,
      });
      setDecisionTitle('');
      setDecisionReason('');
    } else if (activeType === 'knowledge' && knowledgeTopic.trim()) {
      await createKnowledge({
        topic: knowledgeTopic.trim(),
        notes: knowledgeNotes.trim() || undefined,
        project_id: knowledgeProject || null,
        status: 'learning',
      });
      setKnowledgeTopic('');
      setKnowledgeNotes('');
    }

    setIsSubmitting(false);
    closeQuickAction();
  };

  const types = [
    { id: 'task' as const, label: 'Task', icon: CheckSquare, color: 'text-blue-600' },
    { id: 'idea' as const, label: 'Idea', icon: Lightbulb, color: 'text-amber-500' },
    { id: 'decision' as const, label: 'Decision', icon: Scale, color: 'text-purple-600' },
    { id: 'knowledge' as const, label: 'Learning', icon: BookOpen, color: 'text-emerald-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Quick Create
            </span>
          </div>

          <button
            onClick={closeQuickAction}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Selector Segmented Control */}
        <div className="grid grid-cols-4 p-2 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 gap-1.5">
          {types.map((t) => {
            const Icon = t.icon;
            const isActive = activeType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveType(t.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? t.color : ''}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Task Form */}
          {activeType === 'task' && (
            <>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                required
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                rows={2}
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Optional description / details..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Assign To
                  </label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    {hubState.users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.avatar} {u.name} {u.id === hubState.currentUser.id ? '(You)' : '(Partner)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                    <option value="low">⚪ Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Project
                  </label>
                  <select
                    value={taskProject}
                    onChange={(e) => setTaskProject(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">(No Project)</option>
                    {hubState.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </>
          )}

          {/* Idea Form */}
          {activeType === 'idea' && (
            <>
              <input
                type="text"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="What is your idea?"
                autoFocus
                required
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <textarea
                rows={3}
                value={ideaDesc}
                onChange={(e) => setIdeaDesc(e.target.value)}
                placeholder="Concept details, potential benefits..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Related Project (Optional)
                </label>
                <select
                  value={ideaProject}
                  onChange={(e) => setIdeaProject(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">(No Project)</option>
                  {hubState.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Decision Form */}
          {activeType === 'decision' && (
            <>
              <input
                type="text"
                value={decisionTitle}
                onChange={(e) => setDecisionTitle(e.target.value)}
                placeholder="Decision title (e.g. Choose DynamoDB vs PostgreSQL)"
                autoFocus
                required
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                rows={3}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Why was this decided? Mention constraints, rationale, trade-offs..."
                required
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Related Project (Optional)
                </label>
                <select
                  value={decisionProject}
                  onChange={(e) => setDecisionProject(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">(No Project)</option>
                  {hubState.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Knowledge Form */}
          {activeType === 'knowledge' && (
            <>
              <input
                type="text"
                value={knowledgeTopic}
                onChange={(e) => setKnowledgeTopic(e.target.value)}
                placeholder="Topic or Skill (e.g. Docker multi-stage builds)"
                autoFocus
                required
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <textarea
                rows={3}
                value={knowledgeNotes}
                onChange={(e) => setKnowledgeNotes(e.target.value)}
                placeholder="Notes, references, key commands..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Related Project (Optional)
                </label>
                <select
                  value={knowledgeProject}
                  onChange={(e) => setKnowledgeProject(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">(No Project)</option>
                  {hubState.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={closeQuickAction}
              className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
