'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Play, ArrowUpRight, Crown } from 'lucide-react';
import Link from 'next/link';
import type { Program } from '@/lib/strapi/types';

interface CourseCardProps {
  program: Program;
  rating: number;
  students: string;
  index: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ program, rating, students, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get first tag as category, or use program type
  const category = program.tags?.[0] || program.type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#111] rounded-2xl overflow-hidden cursor-pointer"
    >
      <Link href={`/programas/${program.slug}`} className="block">
        {/* Image */}
        <div className="relative h-56 md:h-64 overflow-hidden">
          <motion.img
            src={program.image}
            alt={program.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs font-medium rounded-full">
              {category}
            </span>
            {program.isPro && (
              <span className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-full">
                <Crown size={10} /> PRO
              </span>
            )}
          </div>

          {/* Play button for video preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <ArrowUpRight size={24} className="text-white ml-1"/>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.floor(rating) ? "text-amber-400" : "text-white/20"}
                  fill={i < Math.floor(rating) ? "#f59e0b" : "transparent"}
                />
              ))}
            </div>
            <span className="text-white/50 text-sm">{rating.toFixed(1)}</span>
            <span className="text-white/30 text-sm">({students} estudiantes)</span>
          </div>

          <h3 className="text-white text-xl font-bold mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
            {program.title}
          </h3>

          <p className="text-white/50 text-sm font-light mb-4 line-clamp-2">
            {program.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              {program.originalPrice && (
                <span className="text-white/40 text-sm line-through mr-2">{program.originalPrice}€</span>
              )}
              <span className="text-white text-xl font-bold">{program.price}€</span>
            </div>

            <motion.div
              animate={{ x: isHovered ? 4 : 0 }}
              className="text-amber-400"
            >
              <ArrowUpRight size={20} />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
