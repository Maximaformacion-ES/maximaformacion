import { NextResponse } from 'next/server';
import { getAllCourseRatings } from '@/lib/db/queries';

export async function GET() {
  try {
    const allRatings = await getAllCourseRatings();

    const ratings: Record<string, { averageRating: number; reviewCount: number }> = {};
    for (const row of allRatings) {
      ratings[row.courseId] = {
        averageRating: row.averageRating ? parseFloat(row.averageRating) : 0,
        reviewCount: row.reviewCount,
      };
    }

    return NextResponse.json({ ratings });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Error al obtener ratings' },
      { status: 500 }
    );
  }
}
