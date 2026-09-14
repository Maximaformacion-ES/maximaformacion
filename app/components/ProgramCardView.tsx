"use client";

import React from "react";
import { Clock, GraduationCap, Layers } from "lucide-react";
import { Program } from "@/lib/strapi/types";
import { CourseCard, type CourseCardData } from "./CourseCard";

/**
 * Adaptador Program → <CourseCard>, SIN Clerk. Recibe `userHasPro` como prop.
 *   - <ProgramCard> (envoltorio con Clerk) lo usa en las rutas de app con el
 *     estado Pro real del usuario;
 *   - la home/marketing (CoursesSection) lo usa con `userHasPro={false}` para
 *     no cargar Clerk.
 * La tarjeta en sí es la misma que la de los cursos de Maxymia.
 */
export interface ProgramCardViewProps {
  program: Program;
  index?: number;
  userHasPro?: boolean;
  /** El usuario ya tiene acceso (matrícula o Pro): la tarjeta lo dice y
   *  enlaza al player en vez de a la ficha. */
  enrolled?: boolean;
}

export function programToCardData(program: Program, enrolled = false): CourseCardData {
  const isMaster = program.type === "Master";
  const meta: CourseCardData["meta"] = [];
  if (program.durationLabel || program.duration) {
    meta.push({ icon: Clock, label: program.durationLabel || `${program.duration} horas` });
  }
  if (program.ects > 0) meta.push({ icon: GraduationCap, label: `${program.ects} ECTS` });
  if (program.modules?.length) meta.push({ icon: Layers, label: `${program.modules.length} módulos` });

  return {
    href: enrolled
      ? `/cursos/${program.documentId || program.id}`
      : program.href || `/programas/${program.slug}`,
    title: program.title,
    description: program.description,
    image: program.image,
    kind: isMaster ? "master" : "course",
    isPro: !!program.isPro,
    area: program.subjectArea ?? program.topics?.[0]?.name ?? null,
    meta,
    pricing: {
      price: program.price ?? null,
      originalPrice: program.originalPrice ?? null,
      isPro: program.isPro,
      haveDiscount: program.haveDiscount,
      type: program.type,
      // Los másteres siempre pasan por conversación comercial, tengan o no un
      // número en el CMS; y cualquier programa sin precio configurado también.
      consult: isMaster || !program.price,
    },
    enrolled,
  };
}

export const ProgramCardView: React.FC<ProgramCardViewProps> = ({
  program,
  index = 0,
  userHasPro = false,
  enrolled = false,
}) => (
  <CourseCard
    data={programToCardData(program, enrolled)}
    index={index}
    userHasPro={userHasPro}
    priority={index < 3}
  />
);
