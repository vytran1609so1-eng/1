"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

/**
 * Everything the site measures about how a page is read, in one place.
 *
 * It sits in the layout, so it sees every page — including the ones reached by
 * clicking a link rather than loading the site fresh, because `usePathname`
 * changes on navigation and the whole effect starts again.
 *
 * Four measurements are taken here:
 *
 *  · the view itself, as soon as the page appears;
 *  · which sections were reached, using an observer on anything the page has
 *    marked with `data-track-section`. This is what turns "400 people opened
 *    the portfolio" into "and 90 of them got as far as Work Experience";
 *  · clicks on the contact details, spotted by listening at the document
 *    rather than by wiring every link — so a link added later is counted
 *    without anyone remembering to instrument it;
 *  · how far down the reader got, and how long they stayed, sent once as the
 *    page is being left.
 *
 * Nothing identifying is ever sent — see lib/track.js and the API route.
 */
export default function ViewTracker() {
  const pathname = usePathname();
  const seen = useRef(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    /* React mounts effects twice in development; without this a single visit
       would be recorded as two. */
    const firstTime = seen.current !== pathname;
    seen.current = pathname;
    if (firstTime) track("view", { path: pathname });

    const startedAt = Date.now();
    let deepest = 0;
    let sent = false;

    /* ---------------------------- scroll depth --------------------------- */
    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      /* A page shorter than the window has been read in full by definition. */
      const percent = scrollable <= 0 ? 100 : ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
      deepest = Math.min(100, Math.max(deepest, Math.round(percent)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* -------------------------- sections reached ------------------------- */
    const reported = new Set();
    let observer = null;
    let clearSectionTimer = null;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (records) => {
          for (const record of records) {
            if (!record.isIntersecting) continue;
            const el = record.target;
            const id = el.getAttribute("data-track-section");
            if (!id || reported.has(id)) continue;
            reported.add(id);
            track("section", {
              path: pathname,
              label: el.getAttribute("data-track-label") || id,
            });
            observer.unobserve(el);
          }
        },
        /* A third of the section has to be on screen: scrolling past at speed
           is not reading it. */
        { threshold: 0.34 }
      );

      /* Sections are rendered by the page below this component, so wait for
         the paint before looking for them. */
      const timer = window.setTimeout(() => {
        document
          .querySelectorAll("[data-track-section]")
          .forEach((el) => observer.observe(el));
      }, 400);

      clearSectionTimer = () => window.clearTimeout(timer);
    }

    /* --------------------------- contact clicks -------------------------- */
    function onClick(event) {
      const link = event.target.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";

      let label = null;
      if (href.startsWith("mailto:")) label = "email";
      else if (href.startsWith("tel:")) label = "phone";
      else if (/linkedin\.com/i.test(href)) label = "linkedin";
      else if (/facebook\.com/i.test(href)) label = "facebook";

      if (label) track("link", { path: pathname, label });
    }
    document.addEventListener("click", onClick, true);

    /* ------------------------- leaving the page -------------------------- */
    function onLeave() {
      if (sent) return;
      sent = true;
      onScroll();

      track("depth", { path: pathname, value: deepest });

      /* Seconds only matter where there is something to read. Capped at half
         an hour so a tab left open overnight cannot ruin the average. */
      if (pathname.startsWith("/blog/")) {
        const seconds = Math.min(1800, Math.round((Date.now() - startedAt) / 1000));
        if (seconds >= 3) track("read", { path: pathname, value: seconds });
      }
    }

    /* `pagehide` is the reliable one on phones, where a tab is frozen rather
       than closed and `beforeunload` may never run at all. */
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onLeave();
    });

    return () => {
      onLeave();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onLeave);
      document.removeEventListener("click", onClick, true);
      if (typeof clearSectionTimer === "function") clearSectionTimer();
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
