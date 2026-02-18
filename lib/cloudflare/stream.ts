/**
 * Cloudflare Stream utilities for video hosting and playback
 *
 * Required environment variables:
 * - CLOUDFLARE_ACCOUNT_ID: Your Cloudflare account ID
 * - CLOUDFLARE_STREAM_API_TOKEN: API token with Stream access
 * - CLOUDFLARE_STREAM_SIGNING_KEY_ID: Signing key ID for signed URLs
 * - CLOUDFLARE_STREAM_SIGNING_KEY_JWK: Signing key in JWK format (base64 encoded)
 */

import { SignJWT, importJWK } from 'jose';

// Cloudflare Stream configuration
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;
const CLOUDFLARE_STREAM_SIGNING_KEY_ID = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID;
const CLOUDFLARE_STREAM_SIGNING_KEY_JWK = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_JWK;

interface CloudflareVideoDetails {
  uid: string;
  thumbnail: string;
  playback: {
    hls: string;
    dash: string;
  };
  duration: number;
  status: {
    state: string;
  };
  meta?: {
    name?: string;
  };
}

/**
 * Get a signed video URL for Cloudflare Stream
 * This creates a time-limited token that allows playback
 */
export async function getSignedVideoUrl(
  videoId: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  if (!CLOUDFLARE_STREAM_SIGNING_KEY_ID || !CLOUDFLARE_STREAM_SIGNING_KEY_JWK) {
    console.warn('Cloudflare Stream signing keys not configured');
    // Return unsigned URL as fallback (only works for non-restricted videos)
    return `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
  }

  try {
    // Decode the JWK from base64
    const jwkString = Buffer.from(CLOUDFLARE_STREAM_SIGNING_KEY_JWK, 'base64').toString('utf-8');
    const jwk = JSON.parse(jwkString);

    // Import the key
    const key = await importJWK(jwk, 'RS256');

    // Create the signed token
    const token = await new SignJWT({
      sub: videoId,
      kid: CLOUDFLARE_STREAM_SIGNING_KEY_ID,
    })
      .setProtectedHeader({ alg: 'RS256', kid: CLOUDFLARE_STREAM_SIGNING_KEY_ID })
      .setExpirationTime(`${expiresInSeconds}s`)
      .setIssuedAt()
      .sign(key);

    return token;
  } catch (error) {
    console.error('Error creating signed video URL:', error);
    return null;
  }
}

/**
 * Get the embed URL for Cloudflare Stream player
 */
export function getVideoEmbedUrl(videoId: string, token?: string | null): string {
  const baseUrl = `https://iframe.cloudflarestream.com/${videoId}`;

  if (token) {
    return `${baseUrl}?token=${token}`;
  }

  return baseUrl;
}

/**
 * Get video thumbnail URL
 */
export function getVideoThumbnail(
  videoId: string,
  options?: {
    time?: string; // e.g., "1s", "5.5s"
    width?: number;
    height?: number;
    fit?: 'contain' | 'cover' | 'crop' | 'pad' | 'scale-down';
  }
): string {
  const params = new URLSearchParams();

  if (options?.time) params.set('time', options.time);
  if (options?.width) params.set('width', options.width.toString());
  if (options?.height) params.set('height', options.height.toString());
  if (options?.fit) params.set('fit', options.fit);

  const queryString = params.toString();
  const baseUrl = `https://cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`;

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Get animated GIF preview from video
 */
function getVideoPreviewGif(
  videoId: string,
  options?: {
    start?: string;
    end?: string;
    width?: number;
    height?: number;
    fps?: number;
  }
): string {
  const params = new URLSearchParams();

  if (options?.start) params.set('start', options.start);
  if (options?.end) params.set('end', options.end);
  if (options?.width) params.set('width', options.width.toString());
  if (options?.height) params.set('height', options.height.toString());
  if (options?.fps) params.set('fps', options.fps.toString());

  const queryString = params.toString();
  const baseUrl = `https://cloudflarestream.com/${videoId}/thumbnails/thumbnail.gif`;

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Get video details from Cloudflare Stream API
 */
async function getVideoDetails(videoId: string): Promise<CloudflareVideoDetails | null> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_API_TOKEN) {
    console.warn('Cloudflare Stream API not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Error fetching video details:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data.success) {
      console.error('Cloudflare API error:', data.errors);
      return null;
    }

    return data.result as CloudflareVideoDetails;
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format total duration for display (e.g., "2h 30min")
 */
export function formatTotalDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 min';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${hours}h`;
  }

  return `${minutes} min`;
}
