/**
 * ============================================================================
 *  IMAGE SLOTS
 * ============================================================================
 *  Two kinds of image:
 *   1. Layout images — the hero, your portrait, page covers.
 *   2. Entry photos  — the pictures that fly out under the cursor when someone
 *      hovers an entry, and that fill the gallery inside the pop-up. Each seed
 *      entry in lib/seed-entries.js lists these by key in its `photos` array.
 *
 *  To swap an image permanently:
 *    1. Drop the file into  public/images/
 *    2. Point `src` at it, e.g. "/images/hero.jpg"
 *    3. Tune `x` / `y` (framing, 0–100) and `zoom` (1 = fit)
 *
 *  Or do it visually: open the site, press Ctrl/⌘ + E, upload and drag, then
 *  use the two export buttons and paste the result back into this file.
 *
 *  Entries you add through /admin use their own uploaded images instead and do
 *  not need slots here.
 * ============================================================================
 */

const PH = (n) => `/images/ph-${n}.jpg`;

/**
 * True when an image slot is still showing one of the shipped placeholder
 * files rather than a real photograph. Entry photos that are still
 * placeholders are treated as "no photo": nothing flies out under the cursor
 * and the pop-up shows no gallery, so an activity without pictures simply
 * reads as text.
 */
export const isPlaceholder = (src) =>
  !src || /\/images\/ph-\d+\.(jpe?g|png|webp|avif)$/i.test(String(src));

/**
 * The small copy of an uploaded picture — `photo.jpg` → `photo-thumb.jpg`.
 * Only pictures in Supabase Storage have one; anything else (the files shipped
 * in public/images) is returned unchanged. If the small copy is missing, the
 * <img> falls back to the original, so nothing ever breaks.
 */
export const thumbOf = (src) => {
  const url = String(src ?? "");
  if (!url.includes("/storage/v1/")) return url;
  if (/-thumb\.[a-z0-9]+$/i.test(url)) return url;
  return url.replace(/(\.[a-z0-9]+)(\?.*)?$/i, "-thumb$1$2");
};

/** A slot's image, or null when it is still a placeholder. */
export const realSrc = (cfg) => (cfg && !isPlaceholder(cfg.src) ? cfg.src : null);

const LAYOUT_SLOTS = [
  {
    key: "portrait",
    group: "Your photo",
    label: "Photo of you",
    hint: "The portrait beside your introduction on the home page. Upright, roughly 4:5.",
    src: "/images/portrait.jpg",
    x: 50,
    y: 40,
    zoom: 1,
  },
  {
    key: "hero",
    group: "Home",
    label: "Home background",
    hint: "Landscape. Keep the middle calm — your name sits on top of it.",
    src: "/images/hero.jpg",
    x: 50,
    y: 45,
    zoom: 1,
  },
  {
    key: "portfolioCover",
    group: "Portfolio",
    label: "Portfolio page cover",
    hint: "Wide landscape banner.",
    src: "/images/portfolio-cover.jpg",
    x: 50,
    y: 50,
    zoom: 1,
  },
  {
    key: "contact",
    group: "Contact",
    label: "Contact background",
    hint: "Landscape, calmer tones work best behind text.",
    src: "/images/contact.jpg",
    x: 50,
    y: 50,
    zoom: 1,
  },
];

/* Entry photos: [key, group, label, placeholder number] */
const HOVER = [
  ["uel-1", "Academic", "UEL — photo 1", 1],
  ["uel-2", "Academic", "UEL — photo 2", 2],
  ["poznan-1", "Academic", "Poznań — photo 1", 3],
  ["poznan-2", "Academic", "Poznań — photo 2", 4],
  ["nckh-1", "Academic", "Scientific research", 5],
  ["sebl-1", "Academic", "SEBL Conference", 6],
  ["certs-1", "Academic", "Certifications", 1],

  ["sihub-1", "Work", "SIHUB — photo 1", 3],
  ["sihub-2", "Work", "SIHUB — photo 2", 4],
  ["vnd-1", "Work", "VIETNAMDAUTU — photo 1", 5],
  ["vnd-2", "Work", "VIETNAMDAUTU — photo 2", 6],

  ["bfat-1", "Leadership", "BFAT — photo 1", 2],
  ["bfat-2", "Leadership", "BFAT — photo 2", 3],
  ["fintechclub-1", "Leadership", "Fintech Club — photo 1", 4],
  ["fintechclub-2", "Leadership", "Fintech Club — photo 2", 5],

  ["coop-1", "Extracurricular", "Cooperation & Development", 6],
  ["beach-1", "Extracurricular", "Protect Our Beaches — 1", 1],
  ["beach-2", "Extracurricular", "Protect Our Beaches — 2", 2],
  ["contest-1", "Extracurricular", "Competitions", 3],
  ["bootcamp-1", "Extracurricular", "Entrepreneurship Bootcamp", 4],
];

const HOVER_SLOTS = HOVER.map(([key, group, label, ph]) => ({
  key,
  group: `Entry photos — ${group}`,
  label,
  hint: "Flies out under the cursor and fills the pop-up gallery.",
  src: PH(ph),
  x: 50,
  y: 50,
  zoom: 1,
}));

export const IMAGE_SLOTS = [...LAYOUT_SLOTS, ...HOVER_SLOTS];

export const DEFAULT_IMAGES = Object.fromEntries(
  IMAGE_SLOTS.map((s) => [s.key, { src: s.src, x: s.x, y: s.y, zoom: s.zoom }])
);

/** Slots grouped for the edit panel, in the order they appear above. */
export const IMAGE_GROUPS = IMAGE_SLOTS.reduce((acc, s) => {
  const g = s.group || "Other";
  if (!acc.some((x) => x.name === g)) acc.push({ name: g, slots: [] });
  acc.find((x) => x.name === g).slots.push(s);
  return acc;
}, []);

export const STORAGE_KEY = "vy-portfolio-images-v2";
export const UNLOCK_KEY = "vy-portfolio-edit-unlocked";

/**
 * A picture on the About page may be stored either as a plain URL (the way the
 * first version saved them) or as { src, caption }. This turns both into the
 * same shape, so old and new entries live happily side by side.
 */
export const asPhoto = (item) =>
  typeof item === "string" ? { src: item, caption: "" } : { src: item?.src || "", caption: item?.caption || "" };
