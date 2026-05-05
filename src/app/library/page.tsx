import { books, getBookChapterCount } from "@/data/books";
import { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Library | The Rambam Experience",
  description: "Browse all 14 books and 83 treatises of the Rambam\'s Mishneh Torah.",
};


export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-cloud-gray">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M8 8C8 6.9 8.9 6 10 6H18V34H10C8.9 34 8 33.1 8 32V8Z" fill="#334155" />
              <path d="M22 6H30C31.1 6 32 6.9 32 8V32C32 33.1 31.1 34 30 34H22V6Z" fill="#334155" opacity="0.7" />
              <path d="M18 6H22V34H18V6Z" fill="#334155" opacity="0.4" />
            </svg>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-base font-semibold text-slate-ink leading-none">The Rambam</span>
              <span className="text-[8px] font-semibold tracking-[2px] text-oxide-red leading-none hidden sm:inline" style={{ fontFamily: "var(--font-sans)" }}>EXPERIENCE</span>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-light-slate hover:text-slate-ink transition-colors">Today</Link>
            <span className="text-sm font-medium text-slate-ink">Library</span>
            <Link href="/archive" className="text-sm font-medium text-light-slate hover:text-slate-ink transition-colors">Archive</Link>
          </nav>
        </div>
      </header>
      <section className="pt-10 sm:pt-14 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <h1 className="font-serif text-[28px] sm:text-[36px] font-semibold text-slate-ink leading-[1.15] mb-2">Mishneh Torah</h1>
          <p className="text-blue-slate text-sm">All 14 books and 83 treatises of the Rambam&#39;s complete code of Jewish law</p>
        </div>
      </section>
      <section className="pb-12 px-4 sm:px-6">
        <div className="max-w-[800px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          {books.map((book) => {
            const totalChapters = getBookChapterCount(book);
            return (
              <div key={book.id} className="border border-cloud-gray rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-1" style={{ backgroundColor: book.color }} />
                <div className="p-5">
                  <p className="text-[10px] font-semibold tracking-[2px] uppercase mb-1" style={{ color: book.color }}>Book {book.num}</p>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <h2 className="font-serif text-xl font-semibold text-slate-ink">{book.eng}</h2>
                    <span className="font-serif text-base text-light-slate">{book.heb}</span>
                  </div>
                  <p className="text-[11px] text-light-slate mb-4">{book.treatises.length} treatises &middot; {totalChapters} chapters</p>
                  <div className="space-y-0">
                    {book.treatises.map((treatise) => (
                      <Link key={treatise.id} href={`/study/${treatise.id}/1`} className="flex items-center justify-between py-2 border-b border-cloud-gray/60 last:border-0 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-ink group-hover:text-oxide-red transition-colors truncate">{treatise.name}</p>
                          <p className="text-[10px] text-light-slate">{treatise.chapters} chapters</p>
                        </div>
                        <span className="material-symbols-outlined text-light-slate group-hover:text-oxide-red transition-colors" style={{ fontSize: "14px" }}>chevron_right</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <footer className="border-t border-cloud-gray py-6 px-4">
        <div className="max-w-[980px] mx-auto text-center">
          <p className="text-xs text-light-slate">The Rambam Experience</p>
        </div>
      </footer>
    </div>
  );
}
