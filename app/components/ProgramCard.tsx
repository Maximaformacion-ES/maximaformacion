"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useUserCampus } from "@/app/hooks/useUserCampus";
import { Program } from "@/lib/strapi/types";
import { ProgramCardView } from "./ProgramCardView";

interface ProgramCardProps {
  program: Program;
  index?: number;
}

/**
 * Tarjeta de programa CON Clerk — para las rutas de app (catálogo /programas,
 * ficha, grid). Es un envoltorio fino sobre <ProgramCardView>: aporta el estado
 * Pro real del usuario. En la home/marketing se usa <ProgramCardView> directo
 * (userHasPro=false) para no cargar Clerk. El API público no cambia.
 */
export const ProgramCard: React.FC<ProgramCardProps> = ({ program, index = 0 }) => {
  const { isSignedIn } = useUser();
  const { hasPro, hasAccess } = useUserCampus();
  const userHasPro = !!isSignedIn && hasPro;
  // Comprado (o incluido en su Pro): la tarjeta lo indica y lleva al player.
  const enrolled = !!isSignedIn && hasAccess(program.documentId || String(program.id), program.isPro);

  return <ProgramCardView program={program} index={index} userHasPro={userHasPro} enrolled={enrolled} />;
};
