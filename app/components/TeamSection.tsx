'use client';

import React from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import type { TeamMember } from '@/lib/strapi/types';

// Fallback data when Strapi is unavailable
const FALLBACK_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: 'Alfonso Lara',
    role: 'CEO',
    avatar:
      'https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/32575bc7-df2f-45e7-99e1-c14d10c8b704.webp',
    linkedin: '#',
    email: '',
  },
  {
    id: 2,
    name: 'Rosana Ferrero',
    role: 'Docencia',
    avatar:
      'https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/295ba03d-c8b5-46cd-8b73-11e3a4a37b14.webp',
    linkedin: '#',
    email: '',
  },
  {
    id: 3,
    name: 'Juan Luis López',
    role: 'Docencia',
    avatar:
      'https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/6c438ef0-cd28-4a16-8280-ccee3c18ae6e.webp',
    linkedin: '#',
    email: '',
  },
  {
    id: 4,
    name: 'Ignacio García',
    role: 'Docencia',
    avatar: '/ignacio-garcia.jpg.webp',
    linkedin: '#',
    email: '',
  },
  {
    id: 5,
    name: 'Marcos Rodríguez',
    role: 'Docencia',
    avatar: '/marcos-rodriguez.jpeg',
    linkedin: '#',
    email: '',
  },
  {
    id: 6,
    name: 'José Ant. Lorente',
    role: 'Docencia',
    avatar: '/jose-antonio-lorente.png',
    linkedin: '#',
    email: '',
  },
  {
    id: 7,
    name: 'Joana Gorosito',
    role: 'Comunicación',
    avatar:
      'https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/8d8d9167-df39-4729-8560-88ef9e1d156d.webp',
    linkedin: '#',
    email: '',
  },
];

const ROLE_ORDER: TeamMember['role'][] = ['CEO', 'Docencia', 'Comunicación'];

function LinkedInBadge() {
  return (
    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#0A66C2] rounded-full flex items-center justify-center border-2 border-mx-blue">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    </div>
  );
}

function MemberAvatar({ member, size = 'md' }: { member: TeamMember; size?: 'lg' | 'md' }) {
  const sizeClasses = size === 'lg' ? 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40' : 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28';

  return (
    <div className="flex flex-col items-center gap-3">
      <a
        href={member.linkedin || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group"
      >
        <div className={`${sizeClasses} relative rounded-2xl overflow-hidden border-3 border-white/20 group-hover:border-white/50 transition-colors`}>
          <Image
            src={member.avatar}
            alt={member.name}
            fill
            sizes={size === 'lg' ? '160px' : '112px'}
            className="object-cover rounded-lg"
          />
        </div>
        {member.linkedin && <LinkedInBadge />}
      </a>
      <span className="text-white text-body-sm font-medium text-center">{member.name}</span>
    </div>
  );
}

interface TeamSectionProps {
  members?: TeamMember[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({ members }) => {
  const allMembers = members && members.length > 0 ? members : FALLBACK_MEMBERS;

  const ceo = allMembers.find((m) => m.role === 'CEO');
  const departments = ROLE_ORDER
    .filter((role) => role !== 'CEO')
    .map((role) => ({
      label: role,
      members: allMembers.filter((m) => m.role === role),
    }))
    .filter((dept) => dept.members.length > 0);

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-mx-blue">
      <div className="max-w-[1200px] mx-auto">
        {/* Title */}
        <m.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white text-heading-lg sm:text-display-sm md:text-display-md font-black text-center mb-12 sm:mb-20 uppercase"
        >
          Nuestro Equipo
        </m.h2>

        {/* CEO featured */}
        {ceo && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-center gap-5 sm:gap-8 mb-12 sm:mb-20"
          >
            <MemberAvatar member={ceo} size="lg" />
            <div className="text-center md:text-left">
              <h3 className="text-white text-heading-md md:text-heading-lg font-bold">{ceo.name}</h3>
              <p className="text-white/60 text-body-sm font-light mb-3">CEO de Máxima Formación</p>
              <p className="text-white/80 text-body-lg italic">
                &laquo;Más que un equipo, una gran familia.&raquo;
              </p>
            </div>
          </m.div>
        )}

        {/* Departments */}
        <div className="space-y-10 sm:space-y-16">
          {departments.map((dept) => (
            <m.div
              key={dept.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
                <span className="text-white/50 text-body-sm font-medium tracking-widest uppercase shrink-0">
                  {dept.label}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-14">
                {dept.members.map((member) => (
                  <MemberAvatar key={member.id} member={member} />
                ))}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};
