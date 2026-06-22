"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface SearchResult {
  answer: string;
  primary_source: {
    treatise: string;
    chapter: number;
    halacha: number;
    quote: string;
  } | null;
  additional_sources: Array<{
    treatise: string;
    chapter: number;
    description: string;
  }>;
  matched_chapters: Array<{
    treatise: string;
    chapter: number;
    book: string;
    similarity: number;
  }>;
}

const EXAMPLE_QUERIES = [
  "Is a verbal promise legally binding?",
  "Can a landlord enter a rental without permission?",
  "What happens if someone finds a lost object?",
  "Is it permitted to charge interest on a loan?",
  "When can a marriage be dissolved?",
  "What are the obligations of a neighbor whose tree damages a wall?",
];

export default function SearchInterface() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(searchQuery?: string) {
    const q = searchQuery || query;
    if (!q.trim() || q.trim().length < 3) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim() }),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleExampleClick(example: string) {
    setQuery(example);
    handleSearch(example);
  }

  return (
    <>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-soft-border bottom-nav-blur"
        style={{ backgroundColor: "rgba(253, 251, 247, 0.85)" }}
      >
        <div className="max-w-[700px] mx-auto px-5 h-14 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1 text-[15px] font-medium text-primary hover:text-parchment-gold transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              arrow_back_ios
            </span>
            Home
          </Link>
        </div>
      </header>

      <div className="max-w-[700px] mx-auto px-5 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <span
            className="material-symbols-outlined text-parchment-gold mb-3 block"
            style={{ fontSize: "36px" }}
          >
            search
          </span>
          <h1 className="font-serif text-[28px] sm:text-[36px] font-bold text-primary mb-2">
            Source Finder
          </h1>
          <p className="text-[15px] text-muted-gray max-w-[450px] mx-auto">
            Ask any question in plain English. The Rambam has an answer.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="flex items-center bg-white rounded-full border-2 border-soft-border ios-card-shadow focus-within:border-parchment-gold transition-colors overflow-hidden">
            <span className="material-symbols-outlined text-muted-gray ml-4" style={{ fontSize: "20px" }}>
              search
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g., Can I return a defective product?"
              className="flex-1 py-3.5 px-3 text-[15px] text-charcoal-text placeholder:text-muted-gray bg-transparent outline-none"
              style={{ fontFamily: "var(--font-sans)" }}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className={`mr-1.5 px-5 py-2 rounded-full text-[14px] font-medium transition-all ${
                loading || !query.trim()
                  ? "bg-soft-border text-muted-gray"
                  : "bg-primary text-white hover:opacity-90 active:scale-[0.95]"
              }`}
            >
              {loading ? "Searching..." : "Ask"}
            </button>
          </div>
        </div>

        {/* Example Queries (shown when no result) */}
        {!result && !loading && (
          <div className="mb-8">
            <p
              className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-3"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              TRY ASKING
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((example) => (
                <button
                  key={example}
                  onClick={() => handleExampleClick(example)}
                  className="text-[13px] text-primary bg-white border border-soft-border rounded-full px-4 py-2 hover:border-parchment-gold hover:text-parchment-gold transition-colors active:scale-[0.97]"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-soft-border border-t-parchment-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[14px] text-muted-gray">Searching the Mishneh Torah...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 mb-6">
            <p className="text-[14px] text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="animate-fade-in">
            {/* Answer Card */}
            <div className="bg-white rounded-[20px] border border-soft-border ios-card-shadow p-5 sm:p-6 mb-6">
              <p
                className="text-[11px] font-semibold tracking-[0.1em] uppercase text-parchment-gold mb-4"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                THE RAMBAM&#39;S ANSWER
              </p>
              <div className="font-serif text-[16px] leading-[28px] text-primary space-y-4">
                {result.answer.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Primary Source */}
            {result.primary_source && (
              <div className="bg-surface-container-low rounded-[16px] p-5 mb-6">
                <p
                  className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-gray mb-3"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  PRIMARY SOURCE
                </p>
                <p className="text-[14px] font-semibold text-primary mb-1">
                  Hilchot {result.primary_source.treatise.replace(/^\s*hilchot\s+/i, "")}, Chapter{" "}
                  {result.primary_source.chapter}
                  {result.primary_source.halacha > 0 && `, Halacha ${result.primary_source.halacha}`}
                </p>
                <p className="font-serif text-[14px] leading-[22px] text-primary italic">
                  &#34;{result.primary_source.quote}&#34;
                </p>
              </div>
            )}

            {/* Additional Sources */}
            {result.additional_sources.length > 0 && (
              <div className="mb-6">
                <p
                  className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-gray mb-3"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  RELATED SOURCES
                </p>
                <div className="bg-white rounded-[20px] border border-soft-border divide-y divide-soft-border overflow-hidden">
                  {result.additional_sources.map((source, i) => (
                    <div key={i} className="p-4">
                      <p className="text-[14px] font-semibold text-primary">
                        Hilchot {source.treatise.replace(/^\s*hilchot\s+/i, "")}, Chapter {source.chapter}
                      </p>
                      <p className="text-[13px] text-muted-gray mt-1">{source.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Again */}
            <button
              onClick={() => {
                setResult(null);
                setQuery("");
                inputRef.current?.focus();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-[14px] text-parchment-gold font-medium hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                search
              </span>
              Ask another question
            </button>
          </div>
        )}
      </div>
    </>
  );
}
