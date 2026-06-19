"use client";

import { useState } from "react";
import Link from "next/link";

const NAV = [
  { href: "/", label: "Today", icon: "calendar_today" },
  { href: "/journey", label: "Journey", icon: "explore" },
  { href: "/library", label: "Library", icon: "auto_stories" },
  { href: "/archive", label: "Archive", icon: "history" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-50"
        style={{ backgroundColor: "rgb(253, 251, 247)" }}
      >
        <div className="flex justify-between items-center w-full px-5 h-16 max-w-[800px] mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="hover:opacity-80 transition-opacity active:scale-95 duration-200"
            >
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: "26px" }}
              >
                menu
              </span>
            </button>
            <Link href="/" className="flex items-center">
              <h1 className="font-serif text-[21px] sm:text-[24px] leading-[32px] font-semibold text-primary">
                The Rambam Experience
              </h1>
            </Link>
          </div>
          <button
            aria-label="Account"
            className="hover:opacity-80 transition-opacity active:scale-95 duration-200"
          >
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: "24px" }}
            >
              account_circle
            </span>
          </button>
        </div>
      </header>

      {/* Slide-out menu */}
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/30 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute top-0 left-0 h-full w-[80%] max-w-[320px] flex flex-col shadow-2xl animate-slide-in-left"
            style={{ backgroundColor: "#FDFBF7" }}
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-soft-border">
              <span className="font-serif text-[20px] font-semibold text-primary">
                Menu
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="active:scale-95 transition-transform"
              >
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontSize: "24px" }}
                >
                  close
                </span>
              </button>
            </div>
            <nav className="flex flex-col py-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 px-5 py-4 text-primary hover:bg-surface-container-low transition-colors"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "22px" }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[17px] font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
