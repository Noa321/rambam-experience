#!/usr/bin/env node
// Daily Rambam Pipeline — self-running, catch-up, transition-day safe.
// For each missing day (last published → today) it: resolves the day's chapters
// from Sefaria (handling treatise-transition days that span two hilchot), pulls
// source text, writes a d'var Torah + spoken talk + One-Page Learn via Claude,
// publishes to Supabase, generates MP3 via OpenAI TTS, and uploads everything.
//
// Resilience: each day runs independently (one failure never aborts the rest),
// and the One-Page Learn step is non-blocking (a failure there still ships the
// essay + audio).

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// ─── Credentials (from GitHub Secrets → env vars) ───
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://htwyavvzmcmlucpmqytb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!ANTHROPIC_KEY) throw new Error('Missing ANTHROPIC_API_KEY');
if (!OPENAI_KEY) throw new Error('Missing OPENAI_API_KEY');
if (!SUPABASE_KEY) throw new Error('Missing SUPABASE_ANON_KEY');

const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_CATCHUP_DAYS = 10;

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Hilchot → Sefer mapping ───
const SEFER_MAP = {
  'Foundations of the Torah': 'Madda', 'Human Dispositions': 'Madda',
  'Torah Study': 'Madda', 'Foreign Worship and Customs of the Nations': 'Madda',
  'Foreign Worship': 'Madda', 'Repentance': 'Madda',
  'Reading the Shema': 'Ahavah', 'Prayer and Blessings': 'Ahavah',
  'Prayer': 'Ahavah', 'Tefillin, Mezuzah and the Torah Scroll': 'Ahavah',
  'Tefillin': 'Ahavah', 'Fringes': 'Ahavah', 'Blessings': 'Ahavah',
  'Circumcision': 'Ahavah',
  'Sabbath': 'Zemanim', 'Eruvin': 'Zemanim',
  'Rest on the Tenth of Tishrei': 'Zemanim', 'Rest on a Holiday': 'Zemanim',
  'Leavened and Unleavened Bread': 'Zemanim',
  'Shofar, Sukkah and Lulav': 'Zemanim', 'Sheqel Dues': 'Zemanim',
  'Sanctification of the New Month': 'Zemanim', 'Fasts': 'Zemanim',
  'Scroll of Esther and Hanukkah': 'Zemanim',
  'Marriage': 'Nashim', 'Divorce': 'Nashim',
  'Levirate Marriage and Release': 'Nashim', 'Virgin Maiden': 'Nashim',
  'Woman Suspected of Infidelity': 'Nashim',
  'Forbidden Intercourse': 'Kedushah', 'Forbidden Foods': 'Kedushah',
  'Ritual Slaughter': 'Kedushah',
  'Oaths': "Hafla'ah", 'Vows': "Hafla'ah", 'Naziriteship': "Hafla'ah",
  'Valuations and Devoted Property': "Hafla'ah",
  'Diverse Species': "Zera'im", 'Diverse Kinds': "Zera'im", 'Gifts to the Poor': "Zera'im",
  'Heave Offerings': "Zera'im", 'Tithes': "Zera'im",
  "Second Tithes and Fourth Year's Fruit": "Zera'im", 'Second Tithes and Fourth Year Produce': "Zera'im",
  'First Fruits and other Gifts to Priests Outside the Sanctuary': "Zera'im",
  'Sabbatical Year and the Jubilee': "Zera'im",
  'The Chosen Temple': 'Avodah', 'Temple Vessels and Servants': 'Avodah',
  'Vessels of the Sanctuary': 'Avodah',
  'Entering the Temple': 'Avodah', 'Admission into the Sanctuary': 'Avodah',
  'Things Forbidden on the Altar': 'Avodah',
  'Sacrificial Procedure': 'Avodah', 'Daily Offerings and Additional Offerings': 'Avodah',
  'Sacrifices Rendered Unfit': 'Avodah', 'Service on the Day of Atonement': 'Avodah',
  'Trespass': 'Avodah',
  'Paschal Offering': 'Korbanot', 'Festival Offering': 'Korbanot',
  'Firstlings': 'Korbanot', 'Offerings for Unintentional Transgressions': 'Korbanot',
  'Offerings for Those with Incomplete Atonement': 'Korbanot',
  'Substitution': 'Korbanot',
};

