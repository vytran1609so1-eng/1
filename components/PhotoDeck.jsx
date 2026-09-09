"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { thumbOf } from "@/lib/images";

const EASE = [0.22, 1, 0.36, 1];

/**
 * A little stack of photographs sitting at the end of an activity.
 *
 * At rest you see one picture — the cover — with the edges of the others
 * showing behind it, so it reads as a physical pile. Move the cursor onto it
 * and the pile deals itself out to the left, one card at a time, each at a
 * slightly different angle. Move away and they slide back under the cover.
 *
 * The cover is the activity's first photograph; the order is set in /admin.
 * On a touch screen there is no hover, so tapping opens the pictures full size
 * straight away.
 */
export default function PhotoDeck({ photos = [], label = "", onOpen }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);

  if (!photos.length) return null;

  /* Four is as many as can fan out and still be read at a glance. */
  const behind = photos.slice(1, 5);
  const spread = fine && !reduce && open;

  return (
    <div
      className="relative shrink-0"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      style={{ width: "clamp(96px, 22vw, 168px)", height: "clamp(72px, 16vw, 122px)" }}
    >
      {/* the pictures hiding behind the cover */}
      {behind.map((photo, i) => {
        const step = i + 1;
        return (
          <motion.div
            key={photo.src + i}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[4px] bg-paper-300 shadow-[0_18px_40px_-24px_rgba(22,54,95,0.55)] ring-1 ring-white/70"
            initial={false}
            animate={
              spread
                ? {
                    x: -step * 96,
                    y: step % 2 ? -10 : 8,
                    rotate: step % 2 ? -5 + step : 4 - step,
                    opacity: 1,
                  }
                : { x: -step * 5, y: -step * 4, rotate: -step * 1.6, opacity: 1 }
            }
            transition={{
              duration: 0.55,
              ease: EASE,
              delay: spread ? step * 0.07 : (behind.length - step) * 0.04,
            }}
            style={{ zIndex: 10 - step }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbOf(photo.src)}
              onError={(e) => (e.currentTarget.src = photo.src)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </motion.div>
        );
      })}

      {/* the cover — the only part you can click */}
      <motion.button
        type="button"
        onClick={() => onOpen?.(0)}
        data-cursor={photos.length > 1 ? `${photos.length} ẢNH` : "XEM"}
        aria-label={
          label ? `${label} — xem ${photos.length} ảnh` : `Xem ${photos.length} ảnh`
        }
        className="absolute inset-0 z-20 overflow-hidden rounded-[4px] bg-paper-300 shadow-[0_20px_45px_-25px_rgba(22,54,95,0.6)] ring-1 ring-white/70"
        initial={false}
        animate={spread ? { rotate: 2.5, scale: 1.03 } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbOf(photos[0].src)}
          onError={(e) => (e.currentTarget.src = photos[0].src)}
          alt={photos[0].caption || ""}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />

        {photos.length > 1 && (
          <motion.span
            className="absolute bottom-1.5 right-1.5 rounded-full bg-navy/85 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-white"
            initial={false}
            animate={{ opacity: spread ? 0 : 1 }}
            transition={{ duration: 0.25 }}
          >
            {photos.length}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
