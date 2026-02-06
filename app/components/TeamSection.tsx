'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

const TEAM: TeamMember[] = [
  {
    name: "Rosana Ferrero",
    role: "Directora Académica",
    image: "https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/295ba03d-c8b5-46cd-8b73-11e3a4a37b14.webp"
  },
  {
    name: "Alfonso Lara Núñez",
    role: "CEO & Fundador",
    image: "https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/32575bc7-df2f-45e7-99e1-c14d10c8b704.webp"
  },
  {
    name: "Juan Luis López",
    role: "Coordinador de Formación",
    image: "https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/6c438ef0-cd28-4a16-8280-ccee3c18ae6e.webp"
  },
  {
    name: "Joana Gorosito",
    role: "Atención al Alumno",
    image: "https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/8d8d9167-df39-4729-8560-88ef9e1d156d.webp"
  },
];

export const TeamSection: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-mx-blue text-5xl md:text-7xl font-black mb-6 uppercase">EL EQUIPO</h2>
        <p className="text-mx-text-muted max-w-xl mx-auto font-light">
          Detrás de cada programa hay un equipo de expertos comprometidos con tu aprendizaje.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {TEAM.map((member, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -10 }}
            className="group relative aspect-[3/4] overflow-hidden bg-mx-card border border-mx-border rounded-lg"
          >
            <Image
              src={member.image}
              alt={member.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0 duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h4 className="text-white text-xl font-bold mb-1">{member.name}</h4>
              <p className="text-mx-orange text-xs tracking-widest uppercase">{member.role}</p>
              <div className="flex gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 hover:text-white cursor-pointer"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <Mail size={16} className="text-white/60 hover:text-white cursor-pointer" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
