import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db/client';
import { getUserEnrollments, getUnreadUpdatesForUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDbConfigured()) {
      return NextResponse.json({ updates: [] });
    }

    // Optional filter by program
    const { searchParams } = new URL(request.url);
    const programDocumentId = searchParams.get('programDocumentId');

    let programIds: string[];

    if (programDocumentId) {
      programIds = [programDocumentId];
    } else {
      // Get all enrolled programs for this user
      const userEnrollments = await getUserEnrollments(userId);
      programIds = userEnrollments.map((e) => e.programDocumentId);
    }

    const updates = await getUnreadUpdatesForUser(userId, programIds);

    return NextResponse.json({ updates });
  } catch (error) {
    console.error('Error fetching course updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course updates' },
      { status: 500 }
    );
  }
}
