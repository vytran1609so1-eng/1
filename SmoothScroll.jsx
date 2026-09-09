"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Cuộn có quán tính (Lenis). Lenis vẫn cuộn bằng scroll thật của trình duyệt
 * nên IntersectionObserver và useScroll của Framer Motion vẫn hoạt động bình thường.
 * Tự tắt khi người dùng bật "giảm chuyển động" trong hệ điều hành.
 */
export default function SmoothScroll({ enabled: wanted = true }) {
  const pathname = usePathname();
  /* The editing screens are work, not a showcase: there the wheel should move
     the page immediately. Smooth scroll is for the public pages, and can be
     switched off entirely in /admin → Text. */
  const enabled = wanted && !pathname?.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    /**
     * `lerp` follows the wheel closely — the page keeps a little glide without
     * feeling like it is catching up with you. A longer easing (the old
     * duration: 1.05) reads as a slow, heavy page on an ordinary laptop.
     */
    const lenis = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 1.1,
      smoothWheel: true,
      syncTouch: false, // để cuộn trên điện thoại giữ cảm giác gốc
    });

    window.__lenis = lenis;

    let frame;
    function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    // Cho các link neo (#excellence) chạy qua Lenis
    function onClick(e) {
      const a = e.target.closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -70 });
    }
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, [enabled]);

  return null;
}
