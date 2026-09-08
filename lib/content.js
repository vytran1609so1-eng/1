/**
 * ============================================================================
 *  DEFAULT SITE COPY & STRUCTURE
 * ============================================================================
 *  Everything in `defaultSettings` can be edited from /admin once Supabase is
 *  connected — what you save there is stored in the database and overrides the
 *  values below. These stay as the fallback, so the site still reads correctly
 *  if the database is empty or unreachable.
 *
 *  Nothing here is fixed: every heading, button and small label lives in
 *  `defaultSettings.ui` and can be rewritten in /admin → Text.
 * ============================================================================
 */

/* The three keywords. Their ids are used in URLs: /portfolio/excellence … */
export const KEYWORD_IDS = ["excellence", "leadership", "entrepreneurship"];

export const defaultSettings = {
  /* Who you are ---------------------------------------------------------- */
  profile: {
    signature: "Tran Thi Thuy Vy",
    field: "Financial Technology",
    since: "Class of 2027",
    location: "Ho Chi Minh City, Vietnam",
    email: "vytran1609so1@gmail.com",
    phone: "0913 981 670",
    phoneHref: "+84913981670",
    linkedinLabel: "Vy Tran",
    linkedinUrl: "https://www.linkedin.com/in/vy-tran-50a591298/",
    facebookLabel: "Tran Vy",
    facebookUrl: "https://www.facebook.com/tran.vy.120471/",
  },

  /* Home page ------------------------------------------------------------ */
  home: {
    eyebrow: "Financial Technology · University of Economics and Law, VNU-HCM",
    hook: "I turn ambition into numbers that hold up.",
    intro:
      "I am a Financial Technology undergraduate at the University of Economics and Law (VNU-HCM), graduating in 2027. I rebuild things that stopped working — a student publication after its entire board resigned, a committee with no operating framework, a competition that had stopped growing — and I keep score of what comes out the other side.",
    keywordsLabel: "Three things I am judged on",
    marquee: [
      "GPA 3.69/4.0",
      "Ranked #2 in Fintech cohort",
      "Erasmus+ Poznań",
      "9 consecutive issues",
      "2,000+ participants",
      "120+ analytical articles",
      "70 trainees of trainers",
      "Google Data Analytics",
    ],
    stats: [
      { value: "3.69/4.0", label: "Cumulative GPA" },
      { value: "9", label: "Consecutive issues revived" },
      { value: "2,000+", label: "Competition participants" },
      { value: "120+", label: "Financial analyses published" },
    ],
  },

  /* The three keywords --------------------------------------------------- */
  keywords: [
    {
      id: "excellence",
      word: "Excellence",
      line: "I study to understand, not to pass.",
      lead:
        "Degrees, coursework, research and everything I have written for an audience that checks the footnotes.",
    },
    {
      id: "leadership",
      word: "Leadership",
      line: "I take the seat when the room empties.",
      lead:
        "The organisations I have run, rebuilt or founded — and the people who stayed because the structure finally worked.",
    },
    {
      id: "entrepreneurship",
      word: "Entrepreneurship",
      line: "From an idea to a number that holds up.",
      lead:
        "Where the startup ecosystem actually operates, the competitions I entered, and the work I was paid to do.",
    },
  ],

  /* The five sections. `keyword` decides which keyword page a section
     appears on; set it to "" to leave a section unassigned — it still shows
     on the portfolio, just at the bottom. ------------------------------- */
  categories: [
    {
      id: "academic",
      label: "Academic",
      blurb: "Degrees, coursework, research and conference work.",
      keyword: "excellence",
      stats: [
        { value: "3.69/4.0", label: "Cumulative GPA" },
        { value: "#2", label: "Fintech cohort 2023–2024" },
        { value: "5/5", label: "in 3 Erasmus+ courses" },
        { value: "6.5", label: "IELTS" },
      ],
    },
    {
      id: "leadership",
      label: "Leadership",
      blurb: "Teams rebuilt, committees founded, organisations run.",
      keyword: "leadership",
      stats: [
        { value: "35", label: "Members recruited & trained" },
        { value: "9", label: "Consecutive issues (No. 27–35)" },
        { value: "2,000+", label: "Attacker participants" },
        { value: "1,000+", label: "Students reached" },
      ],
    },
    {
      id: "extracurricular",
      label: "Extracurricular",
      blurb: "Volunteering, exchange and community work.",
      keyword: "leadership",
      stats: [
        { value: "4", label: "Partner countries" },
        { value: "3", label: "Coastal sites patrolled" },
        { value: "100+", label: "Beachgoers engaged" },
        { value: "8", label: "Volunteers in a self-run camp" },
      ],
    },
    {
      id: "work",
      label: "Work Experience",
      blurb: "Roles held, projects run, deliverables shipped.",
      keyword: "entrepreneurship",
      stats: [
        { value: "20", label: "Startup projects aligned" },
        { value: "70", label: "Trainees from 16 universities" },
        { value: "120+", label: "Analytical articles" },
        { value: "100%", label: "HOSE disclosure accuracy" },
      ],
    },
    {
      id: "competition",
      label: "Competitions & Awards",
      blurb: "Contests entered, products built, training earned.",
      keyword: "entrepreneurship",
      stats: [
        { value: "2", label: "National competition finals" },
        { value: "6", label: "Best placing — DBC" },
        { value: "24", label: "Best placing — Startup Challenge" },
        { value: "1", label: "Ivey Business School bootcamp" },
      ],
    },
  ],

  /* Contact page --------------------------------------------------------- */
  contact: {
    eyebrow: "Say hello",
    title: "Let's talk",
    lead:
      "I am looking for internships and management trainee programmes in consulting, finance and financial technology — and I am always up for a conversation about data.",
    availability:
      "Fintech undergraduate at UEL, graduating May 2027. Open to internships, part-time analyst work and management trainee programmes.",
  },

  /* Image overrides uploaded from /admin. Keys match lib/images.js slots.
     Anything absent falls back to the file in public/images/. ------------- */
  images: {},

  /* The two motion extras, both switchable from /admin → Text.
     smoothScroll: the page eases instead of jumping with the wheel.
     cursor:       the small dot and trailing ring that replace the pointer.
     Both are ignored on touch screens, on /admin, and whenever the visitor
     has asked their system for reduced motion. ---------------------------- */
  motion: { smoothScroll: true, cursor: true },

  /* Full-width photographs placed between the sections of a page. Add as many
     as you like in /admin → Images → Photo bands. Each one is:
       { id, src, caption, page: "home" | "portfolio",
         size: "wide" | "tall", width: "full" | "inset", x, y, zoom }        */
  bands: [],

  /* Every other label on the site — page headings, button text, the small
     words above a section. All of it is editable in /admin → Text. --------- */
  ui: {
    home: {
      cta: "View the portfolio",
      ctaSecondary: "Get in touch",
      scroll: "Scroll",
      keywordCta: "Open",
    },
    portfolio: {
      eyebrow: "The record",
      title: "Portfolio",
      lead:
        "Everything I have built, studied and run — grouped by what kind of work it was. Open any entry for the full story, the numbers and the photographs.",
      allLabel: "Everything",
      emptyCategory: "Nothing filed under this heading yet.",
      entryCount: "entries",
      openLabel: "Read",
      closeLabel: "Close",
      highlightsLabel: "What happened",
      galleryLabel: "Photographs",
      linksLabel: "Links",
      keywordStripLabel: "Or read it by keyword",
      unassignedLabel: "Also on file",
    },
    keyword: {
      backLabel: "All of the portfolio",
      otherKeywords: "Keep reading",
      empty: "No sections are assigned to this keyword yet.",
    },
    archive: {
      eyebrow: "Everything, in order",
      title: "Archive",
      lead:
        "The complete record — every activity on file, newest first, including the ones that did not make the portfolio.",
      onPortfolio: "On the portfolio",
      count: "activities",
    },
    contact: {
      labels: {
        email: "Email",
        phone: "Phone",
        linkedin: "LinkedIn",
        facebook: "Facebook",
        location: "Based in",
      },
      cta: "Send me an email",
      availabilityLabel: "Currently",
      messageHint: "Prefer messaging? Facebook is the fastest way to reach me.",
      footer: "Designed & built by Tran Thi Thuy Vy",
    },
  },

  /* True once the CV activities have been copied into the database. The
     portfolio then reads only from the database. ------------------------- */
  seedImported: false,
};

