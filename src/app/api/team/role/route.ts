import { NextRequest, NextResponse } from 'next/server';
import { updateProfileRole } from '@/lib/services/supabaseHubService';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 });
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const updated = await updateProfileRole(userId, role);
        return NextResponse.json(updated);
      } catch (err) {
        console.warn('Supabase role update error, fallback to local db:', err);
      }
    }

    // Local DB fallback
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
    return NextResponse.json({ success: true, userId, role });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
