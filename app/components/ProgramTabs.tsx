"use client";

import React, { useState, useMemo, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import "../styles/markdown.css";
import {
  ChevronDown,
  Clock,
  Users,
  Briefcase,
  Target,
  BookOpen,
  ListOrdered,
  PlayCircle,
} from "lucide-react";
import type { Program } from "@/lib/strapi/types";
import type { LucideIcon } from "lucide-react";
import type { ProgramRichHtml } from "@/app/programas/[id]/page";

// Renders pre-rendered markdown HTML produced server-side. Previously this
// did the markdown conversion in a useEffect, which meant SSR emitted
// nothing and the long-form copy stayed invisible to crawlers until JS
// hydration. Now the parent page passes already-converted HTML strings via
// the `richHtml` prop, so the body is in the initial HTML.
function MarkdownHtml({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  if (!html) return null;
  return (
    <div
      className={`markdown-content ${className}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface ProgramTabsProps {
  program: Program;
  richHtml: ProgramRichHtml;
}

interface TabDef {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export const ProgramTabs: React.FC<ProgramTabsProps> = ({ program, richHtml }) => {
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState("descripcion");

  useEffect(() => {
    console.log("ProgramTabs - program data:", {
      title: program.title,
      topics: program.topics,
      audience: program.audience,
      objectives: program.objectives,
      careers: program.careers,
    });
  }, [program]);

  const tabs = useMemo<TabDef[]>(() => {
    const t: TabDef[] = [
      { value: "descripcion", label: "Descripción", icon: BookOpen },
      { value: "temario", label: "Temario", icon: ListOrdered },
    ];
    if (program.objectives)
      t.push({ value: "objetivos", label: "Objetivos", icon: Target });
    if (program.audience)
      t.push({ value: "audiencia", label: "A quién va dirigido", icon: Users });
    if (program.careers)
      t.push({
        value: "salidas",
        label: "Salidas profesionales",
        icon: Briefcase,
      });
    if (program.videoUrl)
      t.push({ value: "video", label: "Vídeo", icon: PlayCircle });
    return t;
  }, [program.objectives, program.audience, program.careers, program.videoUrl]);

  return (
    <div>
      {/* Tab bar */}
      <div className="relative flex border-b border-mx-border gap-1 md:gap-6 xl:gap-8 w-full overflow-x-auto scrollbar-hide -mx-2 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`relative px-2 md:px-3 py-3 text-label-sm md:text-label-md font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.value
                ? "text-mx-orange"
                : "text-mx-text-muted hover:text-mx-orange"
            }`}
          >
            <span className="flex items-center gap-1 md:gap-2">
              {tab.icon && <tab.icon className="size-3.5 md:size-4" />}
              <span className="md:hidden">
                {tab.value === "descripcion" && "Info"}
                {tab.value === "temario" && "Temario"}
                {tab.value === "objetivos" && "Objetivos"}
                {tab.value === "audiencia" && "Audiencia"}
                {tab.value === "salidas" && "Salidas"}
                {tab.value === "video" && "Vídeo"}
              </span>
              <span className="hidden md:inline">{tab.label}</span>
            </span>
            {activeTab === tab.value && (
              <m.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-mx-orange"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content — all panels rendered always with `hidden` toggling
          the inactive ones. This keeps every panel in the initial HTML so
          crawlers see the full body of the program in SSR, while the user
          UX still only shows one panel at a time. */}
      <div className="pt-10 md:pt-4">
          <div
            role="tabpanel"
            id="panel-descripcion"
            hidden={activeTab !== "descripcion"}
          >
            <MarkdownHtml
              html={richHtml.longDescription}
              className="text-body-sm md:text-body-md text-mx-text-muted font-light leading-relaxed"
            />
          </div>

          <div
            role="tabpanel"
            id="panel-temario"
            hidden={activeTab !== "temario"}
          >
              <div className="mb-4 text-mx-text-muted text-body-sm">
                {program.modules.length} módulos especializados
              </div>
              <div className="space-y-3">
                {program.modules.map((module, index) => (
                  <div
                    key={module.title}
                    className="bg-mx-card border border-mx-border overflow-hidden rounded-lg"
                  >
                    <button
                      onClick={() =>
                        setExpandedModule(
                          expandedModule === index ? null : index,
                        )
                      }
                      className="w-full p-5 md:p-6 flex items-center justify-between text-left hover:bg-mx-orange/5 duration-200 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-mx-orange text-label-sm md:text-label-md font-bold">
                            Módulo {index + 1}
                          </span>
                          <span className="flex items-center gap-1.5 text-mx-text-muted text-label-sm md:text-label-md">
                            <Clock size={12} />
                            {module.hours}h
                          </span>
                        </div>
                        <h3 className="text-body-sm md:text-body-md font-bold text-mx-text group-hover:text-mx-orange transition-colors duration-300">
                          {module.title}
                        </h3>
                        <p className="text-mx-text-muted mt-1 text-body-sm font-light">
                          {module.description}
                        </p>
                      </div>
                      <m.div
                        animate={{ rotate: expandedModule === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 shrink-0"
                      >
                        <ChevronDown size={20} className="text-mx-text-muted" />
                      </m.div>
                    </button>

                    <AnimatePresence>
                      {expandedModule === index && (
                        <m.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 md:px-6 pb-5 md:pb-6 pt-3 border-t border-mx-border">
                            <h4 className="text-label-sm md:text-label-md font-bold text-mx-text-muted uppercase tracking-widest mb-3">
                              Unidades del Módulo
                            </h4>
                            <div className="grid md:grid-cols-1">
                              {module.units?.map((unit, unitIndex) => (
                                <m.div
                                  key={unitIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: unitIndex * 0.05 }}
                                  className="flex items-start gap-3 text-mx-text py-4 border-b last:border-0 border-mx-border"
                                >
                                  <div className="w-1 h-1 rounded-full bg-mx-orange mt-2 shrink-0" />
                                  <span className="font-light text-body-sm">
                                    {unit.title}
                                  </span>
                                </m.div>
                              ))}
                            </div>
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
          </div>

          <div
            role="tabpanel"
            id="panel-objetivos"
            hidden={activeTab !== "objetivos"}
          >
            <MarkdownHtml
              html={richHtml.objectives}
              className="text-body-sm md:text-body-md text-mx-text-muted font-light [&_ul]:space-y-3 md:[&_ul]:space-y-4 [&_li]:flex [&_li]:items-start [&_li]:gap-3 md:[&_li]:gap-4 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-mx-orange [&_li]:before:mt-[7px] [&_li]:before:shrink-0 [&_ul]:list-none [&_ul]:pl-0 [&_p]:mb-3 md:[&_p]:mb-4"
            />
          </div>

          <div
            role="tabpanel"
            id="panel-audiencia"
            hidden={activeTab !== "audiencia"}
          >
            <MarkdownHtml
              html={richHtml.audience}
              className="text-body-sm md:text-body-md text-mx-text-muted font-light [&_ul]:space-y-3 md:[&_ul]:space-y-4 [&_li]:flex [&_li]:items-start [&_li]:gap-3 md:[&_li]:gap-4 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-mx-orange [&_li]:before:mt-[7px] [&_li]:before:shrink-0 [&_ul]:list-none [&_ul]:pl-0 [&_p]:mb-3 md:[&_p]:mb-4"
            />
          </div>

          <div
            role="tabpanel"
            id="panel-salidas"
            hidden={activeTab !== "salidas"}
          >
            <MarkdownHtml
              html={richHtml.careers}
              className="text-body-sm md:text-body-md text-mx-text-muted font-light [&_ul]:space-y-3 md:[&_ul]:space-y-4 [&_li]:flex [&_li]:items-start [&_li]:gap-3 md:[&_li]:gap-4 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-mx-orange [&_li]:before:mt-[7px] [&_li]:before:shrink-0 [&_ul]:list-none [&_ul]:pl-0 [&_p]:mb-3 md:[&_p]:mb-4"
            />
          </div>

          {program.videoUrl && (
            <div
              role="tabpanel"
              id="panel-video"
              hidden={activeTab !== "video"}
            >
              <VideoEmbed url={program.videoUrl} title={program.title} />
            </div>
          )}
      </div>
    </div>
  );
};

// ─── FAQ accordion item ─────────────────────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-mx-card border border-mx-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-5 md:p-6 flex items-start justify-between gap-4 text-left hover:bg-mx-orange/5 transition-colors"
      >
        <span className="text-body-sm md:text-body-md font-bold text-mx-text">
          {question}
        </span>
        <m.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0 mt-0.5 text-mx-text-muted"
        >
          <ChevronDown size={20} />
        </m.span>
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 pt-1 text-body-sm md:text-body-md text-mx-text-muted font-light leading-relaxed border-t border-mx-border whitespace-pre-line">
              {answer}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Video embed ────────────────────────────────────────────────────────────

function VideoEmbed({ url, title }: { url: string; title: string }) {
  const ytMatch = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/i);
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  let embedSrc: string | null = null;
  if (ytMatch) embedSrc = `https://www.youtube.com/embed/${ytMatch[1]}`;
  else if (vimeoMatch) embedSrc = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  if (embedSrc) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={embedSrc}
          title={`Vídeo de ${title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }
  // Direct mp4 fallback
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <video
        controls
        className="w-full h-full"
        preload="metadata"
        title={`Vídeo de ${title}`}
      >
        <source src={url} />
      </video>
    </div>
  );
}
