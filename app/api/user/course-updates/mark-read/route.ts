import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db/client';
import { markUpdateAsRead, markAllUpdatesAsRead } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDbConfigured()) {
      return NextResponse.json({ success: true });
    }

    const body = await request.json();
    const { courseUpdateId, programDocumentId } = body;

    if (programDocumentId) {
      // Mark all updates for a program as read
      await markAllUpdatesAsRead(userId, programDocumentId);
    } else if (courseUpdateId) {
      // Mark a single update as read
      await markUpdateAsRead(userId, courseUpdateId);
    } else {
      return NextResponse.json(
        { error: 'Provide courseUpdateId or programDocumentId' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking update as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark update as read' },
      { status: 500 }
    );
  }
}
