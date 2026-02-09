export interface Book {
  id: string;
  num: string;
  heb: string;
  eng: string;
  color: string;
  treatises: number;
  chapters: number;
  hilchot: string[];
  progress: number;
}

export const books: Book[] = [
  { id: "madda",     num: "I",    heb: "מדע",    eng: "Knowledge",    color: "#34495E", treatises: 5,  chapters: 46,  hilchot: ["Foundations of Torah", "Human Dispositions", "Torah Study", "Foreign Worship", "Repentance"], progress: 78 },
  { id: "ahavah",    num: "II",   heb: "אהבה",   eng: "Love",         color: "#9B2C2C", treatises: 6,  chapters: 38,  hilchot: ["Reading the Shema", "Prayer", "Tefillin & Mezuzah", "Tzitzit", "Blessings", "Circumcision"], progress: 12 },
  { id: "zemanim",   num: "III",  heb: "זמנים",  eng: "Times",        color: "#2C7A7B", treatises: 10, chapters: 65,  hilchot: ["Shabbat", "Eruvin", "Rest on Yom Tov", "Chametz & Matzah", "Shofar Sukkah Lulav"], progress: 0 },
  { id: "nashim",    num: "IV",   heb: "נשים",   eng: "Women",        color: "#702459", treatises: 5,  chapters: 47,  hilchot: ["Marriage", "Divorce", "Yibum & Chalitzah", "Virgin Maiden", "Sotah"], progress: 0 },
  { id: "kedushah",  num: "V",    heb: "קדושה",  eng: "Holiness",     color: "#244E70", treatises: 3,  chapters: 49,  hilchot: ["Forbidden Intercourse", "Forbidden Foods", "Ritual Slaughter"], progress: 0 },
  { id: "haflaah",   num: "VI",   heb: "הפלאה",  eng: "Separation",   color: "#2D6A4F", treatises: 4,  chapters: 36,  hilchot: ["Oaths", "Vows", "Nazirite", "Valuations"], progress: 0 },
  { id: "zeraim",    num: "VII",  heb: "זרעים",  eng: "Seeds",        color: "#525E75", treatises: 7,  chapters: 67,  hilchot: ["Diverse Kinds", "Gifts to Poor", "Terumot", "Tithes", "First Fruits"], progress: 0 },
  { id: "avodah",    num: "VIII", heb: "עבודה",  eng: "Service",      color: "#822727", treatises: 9,  chapters: 62,  hilchot: ["Chosen Temple", "Temple Vessels", "Entering Temple", "Sacrificial Procedure"], progress: 0 },
  { id: "korbanot",  num: "IX",   heb: "קרבנות", eng: "Sacrifices",   color: "#4A5568", treatises: 6,  chapters: 43,  hilchot: ["Paschal Offering", "Festival Offering", "Firstborn", "Substitution"], progress: 0 },
  { id: "taharah",   num: "X",    heb: "טהרה",   eng: "Purity",       color: "#6B7280", treatises: 8,  chapters: 128, hilchot: ["Impurity of Dead", "Red Heifer", "Tzara'at", "Immersion Pools"], progress: 0 },
  { id: "nezikin",   num: "XI",   heb: "נזיקין", eng: "Injuries",     color: "#63171B", treatises: 5,  chapters: 36,  hilchot: ["Property Damage", "Theft", "Robbery", "Murder"], progress: 0 },
  { id: "kinyan",    num: "XII",  heb: "קניין",  eng: "Acquisition",  color: "#1A365D", treatises: 5,  chapters: 30,  hilchot: ["Sales", "Acquisitions", "Neighbors", "Partners", "Slaves"], progress: 0 },
  { id: "mishpatim", num: "XIII", heb: "משפטים", eng: "Judgments",    color: "#2A4365", treatises: 5,  chapters: 39,  hilchot: ["Hiring", "Borrowing", "Creditor", "Claims", "Inheritance"], progress: 0 },
  { id: "shoftim",   num: "XIV",  heb: "שופטים", eng: "Judges",       color: "#234E52", treatises: 5,  chapters: 40,  hilchot: ["Sanhedrin", "Testimony", "Rebels", "Mourning", "Kings & Wars"], progress: 0 },
];
