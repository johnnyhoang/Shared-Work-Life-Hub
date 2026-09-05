import { NextRequest, NextResponse } from 'next/server';
import { sendTestMessageToChannel } from '@/lib/services/notificationService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel, config, userName } = body;

    if (!channel) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const result = await sendTestMessageToChannel(
      channel,
      config || {},
      userName || 'Thành viên'
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Test notification failed:', error);
    return NextResponse.json(
      { success: false, message: 'notify_failed' },
      { status: 500 }
    );
  }
}
