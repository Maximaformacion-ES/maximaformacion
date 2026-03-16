'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';

interface VimeoPlayerProps {
  vimeoId: string;
  title?: string;
  onProgress?: (percent: number) => void;
  onComplete?: () => void;
  className?: string;
}

export default function VimeoPlayer({
  vimeoId,
  title,
  onProgress,
  onComplete,
  className = '',
}: VimeoPlayerProps) {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressRef = useRef<Set<number>>(new Set());

  const thumbnailUrl = `https://vumbnail.com/${vimeoId}.jpg`;

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (!event.origin.includes('player.vimeo.com')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data.event === 'playProgress' && data.data) {
          const percent = Math.round(data.data.percent * 100);
          const milestones = [25, 50, 75, 100];
          for (const milestone of milestones) {
            if (percent >= milestone && !progressRef.current.has(milestone)) {
              progressRef.current.add(milestone);
              onProgress?.(milestone);
            }
          }
        }

        if (data.event === 'finish') {
          onComplete?.();
        }
      } catch {
        // Ignore non-JSON messages
      }
    },
    [onProgress, onComplete]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const handlePlay = () => {
    setStarted(true);
    setLoading(true);
  };

  if (!started) {
    return (
      <div
        className={`aspect-video bg-black/50 rounded-xl relative overflow-hidden cursor-pointer group ${className}`}
        onClick={handlePlay}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePlay();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={title || 'Video thumbnail'}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-mx-orange/90 group-hover:bg-mx-orange flex items-center justify-center transition-all group-hover:scale-110 shadow-2xl">
            <Play className="text-white ml-1" size={36} fill="currentColor" />
          </div>
        </div>
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-medium text-body-lg">{title}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`aspect-video bg-black rounded-xl overflow-hidden relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="text-mx-orange animate-spin" size={48} />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=F7A000&title=0&byline=0&portrait=0&api=1`}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title || 'Vimeo player'}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
