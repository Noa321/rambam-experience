"use client";

import { useState } from "react";
import Landing from "@/components/sections/Landing";
import Dashboard from "@/components/sections/Dashboard";
import Library from "@/components/sections/Library";
import ChapterStudy from "@/components/sections/ChapterStudy";
import Profile from "@/components/sections/Profile";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

type View = "landing" | "app";
type Section = "dashboard" | "library" | "chapter" | "profile" | "daily";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [section, setSection] = useState<Section>("dashboard");

  const navigateToApp = (sec: Section) => {
    setView("app");
    setSection(sec);
    window.scrollTo(0, 0);
  };

  const navigateSection = (sec: string) => {
    setSection(sec as Section);
    window.scrollTo(0, 0);
  };

  if (view === "landing") {
    return (
      <Landing
        onBegin={() => navigateToApp("dashboard")}
        onResume={() => navigateToApp("chapter")}
      />
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar currentSection={section} onNavigate={navigateSection} />

      {/* Main content */}
      <div className="flex-1 lg:ml-[240px]">
        {section === "dashboard" && <Dashboard onNavigate={navigateSection} />}
        {section === "library" && <Library onNavigate={navigateSection} />}
        {section === "chapter" && <ChapterStudy onNavigate={navigateSection} />}
        {section === "profile" && <Profile onNavigate={navigateSection} />}
        {section === "daily" && <Dashboard onNavigate={navigateSection} />}
      </div>

      {/* Mobile bottom nav */}
      <MobileNav currentSection={section} onNavigate={navigateSection} />
    </div>
  );
}
