'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/lib/i18n';
import { AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Tone = 'danger' | 'default';

interface BaseOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  tone?: Tone;
  icon?: LucideIcon;
}

interface PromptOptions extends BaseOptions {
  label?: string;
  placeholder?: string;
  initialValue?: string;
}

type Request =
  | ({ mode: 'confirm' } & BaseOptions)
  | ({ mode: 'prompt' } & PromptOptions);

interface DialogContextValue {
  /** Replaces window.confirm(). Resolves true when the user confirms. */
  confirm: (options: BaseOptions) => Promise<boolean>;
  /** Replaces window.prompt(). Resolves the trimmed text, or null when cancelled. */
  promptText: (options: PromptOptions) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [request, setRequest] = useState<Request | null>(null);
  const [value, setValue] = useState('');
  const resolverRef = useRef<((result: never) => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const settle = useCallback((result: boolean | string | null) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setRequest(null);
    setValue('');
    resolve?.(result as never);
  }, []);

  const confirm = useCallback((options: BaseOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve as (result: never) => void;
      setRequest({ mode: 'confirm', ...options });
    });
  }, []);

  const promptText = useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      resolverRef.current = resolve as (result: never) => void;
      setValue(options.initialValue ?? '');
      setRequest({ mode: 'prompt', ...options });
    });
  }, []);

  // Escape closes, matching the native dialogs these replace.
  useEffect(() => {
    if (!request) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        settle(request.mode === 'prompt' ? null : false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [request, settle]);

  // Native dialogs take focus; keep that so keyboard users are not stranded.
  useEffect(() => {
    if (!request) return;
    const target = request.mode === 'prompt' ? inputRef.current : confirmButtonRef.current;
    target?.focus();
    if (request.mode === 'prompt') inputRef.current?.select();
  }, [request]);

  const cancel = () => settle(request?.mode === 'prompt' ? null : false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;
    if (request.mode === 'prompt') {
      const trimmed = value.trim();
      if (!trimmed) return;
      settle(trimmed);
    } else {
      settle(true);
    }
  };

  const tone: Tone = request?.tone ?? 'danger';
  const Icon = request?.icon ?? AlertTriangle;

  const accent =
    tone === 'danger'
      ? {
          badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
          button: 'bg-rose-600 hover:bg-rose-700',
          ring: 'focus:ring-rose-500',
        }
      : {
          badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-700',
          ring: 'focus:ring-blue-500',
        };

  return (
    <DialogContext.Provider value={{ confirm, promptText }}>
      {children}

      {request
        ? createPortal(
            <div
              className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
              onClick={cancel}
              role="dialog"
              aria-modal="true"
              aria-label={request.title}
            >
              <form
                onSubmit={submit}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-150"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent.badge}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {request.title}
                    </h2>
                    {request.message && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {request.message}
                      </p>
                    )}
                  </div>
                </div>

                {request.mode === 'prompt' && (
                  <div className="space-y-1.5">
                    {request.label && (
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {request.label}
                      </label>
                    )}
                    <input
                      ref={inputRef}
                      type="text"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => {
                        // Enter confirms, matching window.prompt(). Explicit rather
                        // than relying on implicit form submission.
                        if (e.key === 'Enter') submit(e);
                      }}
                      placeholder={request.placeholder}
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition ${accent.ring}`}
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancel}
                    className="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    ref={confirmButtonRef}
                    type="submit"
                    disabled={request.mode === 'prompt' && !value.trim()}
                    className={`px-4 py-2 text-sm font-bold text-white rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${accent.button}`}
                  >
                    {request.confirmLabel ?? t.common.confirm}
                  </button>
                </div>
              </form>
            </div>,
            document.body
          )
        : null}
    </DialogContext.Provider>
  );
}

function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useConfirm/usePromptText must be used within a ConfirmProvider');
  }
  return context;
}

/** Drop-in replacement for window.confirm(). */
export function useConfirm() {
  return useDialog().confirm;
}

/** Drop-in replacement for window.prompt(). */
export function usePromptText() {
  return useDialog().promptText;
}

export type { BaseOptions as ConfirmOptions, PromptOptions };
