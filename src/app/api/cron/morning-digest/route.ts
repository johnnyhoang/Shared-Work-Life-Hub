import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAllUsersWithNotificationSettings,
  getSupabaseTasks,
} from '@/lib/services/supabaseMutations';
import { dispatchMorningDigestToUser } from '@/lib/services/notificationService';
import { DigestPayload, Task } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleMorningDigest(request);
}

export async function POST(request: NextRequest) {
  return handleMorningDigest(request);
}

async function handleMorningDigest(request: NextRequest) {
  try {
    // Optional secret check for security (if CRON_SECRET is set)
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const secretParam = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      const isValid =
        authHeader === `Bearer ${cronSecret}` || secretParam === cronSecret;
      if (!isValid) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
    }

    const usersWithSettings = await getAllUsersWithNotificationSettings();
    const allTasks = await getSupabaseTasks({});

    const todayStr = new Date().toISOString().split('T')[0];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const dispatchReport: any[] = [];

    for (const { user, settings } of usersWithSettings) {
      if (!settings.morning_digest_enabled) {
        continue;
      }

      // Check if any notification channel is enabled
      const hasAnyChannel =
        (settings.zalo_enabled && (settings.zalo_webhook_url || settings.zalo_user_id)) ||
        (settings.slack_enabled && settings.slack_webhook_url) ||
        (settings.discord_enabled && settings.discord_webhook_url) ||
        (settings.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id) ||
        (settings.messenger_enabled && (settings.messenger_webhook_url || settings.messenger_psid)) ||
        (settings.email_enabled && (settings.email_address || user.email));


      if (!hasAnyChannel) {
        continue;
      }

      // Filter tasks assigned to user
      const userTasks = (allTasks as Task[]).filter((t) => t.assignee_id === user.id && t.status !== 'done');

      const overdueTasks = userTasks.filter((t) => t.due_date && t.due_date < todayStr);
      const dueTodayTasks = userTasks.filter((t) => t.due_date && t.due_date === todayStr);
      const newTasks = (allTasks as Task[]).filter(
        (t) => t.assignee_id === user.id && t.created_at >= oneDayAgo
      );

      const payload: DigestPayload = {
        userName: user.name || 'Thành viên',
        overdueTasks,
        dueTodayTasks,
        newTasks,
      };

      const results = await dispatchMorningDigestToUser(settings, payload);
      dispatchReport.push({
        userName: user.name,
        channelsSent: results,
        stats: {
          overdueCount: overdueTasks.length,
          dueTodayCount: dueTodayTasks.length,
          newTasksCount: newTasks.length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processedCount: dispatchReport.length,
      report: dispatchReport,
    });
  } catch (error: any) {
    console.error('Morning digest cron error:', error);
    return NextResponse.json(
      { success: false, error: 'unknown' },
      { status: 500 }
    );
  }
}
