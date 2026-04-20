'use client';

import { useState } from 'react';
import {
  Download,
  Eye,
  ChevronDown,
  File,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  FileCode,
  FolderDown,
  Loader2,
} from 'lucide-react';
import type { DownloadFile } from '../types';

interface DownloadBlockViewProps {
  title?: string;
  description?: string;
  files: DownloadFile[];
}

function formatSize(sizeKB: number): string {
  if (sizeKB < 1024) return `${sizeKB.toFixed(0)} KB`;
  return `${(sizeKB / 1024).toFixed(1)} MB`;
}

function getFileIcon(mime: string) {
  if (mime.startsWith('image/')) return FileImage;
  if (mime === 'application/pdf') return FileText;
  if (mime.includes('spreadsheet') || mime === 'text/csv' || mime.includes('excel')) return FileSpreadsheet;
  if (mime.includes('zip') || mime.includes('compressed') || mime.includes('tar')) return FileArchive;
  if (mime.startsWith('text/') || mime.includes('json') || mime.includes('xml')) return FileCode;
  return File;
}

function canPreview(mime: string): boolean {
  return mime === 'application/pdf' || mime.startsWith('image/');
}

function sanitize(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'archivo';
}

export default function DownloadBlockView({ title, description, files }: DownloadBlockViewProps) {
  const [zipping, setZipping] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  if (files.length === 0) return null;

  const handleDownloadAll = async () => {
    if (zipping) return;
    setZipping(true);
    setZipError(null);
    try {
      const res = await fetch('/api/maxymia/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipName: title ?? 'descargables',
          files: files.map((f) => ({ url: f.url, name: f.name })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitize(title ?? 'descargables')}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setZipError(err instanceof Error ? err.message : 'Error al generar el ZIP');
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="my-8 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.03]">
        <FolderDown size={18} className="text-mx-orange flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-white font-medium text-body-sm">
            {title ?? 'Material descargable'}
          </p>
          {description && (
            <p className="text-white/50 text-body-sm mt-0.5">{description}</p>
          )}
        </div>
        <span className="text-white/40 text-label-sm hidden sm:inline">
          {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
        </span>
        {files.length > 1 && (
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={zipping}
            className="flex items-center gap-1.5 bg-mx-orange/10 hover:bg-mx-orange/20 disabled:opacity-50 disabled:cursor-not-allowed text-mx-orange text-label-sm transition-colors px-3 py-1.5 rounded border border-mx-orange/30 flex-shrink-0"
          >
            {zipping ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span className="hidden sm:inline">{zipping ? 'Preparando…' : 'Descargar todo'}</span>
          </button>
        )}
      </div>
      {zipError && (
        <div className="px-5 py-2 bg-red-500/10 border-b border-red-500/30 text-red-300 text-label-sm">
          {zipError}
        </div>
      )}
      <ul className="divide-y divide-white/5">
        {files.map((f, i) => (
          <DownloadRow key={`${f.name}-${i}`} file={f} />
        ))}
      </ul>
    </div>
  );
}

function DownloadRow({ file }: { file: DownloadFile }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = getFileIcon(file.mime);
  const previewable = canPreview(file.mime);

  return (
    <li>
      <div className="flex items-center gap-3 px-5 py-3">
        <Icon size={18} className="text-white/60 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-white text-body-sm truncate">{file.label}</p>
          {file.description && (
            <p className="text-white/50 text-body-sm truncate">{file.description}</p>
          )}
          <p className="text-white/30 text-label-sm mt-0.5">
            {file.name} · {formatSize(file.sizeKB)}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {previewable && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-label-sm transition-colors px-2.5 py-1.5 rounded hover:bg-white/5"
              aria-expanded={expanded}
              aria-label={expanded ? 'Ocultar vista previa' : 'Ver vista previa'}
            >
              <Eye size={14} />
              <span className="hidden sm:inline">{expanded ? 'Ocultar' : 'Vista previa'}</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
          <a
            href={`/api/maxymia/download-file?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name)}`}
            className="flex items-center gap-1.5 bg-mx-orange/10 hover:bg-mx-orange/20 text-mx-orange text-label-sm transition-colors px-3 py-1.5 rounded border border-mx-orange/30"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Descargar</span>
          </a>
        </div>
      </div>
      {previewable && expanded && (
        <div className="px-5 pb-5 pt-1">
          {file.mime === 'application/pdf' ? (
            <iframe
              src={file.url}
              title={file.label}
              className="w-full h-[70vh] rounded-lg border border-white/10 bg-white"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.url}
              alt={file.label}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg border border-white/10"
            />
          )}
        </div>
      )}
    </li>
  );
}
