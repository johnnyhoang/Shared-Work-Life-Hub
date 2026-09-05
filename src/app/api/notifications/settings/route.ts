import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getUserNotificationSettings,
  upsertUserNotificationSettings,
} from '@/lib/services/supabaseMutations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId') || user?.id;

    if (!targetUserId) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const settings = await getUserNotificationSettings(targetUserId);
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Failed to get notification settings:', error);
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const targetUserId = body.user_id || user?.id;

    if (!targetUserId) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const saved = await upsertUserNotificationSettings(targetUserId, body);
    return NextResponse.json(saved);
  } catch (error: any) {
    console.error('Failed to save notification settings:', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
}
