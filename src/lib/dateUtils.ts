import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export function formatRelativeTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    if (isYesterday(date)) return 'Yesterday';

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return format(date, 'EEEE'); // e.g. "Monday"
    }

    return format(date, 'MMM d'); // e.g. "Sep 2"
  } catch {
    return 'Recently';
  }
}

export function formatDueDate(dateString: string | null): { text: string; isOverdue: boolean; isToday: boolean } {
  if (!dateString) return { text: 'No due date', isOverdue: false, isToday: false };

  try {
    const date = parseISO(dateString.includes('T') ? dateString : `${dateString}T23:59:59Z`);
    const now = new Date();
    
    // Compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const isDueToday = today.getTime() === dueDay.getTime();
    const isOverdue = dueDay.getTime() < today.getTime();

    if (isDueToday) {
      return { text: 'Today', isOverdue: false, isToday: true };
    }
    if (isYesterday(date)) {
      return { text: 'Yesterday (Overdue)', isOverdue: true, isToday: false };
    }

    const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      return { text: 'Tomorrow', isOverdue: false, isToday: false };
    }
    if (diffDays > 1 && diffDays <= 7) {
      return { text: `In ${diffDays} days (${format(date, 'EEE')})`, isOverdue: false, isToday: false };
    }
    if (isOverdue) {
      return { text: `${format(date, 'MMM d')} (Overdue)`, isOverdue: true, isToday: false };
    }

    return { text: format(date, 'MMM d, yyyy'), isOverdue: false, isToday: false };
  } catch {
    return { text: dateString, isOverdue: false, isToday: false };
  }
}

export function getLocalTimeInTimezone(timezone: string): { time: string; period: string; isNight: boolean } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    const parts = formatter.formatToParts(now);
    const hourPart = parts.find((p) => p.type === 'hour')?.value || '12';
    const minutePart = parts.find((p) => p.type === 'minute')?.value || '00';
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value || 'AM';

    const hour24Formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    const hour24 = parseInt(hour24Formatter.format(now), 10);
    const isNight = hour24 < 7 || hour24 >= 22;

    return {
      time: `${hourPart}:${minutePart}`,
      period: dayPeriod,
      isNight,
    };
  } catch {
    return { time: '--:--', period: '', isNight: false };
  }
}