// ─── Hilchot display name → short, app-resolvable name for the rambam_chapters field.
// These short names must match a treatise name or alias the web app understands
// (src/data/books.ts names + src/lib/cycle.ts aliases), so chapters link and the
// journey position resolves. Keep this in sync as the cycle reaches new treatises. ───
const SHORT_NAMES = {
  'Marriage': 'Ishut', 'Divorce': 'Gerushin',
  'Sabbath': 'Shabbat', 'Eruvin': 'Eruvin',
  'Rest on the Tenth of Tishrei': 'Shevitat Asor',
  'Rest on a Holiday': 'Shevitat Yom Tov',
  'Leavened and Unleavened Bread': "Chametz u'Matzah",
  'Shofar, Sukkah and Lulav': "Shofar Sukkah v'Lulav",
  'Sheqel Dues': 'Shekalim',
  'Sanctification of the New Month': 'Kiddush HaChodesh',
  'Fasts': "Ta'aniyot",
  'Scroll of Esther and Hanukkah': "Megillah v'Chanukah",
  'Foundations of the Torah': 'Yesodei HaTorah',
  'Human Dispositions': "De'ot",
  'Torah Study': 'Talmud Torah',
  'Foreign Worship and Customs of the Nations': 'Avodah Zarah',
  'Repentance': 'Teshuvah',
  'Reading the Shema': "Kri'at Shema",
  'Prayer and Blessings': 'Tefilah',
  'Tefillin, Mezuzah and the Torah Scroll': 'Tefillin',
  'Fringes': 'Tzitzit', 'Blessings': 'Berakhot',
  'Circumcision': 'Milah',
  'Forbidden Intercourse': 'Issurei Biah',
  'Forbidden Foods': 'Ma\'akhalot Assurot',
  'Ritual Slaughter': 'Shechitah',
  'Levirate Marriage and Release': 'Yibbum v\'Chalitzah',
  'Virgin Maiden': 'Na\'arah Betulah',
  'Woman Suspected of Infidelity': 'Sotah',
  // Zera'im (current cycle) — map long Sefaria names to app-resolvable short names
  'Diverse Species': 'Diverse Species', 'Diverse Kinds': 'Diverse Species',
  'Gifts to the Poor': 'Gifts to the Poor',
  'Heave Offerings': 'Heave Offerings',
  'Tithes': 'Maaser',
  "Second Tithes and Fourth Year's Fruit": 'Maaser Sheini',
  'Second Tithes and Fourth Year Produce': 'Maaser Sheini',
  'First Fruits and other Gifts to Priests Outside the Sanctuary': 'First Fruits',
  'Sabbatical Year and the Jubilee': 'Sabbatical',
};

// Hebrew title for the One-Page Learn cover, by short name (best-effort; falls back to English)
const HE_NAMES = {
  'Maaser Sheini': 'הִלְכוֹת מַעֲשֵׂר שֵׁנִי',
  'First Fruits': 'הִלְכוֹת בִּכּוּרִים',
  'Maaser': 'הִלְכוֹת מַעֲשְׂרוֹת',
  'Heave Offerings': 'הִלְכוֹת תְּרוּמוֹת',
  'Gifts to the Poor': 'הִלְכוֹת מַתְּנוֹת עֲנִיִּים',
  'Diverse Species': 'הִלְכוֹת כִּלְאַיִם',
  'Sabbatical': 'הִלְכוֹת שְׁמִיטָּה וְיוֹבֵל',
};

const easternDate = (offsetDays = 0) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
};

