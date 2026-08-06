'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Linkedin, Twitter, Globe, ArrowUpRight, GraduationCap } from 'lucide-react';
import { FontStyles } from '../components/FontStyles';
import { MarketingHeader as Header } from '../components/MarketingHeader';
import { Footer } from '../components/Footer';
import { StyledTitle } from '../components/StyledTitle';
import type { TeacherProfile } from '@/lib/strapi/types';

interface ProfesoradoClientProps {
  teachers: TeacherProfile[];
}

export default function ProfesoradoClient({ teachers }: ProfesoradoClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        {/* Hero */}
        <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 px-6 md:px-12 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(82,123,231,0.08),transparent_55%)] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative text-center">
            <span className="inline-block text-mx-orange text-label-sm md:text-label-md tracking-[0.3em] uppercase font-medium mb-5">
              Profesorado
            </span>
            <h1 className="text-mx-blue text-heading-lg md:text-display-sm xl:text-display-md font-black leading-display tracking-display mb-6 text-balance">
              <StyledTitle text="Aprende con quienes {investigan y aplican} cada día" color="blue" />
            </h1>
            <p className="text-mx-text-muted text-body-sm md:text-body-md xl:text-body-lg font-light leading-body max-w-3xl mx-auto text-balance">
              Nuestro equipo combina investigación científica, consultoría real y experiencia docente.
              Cada curso lo imparte un especialista que aplica esos conocimientos a diario.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="px-6 md:px-12 pb-20 md:pb-28">
          <div className="max-w-6xl mx-auto">
            {teachers.length === 0 ? (
              <p className="text-center text-mx-text-muted text-body-md">
                Pronto compartiremos los perfiles del equipo docente.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {teachers.map((t) => (
                  <TeacherCard key={t.documentId} teacher={t} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function TeacherCard({ teacher }: { teacher: TeacherProfile }) {
  return (
    <Link
      href={`/profesorado/${teacher.slug}`}
      className="group bg-mx-card border border-mx-border rounded-2xl overflow-hidden hover:border-mx-orange/40 hover:shadow-lg hover:shadow-mx-blue/5 transition-all duration-300 flex flex-col"
    >
      <div className="aspect-square w-full bg-mx-bg overflow-hidden">
        {teacher.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={teacher.avatarUrl}
            alt={teacher.name}
            className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mx-border">
            <GraduationCap size={48} />
          </div>
        )}
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        <h2 className="text-mx-text text-body-lg md:text-heading-sm font-bold group-hover:text-mx-orange transition-colors">
          {teacher.name}
        </h2>
        <p className="text-mx-orange text-label-md font-medium mt-1">{teacher.role}</p>
        {teacher.bio && (
          <p
            className="text-mx-text-muted text-body-sm font-light mt-3 leading-relaxed line-clamp-3"
            dangerouslySetInnerHTML={{ __html: teacher.bio.replace(/<[^>]+>/g, ' ').slice(0, 220) }}
          />
        )}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-mx-text-muted">
            {teacher.linkedin && <Linkedin size={14} />}
            {teacher.twitter && <Twitter size={14} />}
            {teacher.websiteUrl && <Globe size={14} />}
          </div>
          <ArrowUpRight size={18} className="text-mx-text-muted group-hover:text-mx-orange group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
