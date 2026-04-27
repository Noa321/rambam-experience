#!/usr/bin/env node
// Daily Rambam Pipeline — Fully Automated GitHub Actions Version
// Fetches today's chapters from Sefaria, writes d'var Torah + spoken talk via Claude,
// converts to branded HTML, publishes to Supabase, generates MP3 via OpenAI TTS,
// uploads audio, and links everything together.

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
  'Diverse Kinds': "Zera'im", 'Gifts to the Poor': "Zera'im",
  'Heave Offerings': "Zera'im", 'Tithes': "Zera'im",
  'Second Tithes and Fourth Year Produce': "Zera'im",
  'First Fruits and other Gifts to Priests Outside the Sanctuary': "Zera'im",
  'Sabbatical Year and the Jubilee': "Zera'im",
  'The Chosen Temple': 'Avodah', 'Temple Vessels and Servants': 'Avodah',
  'Entering the Temple': 'Avodah', 'Things Forbidden on the Altar': 'Avodah',
  'Sacrificial Procedure': 'Avodah', 'Daily Offerings and Additional Offerings': 'Avodah',
  'Sacrifices Rendered Unfit': 'Avodah', 'Service on the Day of Atonement': 'Avodah',
  'Trespass': 'Avodah',
  'Paschal Offering': 'Korbanot', 'Festival Offering': 'Korbanot',
  'Firstlings': 'Korbanot', 'Offerings for Unintentional Transgressions': 'Korbanot',
  'Offerings for Those with Incomplete Atonement': 'Korbanot',
  'Substitution': 'Korbanot',
  'Impurity of the Dead': 'Taharah', 'Red Heifer': 'Taharah',
  'Impurity of Leprosy': 'Taharah', 'Those Who Render Couch and Seat Impure': 'Taharah',
  'Other Sources of Impurity': 'Taharah', 'Impurity of Foods': 'Taharah',
  'Vessels': 'Taharah', 'Immersion Pools': 'Taharah',
  'Property Damage': 'Nezikim', 'Theft': 'Nezikim', 'Robbery and Lost Property': 'Nezikim',
  'One Who Injures a Person or Property': 'Nezikim', 'Murderer and the Preservation of Life': 'Nezikim',
  'Sales': 'Kinyan', 'Ownerless Property and Gifts': 'Kinyan',
  'Neighbors': 'Kinyan', 'Agents and Partners': 'Kinyan', 'Slaves': 'Kinyan',
  'Hiring': 'Mishpatim', 'Borrowing and Deposit': 'Mishpatim',
  'Creditor and Debtor': 'Mishpatim', 'Plaintiff and Defendant': 'Mishpatim',
  'Inheritance': 'Mishpatim',
  'Sanhedrin and the Penalties within their Jurisdiction': 'Shoftim',
  'Testimony': 'Shoftim', 'Rebels': 'Shoftim', 'Mourning': 'Shoftim',
  'Kings and Wars': 'Shoftim',
};

// ─── Hilchot display name → short name for rambam_chapters field ───
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
};

