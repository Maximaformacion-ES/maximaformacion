import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Strapi Webhook Handler for On-Demand Revalidation
 *
 * Configure in Strapi Admin > Settings > Webhooks:
 * - URL: https://your-domain.vercel.app/api/webhooks/strapi
 * - Headers: { "x-webhook-secret": "your-secret" }
 * - Events: entry.create, entry.update, entry.delete, entry.publish, entry.unpublish
 */

const WEBHOOK_SECRET = process.env.STRAPI_WEBHOOK_SECRET;

// Map Strapi model names to cache tags
const MODEL_TAG_MAP: Record<string, string[]> = {
  program: ['programs'],
  module: ['programs', 'lessons'], // Modules affect program and lesson views
  lesson: ['lessons', 'programs'], // Lessons affect lesson views and program course content
  'blog-post': ['blog-posts'],
  'maxymia-course': ['maxymia-courses'],
  logo: ['logos'],
  badge: ['badges'],
  metadata: ['site-metadata'],
};

interface StrapiWebhookPayload {
  event: string;
  createdAt: string;
  model: string;
  uid: string;
  entry: {
    id: number;
    documentId?: string;
    slug?: string;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secret = request.headers.get('x-webhook-secret');

    if (!WEBHOOK_SECRET) {
      console.warn('STRAPI_WEBHOOK_SECRET not configured - webhook validation skipped');
    } else if (secret !== WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return NextResponse.json(
        { error: 'Invalid webhook secret' },
        { status: 401 }
      );
    }

    const payload: StrapiWebhookPayload = await request.json();

    console.log(`[Strapi Webhook] Event: ${payload.event}, Model: ${payload.model}`);

    // Get the model name from uid (e.g., "api::program.program" -> "program")
    const modelName = payload.model || payload.uid?.split('.').pop() || '';

    // Get tags to revalidate for this model
    const tagsToRevalidate = MODEL_TAG_MAP[modelName] || [];

    if (tagsToRevalidate.length === 0) {
      console.log(`[Strapi Webhook] No cache tags configured for model: ${modelName}`);
      return NextResponse.json({
        revalidated: false,
        message: `No cache tags for model: ${modelName}`
      });
    }

    // Revalidate collection tags
    for (const tag of tagsToRevalidate) {
      console.log(`[Strapi Webhook] Revalidating tag: ${tag}`);
      revalidateTag(tag, { expire: 0 });
    }

    // Also revalidate specific entry tags if we have an ID or slug
    const entry = payload.entry;
    if (entry) {
      const specificTags: string[] = [];

      // Add ID-based tag
      if (entry.id) {
        specificTags.push(`${modelName}-${entry.id}`);
      }

      // Add documentId-based tag (Strapi 5)
      if (entry.documentId) {
        specificTags.push(`${modelName}-${entry.documentId}`);
      }

      // Add slug-based tag
      if (entry.slug) {
        specificTags.push(`${modelName}-slug-${entry.slug}`);
      }

      for (const tag of specificTags) {
        console.log(`[Strapi Webhook] Revalidating specific tag: ${tag}`);
        revalidateTag(tag, { expire: 0 });
      }
    }

    // Also revalidate main paths
    revalidatePath('/');
    revalidatePath('/programas');
    revalidatePath('/blog');

    return NextResponse.json({
      revalidated: true,
      tags: tagsToRevalidate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Strapi Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle GET for health checks
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Strapi webhook endpoint is ready',
    timestamp: new Date().toISOString(),
  });
}
