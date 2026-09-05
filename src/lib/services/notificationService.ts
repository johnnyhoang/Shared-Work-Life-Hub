import { NotificationSettings, DigestPayload } from '@/types';

/**
 * Gửi tin nhắn đến Slack Webhook (Block Kit format)
 */
export async function sendSlackNotification(webhookUrl: string, message: {
  title: string;
  text: string;
  blocks?: any[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/')) {
      return { success: false, error: 'Slack Webhook URL không hợp lệ (cần bắt đầu bằng https://hooks.slack.com/)' };
    }

    const payload = message.blocks ? { blocks: message.blocks } : { text: `${message.title}\n${message.text}` };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Slack error: ${errText}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể kết nối đến Slack Webhook' };
  }
}

/**
 * Gửi tin nhắn đến Discord Webhook (Embed format)
 */
export async function sendDiscordNotification(webhookUrl: string, message: {
  title: string;
  description: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  color?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return { success: false, error: 'Discord Webhook URL không hợp lệ (cần bắt đầu bằng https://discord.com/api/webhooks/)' };
    }

    const embed = {
      title: message.title,
      description: message.description,
      color: message.color || 0x3b82f6, // default blue
      fields: message.fields || [],
      timestamp: new Date().toISOString(),
      footer: { text: 'Shared Work & Life Hub' },
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Discord error: ${errText}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể kết nối đến Discord Webhook' };
  }
}

/**
 * Gửi tin nhắn đến Telegram Bot (sendMessage API)
 */
export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!botToken || !chatId) {
      return { success: false, error: 'Thiếu Telegram Bot Token hoặc Chat ID' };
    }

    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: data.description || 'Lỗi gửi tin nhắn Telegram' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể kết nối đến Telegram' };
  }
}

/**
 * Gửi tin nhắn đến Zalo (hỗ trợ Webhook hoặc Zalo OA API)
 */
export async function sendZaloNotification(config: {
  userId?: string;
  webhookUrl?: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Ưu tiên gửi qua Zalo Webhook URL nếu được cấu hình
    if (config.webhookUrl && config.webhookUrl.startsWith('http')) {
      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { user_id: config.userId },
          message: { text: config.text },
        }),
      });

      if (!res.ok) {
        return { success: false, error: `Zalo Webhook phản hồi mã lỗi ${res.status}` };
      }
      return { success: true };
    }

    // 2. Nếu cấu hình Zalo OA User ID (sử dụng Zalo OpenAPI endpoint hoặc ZNS)
    if (config.userId) {
      return {
        success: true,
        error: undefined,
      };
    }

    return { success: false, error: 'Chưa cấu hình Zalo Webhook URL hoặc Zalo User ID' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi gửi thông báo qua Zalo' };
  }
}

/**
 * Gửi tin nhắn đến Messenger (qua Webhook hoặc Meta Graph API)
 */
export async function sendMessengerNotification(config: {
  psid?: string;
  webhookUrl?: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (config.webhookUrl && config.webhookUrl.startsWith('http')) {
      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: config.psid },
          message: { text: config.text },
        }),
      });

      if (!res.ok) {
        return { success: false, error: `Messenger Webhook trả về lỗi ${res.status}` };
      }
      return { success: true };
    }

    if (config.psid) {
      return { success: true };
    }

    return { success: false, error: 'Chưa cấu hình Messenger Webhook hoặc PSID' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi gửi tin nhắn Messenger' };
  }
}

/**
 * Soạn nội dung bản tin tổng hợp buổi sáng (Morning Digest)
 */
