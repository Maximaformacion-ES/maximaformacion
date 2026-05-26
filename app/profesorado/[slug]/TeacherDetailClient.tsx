'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Linkedin, Twitter, Globe, Mail, ArrowLeft, GraduationCap } from 'lucide-react';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import type { TeacherProfile } from '@/lib/strapi/types';

interface TeacherDetailClientProps {
  teacher: TeacherProfile;
  /**
   * Sections rendered between the main bio block and the footer — e.g.
   * the list of programs and articles fetched on the server. Keeping
   * them inside this wrapper means the footer stays at the bottom of
   * the page instead of slotting in between the bio and the rest.
   */
  children?: React.ReactNode;
}

export default function TeacherDetailClient({ teacher, children }: TeacherDetailClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10 pt-28 md:pt-36 pb-20 md:pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/profesorado"
            className="inline-flex items-center gap-2 text-mx-text-muted hover:text-mx-orange text-label-md mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Volver al profesorado
          </Link>

          <article className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-start">
            {/* Photo + social */}
            <aside>
              <div className="aspect-square w-full bg-mx-card border border-mx-border rounded-2xl overflow-hidden mb-5">
                {teacher.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={teacher.avatarUrl}
                    alt={teacher.name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-mx-border">
                    <GraduationCap size={64} />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {teacher.linkedin && (
                  <SocialLink href={teacher.linkedin} icon={Linkedin}>
                    LinkedIn
                  </SocialLink>
                )}
                {teacher.twitter && (
                  <SocialLink href={teacher.twitter} icon={Twitter}>
                    Twitter / X
                  </SocialLink>
                )}
                {teacher.websiteUrl && (
                  <SocialLink href={teacher.websiteUrl} icon={Globe}>
                    Web
                  </SocialLink>
                )}
                {teacher.email && (
                  <SocialLink href={`mailto:${teacher.email}`} icon={Mail}>
                    Email
                  </SocialLink>
                )}
                {teacher.orcid && (
                  <SocialLink href={teacher.orcid} icon={Globe}>
                    ORCID
                  </SocialLink>
                )}
              </div>
            </aside>

            {/* Bio */}
            <div>
              <p className="text-mx-orange text-label-sm md:text-label-md tracking-[0.3em] uppercase font-medium mb-3">
                Profesorado
              </p>
              <h1 className="text-mx-blue text-heading-lg md:text-display-sm font-black leading-display tracking-display mb-3 text-balance">
                {teacher.name}
              </h1>
              <p className="text-mx-text text-body-md md:text-body-lg font-medium mb-8">
                {teacher.role}
              </p>

              {teacher.expertiseAreas && teacher.expertiseAreas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {teacher.expertiseAreas.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1.5 text-label-sm font-medium bg-mx-orange/10 text-mx-orange rounded-full border border-mx-orange/20"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}

              <style>{`
                .teacher-bio { color: var(--color-mx-text); font-size: var(--text-body-sm); line-height: 1.75; }
                @media (min-width: 768px) { .teacher-bio { font-size: var(--text-body-md); } }
                .teacher-bio p { margin: 0 0 1.1em; }
                .teacher-bio strong { color: var(--color-mx-text); font-weight: 700; }
                .teacher-bio a { color: var(--color-mx-orange); text-decoration: underline; }
              `}</style>

              {teacher.bio ? (
                <div className="teacher-bio" dangerouslySetInnerHTML={{ __html: teacher.bio }} />
              ) : (
                <p className="text-mx-text-muted text-body-md font-light italic">
                  Próximamente publicaremos más información sobre {teacher.name}.
                </p>
              )}
            </div>
          </article>
        </div>
      </main>

      {children}

      <Footer />
    </div>
  );
}

function SocialLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer me"
      className="inline-flex items-center gap-3 px-4 py-2.5 bg-mx-card border border-mx-border rounded-lg text-mx-text text-label-md font-medium hover:border-mx-orange/40 hover:text-mx-orange transition-colors"
    >
      <Icon size={16} className="shrink-0" />
      {children}
    </a>
  );
}
