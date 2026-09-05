import { NextRequest, NextResponse } from 'next/server';
import { updateProfileRole } from '@/lib/services/supabaseHubService';
import { UserRole } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role || !['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const updated = await updateProfileRole(userId, role as UserRole);
    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Failed to update team role:', error);
    return NextResponse.json({ error: 'member_update_failed' }, { status: 500 });
  }
}
