"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useInView,
  useReducedMotion,
  wrap,
} from "framer-motion";

/**
 * The strip of numbers that scrolls sideways. Its speed reacts to how fast you
 * scroll the page, and it reverses when you scroll back up. Holds still when
 * the visitor has asked for reduced motion.
 */
export default function Marquee({ items = [], tone = "light" }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  /* No point animating a strip nobody can see — this loop used to run on every
     frame for the whole visit, wherever the reader happened to be. */
  const onScreen = useInView(wrapRef, { amount: 0 });

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 48, stiffness: 380 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 4], { clamp: false });
  const direction = useRef(1);

  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce || !onScreen) return;
    let moveBy = direction.current * -1.6 * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) direction.current = -1;
    else if (vf > 0) direction.current = 1;
    moveBy += direction.current * moveBy * vf;
    baseX.set(baseX.get() + moveBy);
  });

  const dark = tone === "dark";

  return (
    <div
      ref={wrapRef}
      className={`overflow-hidden border-y py-4 ${
        dark ? "border-white/15 bg-navy-deep" : "border-navy-line bg-paper-200"
      }`}
    >
      <motion.div className="flex w-max flex-nowrap" style={{ x }}>
        {[0, 1, 2, 3].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy > 0}>
            {items.map((label, i) => (
              <span key={i} className="flex items-center">
                <span
                  className={`whitespace-nowrap px-7 text-[10.5px] font-semibold uppercase tracking-[0.24em] md:text-[11px] ${
                    dark ? "text-white/70" : "text-navy-soft"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`h-1 w-1 shrink-0 rounded-full ${
                    dark ? "bg-azure-light" : "bg-azure/60"
                  }`}
                />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
