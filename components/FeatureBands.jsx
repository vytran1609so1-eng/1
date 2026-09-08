"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Full-width photographs placed between the sections of a page — the magazine
 * spread between two columns of text. You add them in /admin → Images →
 * "Photo bands", as many as you like; they appear here in order.
 *
 * Every band is lazy: the browser only fetches a picture as the reader
 * approaches it, so a page with a dozen of them costs no more to open than a
 * page with one.
 */
export default function FeatureBands({ bands = [], page }) {
  const list = bands.filter((b) => b?.src && (b.page || "home") === page);
  if (!list.length) return null;

  return (
    <section className="space-y-16 bg-paper py-16 md:space-y-24 md:py-24">
      {list.map((band, i) => (
        <Band key={band.id || i} band={band} index={i} />
      ))}
    </section>
  );
}

function Band({ band, index }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // a slow drift inside the frame — the picture is taller than its window
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const tall = band.size === "tall";
  const full = band.width !== "inset";

  return (
    <figure ref={ref} className={full ? "" : "wrap"}>
      <div
        className={`relative overflow-hidden bg-paper-300 ${
          tall ? "h-[72vh] min-h-[420px]" : "h-[48vh] min-h-[280px] md:h-[56vh]"
        } ${full ? "" : "rounded-[4px]"}`}
      >
        <motion.div className="absolute inset-x-0 -top-[6%] -bottom-[6%]" style={reduce ? undefined : { y }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={band.src}
            alt={band.caption || ""}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            style={{
              objectPosition: `${band.x ?? 50}% ${band.y ?? 50}%`,
              transform: `scale(${band.zoom ?? 1})`,
              transformOrigin: `${band.x ?? 50}% ${band.y ?? 50}%`,
            }}
          />
        </motion.div>
      </div>

      {band.caption && (
        <motion.figcaption
          className={`mt-3 text-[12px] uppercase tracking-[0.16em] text-navy-soft ${
            full ? "wrap" : ""
          }`}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 * index }}
        >
          {band.caption}
        </motion.figcaption>
      )}
    </figure>
  );
}
