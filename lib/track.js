/**
 * Sending one measurement to the site's own database.
 *
 * Used only in the browser. Every call is fire-and-forget: a measurement is
 * the least important thing on any page, and must never be able to delay it,
 * block a click, or raise an error the reader can see.
 *
 * `sendBeacon` is preferred because it survives the page being closed a moment
 * later — which is exactly when the most interesting measurements are taken:
 * how far someone had scrolled, and how long they stayed.
 */
export function track(kind, { path, label = null, value = null } = {}) {
  if (typeof window === "undefined") return;

  const here = path || window.location.pathname;
  if (here.startsWith("/admin")) return;

  const body = JSON.stringify({ path: here, kind, label, value });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/views", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch (_) {}

  try {
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch (_) {}
}
