'use client';

import React, { useEffect, useReducer, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Loader2, Play, AlertCircle } from 'lucide-react';
import { getVideoThumbnail } from '@/lib/cloudflare/stream';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  onProgress?: (percent: number) => void;
  onComplete?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  autoPlay?: boolean;
  startTime?: number;
  className?: string;
}

// ─── Video state reducer ────────────────────────────────────────────
interface VideoState {
  embedUrl: string | null;
  isLoading: boolean;
  error: string | null;
  userClickedPlay: boolean;
}

type VideoAction =
  | { type: 'FETCH_SUCCESS'; embedUrl: string }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'USER_CLICKED_PLAY' };

const initialVideoState: VideoState = {
  embedUrl: null,
  isLoading: true,
  error: null,
  userClickedPlay: false,
};

function videoReducer(state: VideoState, action: VideoAction): VideoState {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return { ...state, embedUrl: action.embedUrl, isLoading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, error: action.error, isLoading: false };
    case 'USER_CLICKED_PLAY':
      return { ...state, userClickedPlay: true };
    default:
      return state;
  }
}

export default function VideoPlayer({
  videoId,
  title,
  onProgress,
  onComplete,
  onTimeUpdate,
  autoPlay = false,
  startTime = 0,
  className = '',
}: VideoPlayerProps) {
  const [state, dispatch] = useReducer(videoReducer, initialVideoState);
  const { embedUrl, isLoading, error, userClickedPlay } = state;
  const hasStarted = autoPlay || userClickedPlay;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressRef = useRef<Set<number>>(new Set());

  // Fetch signed URL
  useEffect(() => {
    const abortController = new AbortController();

    async function fetchSignedUrl() {
      if (!videoId) {
        dispatch({ type: 'FETCH_ERROR', error: 'No video ID provided' });
        return;
      }

      try {
        const response = await fetch('/api/stream/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoId }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to get video URL');
        }

        const data = await response.json();

        // Build embed URL with options
        const params = new URLSearchParams();
        if (autoPlay) params.set('autoplay', 'true');
        if (startTime > 0) params.set('startTime', startTime.toString());
        params.set('preload', 'auto');
        params.set('poster', getVideoThumbnail(videoId, { time: '1s', width: 1280 }));

        const url = data.embedUrl + (data.embedUrl.includes('?') ? '&' : '?') + params.toString();
        dispatch({ type: 'FETCH_SUCCESS', embedUrl: url });
      } catch (err) {
        if (abortController.signal.aborted) return;
        dispatch({ type: 'FETCH_ERROR', error: err instanceof Error ? err.message : 'Error loading video' });
      }
    }

    fetchSignedUrl();

    return () => { abortController.abort(); };
  }, [videoId, autoPlay, startTime]);

  // Handle messages from iframe (Cloudflare Stream Player API)
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Only accept messages from Cloudflare Stream
      if (!event.origin.includes('cloudflarestream.com') && !event.origin.includes('iframe.cloudflarestream.com')) {
        return;
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Handle time update
        if (data.type === 'timeupdate' && data.currentTime !== undefined && data.duration) {
          const percent = Math.round((data.currentTime / data.duration) * 100);

          // Call time update callback
          onTimeUpdate?.(data.currentTime, data.duration);

          // Track progress milestones (25%, 50%, 75%, 100%)
          const milestones = [25, 50, 75, 100];
          for (const milestone of milestones) {
            if (percent >= milestone && !progressRef.current.has(milestone)) {
              progressRef.current.add(milestone);
              onProgress?.(milestone);
            }
          }
        }

        // Handle video end
        if (data.type === 'ended') {
          onComplete?.();
        }
      } catch {
        // Ignore non-JSON messages
      }
    },
    [onProgress, onComplete, onTimeUpdate]
  );

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Handle play button click
  const handlePlay = () => {
    dispatch({ type: 'USER_CLICKED_PLAY' });
  };

  if (error) {
    return (
      <div className={`aspect-video bg-black/50 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-white/60">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-amber-500 hover:text-amber-400 text-body-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`aspect-video bg-black/50 rounded-xl flex items-center justify-center ${className}`}>
        <Loader2 className="text-amber-500 animate-spin" size={48} />
      </div>
    );
  }

  // Show thumbnail with play button if not started
  if (!hasStarted && embedUrl) {
    return (
      <div
        className={`aspect-video bg-black/50 rounded-xl relative overflow-hidden cursor-pointer group ${className}`}
        onClick={handlePlay}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlay(); } }}
        role="button"
        tabIndex={0}
      >
        {/* Thumbnail */}
        <Image
          src={getVideoThumbnail(videoId, { time: '1s', width: 1280 })}
          alt={title || 'Video thumbnail'}
          className="absolute inset-0 w-full h-full object-cover"
          fill
          sizes="100vw"
          unoptimized
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/90 group-hover:bg-amber-500 flex items-center justify-center transition-all group-hover:scale-110 shadow-2xl">
            <Play className="text-black ml-1" size={36} fill="currentColor" />
          </div>
        </div>

        {/* Title overlay */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-medium text-body-lg">{title}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`aspect-video bg-black rounded-xl overflow-hidden ${className}`}>
      {embedUrl && (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          title={title || 'Video player'}
        />
      )}
    </div>
  );
}
