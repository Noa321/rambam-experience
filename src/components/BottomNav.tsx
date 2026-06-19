"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { recordVisit } from "@/lib/streak";

export default function BottomNav() {
  const pathname = usePathname();

  // Record the daily visit for the journey streak (once per app session).
  useEffect(() => {
    recordVisit();
  }, []);

  const tabs = [
    { href: "/", icon: "calendar_today", label: "Today", match: "/" },
    { href: "/journey", icon: "explore", label: "Journey", match: "/journey" },
    { href: "/library", icon: "auto_stories", label: "Library", match: "/library" },
    { href: "/archive", icon: "history", label: "Archive", match: "/archive" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-4 px-6 border-t border-soft-border bottom-nav-blur"
      style={{ backgroundColor: "rgba(253, 251, 247, 0.8)" }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.match;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center transition-colors active:scale-90 duration-150 ${
              isActive
                ? "text-parchment-gold"
                : "text-muted-gray hover:text-primary"
            }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              style={
                isActive
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {tab.icon}
            </span>
            <span
              className="text-[10px] font-semibold tracking-[0.1em] uppercase"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
