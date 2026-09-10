"use client";

import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { thumbOf } from "@/lib/images";

const EASE = [0.22, 1, 0.36, 1];

/** How many tiles to lay down. Enough to cover a wide screen with room spare;
 *  anything past the edge is simply clipped by the container. */
const TILE_COUNT = 150;

/**
 * A deterministic 0–1 value from a whole number.
 *
 * It has to be deterministic: the server and the browser both render this
 * component, and if the two disagree on a single opacity React throws a
 * hydration error. `Math.random()` would do exactly that — this will not.
 */
const noise = (i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * A wall of small photographs, repeated until they fill the whole block and
 * read as one large picture. It sits behind a title and is decorative only —
 * every tile is hidden from screen readers, because the pictures already appear
 * properly, with their captions, further down the page.
 *
 * The tiles are the small 640px copies, and the list repeats rather than
 * loading more files, so a wall of 150 tiles costs however many photographs you
 * actually have — the rest are cache hits.
 */
export default function PhotoMosaic({ photos = [] }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  /* A slow drift as the header scrolls away — one transform on one element,
     which the compositor handles on its own. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const drift = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  const tiles = useMemo(
    () =>
      photos.length
        ? Array.from({ length: TILE_COUNT }, (_, i) => photos[i % photos.length])
        : [],
    [photos]
  );

  if (!tiles.length) return null;

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-x-0 -top-[8%] h-[118%] grid gap-[2px]"
        style={{
          y: reduce ? 0 : drift,
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(46px, 5.2vw, 84px), 1fr))",
          gridAutoRows: "clamp(46px, 5.2vw, 84px)",
        }}
      >
        {tiles.map((src, i) => (
          <motion.span
            key={i}
            className="relative block overflow-hidden bg-navy-deep"
            initial={reduce ? false : { opacity: 0, scale: 1.14 }}
            animate={{ opacity: 0.5 + noise(i) * 0.5, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: EASE,
              /* a wave across the wall rather than 150 things at once */
              delay: Math.min(i * 0.011, 1.2),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbOf(src)}
              onError={(e) => (e.currentTarget.src = src)}
              alt=""
              loading={i < 40 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </motion.span>
        ))}
      </motion.div>

      {/* Two washes over the top. The flat one keeps the whole wall a shade
          quieter than the words; the second pools darkness at the bottom,
          exactly where the title and the opening lines sit, so the text has
          real contrast underneath it rather than whatever a photograph
          happened to put there. */}
      <div className="pointer-events-none absolute inset-0 bg-navy/45" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/92 via-navy-deep/45 to-navy-deep/25" />
    </div>
  );
}
