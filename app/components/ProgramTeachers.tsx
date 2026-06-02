'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User } from 'lucide-react';
import type { Program } from '@/lib/strapi/types';

interface Props {
  program: Program;
}

/**
 * Lists the teachers (docentes) assigned to a program with a link out to
 * each teacher's profile page. The internal linking from /programas/[slug]
 * to /profesorado/[slug] helps Google build the teacher entity and signals
 * EEAT (expertise + authoritativeness) on the program page.
 */
export const ProgramTeachers: React.FC<Props> = ({ program }) => {
  const docentes = program.docentes ?? [];
  if (docentes.length === 0) return null;

  return (
    <section className="py-16 md:py-20 px-6 md:px-12 bg-mx-bg border-t border-mx-border bg-transparent">
      <div className="max-w-[1400px] mx-auto">
        <span className="text-mx-orange text-label-md tracking-widest uppercase font-semibold mb-3 block">
          Profesorado
        </span>
        <h2 className="text-heading-md md:text-heading-lg font-black text-mx-blue mb-10 leading-tight">
          Quién imparte este programa
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {docentes.map((d) => {
            const inner = (
              <div className="flex items-center gap-4 p-5 bg-mx-card border border-mx-border rounded-2xl hover:border-mx-orange/40 transition-colors h-full">
                {d.avatar ? (
                  <Image
                    src={d.avatar}
                    alt={d.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full border border-mx-orange/30 object-cover shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-mx-orange/10 border border-mx-orange/30 flex items-center justify-center shrink-0">
                    <User size={26} className="text-mx-orange" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-body-md font-bold text-mx-text leading-tight">{d.name}</p>
                  {d.role && (
                    <p className="text-body-sm text-mx-text-muted font-light mt-1 truncate">{d.role}</p>
                  )}
                </div>
              </div>
            );
            return d.slug ? (
              <Link key={d.documentId} href={`/profesorado/${d.slug}`} className="block group">
                {inner}
              </Link>
            ) : (
              <div key={d.documentId}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
