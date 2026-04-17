'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { marked, Renderer } from 'marked';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';
import VimeoPlayer from '@/app/components/VimeoPlayer';
import type { ContentBlock, Locale } from '../types';

const renderer = new Renderer();
renderer.link = ({ href, text }) => {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

/**
 * Detect if a string is markdown (not already HTML).
 * If it starts with a tag like <p>, <h1>, <div> etc., treat as HTML.
 * Otherwise parse as markdown.
 */
function toHtml(input: string): string {
  const trimmed = input.trim();
  // Already HTML — starts with a tag
  if (/^<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }
  // Parse markdown to HTML
  return marked.parse(trimmed, { async: false, renderer }) as string;
}

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
      return <TextBlockRenderer html={block.html} />;

    case 'video':
      return (
        <div className="my-8">
          <VimeoPlayer
            vimeoId={block.vimeoId}
            videoHash={block.videoHash}
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
            <figcaption className="text-white/40 text-body-sm mt-3 text-center italic">
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
              <span className="text-white/50 text-label-md font-mono">{block.fileName}</span>
              <span className="text-white/20 text-label-sm uppercase">{block.language}</span>
            </div>
          )}
          <pre className="bg-[#0d1117] p-4 overflow-x-auto">
            <code className="text-body-sm font-mono text-white/80 leading-relaxed">
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
                <p className="text-white font-medium text-body-sm mb-1">{block.title}</p>
              )}
              <p className="text-white/60 text-body-sm leading-relaxed">{block.content}</p>
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

function TextBlockRenderer({ html }: { html: string }) {
  const rendered = useMemo(() => toHtml(html), [html]);
  return (
    <div
      className="prose prose-invert prose-sm xl:prose-base 2xl:prose-lg max-w-none prose-headings:text-white prose-p:text-white/70 prose-li:text-white/70 prose-li:marker:text-mx-orange prose-strong:text-white prose-a:text-mx-blue prose-a:underline prose-a:decoration-mx-blue/40 hover:prose-a:decoration-mx-blue prose-em:text-mx-orange prose-em:font-medium prose-em:not-italic prose-img:rounded-xl prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-h4:text-mx-orange prose-h4:text-sm prose-h4:tracking-[0.15em] prose-h4:uppercase prose-h4:font-black prose-h4:border-l-2 prose-h4:border-mx-orange prose-h4:pl-3 prose-h4:mt-10 prose-h4:mb-4 prose-h5:text-mx-orange/70 prose-h5:text-base prose-h5:font-bold prose-h5:tracking-wide prose-h5:mt-8 prose-h5:mb-3"
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}
