'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserAvatar } from './UserAvatar';
import { AtSign, Check, User } from 'lucide-react';

export interface MentionUser {
  id: string;
  name: string;
  avatar?: string | null;
  email?: string;
  role?: string;
}

interface UseMentionProps {
  users: MentionUser[];
  onSelectUser?: (user: MentionUser) => void;
}

export function useMention({ users, onSelectUser }: UseMentionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredUsers = users.filter((u) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(q);
    const emailMatch = u.email?.toLowerCase().includes(q);
    return nameMatch || emailMatch;
  });

  const checkMention = useCallback((text: string, cursorPos: number) => {
    const textBeforeCursor = text.slice(0, cursorPos);
    const match = textBeforeCursor.match(/(?:^|\s)@([^\s@]*)$/);

    if (match && match.index !== undefined) {
      const fullMatch = match[0];
      const atOffset = fullMatch.startsWith(' ') ? match.index + 1 : match.index;
      setMentionStartIndex(atOffset);
      setQuery(match[1]);
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setIsOpen(false);
      setMentionStartIndex(-1);
      setQuery('');
    }
  }, []);

  const applyMention = useCallback(
    (
      user: MentionUser,
      currentText: string,
      cursorPos: number,
      setText: (newText: string) => void,
      inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
    ) => {
      if (mentionStartIndex < 0) return;

      const beforeMention = currentText.slice(0, mentionStartIndex);
      const afterCursor = currentText.slice(cursorPos);
      const mentionText = `@${user.name} `;
      const newText = beforeMention + mentionText + afterCursor;

      setText(newText);
      setIsOpen(false);
      setMentionStartIndex(-1);
      setQuery('');

      if (onSelectUser) {
        onSelectUser(user);
      }

      // Restore focus and cursor
      if (inputRef && inputRef.current) {
        const newCursorPos = beforeMention.length + mentionText.length;
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        }, 10);
      }
    },
    [mentionStartIndex, onSelectUser]
  );

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      currentText: string,
      cursorPos: number,
      setText: (newText: string) => void,
      inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
    ) => {
      if (!isOpen || filteredUsers.length === 0) return false;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
        return true;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        return true;
      }

      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = filteredUsers[selectedIndex];
        if (selected) {
          applyMention(selected, currentText, cursorPos, setText, inputRef);
        }
        return true;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        return true;
      }

      return false;
    },
    [isOpen, filteredUsers, selectedIndex, applyMention]
  );

  return {
    isOpen,
    query,
    filteredUsers,
    selectedIndex,
    checkMention,
    applyMention,
    handleKeyDown,
    closeMention: () => setIsOpen(false),
  };
}

interface MentionDropdownProps {
  users: MentionUser[];
  selectedIndex: number;
  onSelect: (user: MentionUser) => void;
  className?: string;
}

export function MentionDropdown({
  users,
  selectedIndex,
  onSelect,
  className = '',
}: MentionDropdownProps) {
  if (users.length === 0) {
    return (
      <div
        className={`absolute z-50 mt-1 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 text-xs text-zinc-500 dark:text-zinc-400 text-center ${className}`}
      >
        Không tìm thấy thành viên phù hợp
      </div>
    );
  }

  return (
    <div
      className={`absolute z-50 mt-1 max-h-56 w-72 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-1.5 space-y-1 animate-in fade-in slide-from-top-2 duration-150 ${className}`}
    >
      <div className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
        <AtSign className="w-3 h-3 text-blue-500" />
        <span>Gợi ý thành viên</span>
      </div>
      {users.map((user, idx) => {
        const isHighlighted = idx === selectedIndex;
        return (
          <button
            key={user.id}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(user);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition text-xs font-semibold ${
              isHighlighted
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <UserAvatar avatar={user.avatar} name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="truncate font-bold text-zinc-900 dark:text-zinc-100">
                {user.name}
              </div>
              {user.email && (
                <div className="truncate text-xs text-zinc-400 font-normal">
                  {user.email}
                </div>
              )}
            </div>
            {isHighlighted && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

interface AssigneePickerChipsProps {
  users: MentionUser[];
  currentUserId: string;
  selectedAssigneeId: string;
  onSelectAssignee: (userId: string) => void;
  label?: string;
  className?: string;
}

export function AssigneePickerChips({
  users,
  currentUserId,
  selectedAssigneeId,
  onSelectAssignee,
  label,
  className = '',
}: AssigneePickerChipsProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-blue-500" />
          <span>{label}</span>
        </label>
      )}

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {users.map((u) => {
          const isSelected = (selectedAssigneeId || currentUserId) === u.id;
          const isSelf = u.id === currentUserId;

          return (
            <button
              key={u.id}
              type="button"
              onClick={() => onSelectAssignee(u.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs scale-[1.02]'
                  : 'bg-zinc-50 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:border-zinc-600'
              }`}
            >
              <UserAvatar
                avatar={u.avatar}
                name={u.name}
                size="sm"
                className={isSelected ? 'ring-1 ring-white/50' : ''}
              />
              <span className="truncate max-w-[120px]">
                {u.name} {isSelf ? '(Tôi)' : ''}
              </span>
              {isSelected && <Check className="w-3 h-3 ml-0.5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
