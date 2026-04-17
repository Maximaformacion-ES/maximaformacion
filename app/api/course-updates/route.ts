import { NextRequest, NextResponse } from 'next/server';
import { createCourseUpdate, getEnrolledUsersWithEmail } from '@/lib/db/queries';
import { sendEmail } from '@/lib/email/client';
import { courseUpdateEmail } from '@/lib/email/templates/course-update';

const ADMIN_API_KEY = process.env.COURSE_UPDATES_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://maximaformacion.es';

export async function POST(request: NextRequest) {
  // Authenticate via API key (called from Strapi MCP, not from browser)
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  if (!ADMIN_API_KEY || apiKey !== ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const {
      programDocumentId,
      programTitle,
      moduleDocumentId,
      lessonDocumentId,
      changeType,
      title,
      description,
    } = body;

    if (!programDocumentId || !changeType || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: programDocumentId, changeType, title' },
        { status: 400 }
      );
    }

    // 1. Save the update record
    const update = await createCourseUpdate({
      programDocumentId,
      programTitle,
      moduleDocumentId,
      lessonDocumentId,
      changeType,
      title,
      description,
    });

    // 2. Get all users who purchased this course (with their emails)
    const enrolledUsers = await getEnrolledUsersWithEmail(programDocumentId);

    // 3. Send email to each enrolled user
    const courseUrl = `${APP_URL}/cursos/${programDocumentId}`;
    const emailTemplate = courseUpdateEmail({
      programTitle: programTitle || 'tu curso',
      changeType,
      updateTitle: title,
      updateDescription: description,
      courseUrl,
    });

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const user of enrolledUsers) {
      if (!user.email) continue;

      try {
        await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send course update email to ${user.email}:`, err);
        emailsFailed++;
      }
    }

    return NextResponse.json({
      update,
      notifications: {
        totalEnrolled: enrolledUsers.length,
        emailsSent,
        emailsFailed,
      },
    });
  } catch (error) {
    console.error('Error creating course update:', error);
    return NextResponse.json(
      { error: 'Failed to create course update' },
      { status: 500 }
    );
  }
}
