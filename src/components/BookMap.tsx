"use client";

import { useState } from "react";
import Link from "next/link";

export interface BookMapItem {
  id: string;
  num: string;
  eng: string;
  heb: string;
  color: string;
  state: "done" | "current" | "upcoming";
  fillPercent: number;
  chapters: number;
  treatiseCount: number;
  treatises: { id: string; name: string; chapters: number }[];
}

export default function BookMap({ books }: { books: BookMapItem[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-2.5">
      {books.map((b, i) => {
        const isOpen = open === b.id;
        return (
          <div
            key={b.id}
            className="rounded-xl border bg-white overflow-hidden fade-up"
            style={{
              ...(b.state === "current"
                ? { borderColor: "#B8860B", borderLeft: "3px solid #B8860B" }
                : { borderColor: "#E5E5E7" }),
              animationDelay: `${Math.min(i * 45, 500)}ms`,
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : b.id)}
              className="w-full text-left p-4 hover:bg-surface-container-low transition-colors"
              aria-expanded={isOpen}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span
                    className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-gray shrink-0"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Book {b.num}
                  </span>
                  <h3 className="font-serif text-[17px] font-semibold text-primary truncate">{b.eng}</h3>
                  <span className="font-serif text-[15px] text-muted-gray shrink-0">{b.heb}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {b.state === "current" ? (
                    <span
                      className="text-[9px] font-semibold tracking-[0.1em] uppercase px-2 py-1 rounded-full pulse-here"
                      style={{ backgroundColor: "rgba(184,134,11,0.12)", color: "#B8860B", fontFamily: "var(--font-sans)" }}
                    >
                      You are here
                    </span>
                  ) : b.state === "done" ? (
                    <span className="material-symbols-outlined text-parchment-gold" style={{ fontSize: "18px" }}>
                      check_circle
                    </span>
                  ) : null}
                  <span
                    className="material-symbols-outlined text-muted-gray transition-transform"
                    style={{ fontSize: "20px", transform: isOpen ? "rotate(180deg)" : "none" }}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden">
                <div
                  className="h-full rounded-full bar-grow"
                  style={{
                    width: `${b.fillPercent}%`,
                    backgroundColor: b.color,
                    animationDelay: `${Math.min(i * 45, 500) + 150}ms`,
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-gray mt-1.5" style={{ fontFamily: "var(--font-sans)" }}>
                {b.chapters} chapters · {b.treatiseCount} treatises
                {b.state === "current" && ` · ${b.fillPercent}% in`}
              </p>
            </button>

            {isOpen && (
              <div className="border-t border-soft-border divide-y divide-soft-border animate-fade-in">
                {b.treatises.map((t) => (
                  <Link
                    key={t.id}
                    href={`/study/${t.id}/1`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-surface-container-low transition-colors group"
                  >
                    <span className="text-[14px] text-charcoal-text">{t.name}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] text-muted-gray" style={{ fontFamily: "var(--font-sans)" }}>
                        {t.chapters} ch
                      </span>
                      <span
                        className="material-symbols-outlined text-muted-gray group-hover:text-parchment-gold transition-colors"
                        style={{ fontSize: "18px" }}
                      >
                        chevron_right
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
