/**
 * Turn a title into a web address.
 *
 *   "Tôi học được gì ở Poznań?"  →  "toi-hoc-duoc-gi-o-poznan"
 *
 * Vietnamese accents are stripped and đ becomes d, so the link stays readable
 * and survives being pasted into a message, an email or a CV.
 */
export function slugify(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