function deriveSlug(chaptersLabel) {
  return chaptersLabel.toLowerCase().replace(/,\s*/g, '-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Step 0: Resolve a date's chapters (transition-day safe) ───
async function getDayInfo(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const res = await fetch(`https://www.sefaria.org/api/calendars?year=${year}&month=${month}&day=${day}`);
  if (!res.ok) throw new Error(`Sefaria calendar API failed: ${res.status}`);
  const data = await res.json();

  // A normal day has ONE "Daily Rambam (3 Chapters)" item; a treatise-transition
  // day has TWO (e.g. "Second Tithes 11" + "First Fruits 1-2"). Collect them all.
  const items = (data.calendar_items || []).filter((item) => {
    const title = JSON.stringify(item.title || {});
    return title.includes('Rambam') && title.includes('3');
  });
  if (items.length === 0) throw new Error(`No Daily Rambam (3 chapters) for ${dateStr}`);

  const segments = [];
  for (const item of items) {
    const ref = item.ref || '';
    const m = ref.match(/^Mishneh Torah,\s*(.+?)\s+(\d+(?:-\d+)?)$/);
    if (!m) throw new Error(`Cannot parse Sefaria ref: ${ref}`);
    const hilchotDisplayName = m[1];
    const rangeStr = m[2];
    const [start, end] = rangeStr.includes('-') ? rangeStr.split('-').map(Number) : [Number(rangeStr), Number(rangeStr)];
    const chapters = [];
    for (let i = start; i <= end; i++) chapters.push(i);
    segments.push({
      hilchotDisplayName,
      shortName: SHORT_NAMES[hilchotDisplayName] || hilchotDisplayName,
      sefer: SEFER_MAP[hilchotDisplayName] || 'Unknown',
      rangeStr,
      chapters,
      apiName: `Mishneh_Torah,_${hilchotDisplayName.replace(/ /g, '_')}`,
    });
  }

  const chaptersLabel = segments.map((s) => `${s.shortName} ${s.rangeStr}`).join(', ');
  const last = segments[segments.length - 1]; // the treatise the day lands in
  const allChapterNumbers = segments.flatMap((s) => s.chapters);

  return {
    dateStr,
    segments,
    chaptersLabel,
    slug: deriveSlug(chaptersLabel),
    sefer: last.sefer,
    shortName: last.shortName,
    heName: HE_NAMES[last.shortName] || '',
    chapterNumbers: allChapterNumbers,
  };
}

// ─── Step 1: Fetch source text (all segments) ───
async function fetchSourceText(info) {
  const parts = [];
  for (const seg of info.segments) {
    for (const ch of seg.chapters) {
      const url = `https://www.sefaria.org/api/v3/texts/${seg.apiName}.${ch}?version=english`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Sefaria text API failed for ${seg.apiName} ch.${ch}: ${res.status}`);
      const data = await res.json();
      const raw = data.versions?.[0]?.text;
      if (!raw) throw new Error(`No text for ${seg.apiName}.${ch}`);
      const flatten = (arr) => arr.map((v) => (Array.isArray(v) ? flatten(v) : v)).join('\n');
      const text = flatten(raw).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\n{3,}/g, '\n\n');
      parts.push(`## ${seg.hilchotDisplayName}, Chapter ${ch}\n\n${text}`);
    }
  }
  return parts.join('\n\n');
}

// ─── Step 2: Check for duplicates ───
async function alreadyPublished(dateStr) {
  const { data } = await supabase
    .from('content')
    .select('id')
    .eq('content_type', 'dvar_torah')
    .eq('rambam_date', dateStr)
    .limit(1);
  return !!(data && data.length > 0);
}

// ─── Step 3: Write d'var Torah + spoken talk via Claude ───
async function writeContent(sourceText, info) {
  const chaptersDesc = info.segments
    .map((s) => `Hilchot ${s.hilchotDisplayName} chapter${s.chapters.length > 1 ? 's' : ''} ${s.chapters.join(', ')}`)
    .join('; and ');

  const dvarPrompt = `You are writing a d'var Torah for The Rambam Experience — a daily Torah content platform. Today's learning is: ${chaptersDesc} from Maimonides' Mishneh Torah.

Here is the source text:

${sourceText}

CRITICAL OUTPUT FORMAT:
- ABSOLUTELY NO MARKDOWN FORMATTING in the prose body. No asterisks for bold. No underscores for italics. No bullet points. No numbered lists.
- The ONLY markdown allowed: a YAML frontmatter block at the top (between --- and ---) and h2 headings (## SECTION NAME).
- Section headings: SHORT, ALL CAPS, optionally with a subtitle after a colon, e.g. "## THE HOOK" or "## CHAPTER 8: When Money Becomes Sacred".
- When citing Chassidic sources, weave them naturally into prose. No parenthetical citations.

Required YAML frontmatter:
---
title: "[evocative title]"
hook: "[2-3 sentence hook question]"
summary: "[2-3 sentence summary]"
rambam_chapters: "${info.chaptersLabel}"
sefer: "${info.sefer}"
hilchot: "${info.shortName}"
tags: ["rambam", ...]
---

Required sections, in order:
## THE HOOK
Then one section per chapter being learned today (label each with the chapter and an evocative subtitle; cover every chapter listed above, in order).
## THE UNIFYING PRINCIPLE
## MODERN APPLICATION
## THE CLOSING

Length: 1800-2400 words.

VOICE: Manis Friedman style — warm, provocative, conversational, profound. Patient unpacking. Comfortable with paradox. Find the spiritual current beneath the legal mechanics.

CHASSIDIC SOURCES: Cite at least 3 naturally — Alter Rebbe/Tanya, Baal Shem Tov, Lubavitcher Rebbe/Likkutei Sichos, Tzemach Tzedek, Sfat Emet.

NEVER: emojis, bullet points, numbered lists, generic ethics, opening with "So" or "Today we're going to..."

Write the complete d'var Torah now.`;

  const talkPrompt = `You are writing a spoken talk for The Rambam Experience — a daily Torah audio platform. Today's learning is: ${chaptersDesc} from Maimonides' Mishneh Torah.

Here is the source text:

${sourceText}

CRITICAL OUTPUT FORMAT:
- ABSOLUTELY NO MARKDOWN. NO frontmatter. NO headings. NO asterisks. NO underscores. NO bullet points. NO numbered lists. NO horizontal dividers (---). NO blockquotes.
- Pure flowing narrative prose with paragraph breaks only. The ENTIRE output will be read aloud by text-to-speech. ANY symbol that isn't normal punctuation will be spoken or cause a glitch.
- Write Hebrew/Aramaic terms in plain transliteration (e.g. Rambam, halacha, mitzvot, Maaser Sheini) — never Hebrew letters or phonetic respellings.
- Do NOT begin with a title line. Start straight into the talk.

VOICE: Late-night farbrengen. Manis Friedman. Warm, intimate, contemplative, slightly amused, profound. Use "you" and "I". Rhetorical questions. Allow pauses (paragraph breaks).

LENGTH: 700-900 words. End with an open question that lingers.

STRUCTURE (do not label these — just flow):
1. Open with a small observation or moment that draws us in.
2. Move into what the Rambam actually says. Be concrete. Cite specific cases.
3. Find the surprise — what is strange or counterintuitive?
4. Open it up spiritually. 1-2 Chassidic sources naturally.
5. Land somewhere personal and applicable.
6. End with a question.

NEVER: "journey", "at the end of the day", opening with "So" or "Today we're going to..."

Write the complete spoken talk now.`;

  const [dvarResult, talkResult] = await Promise.all([
    anthropic.messages.create({ model: MODEL, max_tokens: 4096, messages: [{ role: 'user', content: dvarPrompt }] }),
    anthropic.messages.create({ model: MODEL, max_tokens: 2048, messages: [{ role: 'user', content: talkPrompt }] }),
  ]);

  return { dvarTorah: dvarResult.content[0].text, talk: talkResult.content[0].text };
}

// ─── Parse YAML frontmatter ───
function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (m) result[m[1]] = m[2];
    const arrMatch = line.match(/^(\w+):\s*\[(.*)\]\s*$/);
    if (arrMatch) result[arrMatch[1]] = arrMatch[2].split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
  }
  return result;
}

