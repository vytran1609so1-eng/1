"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Con trỏ tuỳ biến: một chấm nhỏ đi đúng theo chuột và một vòng tròn bám theo
 * có độ trễ mềm. Khi đi qua ảnh, vòng đổi thành một huy hiệu có chữ.
 * Chỉ bật trên thiết bị có chuột thật và khi người dùng không tắt chuyển động.
 *
 * Cách dựng — quan trọng cho tốc độ:
 *  · Vị trí được ghi thẳng vào `style.transform` trong MỘT vòng requestAnimationFrame,
 *    không đi qua state của React, nên di chuột không làm component render lại lần nào.
 *  · Chấm và vòng vẫn dùng `mix-blend-difference` để đọc được trên cả nền sáng lẫn nền
 *    tối, nhưng chúng nhỏ nên vùng phải trộn màu cũng nhỏ.
 */
export default function Cursor({ enabled: wanted = true }) {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const badgeRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!wanted || pathname?.startsWith("/admin")) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    /* Target position (the real mouse) and the ring's trailing position. */
    let tx = -200;
    let ty = -200;
    let rx = -200;
    let ry = -200;
    let visible = false;
    let variant = "default"; // default | link | media
    let raf = 0;

    /* The loop sleeps when nothing is moving and wakes on the next pointer
       event, so an idle page costs nothing at all. */
    let running = true;

    const apply = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      const badge = badgeRef.current;
      if (!dot || !ring || !badge) {
        // refs attach one render after `enabled` flips — keep waiting
        raf = requestAnimationFrame(apply);
        return;
      }

      // ease the ring toward the cursor — a light trail, no spring library
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;

      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      badge.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;

      const media = variant === "media";
      const size = variant === "link" ? 44 : 26;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.opacity = visible && !media ? "1" : "0";
      dot.style.opacity = visible && !media ? "1" : "0";
      badge.style.opacity = visible && media ? "1" : "0";
      badge.style.width = media ? "78px" : "0px";
      badge.style.height = media ? "78px" : "0px";

      if (Math.abs(tx - rx) < 0.2 && Math.abs(ty - ry) < 0.2) {
        running = false; // caught up — stop until the mouse moves again
        return;
      }
      raf = requestAnimationFrame(apply);
    };
    raf = requestAnimationFrame(apply);

    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(apply);
    };

    function onMove(e) {
      tx = e.clientX;
      ty = e.clientY;
      visible = true;
      wake();
    }

    function onOver(e) {
      const el = e.target.closest?.("a, button, [data-cursor]");
      if (!el) {
        variant = "default";
        if (labelRef.current) labelRef.current.textContent = "";
        wake();
        return;
      }
      wake();
      const custom = el.getAttribute("data-cursor");
      if (custom !== null) {
        variant = "media";
        if (labelRef.current)
          labelRef.current.textContent = custom === "" || custom === "true" ? "" : custom;
      } else {
        variant = "link";
        if (labelRef.current) labelRef.current.textContent = "";
      }
    }

    const onOut = (e) => {
      if (!e.relatedTarget) {
        visible = false;
        wake();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, [pathname, wanted]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      {/* Vòng tròn bám theo, có độ trễ */}
      <div
        ref={ringRef}
        className="absolute left-0 top-0 rounded-full border border-white opacity-0 mix-blend-difference"
        style={{ width: 26, height: 26, transition: "width .18s, height .18s, opacity .18s" }}
      />
      {/* Huy hiệu khi đi qua ảnh */}
      <div
        ref={badgeRef}
        className="absolute left-0 top-0 grid place-items-center overflow-hidden rounded-full bg-navy opacity-0"
        style={{ width: 0, height: 0, transition: "width .18s, height .18s, opacity .18s" }}
      >
        <span
          ref={labelRef}
          className="select-none whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.18em] text-white"
        />
      </div>
      {/* Chấm đi đúng theo chuột */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-white opacity-0 mix-blend-difference"
        style={{ transition: "opacity .18s" }}
      />
    </div>
  );
}
