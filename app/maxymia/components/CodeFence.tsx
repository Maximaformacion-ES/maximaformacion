'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeFenceProps {
  code: string;
  language?: string;
  fileName?: string;
}

export default function CodeFence({ code, language, fileName }: CodeFenceProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked
    }
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]">
      <div className="bg-white/[0.05] px-4 py-2 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {fileName && (
            <span className="text-white/50 text-label-md font-mono truncate">{fileName}</span>
          )}
          {language && (
            <span className="text-white/20 text-label-sm uppercase">{language}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-label-sm transition-colors px-2 py-1 rounded hover:bg-white/5 flex-shrink-0"
          aria-label="Copiar código"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre-wrap break-words">
        <code className="text-body-sm font-mono text-white/80 leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
}
