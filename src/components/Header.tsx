"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: "rgb(253, 251, 247)" }}
    >
      <div className="flex justify-between items-center w-full px-5 h-16 max-w-[800px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: "24px" }}
          >
            menu_book
          </span>
          <h1 className="font-serif text-[24px] leading-[32px] font-semibold text-primary">
            The Rambam Experience
          </h1>
        </Link>
        <button className="hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "24px" }}>
            account_circle
          </span>
        </button>
      </div>
    </header>
  );
}
