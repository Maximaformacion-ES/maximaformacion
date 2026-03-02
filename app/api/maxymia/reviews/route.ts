import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  upsertCourseReview,
  deleteCourseReview,
  getCourseReviews,
  getCourseRatingStats,
  getCourseReview,
} from '@/lib/db/queries';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { courseId, rating, comment } = body;

  if (!courseId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'courseId y rating (1-5) son obligatorios' },
      { status: 400 }
    );
  }

  try {
    const review = await upsertCourseReview(userId, courseId, rating, comment);
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Error al guardar la review' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json(
      { error: 'courseId es obligatorio' },
      { status: 400 }
    );
  }

  try {
    const [reviews, stats] = await Promise.all([
      getCourseReviews(courseId),
      getCourseRatingStats(courseId),
    ]);

    let userReview = null;
    if (userId) {
      userReview = await getCourseReview(userId, courseId);
    }

    return NextResponse.json({ reviews, stats, userReview });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Error al obtener reviews' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { courseId } = body;

  if (!courseId) {
    return NextResponse.json(
      { error: 'courseId es obligatorio' },
      { status: 400 }
    );
  }

  try {
    const deleted = await deleteCourseReview(userId, courseId);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Review no encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la review' },
      { status: 500 }
    );
  }
}
