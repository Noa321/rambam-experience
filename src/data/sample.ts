export interface Halacha {
  number: number;
  hebrew: string;
  english: string;
}

export const sampleHalachot: Halacha[] = [
  {
    number: 1,
    hebrew: "הֲלָכָה א׳: כָּל הָעוֹשֶׂה מְלָאכָה בַּשַּׁבָּת מֵאָבוֹת מְלָאכוֹת בִּשְׁגָגָה חַיָּב חַטָּאת, וְאִם עָשָׂה בְּמֵזִיד חַיָּב כָּרֵת.",
    english: "Any person who performs a forbidden labor on the Sabbath inadvertently is liable to a sin offering. If they do so intentionally, they are liable for excision (Karet)."
  },
  {
    number: 2,
    hebrew: "הֲלָכָה ב׳: כָּל הַמְּקַלְקְלִין פְּטוּרִין, חוּץ מִן הַמַּבְעִיר וְהַחוֹבֵל.",
    english: "All those who act in a destructive manner are exempt, except for those who set fire or cause a wound."
  },
  {
    number: 3,
    hebrew: "הֲלָכָה ג׳: כָּל הַנַּעֲשֶׂה בְּשַׁבָּת בִּשְׁגָגָה, יֵאָכֵל לְמוֹצָאֵי שַׁבָּת מִיָּד לַאֲחֵרִים, וְהוּא עַצְמוֹ יַמְתִּין בִּכְדֵי שֶׁיֵּעָשׂוּ.",
    english: "In the case of anything done on the Sabbath inadvertently: it may be eaten immediately on Saturday night by others, but he himself must wait until enough time passes for it to be made."
  },
];

export const quests = [
  { id: 1, text: "Morning Tehillim", desc: "Read 3 Psalms today", xp: 50, done: true },
  { id: 2, text: "Review Yesterday", desc: "Recap Ch. 3 insights", xp: 30, done: false },
  { id: 3, text: "Daily Quiz", desc: "Complete after study", xp: 100, done: false, locked: true },
];
