'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface TeamMember {
  name: string;
  role?: string;
  image: string;
  linkedin?: string;
}

interface Department {
  label: string;
  members: TeamMember[];
}

const ceo: TeamMember = {
  name: 'Alfonso Lara',
  role: 'CEO de Máxima Formación',
  image:
    'https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/32575bc7-df2f-45e7-99e1-c14d10c8b704.webp',
  linkedin: '#',
};

const departments: Department[] = [
  {
    label: 'Docencia',
    members: [
      {
        name: 'Rosana Ferrero',
        image:
          'https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/295ba03d-c8b5-46cd-8b73-11e3a4a37b14.webp',
        linkedin: '#',
      },
      {
        name: 'Juan Luis López',
        image:
          'https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/6c438ef0-cd28-4a16-8280-ccee3c18ae6e.webp',
        linkedin: '#',
      },
      {
        name: 'Ignacio García',
        image: '/ignacio-garcia.jpg.webp',
        linkedin: '#',
      },
      {
        name: 'Marcos Rodríguez',
        image: '/marcos-rodriguez.jpeg',
        linkedin: '#',
      },
      {
        name: 'José Ant. Lorente',
        image: '/jose-antonio-lorente.png',
        linkedin: '#',
      },
    ],
  },
  {
    label: 'Comunicación',
    members: [
      {
        name: 'Joana Gorosito',
        image:
          'https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/8d8d9167-df39-4729-8560-88ef9e1d156d.webp',
        linkedin: '#',
      },
    ],
  },
];

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
  const sizeClasses = size === 'lg' ? 'w-32 h-32 md:w-40 md:h-40' : 'w-24 h-24 md:w-28 md:h-28';

  return (
    <div className="flex flex-col items-center gap-3">
      <a
        href={member.linkedin || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group"
      >
        <div className={`${sizeClasses} rounded-full overflow-hidden border-3 border-white/20 group-hover:border-white/50 transition-colors`}>
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes={size === 'lg' ? '160px' : '112px'}
            className="object-cover rounded-lg"
          />
        </div>
        <LinkedInBadge />
      </a>
      <span className="text-white text-sm font-medium text-center">{member.name}</span>
    </div>
  );
}

export const TeamSection: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 bg-mx-blue">
      <div className="max-w-[1200px] mx-auto">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white text-4xl md:text-6xl font-black text-center mb-20 uppercase"
        >
          Nuestro Equipo
        </motion.h2>

        {/* CEO featured */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 mb-20"
        >
          <MemberAvatar member={ceo} size="lg" />
          <div className="text-center md:text-left">
            <h3 className="text-white text-2xl md:text-3xl font-bold">{ceo.name}</h3>
            <p className="text-white/60 text-sm font-light mb-3">{ceo.role}</p>
            <p className="text-white/80 text-lg italic">
              &laquo;Más que un equipo, una gran familia.&raquo;
            </p>
          </div>
        </motion.div>

        {/* Departments */}
        <div className="space-y-16">
          {departments.map((dept) => (
            <motion.div
              key={dept.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Department row with line */}
              <div className="flex items-center gap-6 mb-10">
                <span className="text-white/50 text-sm font-medium tracking-widest uppercase shrink-0">
                  {dept.label}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Members grid */}
              <div className="flex flex-wrap justify-center gap-10 md:gap-14">
                {dept.members.map((member) => (
                  <MemberAvatar key={member.name} member={member} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
