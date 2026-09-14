"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronLeft, MessageCircle } from "lucide-react";
import { CourseSearch } from "./course-search";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/app/maxymia/components/NotificationBell";
import TutorQuestionModal from "@/app/maxymia/components/TutorQuestionModal";
import type { Locale, MaxymiaCourse } from "@/app/maxymia/types";

/**
 * Cabecera del campus (kit shadcn, como AdminHeader): trigger del sidebar,
 * buscador que lleva al catálogo con ?q= y notificaciones. En las páginas de
 * lección muestra además "Volver al curso" y el título del curso.
 */
export function CampusHeader({ locale, courses }: { locale: Locale; courses: MaxymiaCourse[] }) {
  const pathname = usePathname();
  const [askOpen, setAskOpen] = useState(false);

  const isLesson = /\/maxymia\/campus\/[^/]+\/lesson\//.test(pathname);
  const segments = pathname.split("/");
  const courseSlug = segments[segments.indexOf("campus") + 1] || "";
  const course = courses.find((c) => c.slug === courseSlug);

  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {isLesson ? (
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href={`/maxymia/campus/${courseSlug}`}>
              <ChevronLeft /> {locale === "es" ? "Volver al curso" : "Back to course"}
            </Link>
          </Button>
          {course && <span className="truncate text-sm text-muted-foreground">{course.title[locale]}</span>}
        </div>
      ) : (
        <CourseSearch locale={locale} courses={courses} />
      )}

      {/* Ayuda, arriba a la derecha: escribir al tutor y volver a la web. */}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAskOpen(true)}
          className="border-mx-orange/50 text-mx-orange-dark hover:bg-mx-orange/10 hover:text-mx-orange-dark"
        >
          <MessageCircle />
          <span className="hidden sm:inline">{locale === "es" ? "Escribir al tutor" : "Write to the tutor"}</span>
        </Button>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hidden md:inline-flex">
          <Link href="/">
            Máxima Formación <ArrowUpRight />
          </Link>
        </Button>
        <Separator orientation="vertical" className="mx-1 hidden h-4 sm:block" />
        <NotificationBell courses={courses} />
      </div>
      <TutorQuestionModal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        locale={locale}
        course={isLesson ? course : undefined}
        courses={courses}
      />
    </header>
  );
}
