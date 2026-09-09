"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { asPhoto } from "@/lib/images";

const EASE = [0.22, 1, 0.36, 1];

/**
 * One photograph, full size, over a dark ground, with its caption underneath.
 *
 *   images   — URLs, or { src, caption } — both are understood
 *   captions — optional captions to pair with plain URLs, by position
 *   index    — which picture is open, or null for closed
 *
 * The arrow keys move between pictures and Escape closes. Only the picture
 * being looked at is ever fetched at full size.
 */
export default function Lightbox({ images = [], captions = [], index, onClose, onIndex }) {
  const list = (Array.isArray(images) ? images : [])
    .map((item, i) => {
      const photo = asPhoto(item);
      return { src: photo.src, caption: photo.caption || captions[i] || "" };
    })
    .filter((photo) => photo.src);

  const current = index === null || index === undefined ? null : list[index];
  const open = Boolean(current);
  const total = list.length;

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    window.__lenis?.stop?.();

    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && total > 1) onIndex((index + 1) % total);
      if (e.key === "ArrowLeft" && total > 1) onIndex((index - 1 + total) % total);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      window.__lenis?.start?.();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, index, total, onClose, onIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] grid place-items-center bg-navy-deep/90 p-4 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <figure className="flex max-h-full max-w-full flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={current.src}
              src={current.src}
              alt={current.caption || ""}
              className="max-h-[78vh] max-w-full object-contain"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
            {current.caption && (
              <figcaption className="max-w-2xl px-4 text-center text-[13.5px] leading-relaxed text-white/75">
                {current.caption}
              </figcaption>
            )}
          </figure>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            ✕
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                aria-label="Ảnh trước"
                onClick={(e) => {
                  e.stopPropagation();
                  onIndex((index - 1 + total) % total);
                }}
                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Ảnh sau"
                onClick={(e) => {
                  e.stopPropagation();
                  onIndex((index + 1) % total);
                }}
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                →
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                {index + 1} / {total}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
