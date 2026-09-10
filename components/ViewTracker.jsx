"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Tells the server that a page has been opened.
 *
 * It sits in the layout, so it sees every page, including the ones reached by
 * clicking a link rather than by loading the site fresh — `usePathname`
 * changes on navigation and the effect runs again.
 *
 * Three things it deliberately does not do:
 *  · it never counts /admin — those visits are Vy's own, and counting them
 *    would make the numbers meaningless within a week of building the site;
 *  · it never blocks anything. The request is fire-and-forget, and a failure
 *    is swallowed. A counter must not be able to break a page;
 *  · it sends nothing but the address of the page. No id, no cookie, nothing
 *    that could say who the reader was.
 *
 * The ref guards against React mounting the effect twice in development, which
 * would otherwise record two views for one visit.
 */
export default function ViewTracker() {
  const pathname = usePathname();
  const counted = useRef(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;
    if (counted.current === pathname) return;
    counted.current = pathname;

    const body = JSON.stringify({ path: pathname });

    /* sendBeacon survives the page being closed a moment later, which is
       exactly what happens when someone glances at a page and leaves. */
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/views", new Blob([body], { type: "application/json" }));
        return;
      }
    } catch (_) {}

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