// ─── Step 0: Determine today's chapters ───
async function getTodaysChapters() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

  console.log(`Fetching Rambam chapters for ${dateStr}...`);

  const res = await fetch(`https://www.sefaria.org/api/calendars?year=${year}&month=${month}&day=${day}`);
  if (!res.ok) throw new Error(`Sefaria calendar API failed: ${res.status}`);
  const data = await res.json();

  const rambamItem = data.calendar_items.find(item => {
    const title = JSON.stringify(item.title || {});
    return title.includes('Rambam') && title.includes('3');
  });

  if (!rambamItem) throw new Error('Could not find Daily Rambam (3 chapters) in Sefaria calendar');

  const displayValue = rambamItem.displayValue?.en || '';
  const ref = rambamItem.ref || '';

  console.log(`  Display: ${displayValue}`);
  console.log(`  Ref: ${ref}`);

  // Parse ref: "Mishneh Torah, Marriage 14-16"
  const refMatch = ref.match(/^Mishneh Torah,\s*(.+?)\s+(\d+(?:-\d+)?)$/);
  if (!refMatch) throw new Error(`Cannot parse Sefaria ref: ${ref}`);

  const hilchotDisplayName = refMatch[1];
  const rangeStr = refMatch[2];

  const [start, end] = rangeStr.includes('-')
    ? rangeStr.split('-').map(Number)
    : [Number(rangeStr), Number(rangeStr)];

  const chapters = [];
  for (let i = start; i <= end; i++) chapters.push(i);

  const sefer = SEFER_MAP[hilchotDisplayName] || 'Unknown';
  const shortName = SHORT_NAMES[hilchotDisplayName] || hilchotDisplayName;
  const chaptersLabel = `${shortName} ${rangeStr}`;
  const slug = `${shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${rangeStr}`;

  // Build Sefaria API path for text fetching
  const apiName = `Mishneh_Torah,_${hilchotDisplayName.replace(/ /g, '_')}`;

  return {
    dateStr,
    hilchotDisplayName,
    shortName,
    sefer,
    chapters,
    chaptersLabel,
    slug,
    apiName,
  };
}

// ─── Step 1: Fetch source text from Sefaria ───
async function fetchSourceText(info) {
  console.log(`Fetching ${info.chapters.length} chapters from Sefaria...`);

  const texts = [];
  for (const ch of info.chapters) {
    const url = `https://www.sefaria.org/api/v3/texts/${info.apiName}.${ch}?version=english`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sefaria text API failed for ch ${ch}: ${res.status}`);
    const data = await res.json();
    const raw = data.versions?.[0]?.text;
    if (!raw) throw new Error(`No text found for ${info.apiName}.${ch}`);

    const flatten = (arr) => arr.map(v => Array.isArray(v) ? flatten(v) : v).join('\n');
    const text = flatten(raw).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\n{3,}/g, '\n\n');
    texts.push({ chapter: ch, text });
    console.log(`  Chapter ${ch}: ${text.length} chars`);
  }

  const combined = texts.map(t => `## CHAPTER ${t.chapter}\n\n${t.text}`).join('\n\n');
  return combined;
}

// ─── Step 2: Check for duplicates ───
async function checkDuplicate(info) {
  const { data } = await supabase
    .from('content')
    .select('id,rambam_chapters')
    .eq('content_type', 'dvar_torah')
    .eq('rambam_date', info.dateStr)
    .limit(1);
  if (data && data.length > 0) {
    console.log(`Already published for ${info.dateStr}: ${data[0].rambam_chapters}. Skipping.`);
    return true;
  }
  return false;
}

// ─── Step 2: Write d'var Torah + spoken talk via Claude ───
async function writeContent(sourceText, info) {
  console.log('Writing d\'var Torah via Claude...');

  const dvarPrompt = `You are writing a d'var Torah for The Rambam Experience — a daily Torah content platform. Today's chapters are Hilchot ${info.hilchotDisplayName} chapters ${info.chapters.join(', ')} from Maimonides' Mishneh Torah.

Here is the source text:

${sourceText}

CRITICAL OUTPUT FORMAT:
- ABSOLUTELY NO MARKDOWN FORMATTING in the prose body. No asterisks for bold. No underscores for italics. No bullet points. No numbered lists.
- The ONLY markdown allowed: a YAML frontmatter block at the top (between --- and ---) and h2 headings (## SECTION NAME).
- Section headings: SHORT, ALL CAPS like "## THE HOOK" or "## CHAPTER ${info.chapters[0]}"
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

Required sections:
## THE HOOK
## CHAPTER ${info.chapters[0]}: [evocative subtitle]
## CHAPTER ${info.chapters[1]}: [evocative subtitle]
${info.chapters[2] ? `## CHAPTER ${info.chapters[2]}: [evocative subtitle]` : ''}
## THE UNIFYING PRINCIPLE
## MODERN APPLICATION
## THE CLOSING

Length: 1800-2400 words.

VOICE: Manis Friedman style — warm, provocative, conversational, profound. Patient unpacking. Comfortable with paradox. Find the spiritual current beneath the legal mechanics.

CHASSIDIC SOURCES: Cite at least 3 naturally — Alter Rebbe/Tanya, Baal Shem Tov, Lubavitcher Rebbe/Likkutei Sichos, Tzemach Tzedek, Sfat Emet.

NEVER: emojis, bullet points, numbered lists, generic ethics, opening with "So" or "Today we're going to..."

Write the complete d'var Torah now.`;

  const talkPrompt = `You are writing a spoken talk for The Rambam Experience — a daily Torah audio platform. Today's chapters are Hilchot ${info.hilchotDisplayName} chapters ${info.chapters.join(', ')} from Maimonides' Mishneh Torah.

Here is the source text:

${sourceText}

CRITICAL OUTPUT FORMAT:
- ABSOLUTELY NO MARKDOWN. NO frontmatter. NO headings. NO asterisks. NO underscores. NO bullet points. NO numbered lists. NO horizontal dividers (---). NO blockquotes.
- Pure flowing narrative prose with paragraph breaks only. The ENTIRE output will be read aloud by text-to-speech. ANY symbol that isn't normal punctuation will be spoken or cause a glitch.
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

  // Run both in parallel
  const [dvarResult, talkResult] = await Promise.all([
    anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{ role: 'user', content: dvarPrompt }],
    }),
    anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [{ role: 'user', content: talkPrompt }],
    }),
  ]);

  const dvarTorah = dvarResult.content[0].text;
  const talk = talkResult.content[0].text;

  console.log(`  D'var Torah: ${dvarTorah.length} chars`);
  console.log(`  Talk: ${talk.length} chars`);

  return { dvarTorah, talk };
}

// ─── Parse YAML frontmatter ───
function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};
  for (const line of yaml.split('\n')) {
    const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (m) result[m[1]] = m[2];
    const arrMatch = line.match(/^(\w+):\s*\[(.*)\]\s*$/);
    if (arrMatch) {
      result[arrMatch[1]] = arrMatch[2].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    }
  }
  return result;
}

