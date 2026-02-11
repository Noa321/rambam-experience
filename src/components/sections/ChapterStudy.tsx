"use client";

import { useState, useEffect } from "react";
import Icon from "../Icon";
import { fetchChapter, parseHalachot, type SefariaText } from "@/lib/sefaria";
import type { Treatise } from "@/data/books";
import { getInsightForChapter, type InsightArticle } from "@/data/insights";
import { fetchInsightsForTreatise } from "@/lib/content";

interface ChapterStudyProps {
  onNavigate: (section: string, data?: Record<string, unknown>) => void;
  treatise?: Treatise;
  chapter?: number;
  bookColor?: string;
  initialTab?: string;
}

const tabs = ["Source", "Summary", "Commentary", "Insights"];

interface Halacha {
  number: number;
  hebrew: string;
  english: string;
}

export default function ChapterStudy({
  onNavigate,
  treatise,
  chapter = 1,
  bookColor = "#2C3E50",
  initialTab,
}: ChapterStudyProps) {
  const [activeTab, setActiveTab] = useState(initialTab || "Source");
  const [langMode, setLangMode] = useState<"both" | "hebrew" | "english">("both");
  const [halachot, setHalachot] = useState<Halacha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sefariaData, setSefariaData] = useState<SefariaText | null>(null);
  const [supabaseInsights, setSupabaseInsights] = useState<InsightArticle[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Default to Foundations of the Torah if no treatise passed
  const currentRef = treatise?.sefariaRef || "Mishneh Torah, Foundations of the Torah";
  const currentName = treatise?.name || "Foundations of the Torah";
  const currentHeName = treatise?.heName || "יסודי התורה";
  const totalChapters = treatise?.chapters || 10;

  useEffect(() => {
    let cancelled = false;

    async function loadText() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchChapter(currentRef, chapter);
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
    return () => { cancelled = true; };
  }, [currentRef, chapter]);

  // Fetch published insights from Supabase for this treatise
  useEffect(() => {
    if (!treatise) return;
    let cancelled = false;

    async function loadInsights() {
      setInsightsLoading(true);
      try {
        const insights = await fetchInsightsForTreatise(treatise!.name);
        if (!cancelled) setSupabaseInsights(insights);
      } catch {
        // Silently fail — static insights still available
      } finally {
        if (!cancelled) setInsightsLoading(false);
      }
    }

    loadInsights();
    return () => { cancelled = true; };
  }, [treatise]);

  const progress = Math.round((chapter / totalChapters) * 100);

  const handleNextChapter = () => {
    if (chapter < totalChapters) {
      onNavigate("chapter", {
        treatiseId: treatise?.id,
        chapter: chapter + 1,
      });
    }
  };

  const handlePrevChapter = () => {
    if (chapter > 1) {
      onNavigate("chapter", {
        treatiseId: treatise?.id,
        chapter: chapter - 1,
      });
    }
  };

  return (
    <section className="animate-fade-in">
      <header className="sticky top-0 z-40 bg-white/95 ios-blur border-b border-gray-100">
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-100">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, background: bookColor }}
          />
        </div>

        <div className="flex items-center px-4 lg:px-8 pt-4 pb-2 justify-between">
          {/* Mobile back */}
          <button
            onClick={() => onNavigate("dashboard")}
            className="lg:hidden text-primary cursor-pointer"
          >
            <Icon name="arrow_back_ios" className="text-2xl" />
          </button>
          {/* Desktop back */}
          <button
            onClick={() => onNavigate("library")}
            className="hidden lg:flex items-center gap-1 text-primary cursor-pointer text-sm font-medium hover:text-deep-red transition-colors"
          >
            <Icon name="arrow_back_ios" className="text-lg" /> {currentName}
          </button>

          <div className="flex-1 text-center lg:text-left lg:flex-none lg:ml-4">
            <h2 className="text-lg font-bold tracking-tight text-primary">
              Chapter {chapter}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Chapter navigation */}
            <button
              onClick={handlePrevChapter}
              disabled={chapter <= 1}
              className="flex items-center justify-center size-10 rounded-full bg-gray-50 text-primary disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >
              <Icon name="chevron_left" className="text-xl" />
            </button>
            <span className="text-xs text-warm-grey font-medium min-w-[3rem] text-center">
              {chapter}/{totalChapters}
            </span>
            <button
              onClick={handleNextChapter}
              disabled={chapter >= totalChapters}
              className="flex items-center justify-center size-10 rounded-full bg-gray-50 text-primary disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >
              <Icon name="chevron_right" className="text-xl" />
            </button>
          </div>
        </div>

        <nav className="px-4 lg:px-8 pb-2">
          <p className="text-light-grey text-[10px] font-bold tracking-widest uppercase">
            Mishneh Torah · Hilchot {currentName}
          </p>
          <p className="text-warm-grey text-xs mt-0.5" style={{ fontFamily: "var(--font-hebrew)" }}>
            {sefariaData?.heRef || `משנה תורה, הלכות ${currentHeName} ${chapter}`}
          </p>
        </nav>

        {/* Content tabs + language toggle */}
        <div className="flex items-center justify-between px-4 lg:px-8 pb-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 transition-all ${
                  activeTab === t
                    ? "bg-primary shadow-sm"
                    : "bg-surface-grey"
                }`}
              >
                <span
                  className={`text-sm ${
                    activeTab === t ? "text-white font-semibold" : "text-light-grey font-medium"
                  }`}
                >
                  {t}
                </span>
              </button>
            ))}
          </div>

          {/* Language toggle */}
          {activeTab === "Source" && (
            <div className="flex shrink-0 ml-3 rounded-full bg-surface-grey p-0.5">
              {([
                { id: "hebrew", label: "עב" },
                { id: "both", label: "Both" },
                { id: "english", label: "EN" },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLangMode(opt.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    langMode === opt.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-light-grey hover:text-primary"
                  }`}
                  style={opt.id === "hebrew" ? { fontFamily: "var(--font-hebrew)" } : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="pb-28 lg:pb-8">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-10 border-3 border-gray-200 border-t-primary rounded-full animate-spin" />
            <p className="text-warm-grey text-sm">Loading from Sefaria...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="max-w-md mx-auto px-4 py-20 text-center">
            <Icon name="error_outline" className="text-4xl text-accent-red mb-3" />
            <p className="text-primary font-semibold mb-2">Couldn&apos;t load text</p>
            <p className="text-warm-grey text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white text-sm rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Source tab — live Sefaria text */}
        {!loading && !error && activeTab === "Source" && (
          <div className="max-w-3xl mx-auto px-4 lg:px-8 py-4 lg:py-6 space-y-6">
            {halachot.map((h) => (
              <article
                key={h.number}
                className="rounded-xl p-5 lg:p-6 bg-white border border-gray-100 shadow-sm hover:border-primary/20 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="size-8 rounded flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: bookColor }}
                  >
                    {h.number}
                  </div>
                  <button className="text-light-grey hover:text-muted-red transition-colors">
                    <Icon name="bookmark" className="text-xl" />
                  </button>
                </div>

                {/* Text content — adapts to language mode */}
                {langMode === "both" && (
                  <div className="flex flex-col lg:flex-row lg:gap-8">
                    <div className="lg:flex-1 text-right mb-5 lg:mb-0" dir="rtl">
                      <div
                        className="text-xl lg:text-[22px] leading-loose text-primary halacha-text"
                        style={{ fontFamily: "var(--font-hebrew)" }}
                        dangerouslySetInnerHTML={{ __html: h.hebrew }}
                      />
                    </div>
                    <div className="hidden lg:block w-px self-stretch" style={{ background: `${bookColor}30` }} />
                    <div className="lg:hidden h-0.5 w-12 mb-5" style={{ background: `${bookColor}40` }} />
                    <div className="lg:flex-1 text-left">
                      <div
                        className="text-base leading-loose text-slate-grey halacha-text"
                        dangerouslySetInnerHTML={{ __html: h.english }}
                      />
                    </div>
                  </div>
                )}

                {langMode === "hebrew" && (
                  <div className="text-right" dir="rtl">
                    <div
                      className="text-2xl lg:text-[22px] leading-loose text-primary halacha-text"
                      style={{ fontFamily: "var(--font-hebrew)" }}
                      dangerouslySetInnerHTML={{ __html: h.hebrew }}
                    />
                  </div>
                )}

                {langMode === "english" && (
                  <div className="text-left">
                    <div
                      className="text-base lg:text-lg leading-loose text-primary/90 halacha-text"
                      dangerouslySetInnerHTML={{ __html: h.english }}
                    />
                  </div>
                )}
              </article>
            ))}

            {halachot.length === 0 && (
              <div className="text-center py-12">
                <p className="text-warm-grey">No text available for this chapter.</p>
              </div>
            )}
          </div>
        )}

        {/* Summary tab — placeholder for future AI summaries */}
        {!loading && !error && activeTab === "Summary" && (
          <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12 text-center">
            <Icon name="auto_awesome" className="text-4xl text-warm-grey mb-3" />
            <h3 className="text-primary text-lg font-bold mb-2">AI Summary</h3>
            <p className="text-warm-grey text-sm max-w-sm mx-auto">
              AI-generated summaries for each chapter coming soon. This will include key concepts,
              practical takeaways, and connections to other halachot.
            </p>
          </div>
        )}

        {/* Commentary tab — placeholder */}
        {!loading && !error && activeTab === "Commentary" && (
          <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12 text-center">
            <Icon name="forum" className="text-4xl text-warm-grey mb-3" />
            <h3 className="text-primary text-lg font-bold mb-2">Commentary</h3>
            <p className="text-warm-grey text-sm max-w-sm mx-auto">
              Classic commentaries (Kesef Mishneh, Maggid Mishneh, Raavad) will appear here,
              also sourced from Sefaria.
            </p>
          </div>
        )}

        {/* Insights tab — static + Supabase articles */}
        {!loading && !error && activeTab === "Insights" && (() => {
          const staticInsight = treatise ? getInsightForChapter(treatise.id, chapter) : null;
          const allInsights = [
            ...(supabaseInsights || []),
            ...(staticInsight ? [staticInsight] : []),
          ];

          if (insightsLoading) {
            return (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="size-10 border-3 border-gray-200 border-t-primary rounded-full animate-spin" />
                <p className="text-warm-grey text-sm">Loading insights...</p>
              </div>
            );
          }

          if (allInsights.length === 0) {
            return (
              <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12 text-center">
                <Icon name="lightbulb" className="text-4xl text-warm-grey mb-3" />
                <h3 className="text-primary text-lg font-bold mb-2">Daily Insights</h3>
                <p className="text-warm-grey text-sm max-w-sm mx-auto">
                  No insight article is available for this chapter yet.
                  Check back soon!
                </p>
              </div>
            );
          }

          return (
            <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-16">
              {allInsights.map((insight, insightIdx) => (
                <div key={insightIdx}>
                  {/* Article header */}
                  <header className="mb-8">
                    <p className="text-xs font-bold tracking-widest uppercase text-muted-red mb-2">
                      {insight.subtitle}
                    </p>
                    <h2 className="text-2xl lg:text-3xl font-bold text-primary leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
                      {insight.title}
                    </h2>
                  </header>

                  {/* Article sections */}
                  <div className="space-y-10">
                    {insight.sections.map((section, idx) => (
                      <section key={idx} className="insight-section">
                        {section.label && (
                          <span
                            className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
                            style={{ background: `${bookColor}12`, color: bookColor }}
                          >
                            {section.label}
                          </span>
                        )}
                        <h3 className="text-xl lg:text-2xl font-bold text-primary mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                          {section.heading}
                        </h3>
                        <div
                          className="insight-article text-base leading-relaxed text-slate-grey"
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                      </section>
                    ))}
                  </div>

                  {/* Separator between multiple insights */}
                  {insightIdx < allInsights.length - 1 && (
                    <div className="mt-12 flex items-center gap-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <Icon name="auto_awesome" className="text-warm-grey text-sm" />
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Next Chapter buttons */}
        <div className="fixed lg:static bottom-0 left-0 right-0 lg:max-w-3xl lg:mx-auto lg:px-8 lg:py-4 p-4 bg-gradient-to-t from-white via-white/95 to-transparent lg:bg-none z-40">
          <div className="flex gap-3">
            <button
              onClick={handleNextChapter}
              disabled={chapter >= totalChapters}
              className="flex-1 flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/10 active:scale-95 transition-transform disabled:opacity-50"
            >
              <span className="text-sm tracking-wide">
                {chapter >= totalChapters ? "COMPLETED" : "NEXT CHAPTER"}
              </span>
              {chapter < totalChapters && <Icon name="arrow_forward" />}
              {chapter >= totalChapters && <Icon name="check" />}
            </button>
            <button className="flex size-14 items-center justify-center rounded-2xl bg-white border border-gray-200 text-muted-red shadow-sm active:scale-95 transition-transform">
              <Icon name="check_circle" className="text-2xl" />
            </button>
          </div>
        </div>
      </main>
    </section>
  );
}