"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-cloud-gray">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="sm:hidden flex items-center justify-center w-9 h-9 -ml-1 text-slate-ink"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              menu
            </span>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="24" height="24" viewBox="0 0 40 40" fill="none"
              xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0"
            >
              <path d="M8 8C8 6.9 8.9 6 10 6H18V34H10C8.9 34 8 33.1 8 32V8Z" fill="#334155" />
              <path d="M22 6H30C31.1 6 32 6.9 32 8V32C32 33.1 31.1 34 30 34H22V6Z" fill="#334155" opacity="0.7" />
              <path d="M18 6H22V34H18V6Z" fill="#334155" opacity="0.4" />
              <line x1="11" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.2" />
              <line x1="11" y1="16" x2="15" y2="16" stroke="white" strokeWidth="1.2" />
              <line x1="24" y1="12" x2="29" y2="12" stroke="white" strokeWidth="1.2" opacity="0.8" />
              <line x1="24" y1="16" x2="28" y2="16" stroke="white" strokeWidth="1.2" opacity="0.8" />
            </svg>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-base font-semibold text-slate-ink leading-none">
                The Rambam
              </span>
              <span
                className="text-[8px] font-semibold tracking-[2px] text-oxide-red leading-none hidden sm:inline"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                EXPERIENCE
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6">
            <span className="text-sm font-medium text-slate-ink">Today</span>
            <Link
              href="/library"
              className="text-sm font-medium text-light-slate hover:text-slate-ink transition-colors"
            >
              Library
            </Link>
            <Link
              href="/archive"
              className="text-sm font-medium text-light-slate hover:text-slate-ink transition-colors"
            >
              Archive
            </Link>
          </nav>

          {/* Spacer for mobile to balance hamburger */}
          <div className="w-9 sm:hidden" />
        </div>
      </header>

      {/* Mobile side menu overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile side menu drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-slate-ink z-[70] transform transition-transform duration-300 ease-out shadow-2xl ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-base font-semibold text-white leading-none">
              The Rambam
            </span>
            <span className="text-[7px] font-semibold tracking-[2px] text-oxide-red leading-none">
              EXPERIENCE
            </span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>close</span>
          </button>
        </div>

        <div className="w-full h-px bg-white/10" />

        {/* Drawer nav */}
        <nav className="px-3 py-4 space-y-1">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>today</span>
            <span className="text-sm font-medium">Today</span>
          </Link>
          <Link
            href="/library"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>library_books</span>
            <span className="text-sm font-medium">Library</span>
          </Link>
          <Link
            href="/archive"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>inventory_2</span>
            <span className="text-sm font-medium">Archive</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
