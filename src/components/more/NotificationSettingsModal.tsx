'use client';

import React, { useState, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { errorText } from '@/lib/errorMessages';
import { NotificationSettings } from '@/types';
import {
  X,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  MessageSquare,
  Bot,
  Hash,
  Sparkles,
  Mail,
} from 'lucide-react';


interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const { hubState } = useHub();
  const { t } = useI18n();

  const [settings, setSettings] = useState<NotificationSettings>({
    user_id: '',
    morning_digest_enabled: true,
    digest_time: '08:00',
    notify_on_new_task: true,
    notify_on_due_today: true,
    notify_on_overdue: true,
    zalo_enabled: false,
    zalo_user_id: '',
    zalo_webhook_url: '',
    slack_enabled: false,
    slack_webhook_url: '',
    discord_enabled: false,
    discord_webhook_url: '',
    telegram_enabled: false,
    telegram_bot_token: '',
    telegram_chat_id: '',
    messenger_enabled: false,
    messenger_psid: '',
    messenger_webhook_url: '',
    email_enabled: false,
    email_address: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ channel: string; success: boolean; message: string } | null>(null);

  const currentUser = hubState?.currentUser;

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      fetchSettings();
    }
  }, [isOpen, currentUser?.id]);

  const fetchSettings = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications/settings?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser?.id) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          user_id: currentUser.id,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestChannel = async (channel: string) => {
    setTestingChannel(channel);
    setTestResult(null);
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          config: settings,
          userName: currentUser?.name || 'Thành viên',
        }),
      });
      const data = await res.json();
      setTestResult({
        channel,
        success: data.success,
        message: data.success
          ? t.notifications.testSuccess
          : errorText(t.errors, data.message),
      });
    } catch (err: any) {
      setTestResult({
        channel,
        success: false,
        message: errorText(t.errors, err),
      });
    } finally {
      setTestingChannel(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {t.notifications.title}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {currentUser?.name} • {t.notifications.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs">{t.common.saving}</p>
            </div>
          ) : (
            <>
              {/* 1. Morning Digest Card */}
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                        {t.notifications.morningDigest}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      {t.notifications.morningDigestDesc}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.morning_digest_enabled}
                      onChange={(e) =>
                        setSettings({ ...settings, morning_digest_enabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.morning_digest_enabled && (
                  <div className="pt-2 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.notifications.digestTime}:</span>
                    </div>
                    <select
                      value={settings.digest_time}
                      onChange={(e) => setSettings({ ...settings, digest_time: e.target.value })}
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="07:00">07:00 AM</option>
                      <option value="07:30">07:30 AM</option>
                      <option value="08:00">08:00 AM ({t.notifications.recommended})</option>
                      <option value="08:30">08:30 AM</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="09:30">09:30 AM</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 2. Notification Triggers Checkboxes */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {t.notifications.notifyTypes}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/50 transition">
                    <input
                      type="checkbox"
                      checked={settings.notify_on_overdue}
                      onChange={(e) =>
                        setSettings({ ...settings, notify_on_overdue: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      🚨 {t.notifications.overdue}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/50 transition">
                    <input
                      type="checkbox"
                      checked={settings.notify_on_due_today}
                      onChange={(e) =>
                        setSettings({ ...settings, notify_on_due_today: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      ⏳ {t.notifications.dueToday}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/50 transition">
                    <input
                      type="checkbox"
                      checked={settings.notify_on_new_task}
                      onChange={(e) =>
                        setSettings({ ...settings, notify_on_new_task: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      🆕 {t.notifications.newTask}
                    </span>
                  </label>
                </div>
              </div>

              {/* 3. Channels Integrations List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {t.notifications.channels}
                </h3>

                {/* ZALO */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        Z
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {t.notifications.zaloTitle}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            VN
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{t.notifications.zaloDesc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.zalo_enabled}
                        onChange={(e) => setSettings({ ...settings, zalo_enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-4.5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.zalo_enabled && (
                    <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Zalo Webhook URL / Endpoint
                        </label>
                        <input
                          type="text"
                          value={settings.zalo_webhook_url}
                          onChange={(e) =>
                            setSettings({ ...settings, zalo_webhook_url: e.target.value })
                          }
                          placeholder={t.notifications.webhookUrlPlaceholder}
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Zalo User ID (UID / OA)
                        </label>
                        <input
                          type="text"
                          value={settings.zalo_user_id}
                          onChange={(e) =>
                            setSettings({ ...settings, zalo_user_id: e.target.value })
                          }
                          placeholder={t.notifications.userIdPlaceholder}
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleTestChannel('zalo')}
                          disabled={testingChannel === 'zalo'}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 transition disabled:opacity-50"
                        >
                          {testingChannel === 'zalo' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>{testingChannel === 'zalo' ? t.notifications.testing : t.notifications.testBtn}</span>
                        </button>
                        {testResult?.channel === 'zalo' && (
                          <span
                            className={`text-xs font-medium ${
                              testResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {testResult.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* SLACK */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {t.notifications.slackTitle}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            US / HQ
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{t.notifications.slackDesc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.slack_enabled}
                        onChange={(e) =>
                          setSettings({ ...settings, slack_enabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-4.5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {settings.slack_enabled && (
                    <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Slack Incoming Webhook URL
                        </label>
                        <input
                          type="text"
                          value={settings.slack_webhook_url}
                          onChange={(e) =>
                            setSettings({ ...settings, slack_webhook_url: e.target.value })
                          }
                          placeholder="https://hooks.slack.com/services/..."
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleTestChannel('slack')}
                          disabled={testingChannel === 'slack'}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 transition disabled:opacity-50"
                        >
                          {testingChannel === 'slack' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>{testingChannel === 'slack' ? t.notifications.testing : t.notifications.testBtn}</span>
                        </button>
                        {testResult?.channel === 'slack' && (
                          <span
                            className={`text-xs font-medium ${
                              testResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {testResult.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* DISCORD */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {t.notifications.discordTitle}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            Tech
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{t.notifications.discordDesc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.discord_enabled}
                        onChange={(e) =>
                          setSettings({ ...settings, discord_enabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-4.5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {settings.discord_enabled && (
                    <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Discord Channel Webhook URL
                        </label>
                        <input
                          type="text"
                          value={settings.discord_webhook_url}
                          onChange={(e) =>
                            setSettings({ ...settings, discord_webhook_url: e.target.value })
                          }
                          placeholder="https://discord.com/api/webhooks/..."
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleTestChannel('discord')}
                          disabled={testingChannel === 'discord'}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 transition disabled:opacity-50"
                        >
                          {testingChannel === 'discord' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>{testingChannel === 'discord' ? t.notifications.testing : t.notifications.testBtn}</span>
                        </button>
                        {testResult?.channel === 'discord' && (
                          <span
                            className={`text-xs font-medium ${
                              testResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {testResult.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* TELEGRAM */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-sky-500 text-white font-bold text-xs flex items-center justify-center">
                        <Send className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {t.notifications.telegramTitle}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                            Bot
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{t.notifications.telegramDesc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.telegram_enabled}
                        onChange={(e) =>
                          setSettings({ ...settings, telegram_enabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-4.5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>

                  {settings.telegram_enabled && (
                    <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Telegram Bot Token
                        </label>
                        <input
                          type="password"
                          value={settings.telegram_bot_token}
                          onChange={(e) =>
                            setSettings({ ...settings, telegram_bot_token: e.target.value })
                          }
                          placeholder={t.notifications.botTokenPlaceholder}
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Telegram Chat ID
                        </label>
                        <input
                          type="text"
                          value={settings.telegram_chat_id}
                          onChange={(e) =>
                            setSettings({ ...settings, telegram_chat_id: e.target.value })
                          }
                          placeholder={t.notifications.chatIdPlaceholder}
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleTestChannel('telegram')}
                          disabled={testingChannel === 'telegram'}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 transition disabled:opacity-50"
                        >
                          {testingChannel === 'telegram' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>{testingChannel === 'telegram' ? t.notifications.testing : t.notifications.testBtn}</span>
                        </button>
                        {testResult?.channel === 'telegram' && (
                          <span
                            className={`text-xs font-medium ${
                              testResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {testResult.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* MESSENGER */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {t.notifications.messengerTitle}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{t.notifications.messengerDesc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.messenger_enabled}
                        onChange={(e) =>
                          setSettings({ ...settings, messenger_enabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-4.5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>

                  {settings.messenger_enabled && (
                    <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          Messenger Webhook URL / Endpoint
                        </label>
                        <input
                          type="text"
                          value={settings.messenger_webhook_url}
                          onChange={(e) =>
                            setSettings({ ...settings, messenger_webhook_url: e.target.value })
                          }
                          placeholder={t.notifications.webhookUrlPlaceholder}
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleTestChannel('messenger')}
                          disabled={testingChannel === 'messenger'}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 transition disabled:opacity-50"
                        >
                          {testingChannel === 'messenger' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>{testingChannel === 'messenger' ? t.notifications.testing : t.notifications.testBtn}</span>
                        </button>
                        {testResult?.channel === 'messenger' && (
                          <span
                            className={`text-xs font-medium ${
                              testResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {testResult.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* EMAIL */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {t.notifications.emailDigestTitle}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {t.notifications.easy}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">
                          {t.notifications.emailDigestDesc}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.email_enabled}
                        onChange={(e) =>
                          setSettings({ ...settings, email_enabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-4.5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {settings.email_enabled && (
                    <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          {t.notifications.recipientEmail}
                        </label>
                        <input
                          type="email"
                          value={settings.email_address || currentUser?.email || ''}
                          onChange={(e) =>
                            setSettings({ ...settings, email_address: e.target.value })
                          }
                          placeholder={currentUser?.email || 'your-email@example.com'}
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleTestChannel('email')}
                          disabled={testingChannel === 'email'}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 transition disabled:opacity-50"
                        >
                          {testingChannel === 'email' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>{testingChannel === 'email' ? t.notifications.testing : t.notifications.testBtn}</span>
                        </button>
                        {testResult?.channel === 'email' && (
                          <span
                            className={`text-xs font-medium ${
                              testResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {testResult.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>


        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.notifications.saveSuccess}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              {t.common.close}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? t.common.saving : t.notifications.saveSettings}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
