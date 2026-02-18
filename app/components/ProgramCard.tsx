"use client";

import React, { useState } from "react";
import { m } from "framer-motion";
import { Star, ArrowUpRight, Crown } from "lucide-react";
import Link from "next/link";
import { Program } from "@/lib/strapi/types";

// Generate a consistent rating between 4 and 5 based on program id
function generateRating(id: number): number {
  const seed = (id * 7919) % 100;
  return 4 + seed / 100;
}

// Generate consistent student count
function generateStudents(id: number): string {
  const seed = ((id * 3571) % 30) + 10;
  return `${(seed / 10).toFixed(1)}K`;
}

interface ProgramCardProps {
  program: Program;
  rating?: number;
  students?: string;
  index?: number;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  rating,
  students,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const displayRating = rating ?? generateRating(program.id);
  const displayStudents = students ?? generateStudents(program.id);

  const isMaster = program.type === "Master";

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-mx-bg rounded-lg overflow-hidden cursor-pointer border border-[#ddd] hover:border-mx-orange/50 transition-all duration-300"
    >
      <Link
        href={`/programas/${program.slug}`}
        className="flex flex-col h-full"
      >
        {/* Image area */}
        <div className="relative h-[220px] xl:h-[240px] 2xl:h-[299px] p-4 xl:p-5 2xl:p-6 flex flex-col justify-between overflow-hidden">
          {/* Background image */}
          <m.img
            src={program.image}
            alt={program.title}
            className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Gradient overlay fading to bg */}
          <div
            className="absolute inset-0 z-10 pointer-events-none rounded-t-lg"
            style={{
              
            }}
          />

          {/* Type badge - top left */}
          <div className="relative z-20 flex items-center gap-2 justify-between">
            <span
              className={`px-4 py-2 backdrop-blur-sm text-xs font-medium rounded-full ${
                isMaster
                  ? "bg-mx-blue text-white"
                  : "bg-mx-orange border border-mx-orange text-white"
              }`}
            >
              {program.type}
            </span>
            {program.isPro && (
              <span className="flex items-center gap-1 px-3 py-2 text-[10px] font-black tracking-wider uppercase text-white rounded-full bg-gradient-to-r from-[#f7a000] via-[#f7c948] to-[#f7a000] shadow-lg shadow-[#f7a000]/30">
                <Crown size={10} /> PRO
              </span>
            )}
          </div>

          {/* Category tags - bottom of image */}
          {program.topics && program.topics.length > 0 && (
            <div className="relative z-20 flex gap-4 items-start">
              {program.topics.slice(0, 2).map((topic) => (
                <span
                  key={topic.name}
                  className="px-4 py-2 backdrop-blur-[1px] bg-[rgba(102,101,99,0.3)] border border-[rgba(102,101,99,0.5)] text-white text-xs font-medium rounded-full"
                >
                  {topic.name}
                </span>
              ))}
              {program.topics.length > 2 && (
                <span className="px-4 py-2 backdrop-blur-[1px] bg-[rgba(102,101,99,0.3)] border border-[rgba(102,101,99,0.4)] text-white text-xs font-medium rounded-full">
                  +{program.topics.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-mx-bg px-4 xl:px-5 2xl:px-6 py-3 flex flex-col flex-grow rounded-b-lg">
          {/* Rating */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={
                    star <= Math.floor(displayRating)
                      ? "text-mx-orange"
                      : "text-[#ddd]"
                  }
                  fill={
                    star <= Math.floor(displayRating)
                      ? "var(--color-mx-orange)"
                      : "transparent"
                  }
                />
              ))}
            </div>
            <span className="text-mx-text-muted text-sm">
              {displayRating.toFixed(1)}
            </span>
            <span className="text-mx-text-muted text-sm">
              ({displayStudents} estudiantes)
            </span>
          </div>

          {/* Title & Description */}
          <div className="flex flex-col gap-2 mb-4">
            <h3 className="text-mx-text-muted text-xl font-medium line-clamp-2">
              {program.title}
            </h3>
            <p className="text-mx-text-muted text-sm 2xl:text-base font-light line-clamp-3 leading-normal">
              {program.description}
            </p>
          </div>

          {/* Price section */}
          <div className="flex items-center justify-between pt-4 mt-auto border-t border-[#ddd]">
            <div className="flex items-center gap-2">
              {program.originalPrice && (
                <span className="text-mx-text-muted text-sm font-light line-through">
                  {program.originalPrice}€
                </span>
              )}
              <span
                className={`${program.originalPrice ? "text-mx-orange" : "text-mx-text"} text-xl font-medium`}
              >
                {program.price}€
              </span>
            </div>

            <m.div
              animate={{ x: isHovered ? 4 : 0 }}
              className="text-mx-text-muted"
            >
              <ArrowUpRight size={24} />
            </m.div>
          </div>
        </div>
      </Link>
    </m.div>
  );
};
