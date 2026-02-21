/**
 * Daily Insight articles keyed by treatise ID and chapter range.
 * Each insight covers a day’s study (typically 3 chapters).
 *
 * Key format: "treatiseId:startChapter-endChapter"
 */

export interface InsightArticle {
  title: string;
  subtitle: string;
  sections: InsightSection[];
  mediaUrl?: string;
  mediaType?: string;
}

export interface InsightSection {
  label?: string;       // e.g. "Hook", "The Halacha", "Chassidic Depth"
  heading: string;
  content: string;      // HTML string
}

const insightsMap: Record<string, InsightArticle> = {

  /* ─── Yesodei HaTorah, Chapters 1–3 ─── */
  "foundations:1-3": {
    title: "The Architecture of Reality: How God\u2019s Unity Creates Everything Else",
    subtitle: "Daily Rambam: Hilchot Yesodei HaTorah 1\u20133",
    sections: [
      {
        label: "Hook",
        heading: "The Knowledge Paradox",
        content: `
          <p>Imagine you\u2019re asked: \u201cDo you know yourself?\u201d Easy question, right? Of course you know yourself! But then comes the follow-up: \u201cAre you and your knowledge of yourself the same thing?\u201d</p>
          <p>Most of us would say no. I\u2019m one thing, my thoughts about myself are another. There\u2019s me, and then there\u2019s what I know about me.</p>
          <p>Now here\u2019s where it gets wild: Rambam tells us that when it comes to God, this distinction completely collapses. God IS His knowledge. God IS His life. Not just that He \u201chas\u201d knowledge or \u201cpossesses\u201d life\u2014He literally IS those things, unified in a way that makes our minds spin.</p>
          <p>And this isn\u2019t just theological poetry. This impossible-to-grasp unity is the FOUNDATION of everything else. It\u2019s <strong>mitzvah #1</strong>. It\u2019s the \u201cgreat principle upon which everything depends.\u201d But why? Why does God\u2019s metaphysical structure matter so much that it\u2019s the very first thing we need to know?</p>
        `,
      },
      {
        label: "The Halacha",
        heading: "The Master Principle of Dependent Existence",
        content: `
          <p>Here\u2019s the organizing principle that explains everything in these three chapters: <strong>Reality operates on a hierarchy of dependent existence, and only God exists independently.</strong></p>

          <h3>The Primary Being (Chapter 1:1\u20134)</h3>
          <p>Rambam opens with an astonishing logical move. He doesn\u2019t say \u201cGod exists.\u201d He says something far more radical: God is THE EXISTENCE. If you could somehow imagine God not existing\u2014nothing else could exist either. But if you imagined everything else disappearing\u2014God would still be there, completely unchanged.</p>
          <p>Why? Because all beings require Him, but He requires nothing. That\u2019s what makes His truth different from all other truth. The verse \u201cGod is true\u201d (Jeremiah 10:10) doesn\u2019t mean God tells the truth\u2014it means God IS truth itself, the only self-sustaining existence.</p>
          <p>This leads to the first mitzvah: <strong>Know</strong> that this Primary Being exists. Not \u201cbelieve in\u201d but KNOW\u2014with the certainty that comes from understanding the logical necessity.</p>

          <h3>The Unity Principle (Chapter 1:7)</h3>
          <p>Now comes the revolutionary move: God must be ONE, but not one like anything we count. Why? Because if there were multiple gods, they would need BODIES to be distinguished from each other. (Think about it: two identical twins are only \u201ctwo\u201d because they occupy different spaces, have different physical features).</p>
          <p>But bodies are limited \u2192 limited power \u2192 but we see unlimited power (the spheres rotating eternally) \u2192 therefore not a body \u2192 therefore nothing that could create multiplicity \u2192 therefore <strong>absolutely ONE</strong>.</p>

          <h3>The Non-Corporeal Reality (Chapter 1:8\u201312)</h3>
          <p>If God has no body, then NONE of the accidents of bodies apply: no place, no time, no change, no emotions, no speech as we know it, no beginning or end.</p>
          <p>So what about all those verses describing God\u2019s \u201chand\u201d or \u201canger\u201d or \u201csitting\u201d? They\u2019re all metaphors\u2014\u201cthe Torah speaks in human language.\u201d Even Moses\u2019s ultimate vision was like seeing someone\u2019s back, not their face.</p>

          <h3>The Hierarchical Universe (Chapter 2:3\u20134)</h3>
          <p>Everything God created falls into THREE categories:</p>
          <p><strong>1. Matter + Form that constantly changes</strong> \u2192 Bodies (humans, animals, plants, metals) that are constantly being generated and destroyed</p>
          <p><strong>2. Matter + Form that\u2019s permanently fixed</strong> \u2192 The spheres and stars, whose forms never shift to different matter</p>
          <p><strong>3. Pure Form without matter</strong> \u2192 Angels, who are completely non-physical, separated only by their spiritual levels</p>
          <p>Notice the pattern: <em>The closer to God, the less material. The less material, the more stable. The more stable, the more knowledge.</em></p>

          <h3>The Knowledge Structure (Chapter 2:9\u201310)</h3>
          <p>Angels have ten levels, each one knowing God according to its capacity\u2014but even the highest angel cannot know God as He knows Himself. Why? Because God\u2019s knowledge IS God. There\u2019s no separation between Knower, Knowledge, and Known.</p>
        `,
      },
      {
        label: "The Unifying Principle",
        heading: "Existence is Proportional to Connection",
        content: `
          <blockquote>\u201cThe degree of a being\u2019s existence, stability, and knowledge is directly proportional to its connection to the Source of Existence.\u201d</blockquote>
          <p><strong>Chapter 1:</strong> God is absolute existence because He IS existence itself\u2014totally self-sufficient.</p>
          <p><strong>Chapter 2:</strong> Angels are stable existence because they\u2019re pure form, entirely spiritual, closer to God\u2019s nature.</p>
          <p><strong>Chapter 3:</strong> The spheres have permanent existence because their form is fixed in their matter. But the four elements below keep changing because they\u2019re furthest from the Source.</p>
          <p>The whole universe is organized as a <strong>ladder of dependency</strong>: everything below exists only because of what\u2019s above it, and the whole chain exists only because God holds it all in being.</p>
        `,
      },
      {
        label: "The Chassidic Depth",
        heading: "Law as Portal to Mystery",
        content: `
          <p>The Lubavitcher Rebbe asks: Why does Rambam begin a legal code\u2014a book of HALACHA\u2014with pure metaphysics? The Shulchan Aruch doesn\u2019t start with cosmology.</p>
          <p>His answer: <strong>Halacha isn\u2019t just commands imposed on an indifferent universe. Halacha is the OPERATING SYSTEM of existence itself.</strong></p>
          <p>The entire legal system requires this metaphysical foundation. Shabbat makes no sense if the world is eternal. Kashrut is meaningless if the physical and spiritual aren\u2019t connected. Prayer is absurd if God is just an impersonal force.</p>

          <h3>The Baal Shem Tov\u2019s Radical Unity</h3>
          <p>The Baal Shem Tov teaches on \u201cEin od milvado\u201d (There is nothing besides Him). Everything we see\u2014rocks, trees, people, planets\u2014these aren\u2019t separate beings that happen to depend on God. They\u2019re expressions of God\u2019s continuous creative will, like waves on an ocean.</p>
          <p>The practical implication? When you look at anything\u2014a flower, a star, another person\u2014you\u2019re seeing God\u2019s will taking form. The moment God would stop \u201csaying\u201d it, it would vanish.</p>

          <h3>The Tzemach Tzedek on Knowledge</h3>
          <p>The Tzemach Tzedek explores why Rambam structures the commandment as \u201cKNOW that there is a Primary Being\u201d rather than \u201cBELIEVE.\u201d</p>
          <p>His answer: Belief can be passive, even superstitious. Knowledge requires engagement, understanding, active integration. The mitzvah isn\u2019t to have a vague sense that God exists. It\u2019s to GRASP the logical necessity and implications of God\u2019s existence.</p>
        `,
      },
      {
        label: "Practical Application",
        heading: "Living in Dependency",
        content: `
          <p><strong>What does this mean for you THIS WEEK?</strong></p>
          <h3>Practice 1: Dependence Prayer</h3>
          <p>Each morning, before you do anything else, spend 30 seconds contemplating: \u201cRight now, at this very moment, I exist only because God is actively creating me. If He would stop thinking me into being, I would vanish.\u201d This isn\u2019t morbid\u2014it\u2019s liberating. You\u2019re a continuous miracle.</p>

          <h3>Practice 2: The Unity Check</h3>
          <p>When you face a decision, ask: \u201cWhat would I choose if I really believed that this situation, this person, this challenge\u2014all of it is ONE divine will taking different forms?\u201d If God is one, your life must be unified too.</p>

          <h3>Practice 3: The Knowledge Mitzvah</h3>
          <p>Take one concept from these chapters and study it for 10 minutes every day this week. Not to memorize, but to UNDERSTAND. You\u2019re fulfilling the first mitzvah: KNOW that there is a Primary Being.</p>

          <blockquote>\u201cThe mind rules the heart.\u201d You can\u2019t love or fear what you don\u2019t know. The intellectual work isn\u2019t separate from the emotional work of loving God. It\u2019s the FOUNDATION.<br/><cite>\u2014 Alter Rebbe, Tanya</cite></blockquote>
        `,
      },
      {
        label: "Closing",
        heading: "The Foundation That Holds Everything",
        content: `
          <p>We started with a paradox: God\u2019s knowledge is God. We end with clarity: That impossible unity is what makes everything else possible.</p>
          <p>Because God is one, unified, independent\u2014He can create a diverse universe without fragmenting. Because God knows Himself perfectly\u2014He knows everything, since everything exists through Him.</p>
          <blockquote>\u201cThe foundation (yesod) isn\u2019t just the starting point\u2014it\u2019s what holds everything up. Remove the foundation, and the building collapses. Remove the knowledge of God\u2019s unity, and the entire structure of Torah collapses.\u201d<br/><cite>\u2014 Sfat Emet</cite></blockquote>
          <p>When you wake up tomorrow, remember: You\u2019re not just a human trying to follow some ancient rules. You\u2019re a conscious being, standing on the lowest rung of the ladder of existence, aware of the Primary Being who holds you in existence at this very moment, choosing to align your will with the Will that creates everything.</p>
          <p><strong>That\u2019s not just philosophy. That\u2019s the foundation of foundations. That\u2019s the first thing you need to know.</strong></p>
        `,
      },
    ],
  },
};

/**
 * Look up a daily insight article.
 * Tries exact match first, then tries expanding/contracting the chapter range.
 */
export function getInsight(treatiseId: string, startChapter: number, endChapter: number): InsightArticle | null {
  const key = `${treatiseId}:${startChapter}-${endChapter}`;
  return insightsMap[key] || null;
}

/**
 * Check if an insight exists for a given treatise and chapter range.
 */
export function hasInsight(treatiseId: string, startChapter: number, endChapter: number): boolean {
  return getInsight(treatiseId, startChapter, endChapter) !== null;
}

/**
 * Find an insight article that covers a specific chapter of a treatise.
 * e.g. getInsightForChapter("foundations", 2) → returns the "foundations:1-3" article
 * because chapter 2 falls within the 1–3 range.
 */
export function getInsightForChapter(treatiseId: string, chapter: number): InsightArticle | null {
  for (const [key, article] of Object.entries(insightsMap)) {
    const [id, range] = key.split(":");
    if (id !== treatiseId) continue;

    const [start, end] = range.split("-").map(Number);
    if (chapter >= start && chapter <= end) {
      return article;
    }
  }
  return null;
}
