'use client';

import React from 'react';
import Image from 'next/image';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';
import VimeoPlayer from '@/app/components/VimeoPlayer';
import type { ContentBlock, Locale } from '../types';

interface LessonContentRendererProps {
  content: ContentBlock[];
  locale: Locale;
}

export default function LessonContentRenderer({ content }: LessonContentRendererProps) {
  return (
    <div className="space-y-6">
      {content.map((block, i) => (
        <ContentBlockRenderer key={i} block={block} />
      ))}
    </div>
  );
}

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text':
      return (
        <div
          className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white/70 prose-li:text-white/70 prose-strong:text-white prose-a:text-mx-orange"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );

    case 'video':
      return (
        <div className="my-8">
          <VimeoPlayer
            vimeoId={block.vimeoId}
            title={block.title}
          />
        </div>
      );

    case 'image':
      return (
        <figure className="my-8">
          <div className="relative rounded-xl overflow-hidden border border-white/10">
            <Image
              src={block.src}
              alt={block.alt}
              width={900}
              height={500}
              className="w-full h-auto object-cover"
              unoptimized
            />
          </div>
          {block.caption && (
            <figcaption className="text-white/40 text-sm mt-3 text-center italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'code':
      return (
        <div className="my-6 rounded-xl overflow-hidden border border-white/10">
          {block.fileName && (
            <div className="bg-white/[0.05] px-4 py-2 border-b border-white/10 flex items-center gap-2">
              <span className="text-white/50 text-xs font-mono">{block.fileName}</span>
              <span className="text-white/20 text-[10px] uppercase">{block.language}</span>
            </div>
          )}
          <pre className="bg-[#0d1117] p-4 overflow-x-auto">
            <code className="text-sm font-mono text-white/80 leading-relaxed">
              {block.code}
            </code>
          </pre>
        </div>
      );

    case 'callout': {
      const variants = {
        info: {
          icon: Info,
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/5',
          iconColor: 'text-blue-400',
        },
        warning: {
          icon: AlertTriangle,
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/5',
          iconColor: 'text-yellow-400',
        },
        tip: {
          icon: Lightbulb,
          border: 'border-green-500/30',
          bg: 'bg-green-500/5',
          iconColor: 'text-green-400',
        },
      };
      const v = variants[block.variant];
      const Icon = v.icon;

      return (
        <div className={`my-6 rounded-xl border ${v.border} ${v.bg} p-5`}>
          <div className="flex gap-3">
            <Icon size={20} className={`${v.iconColor} flex-shrink-0 mt-0.5`} />
            <div>
              {block.title && (
                <p className="text-white font-medium text-sm mb-1">{block.title}</p>
              )}
              <p className="text-white/60 text-sm leading-relaxed">{block.content}</p>
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
