import { books, getBookChapterCount } from "@/data/books";
import { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Library | The Rambam Experience",
  description: "Browse all 14 books and 83 treatises of the Rambam\'s Mishneh Torah.",
};

const BOOK_ICONS: Record<string, string> = {
  madda: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  ahavah: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  zemanim: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  nashim: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  kedushah: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
  haflaah: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
  zeraim: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
  avodah: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z",
  korbanot: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
  taharah: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
  nezikin: "M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z",
  kinyan: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  mishpatim: "M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z",
  shoftim: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
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
            const iconPath = BOOK_ICONS[book.id];
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
                  {iconPath && (
                    <div className="bg-ice-white rounded-lg h-20 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke={book.color} className="w-10 h-10 opacity-40">
                        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                      </svg>
                    </div>
                  )}
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
