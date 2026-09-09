/**
 * ============================================================================
 *  SEED ENTRIES — everything that came off the CV
 * ============================================================================
 *  These live in code, so the portfolio is never empty and never depends on a
 *  database being up. Anything you add later through /admin is stored in
 *  Supabase and appears alongside these, sorted by date.
 *
 *  Shape of an entry:
 *    id          unique string
 *    category    "academic" | "work" | "leadership" | "extracurricular"
 *    title       the organisation or programme
 *    role        your role or the subtitle, shown in italics
 *    period      free text, e.g. "Dec 2024 – Dec 2025"
 *    sortDate    YYYY-MM-DD, used only for ordering (newest first)
 *    summary     one or two lines shown on the card
 *    body        optional longer paragraph shown in the pop-up
 *    highlights  bullet points shown in the pop-up
 *    photos      image slot keys from lib/images.js (hover + gallery)
 *    links       [{ label, url }]
 *    featured    true = shown in the "Recent" strip on the portfolio page
 * ============================================================================
 */

export const seedEntries = [
  /* ============================ ACADEMIC ============================ */
  {
    id: "uel",
    category: "academic",
    title: "University of Economics and Law, VNU-HCM",
    role: "Bachelor of Financial Technology (Fintech)",
    period: "Sept 2023 – Present · expected May 2027",
    sortDate: "2023-09-01",
    summary:
      "GPA 3.69/4.0, ranked #2 in the Fintech cohort for 2023–2024.",
    body:
      "My degree sits at the seam between finance and engineering: financial modelling on one side, data and systems on the other. The coursework I care most about is the part that turns a spreadsheet into an argument.",
    highlights: [
      "GPA 3.69/4.0 — ranked #2 in the Fintech cohort for the 2023–2024 academic year.",
      "Core coursework: Data Analysis 9.2 · Business Information Systems 8.9 · Financial Management 8.5.",
    ],
    photos: ["uel-1", "uel-2"],
    links: [],
    featured: true,
    inPortfolio: true,
  },
  {
    id: "poznan",
    category: "academic",
    title: "Poznań University of Economics and Business",
    role: "Erasmus+ Exchange · Poland",
    period: "Feb 2026 – Jul 2026",
    sortDate: "2026-02-01",
    summary:
      "A semester in Poland working with international teams across finance and management.",
    body:
      "A full semester abroad on an Erasmus+ grant, taught and assessed in English alongside students from across Europe. The projects were team-based and cross-cultural, which is where most of the learning actually was.",
    highlights: [
      "Collaborated with international teams on academic projects across Finance and Management.",
      "Innovation Management 5/5 · Data Mining 5/5 · Corporate Finance 5/5 · Internal Communication in Business 4.5/5.",
    ],
    photos: ["poznan-1", "poznan-2"],
    links: [],
    featured: true,
    inPortfolio: true,
  },
  {
    id: "nckh",
    category: "academic",
    title: "Faculty-level Scientific Research",
    role: "“Rethinking ICT and financial development: Does digitalization directly hinder economic growth?”",
    period: "University of Economics and Law",
    sortDate: "2025-06-01",
    summary:
      "Re-examines whether digitalisation actually helps economic growth, or only appears to.",
    body:
      "The paper questions a comfortable assumption — that information technology and financial development pull growth in the same direction — and tests where the relationship breaks down.",
    highlights: [
      "Re-examines the relationship between digitalization, financial development and economic growth.",
    ],
    photos: ["nckh-1"],
    links: [],
    featured: false,
    inPortfolio: true,
  },
  {
    id: "sebl",
    category: "academic",
    title: "SEBL Conference",
    role: "“Machine Learning–Driven Anomaly Detection for Greenwashing in ESG Disclosures”",
    period: "Conference presentation",
    sortDate: "2025-09-01",
    summary:
      "Using machine learning to find the fingerprints of greenwashing in ESG reports.",
    body:
      "Companies rarely lie outright in ESG disclosures — they drift. This work treats that drift as an anomaly detection problem and flags the reports whose language and numbers stop agreeing with each other.",
    highlights: [
      "Applies machine learning to flag anomalies in ESG disclosures — the fingerprints of greenwashing.",
      "Presented at the SEBL Conference.",
    ],
    photos: ["sebl-1"],
    links: [],
    featured: false,
    inPortfolio: true,
  },
  {
    id: "certifications",
    category: "academic",
    title: "Certifications",
    role: "Data · Finance · Branding",
    period: "2025",
    sortDate: "2025-10-01",
    summary:
      "Google Data Analytics, corporate finance and branding, plus IELTS 6.5.",
    body: "",
    highlights: [
      "Google Data Analytics Specialization (Oct 2025).",
      "Corporate Financial Management — SIHUB & Vtalk (Aug 2025).",
      "Branding Management — SIHUB & Vtalk (Aug 2025).",
      "IELTS 6.5.",
    ],
    photos: ["certs-1"],
    links: [],
    featured: false,
    inPortfolio: true,
  },

  /* ========================= WORK EXPERIENCE ========================= */
  {
    id: "sihub",
    category: "work",
    title: "Startup and Innovation Hub of HCM City (SIHUB)",
    role: "Project Management Assistant",
    period: "Dec 2024 – Dec 2025",
    sortDate: "2024-12-01",
    summary:
      "Aligned 20 startup-support projects with national innovation strategy across three stakeholders.",
    body:
      "SIHUB is where Ho Chi Minh City's startup ecosystem actually gets coordinated — ministries, international funds, incubators and early-stage founders in the same room. My job was to keep twenty projects pointed in the same direction.",
    highlights: [
      "Coordinated with 3 national and international stakeholders (Ministry of Industry and Trade, Global Green Growth Institute, SpinLab) to align 20 startup-support projects with the national innovation strategy.",
      "Recruited 70 Trainees of Trainers from 16 universities and organised 4 workshops and Demo Days, supporting early-stage founders in refining business models.",
    ],
    photos: ["sihub-1", "sihub-2"],
    links: [],
    featured: true,
    inPortfolio: true,
  },
  {
    id: "vietnamdautu",
    category: "work",
    title: "Vietnam Investment Media JSC (VIETNAMDAUTU Online)",
    role: "Content Collaborator — Finance & Securities",
    period: "Apr 2025 – Jul 2025",
    sortDate: "2025-04-01",
    summary:
      "120+ analytical articles on gold and VN30 companies in four months, with same-day disclosure monitoring.",
    body:
      "Four months of reading financial statements in the morning and publishing an argument about them in the afternoon. It taught me to be fast without being loose.",
    highlights: [
      "Authored 120+ analytical articles on gold and VN30-index companies, synthesising financial statements and macro trends for more than 20 listed companies.",
      "Monitored HOSE disclosures with 100% accuracy and same-day turnaround, supporting institutional and individual investor decision-making.",
    ],
    photos: ["vnd-1", "vnd-2"],
    links: [{ label: "Published work", url: "https://vietnamdautu.vn/" }],
    featured: true,
    inPortfolio: true,
  },

  /* ============================ LEADERSHIP =========================== */
  {
    id: "bfat",
    category: "leadership",
    title: "Bulletin of Applied Finance and Technology (BFAT), UEL",
    role: "Deputy Head",
    period: "Apr 2024 – Present",
    sortDate: "2024-04-01",
    summary:
      "Rebuilt a publication from near-dissolution to 9 consecutive issues after 100% of the board resigned.",
    body:
      "In April 2024 the entire executive board of BFAT resigned at once. I stayed. Eight months later the organisation had thirty-five trained members and an editorial workflow that actually ran — and the bulletin has not missed an issue since.",
    highlights: [
      "Stepped into leadership when 100% of the executive board resigned within April 2024; rebuilt the team by recruiting and training 35 new members within 8 months, restoring full editorial operations.",
      "Restructured the publication workflow, reviving the organisation from near-dissolution to 9 consecutive issues (No. 27–35) within 2 years.",
    ],
    photos: ["bfat-1", "bfat-2"],
    links: [],
    featured: true,
    inPortfolio: true,
  },
  {
    id: "fintech-club",
    category: "leadership",
    title: "Financial Technology Club, UEL",
    role: "Head, Personal Finance Committee",
    period: "Jan 2024 – Sep 2025",
    sortDate: "2024-01-01",
    summary:
      "Founded a committee from nothing and scaled the Attacker competition past 2,000 participants.",
    body:
      "The committee did not exist when I took it — no framework, no calendar, no precedent. Building one from scratch turned out to be easier than fixing a broken one, and considerably more fun.",
    highlights: [
      "Scaled the “Attacker” fintech startup competition from 1,500 to over 2,000 participants (2024–2025).",
      "Led a newly established committee with no prior operating framework, building 15 workshops on personal finance and financial technology for more than 1,000 students.",
    ],
    photos: ["fintechclub-1", "fintechclub-2"],
    links: [],
    featured: true,
    inPortfolio: true,
  },

  /* ========================= EXTRACURRICULAR ========================= */
  {
    id: "coop-dept",
    category: "extracurricular",
    title: "Department of Cooperation and Development, UEL",
    role: "Collaborator",
    period: "Oct 2023 – Present",
    sortDate: "2023-10-01",
    summary:
      "Cultural exchange with partner universities from Singapore, Germany, Poland and Taiwan.",
    body: "",
    highlights: [
      "Facilitated cultural exchange events between UEL and partner universities from Singapore, Germany, Poland and Taiwan.",
      "Served as official “Buddy” for a French exchange student in the first semester of 2024–2025, providing academic and cultural support.",
    ],
    photos: ["coop-1"],
    links: [],
    featured: false,
    inPortfolio: true,
  },
  {
    id: "protect-our-beaches",
    category: "extracurricular",
    title: "“Protect Our Beaches” — Weaves of Change, Italy",
    role: "Environmental Volunteer",
    period: "Jul 2–14, 2025",
    sortDate: "2025-07-02",
    summary:
      "Two weeks in a fully self-organised camp, patrolling three coastal sites.",
    body:
      "Eight volunteers, three beaches, no staff. We cooked, cleaned and ran the camp ourselves between patrols — which is its own lesson in how small organisations hold together.",
    highlights: [
      "Participated in environmental training sessions led by camp leaders and collaborated with 8 volunteers on shared logistics in a fully self-organised camp.",
      "Conducted daily beach patrols across 3 coastal sites, engaging directly with more than 100 beachgoers on responsible tourist behaviour.",
    ],
    photos: ["beach-1", "beach-2"],
    links: [],
    featured: true,
    inPortfolio: true,
  },
  {
    id: "competitions",
    category: "competition",
    title: "Competitions & Products",
    role: "E-commerce · Environmental education",
    period: "2024 – 2025",
    sortDate: "2024-11-01",
    summary:
      "Top 6 at the Digital Business Contest; Top 24 at Startup Challenge 2024.",
    body: "",
    highlights: [
      "Top 6 — Digital Business Contest (DBC), Vietnam E-commerce Association (VECOM).",
      "Top 24 — Startup Challenge 2024 for the environmental education board game “Nhiệt chiến”.",
    ],
    photos: ["contest-1"],
    links: [],
    featured: false,
    inPortfolio: true,
  },
  {
    id: "bootcamp",
    category: "competition",
    title: "Entrepreneurship Bootcamp",
    role: "SIHUB & Ivey Business School",
    period: "Apr 2025",
    sortDate: "2025-04-15",
    summary:
      "Case-method entrepreneurship training run with Ivey Business School, Canada.",
    body: "",
    highlights: [
      "Case-method entrepreneurship training run with Ivey Business School (Canada).",
    ],
    photos: ["bootcamp-1"],
    links: [],
    featured: false,
    inPortfolio: true,
  },
];
