'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import MarkdownIt from 'markdown-it';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';
import VimeoPlayer from '@/app/components/VimeoPlayer';
import CodeFence from './CodeFence';
import DownloadBlockView from './DownloadBlockView';
import type { ContentBlock, Locale } from '../types';

const md = new MarkdownIt({ html: true, linkify: true, breaks: false });

const defaultLinkOpen =
  md.renderer.rules.link_open ||
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const targetIndex = token.attrIndex('target');
  if (targetIndex < 0) token.attrPush(['target', '_blank']);
  else token.attrs![targetIndex][1] = '_blank';
  const relIndex = token.attrIndex('rel');
  if (relIndex < 0) token.attrPush(['rel', 'noopener noreferrer']);
  else token.attrs![relIndex][1] = 'noopener noreferrer';
  return defaultLinkOpen(tokens, idx, options, env, self);
};

md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx];
  const code = token.content;
  const language = (token.info || '').trim().split(/\s+/)[0];
  const escapedCode = md.utils.escapeHtml(code);
  const langLabel = language
    ? `<span class="text-white/20 text-label-sm uppercase">${md.utils.escapeHtml(language)}</span>`
    : '';
  return `
    <div class="my-6 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] not-prose">
      <div class="bg-white/[0.05] px-4 py-2 border-b border-white/10 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">${langLabel}</div>
        <button type="button" data-copy-code class="flex items-center gap-1.5 text-white/50 hover:text-white text-label-sm transition-colors px-2 py-1 rounded hover:bg-white/5 flex-shrink-0">
          <span data-copy-label>Copiar</span>
        </button>
      </div>
      <pre class="p-4 overflow-x-auto whitespace-pre-wrap break-words"><code class="text-body-sm font-mono text-white/80 leading-relaxed">${escapedCode}</code></pre>
    </div>
  `;
};

function toHtml(input: string): string {
  const trimmed = input.trim();
  if (/^<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }
  return md.render(trimmed);
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

    case 'video': {
      if (block.provider === 'youtube' && block.youtubeId) {
        return (
          <div className="my-8 aspect-video rounded-xl overflow-hidden border border-white/10">
            <iframe
              src={`https://www.youtube.com/embed/${block.youtubeId}`}
              title={block.title || 'Video'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        );
      }
      if (!block.vimeoId) return null;
      return (
        <div className="my-8">
          <VimeoPlayer
            vimeoId={block.vimeoId}
            videoHash={block.videoHash}
            title={block.title}
          />
        </div>
      );
    }

    case 'embed':
      return (
        <div
          className="my-8 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:border [&_iframe]:border-white/10"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
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
        <CodeFence code={block.code} language={block.language} fileName={block.fileName} />
      );

    case 'download':
      return (
        <DownloadBlockView
          title={block.title}
          description={block.description}
          files={block.files}
        />
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest<HTMLButtonElement>('[data-copy-code]');
      if (!btn) return;
      const pre = btn.closest('div')?.parentElement?.querySelector('pre code');
      const text = pre?.textContent ?? '';
      navigator.clipboard?.writeText(text).then(() => {
        const label = btn.querySelector('[data-copy-label]');
        if (!label) return;
        const original = label.textContent;
        label.textContent = 'Copiado';
        setTimeout(() => { label.textContent = original; }, 1500);
      }).catch(() => {});
    };
    container.addEventListener('click', handler);
    return () => container.removeEventListener('click', handler);
  }, [rendered]);

  return (
    <div
      ref={containerRef}
      className="prose prose-invert prose-sm xl:prose-base 2xl:prose-lg max-w-none prose-headings:text-white prose-p:text-white/70 prose-li:text-white/70 prose-li:marker:text-mx-orange prose-strong:text-white prose-a:text-mx-blue prose-a:underline prose-a:decoration-mx-blue/40 hover:prose-a:decoration-mx-blue prose-em:text-mx-orange prose-em:font-medium prose-em:not-italic prose-img:rounded-xl prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-h4:text-mx-orange prose-h4:text-sm prose-h4:tracking-[0.15em] prose-h4:uppercase prose-h4:font-black prose-h4:border-l-2 prose-h4:border-mx-orange prose-h4:pl-3 prose-h4:mt-10 prose-h4:mb-4 prose-h5:text-mx-orange/70 prose-h5:text-base prose-h5:font-bold prose-h5:tracking-wide prose-h5:mt-8 prose-h5:mb-3"
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}
