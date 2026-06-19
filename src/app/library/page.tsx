import { books, getBookChapterCount } from "@/data/books";
import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Library | The Rambam Experience",
  description: "Browse all 14 books and 83 treatises of the Rambam's Mishneh Torah.",
};

export default function LibraryPage() {
  return (
    <div className="min-h-screen pb-28">
      <Header />

      <div className="max-w-[800px] mx-auto px-5">
        <div className="pt-8 pb-6">
          <h1 className="font-serif text-[28px] sm:text-[34px] font-semibold text-primary leading-tight">Mishneh Torah</h1>
          <p className="text-[15px] text-muted-gray mt-1">All 14 books and 83 treatises of the Rambam&#39;s complete code of Jewish law</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {books.map((book) => {
            const totalChapters = getBookChapterCount(book);
            return (
              <div key={book.id} className="bg-white rounded-xl border border-soft-border overflow-hidden">
                <div className="h-1" style={{ backgroundColor: book.color }} />
                <div className="p-5">
                  <p className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-1" style={{ color: book.color, fontFamily: "var(--font-sans)" }}>
                    Book {book.num}
                  </p>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <h2 className="font-serif text-xl font-semibold text-primary">{book.eng}</h2>
                    <span className="font-serif text-base text-muted-gray">{book.heb}</span>
                  </div>
                  <p className="text-[11px] text-muted-gray mb-4" style={{ fontFamily: "var(--font-sans)" }}>
                    {book.treatises.length} treatises &middot; {totalChapters} chapters
                  </p>
                  <div className="divide-y divide-soft-border">
                    {book.treatises.map((treatise) => (
                      <Link key={treatise.id} href={`/study/${treatise.id}/1`} className="flex items-center justify-between py-2.5 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] text-primary group-hover:text-parchment-gold transition-colors truncate">{treatise.name}</p>
                          <p className="text-[11px] text-muted-gray">{treatise.chapters} chapters</p>
                        </div>
                        <span className="material-symbols-outlined text-muted-gray group-hover:text-parchment-gold transition-colors" style={{ fontSize: "16px" }}>chevron_right</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
