'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, X } from 'lucide-react';

interface PreviewBannerProps {
  currentPath: string;
}

export const PreviewBanner: React.FC<PreviewBannerProps> = ({ currentPath }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Eye size={20} />
        <span className="font-medium">
          Modo Preview activo - Estás viendo contenido no publicado
        </span>
      </div>
      <Link
        href={`/api/preview/exit?redirect=${encodeURIComponent(currentPath)}`}
        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
      >
        <X size={16} />
        Salir del Preview
      </Link>
    </div>
  );
};
