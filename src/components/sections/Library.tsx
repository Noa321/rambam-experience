"use client";

import { useState } from "react";
import Icon from "../Icon";
import { books } from "@/data/books";

interface LibraryProps {
  onNavigate: (section: string) => void;
}

export default function Library({ onNavigate }: LibraryProps) {
  const [tab, setTab] = useState<"full" | "today">("full");

  return (
    <section className="animate-fade-in">
      <header className="sticky top-0 z-40 bg-white/90 ios-blur border-b border-gray-100">
        <div className="flex items-center justify-between px-4 lg:px-8 pt-4 pb-2">
          <div className="w-10 lg:hidden">
            <button onClick={() => onNavigate("dashboard")} className="text-primary cursor-pointer">
              <Icon name="arrow_back_ios" />
            </button>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-primary uppercase">
            Mishneh Torah
          </h1>
          <div className="w-10 flex justify-end">
            <button className="text-primary">
              <Icon name="search" />
            </button>
          </div>
        </div>
        <div className="px-4 lg:px-8 py-3">
          <div className="flex h-9 items-center justify-center rounded-lg bg-inactive-grey p-1 max-w-xs">
            <button
              onClick={() => setTab("full")}
              className={`flex h-full grow items-center justify-center rounded-md text-xs transition-all ${
                tab === "full"
                  ? "bg-primary shadow-sm font-semibold text-white"
                  : "text-light-grey font-medium"
              }`}
            >
              Full Library
            </button>
            <button
              onClick={() => setTab("today")}
              className={`flex h-full grow items-center justify-center rounded-md text-xs transition-all ${
                tab === "today"
                  ? "bg-primary shadow-sm font-semibold text-white"
                  : "text-light-grey font-medium"
              }`}
            >
              Today's Study
            </button>
          </div>
        </div>
      </header>

      {/* Full Library Grid */}
      {tab === "full" && (
        <main className="px-4 lg:px-8 py-6 pb-28 lg:pb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => onNavigate("chapter")}
                className="cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="h-1.5 w-full" style={{ background: book.color }} />
                <div className="p-4 flex flex-col h-full">
                  <span className="text-[10px] font-bold text-light-grey tracking-widest uppercase mb-1">
                    Book {book.num}
                  </span>
                  <h3 className="text-xl font-bold text-primary mb-0.5 leading-tight">
                    {book.heb}
                  </h3>
                  <p className="text-xs text-light-grey mb-3">{book.eng}</p>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-1.5">
                    <Icon name="menu_book" className="text-[14px] text-primary" />
                    <span className="text-[10px] font-medium text-light-grey">
                      {book.treatises} Treatises
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Today's Study */}
      {tab === "today" && (
        <main className="px-4 lg:px-8 py-6 pb-28 lg:pb-8">
          <div className="max-w-lg mx-auto lg:mx-0">
            <h2 className="text-primary text-xl font-bold mb-1">Today's Study</h2>
            <p className="text-warm-grey text-sm mb-6">Hilchot Shabbat, Chapters 4–6</p>
            <div className="space-y-3">
              {[
                { ch: 4, title: "Sabbath Labors", active: true },
                { ch: 5, title: "Additional Prohibitions", active: false },
                { ch: 6, title: "Shabbat Boundaries", active: false },
              ].map((item) => (
                <div
                  key={item.ch}
                  onClick={item.active ? () => onNavigate("chapter") : undefined}
                  className={`flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl ios-shadow ${
                    item.active ? "cursor-pointer hover:shadow-md transition-shadow" : "opacity-60"
                  }`}
                >
                  <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                    {item.ch}
                  </div>
                  <div className="flex-1">
                    <p className="text-primary text-sm font-bold">Chapter {item.ch}</p>
                    <p className="text-warm-grey text-xs">{item.title}</p>
                  </div>
                  {item.active ? (
                    <Icon name="chevron_right" className="text-primary/30" />
                  ) : (
                    <Icon name="lock" className="text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </section>
  );
}
