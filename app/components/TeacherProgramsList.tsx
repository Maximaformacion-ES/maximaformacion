import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Program } from '@/lib/strapi/types';

interface Props {
  programs: Program[];
  heading?: string;
}

/**
 * Server-rendered list of programs taught by a given teacher. Each card is
 * an anchor that points at the program detail page (or the Maxymia campus
 * page when href has been overridden by the adapter). Renders nothing if
 * the teacher hasn't been assigned to any program — keeps the layout clean.
 */
export const TeacherProgramsList: React.FC<Props> = ({ programs, heading = 'Programas que imparte' }) => {
  if (programs.length === 0) return null;
  return (
    <section className="py-16 md:py-20 px-6 md:px-12 bg-mx-bg border-t border-mx-border">
      <div className="max-w-6xl mx-auto">
        <span className="text-mx-orange text-label-md tracking-widest uppercase font-semibold mb-3 block">
          Cursos & másteres
        </span>
        <h2 className="text-heading-md md:text-heading-lg font-black text-mx-blue mb-8 leading-tight">
          {heading}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((program) => {
            const href = program.href ?? `/programas/${program.slug}`;
            return (
              <li key={program.documentId}>
                <Link
                  href={href}
                  className="group flex flex-col h-full p-5 bg-mx-card border border-mx-border rounded-xl hover:border-mx-orange/40 transition-colors"
                >
                  {program.image && (
                    <div className="relative w-full aspect-[16/9] mb-4 rounded-lg overflow-hidden bg-mx-bg">
                      <Image
                        src={program.image}
                        alt={program.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <span className="text-mx-orange text-label-sm tracking-widest uppercase font-semibold mb-2">
                    {program.type === 'Master' ? 'Máster' : 'Curso'}
                  </span>
                  <h3 className="text-body-lg font-bold text-mx-text leading-snug group-hover:text-mx-orange transition-colors line-clamp-2">
                    {program.title}
                  </h3>
                  {program.description && (
                    <p className="text-body-sm text-mx-text-muted font-light mt-2 line-clamp-3">
                      {program.description}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
