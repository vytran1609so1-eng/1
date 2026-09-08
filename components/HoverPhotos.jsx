"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { useSite } from "./SiteProvider";
import { isPlaceholder, thumbOf } from "@/lib/images";

/**
 * Wraps an entry. On a mouse, hovering it makes the photographs fly out and
 * trail the cursor, each one a beat behind the last. On touch devices it shows
 * a small button that opens a thumbnail strip instead.
 *
 *   photos — image slot keys from lib/images.js (seed entries)
 *   urls   — plain image URLs (entries added through /admin)
 */
export default function HoverPhotos({
  photos = [],
  urls = [],
  children,
  className = "",
  label = "Photos",
}) {
  const { images } = useSite();
  const reduce = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const [fine, setFine] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const x = useMotionValue(-500);
  const y = useMotionValue(-500);

  useEffect(() => {
    setFine(
      window.matchMedia("(pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  /**
   * Only real photographs count. A slot still showing a shipped placeholder is
   * treated as empty, so an activity you have no pictures for behaves like
   * ordinary text: nothing flies out, and no "Photos" button appears.
   */
  const list = [
    ...photos.map((k) => ({ key: k, cfg: images[k] })),
    ...urls.map((u, i) => ({ key: `url-${i}`, cfg: { src: u, x: 50, y: 50, zoom: 1 } })),
  ].filter((p) => p.cfg && !isPlaceholder(p.cfg.src));

  const active = fine && !reduce && list.length > 0;

  function onMove(e) {
    x.set(e.clientX);
    y.set(e.clientY);
  }

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      onPointerEnter={active ? () => setHovering(true) : undefined}
      onPointerMove={active ? onMove : undefined}
      onPointerLeave={active ? () => setHovering(false) : undefined}
    >
      {children}

      {/* Touch devices: a button that opens a thumbnail strip */}
      {list.length > 0 && (
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-4 inline-flex items-center gap-2 border border-current/25 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] opacity-70"
          >
            {label} ({list.length})
            <span className={`transition-transform ${open ? "rotate-45" : ""}`}>+</span>
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {list.map((p) => (
                    <div
                      key={p.key}
                      className="relative h-28 w-40 shrink-0 overflow-hidden bg-paper-300"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbOf(p.cfg.src)}
                        onError={(e) => (e.currentTarget.src = p.cfg.src)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{
                          objectPosition: `${p.cfg.x}% ${p.cfg.y}%`,
                          transform: `scale(${p.cfg.zoom})`,
                          transformOrigin: `${p.cfg.x}% ${p.cfg.y}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Desktop: the layer of photographs trailing the cursor */}
      {active && (
        <AnimatePresence>
          {hovering && (
            <div className="pointer-events-none fixed inset-0 z-40 hidden md:block">
              {list.map((p, i) => (
                <TrailingPhoto key={p.key} cfg={p.cfg} x={x} y={y} index={i} total={list.length} />
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

const SPRINGS = [
  { stiffness: 240, damping: 26, mass: 0.7 },
  { stiffness: 150, damping: 24, mass: 0.9 },
  { stiffness: 105, damping: 22, mass: 1.1 },
];

function TrailingPhoto({ cfg, x, y, index, total }) {
  const cfgSpring = SPRINGS[Math.min(index, SPRINGS.length - 1)];
  const sx = useSpring(x, cfgSpring);
  const sy = useSpring(y, cfgSpring);

  // fan them out slightly so the whole stack is visible
  const spread = total > 1 ? (index - (total - 1) / 2) * 46 : 0;
  const tilt = total > 1 ? (index - (total - 1) / 2) * 5 : -2.5;

  return (
    <motion.div className="absolute left-0 top-0" style={{ x: sx, y: sy }}>
      <motion.div
        className="relative overflow-hidden bg-paper-300 shadow-[0_20px_55px_-20px_rgba(22,54,95,0.45)] ring-1 ring-white/60"
        style={{ width: 260, height: 190 }}
        initial={{ opacity: 0, scale: 0.86, rotate: 0, x: "-50%", y: "-50%" }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: tilt,
          x: `calc(-50% + ${spread}px)`,
          y: "-50%",
        }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
          delay: index * 0.055,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbOf(cfg.src)}
          onError={(e) => (e.currentTarget.src = cfg.src)}
          alt=""
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: `${cfg.x}% ${cfg.y}%`,
            transform: `scale(${cfg.zoom})`,
            transformOrigin: `${cfg.x}% ${cfg.y}%`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
