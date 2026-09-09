"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSite } from "./SiteProvider";
import { isPlaceholder, thumbOf } from "@/lib/images";

const EASE = [0.22, 1, 0.36, 1];

export default function EntryModal({ entry, categoryLabel = "", onClose }) {
  const { images, ui } = useSite();
  /* Which photograph is open full-size. The grid shows small copies; the
     heavy original is only fetched for the one picture someone asks to see. */
  const [zoomed, setZoomed] = useState(null);

  /* Lock the page (and the smooth-scroll engine) while the panel is open */
  useEffect(() => {
    if (!entry) return;
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    window.__lenis?.stop?.();
    function onKey(e) {
      if (e.key !== "Escape") return;
      setZoomed((cur) => {
        if (cur !== null) return null; // first Escape closes the photograph
        onClose();
        return null;
      });
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      window.__lenis?.start?.();
      window.removeEventListener("keydown", onKey);
    };
  }, [entry, onClose]);

  useEffect(() => {
    if (!entry) setZoomed(null);
  }, [entry]);

  /* Placeholders don't count as photographs — an activity with no pictures
     simply has no gallery section. */
  const gallery = entry
    ? [
        ...(entry.photos || []).map((k) => images[k]),
        ...(entry.imageUrls || []).map((u) => ({ src: u, x: 50, y: 50, zoom: 1 })),
      ].filter((c) => c && !isPlaceholder(c.src))
    : [];

  return (
    <>
      <AnimatePresence>
        {entry && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center md:items-center">
          <motion.button
            type="button"
            aria-label={ui.portfolio.closeLabel}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-navy-deep/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={entry.title}
            className="relative flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[10px] bg-white shadow-2xl md:max-h-[86svh] md:rounded-[8px]"
            initial={{ y: "6%", opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "4%", opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-5 border-b border-navy-line px-6 py-5 md:px-9 md:py-7">
              <div className="min-w-0">
                <p className="eyebrow text-azure">
                  {categoryLabel ? `${categoryLabel} · ` : ""}{entry.period}
                </p>
                <h2 className="display mt-3 text-[clamp(1.35rem,3.6vw,2.15rem)] text-navy">
                  {entry.title}
                </h2>
                {entry.role && (
                  <p className="display-italic mt-2 text-[16px] text-navy-soft md:text-[18px]">
                    {entry.role}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={ui.portfolio.closeLabel}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-navy-line text-navy-soft transition-colors hover:border-azure hover:text-azure"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-7 md:px-9 md:py-9">
              {entry.body && (
                <p className="max-w-2xl whitespace-pre-line text-[15.5px] leading-[1.85] text-navy">
                  {entry.body}
                </p>
              )}

              {entry.highlights?.length > 0 && (
                <div className={entry.body ? "mt-9" : ""}>
                  <p className="eyebrow text-navy-soft">{ui.portfolio.highlightsLabel}</p>
                  <ul className="mt-5 max-w-2xl space-y-4">
                    {entry.highlights.map((h, i) => (
                      <motion.li
                        key={i}
                        className="flex gap-4"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: EASE }}
                      >
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-azure" />
                        <span className="text-[14.5px] leading-[1.8] text-navy-soft">{h}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {gallery.length > 0 && (
                <div className="mt-10">
                  <p className="eyebrow text-navy-soft">{ui.portfolio.galleryLabel}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {gallery.map((cfg, i) => (
                      <motion.button
                        type="button"
                        key={i}
                        onClick={() => setZoomed(i)}
                        aria-label={`${ui.portfolio.galleryLabel} ${i + 1}`}
                        className="group relative aspect-[4/3] overflow-hidden rounded-[3px] bg-paper-300 ring-1 ring-navy/10"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.06, duration: 0.55, ease: EASE }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbOf(cfg.src)}
                          onError={(e) => (e.currentTarget.src = cfg.src)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          style={{
                            objectPosition: `${cfg.x}% ${cfg.y}%`,
                            transform: `scale(${cfg.zoom})`,
                            transformOrigin: `${cfg.x}% ${cfg.y}%`,
                          }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {entry.links?.length > 0 && (
                <div className="mt-10 border-t border-navy-line pt-6">
                  <p className="eyebrow text-navy-soft">{ui.portfolio.linksLabel}</p>
                  <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2">
                    {entry.links.map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="link-underline text-[13px] font-semibold text-azure"
                      >
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* One photograph, full size, on request */}
      <AnimatePresence>
        {entry && zoomed !== null && gallery[zoomed] && (
          <motion.div
            className="fixed inset-0 z-[95] grid place-items-center bg-navy-deep/90 p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setZoomed(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src={gallery[zoomed].src}
              alt=""
              className="max-h-full max-w-full object-contain"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
            <button
              type="button"
              onClick={() => setZoomed(null)}
              aria-label={ui.portfolio.closeLabel}
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              ✕
            </button>
            {gallery.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                {zoomed + 1} / {gallery.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
