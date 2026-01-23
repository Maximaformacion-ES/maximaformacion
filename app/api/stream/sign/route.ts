import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSignedVideoUrl, getVideoEmbedUrl } from '@/lib/cloudflare/stream';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { videoId, expiresIn = 3600 } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Get signed token
    const token = await getSignedVideoUrl(videoId, expiresIn);

    if (!token) {
      // Return unsigned URL as fallback
      return NextResponse.json({
        embedUrl: getVideoEmbedUrl(videoId),
        signed: false,
      });
    }

    return NextResponse.json({
      token,
      embedUrl: getVideoEmbedUrl(videoId, token),
      signed: true,
      expiresIn,
    });
  } catch (error) {
    console.error('Error signing video URL:', error);
    return NextResponse.json(
      { error: 'Failed to sign video URL' },
      { status: 500 }
    );
  }
}
