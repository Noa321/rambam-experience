"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchChapter, parseHalachot, type SefariaText } from "@/lib/sefaria";
import { findTreatise } from "@/data/books";

interface Halacha {
  number: number;
  hebrew: string;
  english: string;
}

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const treatiseId = params.treatiseId as string;
  const chapter = parseInt(params.chapter as string);

  const [langMode, setLangMode] = useState<"both" | "hebrew" | "english">(
    "both"
  );
  const [halachot, setHalachot] = useState<Halacha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sefariaData, setSefariaData] = useState<SefariaText | null>(null);

  const found = findTreatise(treatiseId);
  const treatise = found?.treatise;
  const sefariaRef =
    treatise?.sefariaRef || "Mishneh Torah, Foundations of the Torah";
  const totalChapters = treatise?.chapters || 10;

  useEffect(() => {
    let cancelled = false;

    async function loadText() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchChapter(sefariaRef, chapter);
        if (cancelled) return;

        setSefariaData(data);
        setHalachot(parseHalachot(data));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load text");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadText();
    return () => {
      cancelled = true;
    };
  }, [sefariaRef, chapter]);

  const handleNav = (ch: number) => {
    router.push(`/study/${treatiseId}/${ch}`);
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-soft-border bottom-nav-blur"
        style={{ backgroundColor: "rgba(253, 251, 247, 0.85)" }}
      >
        <div className="max-w-[720px] mx-auto px-5">
          {/* Top row: back + title + nav */}
          <div className="h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1 text-[15px] font-medium text-primary hover:text-parchment-gold transition-colors"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                arrow_back_ios
              </span>
              Home
            </Link>

            <h1 className="text-base font-semibold text-primary">
              Chapter {chapter}
            </h1>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleNav(chapter - 1)}
                disabled={chapter <= 1}
                className="w-8 h-8 rounded-full bg-white border border-soft-border flex items-center justify-center text-primary disabled:opacity-30"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  chevron_left
                </span>
              </button>
              <span className="text-xs text-muted-gray min-w-[2.5rem] text-center">
                {chapter}/{totalChapters}
              </span>
              <button
                onClick={() => handleNav(chapter + 1)}
                disabled={chapter >= totalChapters}
                className="w-8 h-8 rounded-full bg-white border border-soft-border flex items-center justify-center text-primary disabled:opacity-30"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* Info row */}
          <div className="pb-3 flex items-center justify-between">
            <div>
              <p
                className="text-[10px] font-semibold tracking-[0.1em] uppercase text-parchment-gold"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Hilchot {treatise?.name || treatiseId}
              </p>
              <p
                className="text-xs text-muted-gray mt-0.5"
                style={{ fontFamily: "var(--font-hebrew)" }}
              >
                {sefariaData?.heRef || ""}
              </p>
            </div>

            {/* Language toggle */}
            <div className="flex rounded-full bg-white border border-soft-border p-0.5">
              {(
                [
                  { id: "hebrew", label: "עב" },
                  { id: "both", label: "Both" },
                  { id: "english", label: "EN" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLangMode(opt.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    langMode === opt.id
                      ? "bg-primary text-white"
                      : "text-muted-gray hover:text-primary"
                  }`}
                  style={
                    opt.id === "hebrew"
                      ? { fontFamily: "var(--font-hebrew)" }
                      : undefined
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[720px] mx-auto px-5 py-6">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-soft-border border-t-primary rounded-full animate-spin" />
            <p className="text-[15px] text-muted-gray">
              Loading text…
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-20">
            <span
              className="material-symbols-outlined text-parchment-gold mb-3"
              style={{ fontSize: "32px" }}
            >
              error_outline
            </span>
            <p className="text-primary font-medium mb-2">
              Couldn&#39;t load text
            </p>
            <p className="text-[15px] text-muted-gray mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-primary text-white text-[15px] rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Halachot */}
        {!loading && !error && (
          <div className="space-y-4">
            {halachot.map((h) => (
              <article
                key={h.number}
                className="bg-white rounded-[20px] p-4 sm:p-5 border border-soft-border ios-card-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-semibold">
                    {h.number}
                  </div>
                </div>

                {langMode === "both" && (
                  <div className="space-y-4">
                    <div className="text-right" dir="rtl">
                      <div
                        className="sefaria-text-he text-lg text-primary"
                        dangerouslySetInnerHTML={{ __html: h.hebrew }}
                      />
                    </div>
                    <div className="h-px bg-soft-border" />
                    <div>
                      <div
                        className="sefaria-text text-[15px] text-primary"
                        dangerouslySetInnerHTML={{ __html: h.english }}
                      />
                    </div>
                  </div>
                )}

                {langMode === "hebrew" && (
                  <div className="text-right" dir="rtl">
                    <div
                      className="sefaria-text-he text-xl text-primary"
                      dangerouslySetInnerHTML={{ __html: h.hebrew }}
                    />
                  </div>
                )}

                {langMode === "english" && (
                  <div>
                    <div
                      className="sefaria-text text-base text-primary"
                      dangerouslySetInnerHTML={{ __html: h.english }}
                    />
                  </div>
                )}
              </article>
            ))}

            {halachot.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-gray">
                  No text available for this chapter.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Next Chapter */}
        {!loading && !error && chapter < totalChapters && (
          <div className="mt-8 pb-4">
            <button
              onClick={() => handleNav(chapter + 1)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-medium rounded-full hover:opacity-90 transition-opacity"
            >
              Next Chapter
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                arrow_forward
              </span>
            </button>
          </div>
        )}

        {!loading && !error && halachot.length > 0 && (
          <p
            className="mt-8 text-center text-[11px] text-muted-gray"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Text courtesy of Sefaria
          </p>
        )}
      </main>
    </div>
  );
}
