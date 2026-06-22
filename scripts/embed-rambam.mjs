// One-time script: embed every chapter of the Mishneh Torah into rambam_embeddings.
// Reads the complete treatise list from scripts/mishneh-torah.json (derived from
// src/data/books.ts — all 14 books, 83 treatises, 1000 chapters).
//
// Run:  node scripts/embed-rambam.mjs
// Creds are loaded from the project .env (OPENAI_API_KEY + SUPABASE_SERVICE_ROLE_KEY),
// or from the environment if set. The SERVICE ROLE key is required because
// rambam_embeddings has a read-only RLS policy (the anon key cannot insert).

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env (project dir, then Downloads/Rambam Experience) without extra deps ──
function loadEnv() {
  const candidates = [
    join(__dirname, "..", ".env"),
    join(__dirname, "..", ".env.local"),
    "/Users/brianliebenthal/Downloads/Rambam Experience/.env",
  ];
  for (const path of candidates) {
    try {
      for (const line of readFileSync(path, "utf8").split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#") || !t.includes("=")) continue;
        const i = t.indexOf("=");
        const k = t.slice(0, i).trim();
        const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[k]) process.env[k] = v;
      }
    } catch {
      // file not present — fine
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://htwyavvzmcmlucpmqytb.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY (needed to insert past the read-only RLS policy).");
  process.exit(1);
}
if (!OPENAI_KEY) {
  console.error("Missing OPENAI_API_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_KEY });

const TREATISES = JSON.parse(readFileSync(join(__dirname, "mishneh-torah.json"), "utf8"));

async function fetchChapterText(sefariaName, chapter) {
  const url = `https://www.sefaria.org/api/texts/Mishneh_Torah,_${sefariaName}.${chapter}?context=0&pad=0`;
  const res = await fetch(url, { headers: { "User-Agent": "RambamExperience/1.0" } });
  if (!res.ok) return null;
  const data = await res.json();
  const english = (data.text || [])
    .flat()
    .map((t) => (typeof t === "string" ? t.replace(/<[^>]*>/g, "") : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return english || null;
}

async function getEmbedding(text) {
  const truncated = text.slice(0, 32000);
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: truncated,
  });
  return response.data[0].embedding;
}

async function main() {
  console.log("Embedding the Mishneh Torah into rambam_embeddings...");
  const totalChapters = TREATISES.reduce((a, t) => a + t.chapters, 0);
  console.log(`Plan: ${TREATISES.length} treatises, ${totalChapters} chapters.\n`);

  // Resumability: skip chapters already embedded
  const done = new Set();
  let from = 0;
  // page through existing rows (sefaria_ref) so re-runs don't duplicate or re-spend
  // (the table has a unique-ish ref per chapter via book/treatise/chapter)
  while (true) {
    const { data, error } = await supabase
      .from("rambam_embeddings")
      .select("sefaria_ref")
      .range(from, from + 999);
    if (error) {
      console.log(`(could not read existing rows: ${error.message} — proceeding fresh)`);
      break;
    }
    if (!data || data.length === 0) break;
    for (const r of data) done.add(r.sefaria_ref);
    if (data.length < 1000) break;
    from += 1000;
  }
  if (done.size) console.log(`Already embedded: ${done.size} chapters — will skip those.\n`);

  let inserted = 0, skipped = 0, errors = 0;

  for (const t of TREATISES) {
    console.log(`${t.treatise_name} (Book ${t.book_number}: ${t.book_name}, ${t.chapters} ch)`);
    for (let ch = 1; ch <= t.chapters; ch++) {
      const ref = `Mishneh_Torah,_${t.sefaria_name}.${ch}`;
      if (done.has(ref)) { skipped++; continue; }
      try {
        const text = await fetchChapterText(t.sefaria_name, ch);
        if (!text || text.length < 50) {
          console.log(`  ch ${ch}: no text — skipped`);
          errors++;
          continue;
        }
        const embedding = await getEmbedding(text);
        const summary = text.slice(0, 300) + (text.length > 300 ? "..." : "");
        const { error } = await supabase.from("rambam_embeddings").insert({
          book_number: t.book_number,
          book_name: t.book_name,
          treatise_name: t.treatise_name,
          chapter_number: ch,
          content_text: text.slice(0, 32000),
          content_summary: summary,
          embedding,
          sefaria_ref: ref,
        });
        if (error) {
          console.log(`  ch ${ch}: DB error — ${error.message}`);
          errors++;
        } else {
          inserted++;
          if (inserted % 25 === 0) console.log(`  ...${inserted} embedded so far`);
        }
        await new Promise((r) => setTimeout(r, 40));
      } catch (err) {
        console.log(`  ch ${ch}: error — ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped} (already done), errors ${errors}.`);
}

main();
