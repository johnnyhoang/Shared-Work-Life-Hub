'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const { t, language, setLanguage } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setErrorMsg('');
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setIsSigningIn(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to Google Auth');
      setIsSigningIn(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsSigningIn(true);
      setErrorMsg('');
      const supabase = createClient();

      if (isSignUpMode) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        alert(language === 'vi' ? 'Đã gửi email xác nhận. Vui lòng kiểm tra hòm thư!' : 'Confirmation email sent. Please check your inbox!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = '/';
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Authentication error');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 sm:p-6">
      {/* Top Bar: Language Switcher */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-base tracking-tight">Hub</span>
        </div>

        <button
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs"
        >
          <span>{language === 'vi' ? '🇻🇳 VN' : '🇬🇧 EN'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            {t.auth.welcome}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t.auth.tagline}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-zinc-300 dark:border-zinc-700 text-xs font-bold shadow-xs active:scale-98 transition"
        >
          {isSigningIn ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{t.auth.signInWithGoogle}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            {t.auth.or}
          </span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              {t.auth.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@team.com"
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              {t.auth.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
          >
            {isSigningIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isSignUpMode ? 'Đăng ký tài khoản' : t.auth.signInEmail}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsSignUpMode(!isSignUpMode)}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isSignUpMode
                ? 'Đã có tài khoản? Đăng nhập ngay'
                : 'Chưa có tài khoản? Đăng ký với Email'}
            </button>
          </div>
        </form>

        <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
          {t.auth.signInNote}
        </p>
      </div>

      {/* Footer info */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-zinc-400">
        Shared Work & Life Hub • Powered by Supabase PostgreSQL
      </div>
    </div>
  );
}