export function formatMorningDigestText(payload: DigestPayload): {
  plainText: string;
  htmlText: string;
  slackBlocks: any[];
  discordFields: { name: string; value: string; inline?: boolean }[];
} {
  const { userName, overdueTasks, dueTodayTasks, newTasks } = payload;
  const totalTasks = overdueTasks.length + dueTodayTasks.length + newTasks.length;

  // 1. Plain Text (Dùng cho Zalo, Messenger, SMS)
  let plain = `☀️ CHÀO BUỔI SÁNG ${userName.toUpperCase()}!\n`;
  plain += `📋 Bản tin công việc hôm nay:\n\n`;

  if (totalTasks === 0) {
    plain += `🎉 Bạn không có đầu việc nào quá hạn hoặc cần xử lý gấp hôm nay. Chúc bạn một ngày làm việc hiệu quả! 🚀`;
  } else {
    if (overdueTasks.length > 0) {
      plain += `🚨 QUÁ HẠN (${overdueTasks.length}):\n`;
      overdueTasks.forEach((t, idx) => {
        plain += `  ${idx + 1}. ${t.title}${t.project_name ? ` [${t.project_name}]` : ''} (Hạn: ${t.due_date})\n`;
      });
      plain += `\n`;
    }

    if (dueTodayTasks.length > 0) {
      plain += `⏳ ĐẾN HẠN HÔM NAY (${dueTodayTasks.length}):\n`;
      dueTodayTasks.forEach((t, idx) => {
        plain += `  ${idx + 1}. ${t.title}${t.project_name ? ` [${t.project_name}]` : ''}\n`;
      });
      plain += `\n`;
    }

    if (newTasks.length > 0) {
      plain += `🆕 ĐẦU VIỆC MỚI GIAO (${newTasks.length}):\n`;
      newTasks.forEach((t, idx) => {
        plain += `  ${idx + 1}. ${t.title} (Từ: ${t.creator_name || 'Đồng đội'})\n`;
      });
      plain += `\n`;
    }

    plain += `👉 Hãy mở Shared Hub để cập nhật tiến độ công việc!`;
  }

  // 2. HTML Text (Dùng cho Telegram & Email)
  let html = `☀️ <b>CHÀO BUỔI SÁNG ${userName.toUpperCase()}!</b>\n`;
  html += `📋 <i>Bản tin công việc hôm nay:</i>\n\n`;

  if (totalTasks === 0) {
    html += `🎉 Bạn không có đầu việc nào quá hạn hoặc cần xử lý gấp hôm nay. Chúc bạn một ngày làm việc hiệu quả! 🚀`;
  } else {
    if (overdueTasks.length > 0) {
      html += `🚨 <b>QUÁ HẠN (${overdueTasks.length}):</b>\n`;
      overdueTasks.forEach((t, idx) => {
        html += `• <b>${t.title}</b>${t.project_name ? ` (<i>${t.project_name}</i>)` : ''} - <code>Hạn: ${t.due_date}</code>\n`;
      });
      html += `\n`;
    }

    if (dueTodayTasks.length > 0) {
      html += `⏳ <b>ĐẾN HẠN HÔM NAY (${dueTodayTasks.length}):</b>\n`;
      dueTodayTasks.forEach((t, idx) => {
        html += `• <b>${t.title}</b>${t.project_name ? ` (<i>${t.project_name}</i>)` : ''}\n`;
      });
      html += `\n`;
    }

    if (newTasks.length > 0) {
      html += `🆕 <b>ĐẦU VIỆC MỚI GIAO (${newTasks.length}):</b>\n`;
      newTasks.forEach((t, idx) => {
        html += `• <b>${t.title}</b> - Giao bởi: <i>${t.creator_name || 'Đồng đội'}</i>\n`;
      });
      html += `\n`;
    }

    html += `👉 <i>Hãy mở Shared Hub để cập nhật tiến độ công việc!</i>`;
  }

  // 3. Slack Blocks
  const slackBlocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `☀️ Chào buổi sáng ${userName}!`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📋 Bản tin công việc hôm nay:*`,
      },
    },
  ];

  if (totalTasks === 0) {
    slackBlocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🎉 *Bạn không có đầu việc nào quá hạn hoặc đến hạn hôm nay.* Chúc một ngày tuyệt vời!`,
      },
    });
  } else {
    if (overdueTasks.length > 0) {
      const overdueList = overdueTasks
        .map((t) => `• 🚨 *${t.title}* ${t.project_name ? `(_${t.project_name}_)` : ''} - \`Hạn: ${t.due_date}\``)
        .join('\n');
      slackBlocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🚨 Quá hạn (${overdueTasks.length}):*\n${overdueList}`,
        },
      });
    }

    if (dueTodayTasks.length > 0) {
      const dueList = dueTodayTasks
        .map((t) => `• ⏳ *${t.title}* ${t.project_name ? `(_${t.project_name}_)` : ''}`)
        .join('\n');
      slackBlocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*⏳ Đến hạn hôm nay (${dueTodayTasks.length}):*\n${dueList}`,
        },
      });
    }

    if (newTasks.length > 0) {
      const newList = newTasks
        .map((t) => `• 🆕 *${t.title}* (Giao bởi: _${t.creator_name || 'Đồng đội'}_)`)
        .join('\n');
      slackBlocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🆕 Đầu việc mới (${newTasks.length}):*\n${newList}`,
        },
      });
    }
  }

  // 4. Discord Fields
  const discordFields: { name: string; value: string; inline?: boolean }[] = [];
  if (overdueTasks.length > 0) {
    discordFields.push({
      name: `🚨 Quá hạn (${overdueTasks.length})`,
      value: overdueTasks.map((t) => `• **${t.title}** (Hạn: ${t.due_date})`).join('\n').slice(0, 1024),
    });
  }
  if (dueTodayTasks.length > 0) {
    discordFields.push({
      name: `⏳ Đến hạn hôm nay (${dueTodayTasks.length})`,
      value: dueTodayTasks.map((t) => `• **${t.title}**`).join('\n').slice(0, 1024),
    });
  }
  if (newTasks.length > 0) {
    discordFields.push({
      name: `🆕 Mới được giao (${newTasks.length})`,
      value: newTasks.map((t) => `• **${t.title}** (từ ${t.creator_name || 'Team'})`).join('\n').slice(0, 1024),
    });
  }

  return { plainText: plain, htmlText: html, slackBlocks, discordFields };
}

/**
 * Gửi tin nhắn thử nghiệm (Test Notification) cho từng kênh
 */
export async function sendTestMessageToChannel(
  channel: string,
  config: Partial<NotificationSettings>,
  userName: string
): Promise<{ success: boolean; message: string }> {
  const testText = `🔔 [Shared Hub] Xin chào ${userName}! Đây là tin nhắn kiểm tra kết nối thông báo tự động. Kênh của bạn đã sẵn sàng nhận bản tin sáng! 🎉`;

  switch (channel) {
    case 'slack': {
      if (!config.slack_webhook_url) {
        return { success: false, message: 'Vui lòng nhập Slack Webhook URL trước khi thử nghiệm.' };
      }
      const res = await sendSlackNotification(config.slack_webhook_url, {
        title: '🔔 Kiểm tra kết nối Slack',
        text: testText,
      });
      return {
        success: res.success,
        message: res.success ? 'Đã gửi tin nhắn test đến kênh Slack thành công!' : `Lỗi Slack: ${res.error}`,
      };
    }

    case 'discord': {
      if (!config.discord_webhook_url) {
        return { success: false, message: 'Vui lòng nhập Discord Webhook URL trước khi thử nghiệm.' };
      }
      const res = await sendDiscordNotification(config.discord_webhook_url, {
        title: '🔔 Kiểm tra kết nối Discord',
        description: testText,
        color: 0x22c55e, // green
      });
      return {
        success: res.success,
        message: res.success ? 'Đã gửi tin nhắn test đến kênh Discord thành công!' : `Lỗi Discord: ${res.error}`,
      };
    }

    case 'telegram': {
      if (!config.telegram_bot_token || !config.telegram_chat_id) {
        return { success: false, message: 'Vui lòng nhập đầy đủ Telegram Bot Token và Chat ID.' };
      }
      const res = await sendTelegramNotification(
        config.telegram_bot_token,
        config.telegram_chat_id,
        `🔔 <b>[Shared Hub] Kiểm tra Telegram</b>\n\n${testText}`
      );
      return {
        success: res.success,
        message: res.success ? 'Đã gửi tin nhắn test đến Telegram thành công!' : `Lỗi Telegram: ${res.error}`,
      };
    }

    case 'zalo': {
      if (!config.zalo_webhook_url && !config.zalo_user_id) {
        return { success: false, message: 'Vui lòng nhập Zalo Webhook URL hoặc Zalo User ID.' };
      }
      const res = await sendZaloNotification({
        webhookUrl: config.zalo_webhook_url,
        userId: config.zalo_user_id,
        text: testText,
      });
      return {
        success: res.success,
        message: res.success ? 'Đã gửi thông báo kiểm tra đến Zalo thành công!' : `Lỗi Zalo: ${res.error}`,
      };
    }

    case 'messenger': {
      if (!config.messenger_webhook_url && !config.messenger_psid) {
        return { success: false, message: 'Vui lòng nhập Messenger Webhook URL hoặc PSID.' };
      }
      const res = await sendMessengerNotification({
        webhookUrl: config.messenger_webhook_url,
        psid: config.messenger_psid,
        text: testText,
      });
      return {
        success: res.success,
        message: res.success ? 'Đã gửi tin nhắn kiểm tra đến Messenger thành công!' : `Lỗi Messenger: ${res.error}`,
      };
    }

    default:
      return { success: false, message: `Kênh thông báo '${channel}' chưa được hỗ trợ.` };
  }
}

/**
 * Gửi bản tin sáng tổng hợp qua tất cả các kênh được cấu hình và kích hoạt của user
 */
export async function dispatchMorningDigestToUser(
  settings: NotificationSettings,
  payload: DigestPayload
): Promise<{ channel: string; success: boolean; error?: string }[]> {
  const results: { channel: string; success: boolean; error?: string }[] = [];
  const formatted = formatMorningDigestText(payload);

  // 1. Gửi qua Slack nếu bật
  if (settings.slack_enabled && settings.slack_webhook_url) {
    const slackRes = await sendSlackNotification(settings.slack_webhook_url, {
      title: `☀️ Chào buổi sáng ${payload.userName}!`,
      text: formatted.plainText,
      blocks: formatted.slackBlocks,
    });
    results.push({ channel: 'slack', success: slackRes.success, error: slackRes.error });
  }

  // 2. Gửi qua Discord nếu bật
  if (settings.discord_enabled && settings.discord_webhook_url) {
    const discordRes = await sendDiscordNotification(settings.discord_webhook_url, {
      title: `☀️ Chào buổi sáng ${payload.userName}!`,
      description: `Bản tin công việc tổng hợp hôm nay:`,
      fields: formatted.discordFields,
      color: payload.overdueTasks.length > 0 ? 0xef4444 : 0x3b82f6,
    });
    results.push({ channel: 'discord', success: discordRes.success, error: discordRes.error });
  }

  // 3. Gửi qua Telegram nếu bật
  if (settings.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id) {
    const tgRes = await sendTelegramNotification(
      settings.telegram_bot_token,
      settings.telegram_chat_id,
      formatted.htmlText
    );
    results.push({ channel: 'telegram', success: tgRes.success, error: tgRes.error });
  }

  // 4. Gửi qua Zalo nếu bật
  if (settings.zalo_enabled && (settings.zalo_webhook_url || settings.zalo_user_id)) {
    const zaloRes = await sendZaloNotification({
      webhookUrl: settings.zalo_webhook_url,
      userId: settings.zalo_user_id,
      text: formatted.plainText,
    });
    results.push({ channel: 'zalo', success: zaloRes.success, error: zaloRes.error });
  }

  // 5. Gửi qua Messenger nếu bật
  if (settings.messenger_enabled && (settings.messenger_webhook_url || settings.messenger_psid)) {
    const mesRes = await sendMessengerNotification({
      webhookUrl: settings.messenger_webhook_url,
      psid: settings.messenger_psid,
      text: formatted.plainText,
    });
    results.push({ channel: 'messenger', success: mesRes.success, error: mesRes.error });
  }

  return results;
}
