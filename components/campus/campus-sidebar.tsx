"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/admin/nav-user";
import { CampusBrand } from "./brand";
import { CampusNavMain } from "./nav-main";
import TutorQuestionModal from "@/app/maxymia/components/TutorQuestionModal";
import type { Locale, MaxymiaCourse } from "@/app/maxymia/types";

/** Sidebar del campus (kit shadcn, misma estructura que el del panel /admin). */
export function CampusSidebar({
  locale,
  courses,
  ...props
}: React.ComponentProps<typeof Sidebar> & { locale: Locale; courses: MaxymiaCourse[] }) {
  const [askOpen, setAskOpen] = useState(false);
  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <CampusBrand />
        </SidebarHeader>
        <SidebarContent>
          <CampusNavMain locale={locale} onAskTutor={() => setAskOpen(true)} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <TutorQuestionModal open={askOpen} onClose={() => setAskOpen(false)} locale={locale} courses={courses} />
    </>
  );
}