// ─── Step 4: Convert d'var Torah to clean article HTML (the app re-skins it) ───
function buildArticleHTML(dvarTorah) {
  let body = dvarTorah.replace(/^---[\s\S]*?---\n*/, '');
  const sections = body.split(/^## /m).filter((s) => s.trim());
  let out = '<article>\n';
  for (const section of sections) {
    const lines = section.split('\n');
    const heading = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    let label, title;
    if (heading.includes(':')) {
      const [l, ...rest] = heading.split(':');
      label = l.trim();
      title = rest.join(':').trim();
    } else {
      label = heading;
      title = heading.replace(/^THE\s+/i, '');
    }
    out += `<p class="section-label">${label}</p>\n`;
    if (title && title.toUpperCase() !== label.toUpperCase()) out += `<h2>${title}</h2>\n`;
    const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());
    for (let i = 0; i < paragraphs.length; i++) {
      const isClosing = /CLOS/i.test(label) && i === paragraphs.length - 1;
      const esc = paragraphs[i].trim()
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      out += `<p${isClosing ? ' class="closing-bold"' : ''}>${esc}</p>\n`;
    }
  }
  out += '</article>';
  return out;
}

// ─── Step 5: Publish to Supabase ───
async function publishToSupabase(html, dvarTorah, info) {
  const meta = parseFrontmatter(dvarTorah);
  const record = {
    title: meta.title || info.chaptersLabel,
    content_type: 'dvar_torah',
    body_format: 'html',
    body: html,
    status: 'published',
    source: 'claude',
    rambam_chapters: info.chaptersLabel,
    sefer: info.sefer,
    hilchot: info.shortName,
    chapter_numbers: info.chapterNumbers,
    rambam_date: info.dateStr,
    hook: meta.hook || '',
    summary: meta.summary || '',
    tags: meta.tags || ['rambam'],
    published_at: `${info.dateStr}T11:00:00+00:00`,
  };
  const { data, error } = await supabase.from('content').insert(record).select('id,title').single();
  if (error) throw new Error(`Supabase insert failed: ${JSON.stringify(error)}`);
  return data.id;
}