// ─── Step 3: Convert d'var Torah to branded HTML ───
function buildHTML(dvarTorah, info) {
  console.log('Converting to branded HTML...');

  const meta = parseFrontmatter(dvarTorah);
  const title = meta.title || info.chaptersLabel;
  const hook = meta.hook || '';

  // Strip frontmatter, then convert sections to HTML
  let body = dvarTorah.replace(/^---[\s\S]*?---\n*/, '');

  // Process sections
  const sections = body.split(/^## /m).filter(s => s.trim());
  let articleHTML = '';
  let isFirst = true;

  for (const section of sections) {
    const lines = section.split('\n');
    const heading = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();

    // Parse heading: "THE HOOK" or "CHAPTER 14: The Weight of Status"
    let sectionLabel, h2Title;
    if (heading.includes(':')) {
      const [label, ...rest] = heading.split(':');
      sectionLabel = label.trim();
      h2Title = rest.join(':').trim();
    } else {
      sectionLabel = heading;
      h2Title = heading.replace(/^THE\s+/, '');
    }

    // Add divider between sections (not before first)
    if (!isFirst) {
      articleHTML += '            <hr class="section-divider">\n';
    }
    isFirst = false;

    articleHTML += `            <p class="section-label">${sectionLabel}</p>\n`;
    articleHTML += `            <h2>${h2Title}</h2>\n\n`;

    // Convert paragraphs
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    const isClosingSection = sectionLabel.includes('CLOSING');

    for (let i = 0; i < paragraphs.length; i++) {
      let p = paragraphs[i].trim()
        .replace(/—/g, '&mdash;')
        .replace(/"/g, '&ldquo;').replace(/"/g, '&rdquo;')
        .replace(/'/g, '&rsquo;')
        .replace(/é/g, '&eacute;')
        .replace(/–/g, '&ndash;');

      const isLast = isClosingSection && i === paragraphs.length - 1;
      const cls = isLast ? ' class="closing-bold"' : '';
      articleHTML += `            <p${cls}>${p}</p>\n\n`;
    }
  }

  const readingTime = Math.ceil(body.split(/\s+/).length / 200);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Literata:ital@0;1&family=Noto+Serif+Hebrew:wght@400;600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet">
    <style>
        :root {
            --primary: #2C3E50; --accent-red: #C0392B; --deep-red: #A93226;
            --bg: #FAFAF8; --border-grey: #E2E2E2; --warm-grey: #718096;
            --text-primary: #2A2A28; --text-secondary: #5A5A56;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Literata', serif; background-color: var(--bg); color: var(--text-primary); line-height: 1.7; font-size: 16px; }
        .container { max-width: 760px; margin: 0 auto; padding: 40px 24px; }
        header { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; border-bottom: 2px solid var(--border-grey); padding-bottom: 24px; }
        .material-symbols-outlined { font-size: 32px; color: var(--primary); font-variation-settings: 'FILL' 1; }
        .site-title { font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 600; color: var(--primary); letter-spacing: 0.5px; }
        .article-header { margin-bottom: 48px; }
        .title-block { margin-bottom: 24px; }
        .title-block h1 { font-family: 'DM Sans', sans-serif; font-size: 32px; font-weight: 600; color: var(--primary); line-height: 1.3; margin-bottom: 16px; }
        .subtitle { font-family: 'Literata', serif; font-size: 18px; color: var(--accent-red); font-style: italic; line-height: 1.6; }
        .metadata { font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--warm-grey); margin-top: 16px; display: flex; gap: 20px; flex-wrap: wrap; }
        .metadata-item { display: flex; align-items: center; gap: 6px; }
        article { margin-bottom: 48px; }
        .section-label { font-family: 'DM Sans', sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: var(--accent-red); margin-bottom: 12px; margin-top: 32px; font-weight: 600; }
        .section-divider { border: none; border-top: 1px solid var(--border-grey); margin: 40px 0 16px; }
        article h2 { font-family: 'DM Sans', sans-serif; font-size: 24px; font-weight: 600; color: var(--primary); margin-bottom: 20px; margin-top: 8px; line-height: 1.35; }
        article p { margin-bottom: 20px; font-size: 17px; line-height: 1.75; color: var(--text-primary); }
        .pull-quote { font-family: 'Literata', serif; font-style: italic; font-size: 19px; color: var(--primary); border-left: 3px solid var(--accent-red); padding: 8px 0 8px 24px; margin: 32px 0; line-height: 1.6; }
        .closing-bold { font-weight: 600; color: var(--primary); margin-top: 32px; padding-top: 24px; border-top: 2px solid var(--border-grey); }
        footer { border-top: 2px solid var(--border-grey); padding-top: 24px; margin-top: 48px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--warm-grey); text-align: center; }
        @media (max-width: 600px) {
            .container { padding: 24px 16px; }
            .title-block h1 { font-size: 24px; }
            article h2 { font-size: 20px; }
            .metadata { flex-direction: column; gap: 8px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <span class="material-symbols-outlined">auto_stories</span>
            <div class="site-title">The Rambam / Experience</div>
        </header>
        <div class="article-header">
            <div class="title-block">
                <h1>${title}</h1>
                <p class="subtitle">${hook}</p>
            </div>
            <div class="metadata">
                <div class="metadata-item">${info.chaptersLabel}</div>
                <div class="metadata-item">${readingTime} minutes</div>
            </div>
        </div>
        <article>
${articleHTML}
        </article>
        <footer>The Rambam Experience &middot; therambamexperience.com</footer>
    </div>
</body>
</html>`;
}

// ─── Step 4: Publish to Supabase ───
async function publishToSupabase(html, dvarTorah, info) {
  console.log('Publishing to Supabase...');

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
    chapter_numbers: info.chapters,
    rambam_date: info.dateStr,
    hook: meta.hook || '',
    summary: meta.summary || '',
    tags: meta.tags || ['rambam'],
    published_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('content')
    .insert(record)
    .select('id,title,published_at,rambam_chapters')
    .single();

  if (error) throw new Error(`Supabase insert failed: ${JSON.stringify(error)}`);
  console.log(`  Published: ${data.id} — ${data.title}`);
  return data.id;
}

// ─── Step 5: Generate MP3 via OpenAI TTS ───
function cleanText(text) {
  text = text.replace(/^---[\s\S]*?---\n*/m, '');
  text = text.replace(/^#+\s*/gm, '');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*\*/g, '');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/\*/g, '');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/^>\s*/gm, '');
  text = text.replace(/^---+$/gm, '');
  text = text.replace(/^\*\*\*+$/gm, '');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
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
    } else {
      current = current ? current + '\n\n' + p : p;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

async function generateMP3(talkText) {
  console.log('Generating MP3 via OpenAI TTS...');

  const cleaned = cleanText(talkText);
  console.log(`  Cleaned text: ${cleaned.length} chars`);
  console.log(`  First 100: ${cleaned.substring(0, 100)}...`);

  const chunks = chunkText(cleaned);
  console.log(`  Chunks: ${chunks.length}`);

  const buffers = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`  Generating chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)...`);
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: chunks[i],
        voice: 'onyx',
        speed: 0.95,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI TTS failed chunk ${i + 1}: ${await res.text()}`);
    buffers.push(Buffer.from(await res.arrayBuffer()));
    console.log(`    -> ${buffers[i].length} bytes`);
  }

  return Buffer.concat(buffers);
}

