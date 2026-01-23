'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressRef = useRef<Set<number>>(new Set());

  // Fetch signed URL
  useEffect(() => {
    async function fetchSignedUrl() {
      if (!videoId) {
        setError('No video ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/stream/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoId }),
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
        setEmbedUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading video');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSignedUrl();
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
    setHasStarted(true);
  };

  if (error) {
    return (
      <div className={`aspect-video bg-black/50 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-white/60">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-amber-500 hover:text-amber-400 text-sm"
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
      >
        {/* Thumbnail */}
        <img
          src={getVideoThumbnail(videoId, { time: '1s', width: 1280 })}
          alt={title || 'Video thumbnail'}
          className="absolute inset-0 w-full h-full object-cover"
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
            <p className="text-white font-medium text-lg">{title}</p>
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