/* The labels above, as a plain object, for anything that needs them before
   the database has been read. Live pages use settings.ui instead. */
export const ui = defaultSettings.ui;

/* Navigation ------------------------------------------------------------- */
export const nav = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/archive", label: "Archive" },
  { href: "/contact", label: "Contact" },
  /**
   * The graduation guestbook is built and ready but hidden until closer to
   * graduation. To switch it on, uncomment the line below.
   */
  // { href: "/guestbook", label: "Guestbook" },
];

/* ==========================================================================
 *  GUESTBOOK (hidden for now — see nav above)
 * ======================================================================== */
export const guestbook = {
  eyebrow: "Guestbook",
  headline: "Leave me a note",
  lead:
    "Four years are drawing to a close. If we shared a classroom, ran an event together, or simply sat next to each other in the library — leave me a few lines. I am keeping all of them here.",
  form: {
    name: "Your name",
    namePlaceholder: "e.g. Minh Anh",
    relation: "How do we know each other?",
    relationPlaceholder: "Classmate · BFAT teammate · …",
    message: "Your message",
    messagePlaceholder: "Anything — a memory, a wish, a joke.",
    submit: "Send it",
    sending: "Sending…",
    successTitle: "Got it — thank you!",
    successBody: "Your note will appear once I have read through it.",
    another: "Write another",
    errorRequired: "Name and message are required.",
    errorGeneric: "Something went wrong. Please try again in a moment.",
    errorTooLong: "That message is a little too long.",
  },
  wall: {
    empty: "No notes yet. Be the first.",
    notConfigured:
      "The guestbook is not connected to a database yet. See the Supabase section in the README.",
    count: "notes",
  },
  back: "Back to the portfolio",
};