// ─── Step 6: Upload MP3 + link to record ───
async function uploadAndLink(mp3Buffer, slug, recordId) {
  console.log('Uploading MP3 to Supabase storage...');

  const filename = `talk-${slug}.mp3`;
  const path = `talks/${filename}`;

  const { error: uploadErr } = await supabase.storage
    .from('media')
    .upload(path, mp3Buffer, { contentType: 'audio/mpeg', upsert: true });

  if (uploadErr) throw new Error(`Upload failed: ${JSON.stringify(uploadErr)}`);

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
  console.log(`  Uploaded: ${urlData.publicUrl}`);

  const { error: updateErr } = await supabase
    .from('content')
    .update({ media_url: urlData.publicUrl, media_type: 'audio/mpeg' })
    .eq('id', recordId);

  if (updateErr) throw new Error(`Record update failed: ${JSON.stringify(updateErr)}`);
  console.log('  Record linked to audio.');
}

// ─── Main ───
async function main() {
  console.log('=== Daily Rambam Pipeline ===\n');

  // Step 0: Get today's chapters
  const info = await getTodaysChapters();
  console.log(`  Sefer: ${info.sefer}, Hilchot: ${info.shortName}, Chapters: ${info.chapters.join(', ')}\n`);

  // Check for duplicates
  if (await checkDuplicate(info)) {
    console.log('Pipeline complete (already published).');
    return;
  }

  // Step 1: Fetch source text
  const sourceText = await fetchSourceText(info);
  console.log(`  Total source: ${sourceText.length} chars\n`);

  // Step 2: Write content via Claude (parallel)
  const { dvarTorah, talk } = await writeContent(sourceText, info);

  // Step 3: Convert to HTML
  const html = buildHTML(dvarTorah, info);

  // Step 4: Publish to Supabase
  const recordId = await publishToSupabase(html, dvarTorah, info);

  // Step 5: Generate MP3
  const mp3 = await generateMP3(talk);
  console.log(`  Total MP3: ${mp3.length} bytes\n`);

  // Step 6: Upload + link
  await uploadAndLink(mp3, info.slug, recordId);

  console.log('\n=== Pipeline complete! ===');
  console.log(`  ${info.chaptersLabel} — published with audio.`);
}

main().catch(err => {
  console.error('\nPIPELINE FAILED:', err.message);
  process.exit(1);
});