// ─── Step 6: One-Page Learn (non-blocking) ───
async function writeOnePager(sourceText, info) {
  const chaptersDesc = info.segments
    .map((s) => `${s.hilchotDisplayName} ${s.chapters.join(', ')}`)
    .join('; ');
  const prompt = `You are creating a One-Page Learn — a structured visual study overview — for The Rambam Experience. Today's chapters: ${chaptersDesc}, from Maimonides' Mishneh Torah, Sefer ${info.sefer}.

Source text:
${sourceText}

Return ONLY valid JSON (no markdown fence, no prose) with this EXACT shape:
{
  "subtitle": "one evocative sentence capturing the day's unifying idea",
  "one_idea": "5-7 sentences naming the single arc across all the chapters; give each chapter a one-word theme and show how they connect",
  "chapters": [
    {
      "label": "CH 8",
      "theme": "Attention",
      "question": "What makes a thing holy?",
      "heading": "short evocative title",
      "bullets": [
        {"lead": "short bold lead phrase", "text": "one or two sentences of explanation"}
      ]
    }
  ],
  "spark": "one paragraph on what is surprising or counterintuitive about these laws (2-3 sentences)",
  "chas": "one paragraph with 1-2 Chassidic sources (Alter Rebbe/Tanya, Baal Shem Tov, Lubavitcher Rebbe) that illuminate the deeper meaning",
  "society": "one paragraph applying the teaching to modern life (2-3 sentences)",
  "live": ["a principle that applies now", "another", "another"],
  "historical": ["a law specific to Temple times", "another", "another"],
  "memory_hook": "a short, memorable phrase (shown in quotes)",
  "takeaway": "2-3 sentences of practical takeaway",
  "sources": "Mishneh Torah, <treatises and chapters>; <1-2 Chassidic sources>."
}

Rules: exactly one chapters[] entry per chapter learned today, in order; use the real chapter label and treatise context (e.g. "CH 8", or for transition days "M.S. 11", "F.F. 1"); each chapter needs a single-word "theme" and a short "question" of 2-4 words it answers; EXACTLY 4 bullets per chapter, each an object with a short "lead" and a 1-2 sentence "text"; 3-4 items each in live and historical; no markdown, no asterisks, no emojis; use plain English transliteration for Hebrew terms.`;

  const res = await anthropic.messages.create({ model: MODEL, max_tokens: 4096, messages: [{ role: 'user', content: prompt }] });
  let text = res.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('One-pager: no JSON found');
  return JSON.parse(jsonMatch[0]);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrap2(text, maxLen = 15) {
  const words = String(text || '').split(/\s+/);
  const lines = ['', ''];
  let i = 0;
  for (const w of words) {
    if (i === 0 && (lines[0] + ' ' + w).trim().length > maxLen && lines[0]) i = 1;
    lines[i] = (lines[i] + ' ' + w).trim();
  }
  return lines;
}

function svgDiagram(chapters) {
  const palette = [
    { stroke: '#B8860B', fill: '#F7F1E6' },
    { stroke: '#735C00', fill: '#F3F3F5' },
    { stroke: '#162839', fill: '#F3F3F5' },
  ];
  const xs = [6, 178, 326];
  const cx = [75, 247, 395];
  const list = (chapters || []).slice(0, 3);
  let boxes = '';
  list.forEach((c, i) => {
    const p = palette[i % 3];
    const [q1, q2] = wrap2(c.question || '', 15);
    boxes += `<rect x="${xs[i]}" y="12" width="138" height="108" rx="9" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5"/>
<text x="${cx[i]}" y="36" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" font-weight="700" letter-spacing="1" fill="${p.stroke}">${esc((c.label || '').toUpperCase())}</text>
<text x="${cx[i]}" y="60" text-anchor="middle" font-family="Inter,sans-serif" font-size="15" font-weight="600" fill="#162839">${esc(c.theme || '')}</text>
<text x="${cx[i]}" y="82" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#86868B">${esc(q1)}</text>
<text x="${cx[i]}" y="95" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#86868B">${esc(q2)}</text>`;
    if (i < list.length - 1) {
      const lx = xs[i] + 142;
      boxes += `<line x1="${lx}" y1="66" x2="${lx + 18}" y2="66" stroke="#E5E5E7" stroke-width="2"/><polygon points="${lx + 18},61 ${lx + 28},66 ${lx + 18},71" fill="#E5E5E7"/>`;
    }
  });
  const themes = list.map((c) => esc(c.theme || '')).join(' &rarr; ');
  return `<figure class="figure"><svg viewBox="0 0 470 134" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${list.map((c) => esc(c.theme || '')).join(', ')}">${boxes}</svg><figcaption>${themes}</figcaption></figure>`;
}

function buildLearnHTML(op, info) {
  const tabClasses = ['tab-ch1', 'tab-ch2', 'tab-ch3'];
  const spineClasses = ['ch1', 'ch2', 'ch3'];
  const chapters = (op.chapters || []).map((c, i) => {
    const lis = (c.bullets || []).map((b) => {
      if (b && typeof b === 'object') return `<li><strong>${esc(b.lead)}.</strong> ${esc(b.text)}</li>`;
      return `<li>${esc(b)}</li>`;
    }).join('');
    return `<h2><span class="tab ${tabClasses[i % 3]}">${esc(c.label)}</span> ${esc(c.heading)}</h2>\n<ul class="spine-list ${spineClasses[i % 3]}">${lis}</ul>`;
  }).join('\n');

  const listItems = (arr) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const band = (op.live || op.historical)
    ? `<h2><span class="tab tab-frame">Then &amp; Now</span> Live vs. historical</h2>
<div class="band">
<div class="col live"><h4>Alive Today</h4><ul>${listItems(op.live)}</ul></div>
<div class="col hist"><h4>Historical / Awaiting the Temple</h4><ul>${listItems(op.historical)}</ul></div>
</div>`
    : '';
  const memory = (op.memory_hook || op.takeaway)
    ? `<div class="box practical"><span class="box-title">Memory Hook &amp; Takeaway</span><strong>&ldquo;${esc(op.memory_hook || '')}&rdquo;</strong>${esc(op.takeaway || '')}</div>`
    : '';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head><body>
<div class="page">
<div class="cover">
<div class="kicker">One-Page Learn &middot; Daily Rambam</div>
<div class="he">${esc(info.heName)}</div>
<div class="subtitle">${esc(op.subtitle || '')}</div>
<div class="meta">Sefer ${esc(info.sefer)} &middot; ${esc(info.chaptersLabel)}</div>
</div>
<div class="lede"><strong>What this is:</strong> A one-page overview of today's Rambam chapters &mdash; the core halachos, the single idea that binds them, and how it lands now. For study, not for ruling.</div>
<h2><span class="tab tab-frame">Frame</span> The one idea</h2>
<p class="frame-text">${esc(op.one_idea || '')}</p>
${svgDiagram(op.chapters || [])}
${chapters}
${op.spark ? `<div class="box spark"><span class="box-title">Why This Is Striking</span>${esc(op.spark)}</div>` : ''}
${op.chas ? `<div class="box chas"><span class="box-title">A Chassidus Lens</span>${esc(op.chas)}</div>` : ''}
${op.society ? `<div class="box society"><span class="box-title">How It Lands Today</span>${esc(op.society)}</div>` : ''}
${band}
${memory}
<div class="box warn"><span class="box-title">One Caution</span>This is a study overview, not a halachic ruling. These laws are detailed and apply chiefly within Eretz Yisrael or while the Temple stands; consult a competent rav for practical questions.</div>
<div class="endmark">&#9670; &#9670; &#9670;</div>
<div class="sources">${esc(op.sources || '')}</div>
</div>
</body></html>`;
}

async function uploadToMedia(objectPath, body, contentType) {
  const { error } = await supabase.storage.from('media').upload(objectPath, body, { contentType, upsert: true });
  if (error) throw new Error(`Storage upload failed (${objectPath}): ${JSON.stringify(error)}`);
  return `${SUPABASE_URL}/storage/v1/object/public/media/${objectPath}`;
}

// ─── TTS helpers ───
function cleanText(text) {
  return text
    .replace(/^---[\s\S]*?---\n*/m, '')
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*\*/g, '')
    .replace(/\*([^*]+)\*/g, '$1').replace(/\*/g, '')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^>\s*/gm, '')
    .replace(/^---+$/gm, '').replace(/^\*\*\*+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function chunkText(text, max = 4000) {
  if (text.length <= max) return [text];
  const paras = text.split(/\n\n+/);
  const chunks = [];
  let current = '';
  for (const p of paras) {
    if ((current + '\n\n' + p).length > max && current) {
      chunks.push(current.trim());
      current = p;
    } else current = current ? current + '\n\n' + p : p;
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

async function generateMP3(talkText) {
  const cleaned = cleanText(talkText);
  const chunks = chunkText(cleaned);
  const buffers = [];
  for (let i = 0; i < chunks.length; i++) {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'tts-1-hd', input: chunks[i], voice: 'onyx', speed: 0.95 }),
    });
    if (!res.ok) throw new Error(`OpenAI TTS failed chunk ${i + 1}: ${await res.text()}`);
    buffers.push(Buffer.from(await res.arrayBuffer()));
  }
  return Buffer.concat(buffers);
}

// ─── Per-day orchestration ───
async function processDay(dateStr) {
  console.log(`\n=== ${dateStr} ===`);
  if (await alreadyPublished(dateStr)) {
    console.log('  already published — skipping');
    return;
  }
  const info = await getDayInfo(dateStr);
  console.log(`  ${info.chaptersLabel} (Sefer ${info.sefer})`);

  const sourceText = await fetchSourceText(info);
  const { dvarTorah, talk } = await writeContent(sourceText, info);
  const html = buildArticleHTML(dvarTorah);
  const recordId = await publishToSupabase(html, dvarTorah, info);
  console.log(`  published essay: ${recordId}`);

  // Audio (best-effort: a TTS failure shouldn't unpublish the essay)
  try {
    const mp3 = await generateMP3(talk);
    const url = await uploadToMedia(`talks/talk-${info.slug}.mp3`, mp3, 'audio/mpeg');
    await supabase.from('content').update({ media_url: url, media_type: 'audio/mpeg' }).eq('id', recordId);
    console.log('  audio linked');
  } catch (err) {
    console.error(`  AUDIO FAILED (${dateStr}): ${err.message}`);
  }

  // One-Page Learn (non-blocking)
  try {
    const op = await writeOnePager(sourceText, info);
    const learnHtml = buildLearnHTML(op, info);
    await uploadToMedia(`learns/learn-${info.slug}.html`, learnHtml, 'text/html; charset=utf-8');
    console.log('  one-page learn uploaded');
  } catch (err) {
    console.error(`  ONE-PAGER FAILED (${dateStr}): ${err.message}`);
  }
}

// ─── Main: catch up from last published date through today ───
async function main() {
  console.log('=== Daily Rambam Pipeline ===');

  const { data: latest } = await supabase
    .from('content')
    .select('rambam_date')
    .eq('content_type', 'dvar_torah')
    .eq('status', 'published')
    .not('rambam_date', 'is', null)
    .lte('rambam_date', easternDate())
    .order('rambam_date', { ascending: false })
    .limit(1);

  const today = easternDate();
  const lastDate = latest && latest.length ? latest[0].rambam_date : easternDate(-1);
  console.log(`Last published: ${lastDate}; today: ${today}`);

  // Build the list of days to fill (lastDate+1 .. today), capped
  const days = [];
  const cursor = new Date(`${lastDate}T12:00:00Z`);
  const end = new Date(`${today}T12:00:00Z`);
  cursor.setUTCDate(cursor.getUTCDate() + 1);
  while (cursor <= end && days.length < MAX_CATCHUP_DAYS) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  if (days.length === 0) {
    console.log('Up to date — nothing to publish.');
    return;
  }
  console.log(`Catching up ${days.length} day(s): ${days.join(', ')}`);

  let ok = 0;
  for (const day of days) {
    try {
      await processDay(day);
      ok++;
    } catch (err) {
      console.error(`DAY FAILED (${day}): ${err.message}`);
    }
  }
  console.log(`\n=== Done: ${ok}/${days.length} day(s) processed ===`);
}

main().catch((err) => {
  console.error('\nPIPELINE FAILED:', err.message);
  process.exit(1);
});
