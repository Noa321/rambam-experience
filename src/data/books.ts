// Complete Mishneh Torah structure with exact Sefaria API reference names
// for all 14 Sefarim and 83 Hilchot (treatises)

export interface Treatise {
  id: string;
  name: string;           // Display name
  heName: string;         // Hebrew display name
  sefariaRef: string;     // Exact Sefaria API reference
  chapters: number;       // Number of chapters
}

export interface Book {
  id: string;
  num: string;            // Roman numeral
  heb: string;            // Hebrew name
  eng: string;            // English name
  color: string;          // Brand color for the book
  treatises: Treatise[];
  progress: number;       // 0-100
}

export const books: Book[] = [
  {
    id: "madda",
    num: "I",
    heb: "מדע",
    eng: "Knowledge",
    color: "#34495E",
    progress: 0,
    treatises: [
      { id: "foundations",     name: "Foundations of the Torah",                heName: "יסודי התורה",       sefariaRef: "Mishneh Torah, Foundations of the Torah",                          chapters: 10 },
      { id: "dispositions",    name: "Human Dispositions",                     heName: "דעות",              sefariaRef: "Mishneh Torah, Human Dispositions",                                chapters: 7 },
      { id: "torah-study",     name: "Torah Study",                            heName: "תלמוד תורה",        sefariaRef: "Mishneh Torah, Torah Study",                                       chapters: 7 },
      { id: "foreign-worship", name: "Foreign Worship",                        heName: "עבודה זרה",         sefariaRef: "Mishneh Torah, Foreign Worship and Customs of the Nations",        chapters: 12 },
      { id: "repentance",      name: "Repentance",                             heName: "תשובה",             sefariaRef: "Mishneh Torah, Repentance",                                        chapters: 10 },
    ],
  },
  {
    id: "ahavah",
    num: "II",
    heb: "אהבה",
    eng: "Love",
    color: "#9B2C2C",
    progress: 0,
    treatises: [
      { id: "shema",           name: "Reading the Shema",                      heName: "קריאת שמע",         sefariaRef: "Mishneh Torah, Reading the Shema",                                 chapters: 4 },
      { id: "prayer",          name: "Prayer and the Priestly Blessing",       heName: "תפילה וברכת כהנים", sefariaRef: "Mishneh Torah, Prayer and the Priestly Blessing",                  chapters: 15 },
      { id: "tefillin",        name: "Tefillin, Mezuzah and Torah Scroll",     heName: "תפילין ומזוזה",     sefariaRef: "Mishneh Torah, Tefillin, Mezuzah and the Torah Scroll",             chapters: 10 },
      { id: "fringes",         name: "Fringes",                                heName: "ציצית",             sefariaRef: "Mishneh Torah, Fringes",                                           chapters: 3 },
      { id: "blessings",       name: "Blessings",                              heName: "ברכות",             sefariaRef: "Mishneh Torah, Blessings",                                         chapters: 11 },
      { id: "circumcision",    name: "Circumcision",                           heName: "מילה",              sefariaRef: "Mishneh Torah, Circumcision",                                      chapters: 3 },
    ],
  },
  {
    id: "zemanim",
    num: "III",
    heb: "זמנים",
    eng: "Times",
    color: "#2C7A7B",
    progress: 0,
    treatises: [
      { id: "sabbath",         name: "Sabbath",                                heName: "שבת",               sefariaRef: "Mishneh Torah, Sabbath",                                           chapters: 30 },
      { id: "eruvin",          name: "Eruvin",                                 heName: "עירובין",           sefariaRef: "Mishneh Torah, Eruvin",                                            chapters: 8 },
      { id: "yom-kippur",      name: "Rest on the Tenth of Tishrei",           heName: "שביתת עשור",        sefariaRef: "Mishneh Torah, Rest on the Tenth of Tishrei",                      chapters: 3 },
      { id: "yom-tov",         name: "Rest on a Holiday",                      heName: "שביתת יום טוב",     sefariaRef: "Mishneh Torah, Rest on a Holiday",                                 chapters: 8 },
      { id: "chametz",         name: "Leavened and Unleavened Bread",           heName: "חמץ ומצה",          sefariaRef: "Mishneh Torah, Leavened and Unleavened Bread",                      chapters: 8 },
      { id: "shofar",          name: "Shofar, Sukkah and Lulav",               heName: "שופר סוכה ולולב",   sefariaRef: "Mishneh Torah, Shofar, Sukkah and Lulav",                          chapters: 8 },
      { id: "shekel",          name: "Sheqel Dues",                            heName: "שקלים",             sefariaRef: "Mishneh Torah, Sheqel Dues",                                       chapters: 4 },
      { id: "new-month",       name: "Sanctification of the New Month",        heName: "קידוש החודש",       sefariaRef: "Mishneh Torah, Sanctification of the New Month",                   chapters: 19 },
      { id: "fasts",           name: "Fasts",                                  heName: "תעניות",            sefariaRef: "Mishneh Torah, Fasts",                                             chapters: 5 },
      { id: "megillah",        name: "Scroll of Esther and Hanukkah",          heName: "מגילה וחנוכה",      sefariaRef: "Mishneh Torah, Scroll of Esther and Hanukkah",                     chapters: 4 },
    ],
  },
  {
    id: "nashim",
    num: "IV",
    heb: "נשים",
    eng: "Women",
    color: "#702459",
    progress: 0,
    treatises: [
      { id: "marriage",        name: "Marriage",                               heName: "אישות",             sefariaRef: "Mishneh Torah, Marriage",                                          chapters: 25 },
      { id: "divorce",         name: "Divorce",                                heName: "גירושין",           sefariaRef: "Mishneh Torah, Divorce",                                           chapters: 13 },
      { id: "levirate",        name: "Levirate Marriage and Release",           heName: "יבום וחליצה",       sefariaRef: "Mishneh Torah, Levirate Marriage and Release",                     chapters: 8 },
      { id: "virgin",          name: "Virgin Maiden",                          heName: "נערה בתולה",        sefariaRef: "Mishneh Torah, Virgin Maiden",                                     chapters: 3 },
      { id: "sotah",           name: "Woman Suspected of Infidelity",          heName: "סוטה",              sefariaRef: "Mishneh Torah, Woman Suspected of Infidelity",                     chapters: 4 },
    ],
  },
  {
    id: "kedushah",
    num: "V",
    heb: "קדושה",
    eng: "Holiness",
    color: "#244E70",
    progress: 0,
    treatises: [
      { id: "intercourse",     name: "Forbidden Intercourse",                  heName: "איסורי ביאה",       sefariaRef: "Mishneh Torah, Forbidden Intercourse",                             chapters: 22 },
      { id: "forbidden-foods", name: "Forbidden Foods",                        heName: "מאכלות אסורות",     sefariaRef: "Mishneh Torah, Forbidden Foods",                                   chapters: 17 },
      { id: "slaughter",       name: "Ritual Slaughter",                       heName: "שחיטה",             sefariaRef: "Mishneh Torah, Ritual Slaughter",                                  chapters: 14 },
    ],
  },
  {
    id: "haflaah",
    num: "VI",
    heb: "הפלאה",
    eng: "Separation",
    color: "#2D6A4F",
    progress: 0,
    treatises: [
      { id: "oaths",           name: "Oaths",                                  heName: "שבועות",            sefariaRef: "Mishneh Torah, Oaths",                                             chapters: 12 },
      { id: "vows",            name: "Vows",                                   heName: "נדרים",             sefariaRef: "Mishneh Torah, Vows",                                              chapters: 13 },
      { id: "nazirite",        name: "Nazirite",                               heName: "נזירות",            sefariaRef: "Mishneh Torah, Nazirite",                                          chapters: 10 },
      { id: "appraisals",      name: "Appraisals and Devoted Property",        heName: "ערכים וחרמים",      sefariaRef: "Mishneh Torah, Appraisals and Devoted Property",                   chapters: 8 },
    ],
  },
  {
    id: "zeraim",
    num: "VII",
    heb: "זרעים",
    eng: "Seeds",
    color: "#525E75",
    progress: 0,
    treatises: [
      { id: "diverse-species", name: "Diverse Species",                        heName: "כלאים",             sefariaRef: "Mishneh Torah, Diverse Species",                                   chapters: 10 },
      { id: "gifts-poor",      name: "Gifts to the Poor",                      heName: "מתנות עניים",       sefariaRef: "Mishneh Torah, Gifts to the Poor",                                 chapters: 10 },
      { id: "heave-offerings", name: "Heave Offerings",                        heName: "תרומות",            sefariaRef: "Mishneh Torah, Heave Offerings",                                   chapters: 15 },
      { id: "tithes",          name: "Tithes",                                 heName: "מעשרות",            sefariaRef: "Mishneh Torah, Tithes",                                            chapters: 14 },
      { id: "second-tithes",   name: "Second Tithes and Fourth Year's Fruit",  heName: "מעשר שני ונטע רבעי",sefariaRef: "Mishneh Torah, Second Tithes and Fourth Year's Fruit",              chapters: 11 },
      { id: "first-fruits",    name: "First Fruits",                           heName: "ביכורים",           sefariaRef: "Mishneh Torah, First Fruits and other Gifts to Priests Outside the Sanctuary", chapters: 12 },
      { id: "sabbatical",      name: "Sabbatical Year and the Jubilee",        heName: "שמיטה ויובל",       sefariaRef: "Mishneh Torah, Sabbatical Year and the Jubilee",                   chapters: 13 },
    ],
  },
  {
    id: "avodah",
    num: "VIII",
    heb: "עבודה",
    eng: "Service",
    color: "#822727",
    progress: 0,
    treatises: [
      { id: "temple",          name: "The Chosen Temple",                      heName: "בית הבחירה",        sefariaRef: "Mishneh Torah, The Chosen Temple",                                 chapters: 8 },
      { id: "vessels",         name: "Vessels of the Sanctuary",               heName: "כלי המקדש",         sefariaRef: "Mishneh Torah, Vessels of the Sanctuary and Those who Serve Therein", chapters: 10 },
      { id: "admission",       name: "Admission into the Sanctuary",           heName: "ביאת מקדש",         sefariaRef: "Mishneh Torah, Admission into the Sanctuary",                      chapters: 9 },
      { id: "forbidden-altar", name: "Things Forbidden on the Altar",          heName: "איסורי מזבח",       sefariaRef: "Mishneh Torah, Things Forbidden on the Altar",                     chapters: 7 },
      { id: "sacrificial",     name: "Sacrificial Procedure",                  heName: "מעשה הקרבנות",      sefariaRef: "Mishneh Torah, Sacrificial Procedure",                             chapters: 19 },
      { id: "daily-offerings", name: "Daily Offerings",                        heName: "תמידין ומוספין",    sefariaRef: "Mishneh Torah, Daily Offerings and Additional Offerings",           chapters: 10 },
      { id: "unfit",           name: "Sacrifices Rendered Unfit",              heName: "פסולי המוקדשין",    sefariaRef: "Mishneh Torah, Sacrifices Rendered Unfit",                          chapters: 19 },
      { id: "atonement-day",   name: "Service on the Day of Atonement",       heName: "עבודת יום הכיפורים",sefariaRef: "Mishneh Torah, Service on the Day of Atonement",                   chapters: 5 },
      { id: "trespass",        name: "Trespass",                               heName: "מעילה",             sefariaRef: "Mishneh Torah, Trespass",                                          chapters: 8 },
    ],
  },
  {
    id: "korbanot",
    num: "IX",
    heb: "קרבנות",
    eng: "Sacrifices",
    color: "#4A5568",
    progress: 0,
    treatises: [
      { id: "paschal",         name: "Paschal Offering",                       heName: "קרבן פסח",          sefariaRef: "Mishneh Torah, Paschal Offering",                                  chapters: 10 },
      { id: "festival",        name: "Festival Offering",                      heName: "חגיגה",             sefariaRef: "Mishneh Torah, Festival Offering",                                 chapters: 3 },
      { id: "firstlings",      name: "Firstlings",                             heName: "בכורות",            sefariaRef: "Mishneh Torah, Firstlings",                                        chapters: 8 },
      { id: "unintentional",   name: "Offerings for Unintentional Transgressions", heName: "שגגות",         sefariaRef: "Mishneh Torah, Offerings for Unintentional Transgressions",         chapters: 15 },
      { id: "atonement",       name: "Offerings for Incomplete Atonement",     heName: "מחוסרי כפרה",      sefariaRef: "Mishneh Torah, Offerings for Those with Incomplete Atonement",      chapters: 5 },
      { id: "substitution",    name: "Substitution",                           heName: "תמורה",             sefariaRef: "Mishneh Torah, Substitution",                                      chapters: 4 },
    ],
  },
  {
    id: "taharah",
    num: "X",
    heb: "טהרה",
    eng: "Purity",
    color: "#6B7280",
    progress: 0,
    treatises: [
      { id: "corpse",          name: "Defilement by a Corpse",                 heName: "טומאת מת",          sefariaRef: "Mishneh Torah, Defilement by a Corpse",                            chapters: 25 },
      { id: "red-heifer",      name: "Red Heifer",                             heName: "פרה אדומה",         sefariaRef: "Mishneh Torah, Red Heifer",                                        chapters: 15 },
      { id: "leprosy",         name: "Defilement by Leprosy",                  heName: "טומאת צרעת",        sefariaRef: "Mishneh Torah, Defilement by Leprosy",                             chapters: 16 },
      { id: "bed-seat",        name: "Those Who Defile Bed or Seat",           heName: "מטמאי משכב ומושב",  sefariaRef: "Mishneh Torah, Those Who Defile Bed or Seat",                      chapters: 13 },
      { id: "other-defile",    name: "Other Fathers of Defilement",            heName: "שאר אבות הטומאה",   sefariaRef: "Mishneh Torah, Other Fathers of Defilement",                       chapters: 20 },
      { id: "food-defile",     name: "Defilement of Foods",                    heName: "טומאת אוכלין",      sefariaRef: "Mishneh Torah, Defilement of Foods",                               chapters: 16 },
      { id: "vessels-purity",  name: "Vessels",                                heName: "כלים",              sefariaRef: "Mishneh Torah, Vessels",                                           chapters: 28 },
      { id: "mikvot",          name: "Immersion Pools",                        heName: "מקוואות",           sefariaRef: "Mishneh Torah, Immersion Pools",                                   chapters: 11 },
    ],
  },
  {
    id: "nezikin",
    num: "XI",
    heb: "נזיקין",
    eng: "Injuries",
    color: "#63171B",
    progress: 0,
    treatises: [
      { id: "damages",         name: "Damages to Property",                    heName: "נזקי ממון",         sefariaRef: "Mishneh Torah, Damages to Property",                               chapters: 14 },
      { id: "theft",           name: "Theft",                                  heName: "גניבה",             sefariaRef: "Mishneh Torah, Theft",                                             chapters: 9 },
      { id: "robbery",         name: "Robbery and Lost Property",              heName: "גזילה ואבידה",      sefariaRef: "Mishneh Torah, Robbery and Lost Property",                         chapters: 18 },
      { id: "injury",          name: "One Who Injures a Person or Property",   heName: "חובל ומזיק",        sefariaRef: "Mishneh Torah, One Who Injures a Person or Property",              chapters: 8 },
      { id: "murder",          name: "Murderer and the Preservation of Life",  heName: "רוצח ושמירת נפש",   sefariaRef: "Mishneh Torah, Murderer and the Preservation of Life",             chapters: 13 },
    ],
  },
  {
    id: "kinyan",
    num: "XII",
    heb: "קניין",
    eng: "Acquisition",
    color: "#1A365D",
    progress: 0,
    treatises: [
      { id: "sales",           name: "Sales",                                  heName: "מכירה",             sefariaRef: "Mishneh Torah, Sales",                                             chapters: 30 },
      { id: "ownerless",       name: "Ownerless Property and Gifts",           heName: "זכייה ומתנה",       sefariaRef: "Mishneh Torah, Ownerless Property and Gifts",                      chapters: 12 },
      { id: "neighbors",       name: "Neighbors",                              heName: "שכנים",             sefariaRef: "Mishneh Torah, Neighbors",                                         chapters: 14 },
      { id: "partners",        name: "Agents and Partners",                    heName: "שלוחין ושותפין",    sefariaRef: "Mishneh Torah, Agents and Partners",                               chapters: 10 },
      { id: "slaves",          name: "Slaves",                                 heName: "עבדים",             sefariaRef: "Mishneh Torah, Slaves",                                            chapters: 9 },
    ],
  },
  {
    id: "mishpatim",
    num: "XIII",
    heb: "משפטים",
    eng: "Judgments",
    color: "#2A4365",
    progress: 0,
    treatises: [
      { id: "hiring",          name: "Hiring",                                 heName: "שכירות",            sefariaRef: "Mishneh Torah, Hiring",                                            chapters: 13 },
      { id: "borrowing",       name: "Borrowing and Deposit",                  heName: "שאלה ופיקדון",      sefariaRef: "Mishneh Torah, Borrowing and Deposit",                             chapters: 8 },
      { id: "creditor",        name: "Creditor and Debtor",                    heName: "מלווה ולווה",       sefariaRef: "Mishneh Torah, Creditor and Debtor",                               chapters: 27 },
      { id: "plaintiff",       name: "Plaintiff and Defendant",                heName: "טוען ונטען",        sefariaRef: "Mishneh Torah, Plaintiff and Defendant",                           chapters: 16 },
      { id: "inheritance",     name: "Inheritance",                            heName: "נחלות",             sefariaRef: "Mishneh Torah, Inheritance",                                       chapters: 11 },
    ],
  },
  {
    id: "shoftim",
    num: "XIV",
    heb: "שופטים",
    eng: "Judges",
    color: "#234E52",
    progress: 0,
    treatises: [
      { id: "sanhedrin",       name: "The Sanhedrin",                          heName: "סנהדרין",           sefariaRef: "Mishneh Torah, The Sanhedrin and the Penalties within their Jurisdiction", chapters: 26 },
      { id: "testimony",       name: "Testimony",                              heName: "עדות",              sefariaRef: "Mishneh Torah, Testimony",                                         chapters: 22 },
      { id: "rebels",          name: "Rebels",                                 heName: "ממרים",             sefariaRef: "Mishneh Torah, Rebels",                                            chapters: 7 },
      { id: "mourning",        name: "Mourning",                               heName: "אבל",              sefariaRef: "Mishneh Torah, Mourning",                                          chapters: 14 },
      { id: "kings",           name: "Kings and Wars",                         heName: "מלכים ומלחמות",     sefariaRef: "Mishneh Torah, Kings and Wars",                                    chapters: 12 },
    ],
  },
];

/**
 * Helper: get total chapters across all treatises in a book
 */
export function getBookChapterCount(book: Book): number {
  return book.treatises.reduce((sum, t) => sum + t.chapters, 0);
}

/**
 * Helper: get total treatise count for a book
 */
export function getBookTreatiseCount(book: Book): number {
  return book.treatises.length;
}

/**
 * Helper: find a treatise by its ID across all books
 */
export function findTreatise(treatiseId: string): { book: Book; treatise: Treatise } | null {
  for (const book of books) {
    const treatise = book.treatises.find(t => t.id === treatiseId);
    if (treatise) return { book, treatise };
  }
  return null;
}

/**
 * Helper: get a flat list of all treatises
 */
export function getAllTreatises(): Array<Treatise & { bookId: string; bookColor: string }> {
  return books.flatMap(book =>
    book.treatises.map(t => ({ ...t, bookId: book.id, bookColor: book.color }))
  );
}