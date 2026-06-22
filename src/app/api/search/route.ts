import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://htwyavvzmcmlucpmqytb.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Match {
  treatise_name: string;
  chapter_number: number;
  book_number: number;
  book_name: string;
  content_text: string;
  similarity: number;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    // 1. Embed the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query.trim(),
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 2. Find the most similar chapters via pgvector
    const { data: matches, error: matchError } = await supabase.rpc("match_rambam_chapters", {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 5,
    });

    if (matchError || !matches || matches.length === 0) {
      return NextResponse.json({
        answer:
          "I could not find relevant chapters in the Mishneh Torah for this question. Try rephrasing your question or being more specific about the topic.",
        primary_source: null,
        additional_sources: [],
        matched_chapters: [],
      });
    }

    const typed = matches as Match[];

    // 3. Build context from matched chapters
    const context = typed
      .map(
        (m) =>
          `--- ${m.treatise_name}, Chapter ${m.chapter_number} (Book ${m.book_number}: ${m.book_name}, similarity: ${m.similarity.toFixed(3)}) ---\n${m.content_text.slice(0, 6000)}`
      )
      .join("\n\n");

    // 4. Generate the answer with OpenAI GPT-5.1
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: `You are a knowledgeable Torah scholar helping someone find the Rambam's ruling on a practical question. You have been given the most relevant chapters from the Mishneh Torah.

QUESTION: ${query}

RELEVANT CHAPTERS FROM THE RAMBAM:
${context}

Instructions:
- Base the answer only on the Rambam's actual rulings, but write authoritatively, presenting his position directly.
- VOICE: NEVER mention "the chapters", "the chapters provided/supplied", "the text given", "these sources", "the passages", or the fact that you were handed excerpts. Do NOT begin with phrases like "In the chapters you supplied" or "From these chapters". Simply state the ruling, e.g. "The Rambam rules that…" or "According to the Rambam,…".
- STRUCTURE for readability: Begin with ONE short bold sentence giving the bottom-line answer, wrapped in **double asterisks** — and put NO other bold inside that opening sentence. Then write 2-3 SHORT paragraphs (separated by a blank line) explaining the ruling. Keep paragraphs short and scannable.
- EMPHASIS: Use **bold** sparingly to highlight the core ruling and key terms (for example **kinyan** or **asmachta**). Do NOT use bullet points, numbered lists, or dashes to structure the answer — use flowing prose paragraphs only.
- Cite each ruling inline with its location (e.g., "Hilchot Mechirah, Chapter 14").
- If the Rambam does not address this question, say so plainly and name the closest related topic he does cover — without referring to "the chapters".
- Do not add your own opinions or outside sources. Only the Rambam.

Respond with JSON:
{
  "answer": "A short bold bottom-line sentence wrapped in **double asterisks**, then 2-3 short paragraphs separated by \\n\\n. Use **bold** for key terms. No bullet points or numbered lists.",
  "primary_source": {
    "treatise": "Name of treatise",
    "chapter": 14,
    "halacha": 7,
    "quote": "Brief quote or paraphrase of the key ruling"
  },
  "additional_sources": [
    { "treatise": "...", "chapter": 0, "description": "Brief note on what this chapter adds" }
  ]
}

Output ONLY valid JSON.`,
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content || "";

    let parsed: {
      answer: string;
      primary_source: unknown;
      additional_sources: unknown[];
    };
    try {
      // Strip any markdown fences and extract the first JSON object
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      parsed = { answer: responseText, primary_source: null, additional_sources: [] };
    }

    // 5. Log the search (best-effort analytics)
    supabase
      .from("rambam_search_log")
      .insert({
        query: query.trim(),
        results_count: typed.length,
        top_match_treatise: typed[0]?.treatise_name,
        top_match_chapter: typed[0]?.chapter_number,
        top_match_similarity: typed[0]?.similarity,
      })
      .then(() => {}, () => {});

    return NextResponse.json({
      answer: parsed.answer,
      primary_source: parsed.primary_source,
      additional_sources: parsed.additional_sources || [],
      matched_chapters: typed.map((m) => ({
        treatise: m.treatise_name,
        chapter: m.chapter_number,
        book: m.book_name,
        similarity: m.similarity,
      })),
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed. Please try again." }, { status: 500 });
  }
}
