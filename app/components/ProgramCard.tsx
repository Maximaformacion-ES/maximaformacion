"use client";

import React, { useState } from "react";
import { m } from "framer-motion";
import { ArrowUpRight, Crown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Program } from "@/lib/strapi/types";
import { useUser } from "@clerk/nextjs";
import { useUserCampus } from "@/app/hooks/useUserCampus";
import { getEffectivePrice, shouldApplyProDiscount, isFreeWithPro, getProSavings } from "@/lib/pricing";

interface ProgramCardProps {
  program: Program;
  index?: number;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isSignedIn } = useUser();
  const { hasPro } = useUserCampus();

  const isMaster = program.type === "Master";
  const userHasPro = !!isSignedIn && hasPro;
  const includedInPro = isFreeWithPro(program, userHasPro);
  const proDiscount = !includedInPro && shouldApplyProDiscount(program, userHasPro);
  const effectivePrice = getEffectivePrice(program, userHasPro);
  const proSavings = getProSavings(program, userHasPro);
  const detailHref = program.href || `/programas/${program.slug}`;

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
        href={detailHref}
        className="flex flex-col h-full"
      >
        {/* Image area */}
        <div className="relative h-[220px] xl:h-[240px] 2xl:h-[299px] p-4 xl:p-5 2xl:p-6 flex flex-col justify-between overflow-hidden">
          {/* Background image — next/image generates the responsive srcset and
              serves AVIF/WebP; the surrounding motion.div carries the hover
              scale animation that the legacy <m.img> handled in one element. */}
          <m.div
            className="absolute inset-0"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={program.image}
              alt={program.title}
              fill
              className="object-cover rounded-t-lg"
              sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw"
              loading={index < 3 ? 'eager' : 'lazy'}
            />
          </m.div>
          {/* Gradient overlay fading to bg */}
          <div
            className="absolute inset-0 z-10 pointer-events-none rounded-t-lg"
            style={{
              
            }}
          />

          {/* Type badge - top left */}
          <div className="relative z-20 flex items-center gap-2 justify-between">
            <span
              className={`px-4 py-2 backdrop-blur-sm text-label-sm md:text-label-md font-medium rounded-full ${
                isMaster
                  ? "bg-mx-blue text-white"
                  : "bg-mx-orange border border-mx-orange text-white"
              }`}
            >
              {program.type}
            </span>
            {program.isPro && (
              <span className="flex items-center gap-1 px-3 py-2 text-label-sm font-black tracking-wider uppercase text-white rounded-full bg-gradient-to-r from-[#f7a000] via-[#f7c948] to-[#f7a000] shadow-lg shadow-[#f7a000]/30">
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
                  className="px-4 py-2 backdrop-blur-[1px] bg-[rgba(102,101,99,0.3)] border border-[rgba(102,101,99,0.5)] text-white text-label-sm md:text-label-md font-medium rounded-full"
>
                  {topic.name}
                </span>
              ))}
              {program.topics.length > 2 && (
                <span className="px-4 py-2 backdrop-blur-[1px] bg-[rgba(102,101,99,0.3)] border border-[rgba(102,101,99,0.4)] text-white text-label-md font-medium rounded-full">
                  +{program.topics.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-mx-bg px-4 xl:px-5 2xl:px-6 py-3 flex flex-col flex-grow rounded-b-lg">
          {/* Title & Description */}
          <div className="flex flex-col gap-2 mb-4">
            <h3 className="text-mx-text-muted text-heading-sm  font-medium line-clamp-2">
              {program.title}
            </h3>
            <p className="text-mx-text-muted text-body-sm 2xl:text-body-md font-light line-clamp-3 leading-normal">
              {program.description}
            </p>
          </div>

          {/* Price section */}
          <div className="flex items-center justify-between pt-4 mt-auto border-t border-[#ddd]">
            <div className="flex items-center gap-2">
              {isMaster || !program.price ? (
                // Masters always go through a sales conversation, regardless
                // of any number the CMS happens to carry. Same for any other
                // program lacking a configured price. Pro/discount badges
                // aren't meaningful without a real base price either.
                <span className="text-mx-text text-heading-sm font-medium">
                  Consultar precio
                </span>
              ) : includedInPro ? (
                <>
                  <span className="text-mx-text-muted text-body-sm font-light line-through">
                    {program.price}€
                  </span>
                  <span className="flex items-center gap-1 text-mx-orange text-heading-sm font-medium">
                    <Crown size={14} /> Incluido en Pro
                  </span>
                </>
              ) : proDiscount ? (
                <>
                  <span className="text-mx-text-muted text-body-sm font-light line-through">
                    {program.price}€
                  </span>
                  <span className="text-mx-orange text-heading-sm font-medium">
                    {effectivePrice}€
                  </span>
                  <span className="flex items-center gap-1 text-label-sm font-bold text-mx-orange">
                    <Crown size={10} /> -20%
                  </span>
                </>
              ) : (
                <>
                  {program.originalPrice && (
                    <span className="text-mx-text-muted text-body-sm font-light line-through">
                      {program.originalPrice}€
                    </span>
                  )}
                  <span
                    className={`${program.originalPrice ? "text-mx-orange" : "text-mx-text"} text-heading-sm font-medium`}
                  >
                    {program.price}€
                  </span>
                </>
              )}
            </div>

            <m.div
              animate={{ x: isHovered ? 4 : 0 }}
              className="text-mx-text-muted"
            >
              <ArrowUpRight size={24} />
            </m.div>
          </div>

          {/* Pro savings hint for non-Pro users */}
          {proSavings > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-mx-orange text-label-md font-medium">
              <Crown size={11} />
              Ahorra {proSavings}€ con Pro
            </p>
          )}
        </div>
      </Link>
    </m.div>
  );
};
