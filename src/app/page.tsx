"use client";

import { useState } from "react";
import Landing from "@/components/sections/Landing";
import Dashboard from "@/components/sections/Dashboard";
import Library from "@/components/sections/Library";
import ChapterStudy from "@/components/sections/ChapterStudy";
import Profile from "@/components/sections/Profile";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { findTreatise } from "@/data/books";

type View = "landing" | "app";
type Section = "dashboard" | "library" | "chapter" | "profile" | "daily";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [section, setSection] = useState<Section>("dashboard");

  // Track which treatise and chapter the user is studying
  const [currentTreatiseId, setCurrentTreatiseId] = useState<string>("foundations");
  const [currentChapter, setCurrentChapter] = useState<number>(1);

  const navigateToApp = (sec: Section) => {
    setView("app");
    setSection(sec);
    window.scrollTo(0, 0);
  };

  const navigateSection = (sec: string, data?: Record<string, unknown>) => {
    setSection(sec as Section);

    // If navigating to chapter view with treatise/chapter data, update state
    if (data?.treatiseId) {
      setCurrentTreatiseId(data.treatiseId as string);
    }
    if (data?.chapter) {
      setCurrentChapter(data.chapter as number);
    }

    window.scrollTo(0, 0);
  };

  if (view === "landing") {
    return (
      <Landing
        onBegin={() => navigateToApp("dashboard")}
        onResume={() => {
          setCurrentTreatiseId("foundations");
          setCurrentChapter(1);
          navigateToApp("chapter");
        }}
      />
    );
  }

  // Look up the current treatise from our data
  const found = findTreatise(currentTreatiseId);
  const treatise = found?.treatise;
  const bookColor = found?.book.color;

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar currentSection={section} onNavigate={navigateSection} />

      {/* Main content */}
      <div className="flex-1 lg:ml-[240px]">
        {section === "dashboard" && <Dashboard onNavigate={navigateSection} />}
        {section === "library" && <Library onNavigate={navigateSection} />}
        {section === "chapter" && (
          <ChapterStudy
            onNavigate={navigateSection}
            treatise={treatise}
            chapter={currentChapter}
            bookColor={bookColor}
          />
        )}
        {section === "profile" && <Profile onNavigate={navigateSection} />}
        {section === "daily" && <Dashboard onNavigate={navigateSection} />}
      </div>

      {/* Mobile bottom nav */}
      <MobileNav currentSection={section} onNavigate={navigateSection} />
    </div>
  );
}