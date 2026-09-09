"use client";

import { useRef, useState } from "react";
import { useSite } from "./SiteProvider";
import { IMAGE_SLOTS } from "@/lib/images";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export default function EditableImage({
  slot,
  alt = "",
  className = "",
  imgClassName = "",
  overlay = null,
  eager = false,
}) {
  const { images, updateImage, editMode, setActiveSlot } = useSite();
  const cfg = images[slot] || { src: "", x: 50, y: 50, zoom: 1 };
  const meta = IMAGE_SLOTS.find((s) => s.key === slot);
  const boxRef = useRef(null);
  const drag = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [failed, setFailed] = useState(false);

  function onPointerDown(e) {
    if (!editMode) return;
    e.preventDefault();
    const rect = boxRef.current.getBoundingClientRect();
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      x: cfg.x,
      y: cfg.y,
      w: rect.width,
      h: rect.height,
      moved: false,
    };
    setDragging(true);
    setActiveSlot(slot);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!drag.current) return;
    const d = drag.current;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) d.moved = true;
    // Kéo sang phải => ảnh dịch phải => object-position x giảm
    const nx = clamp(d.x - (dx / d.w) * 100, 0, 100);
    const ny = clamp(d.y - (dy / d.h) * 100, 0, 100);
    updateImage(slot, { x: Math.round(nx), y: Math.round(ny) });
  }

  function endDrag(e) {
    if (!drag.current) return;
    const moved = drag.current.moved;
    drag.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch (_) {}
    if (!moved) setActiveSlot(slot);
  }

  const showPlaceholder = failed || !cfg.src;

  return (
    <div
      ref={boxRef}
      data-image-slot={slot}
      className={`relative overflow-hidden bg-paper-300 ${
        dragging ? "is-dragging" : ""
      } ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={editMode ? { touchAction: "none" } : undefined}
    >
      {showPlaceholder ? (
        <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(140deg,#EAF2FD_0%,#D2E4F8_55%,#B9D5F3_100%)]">
          <div className="px-4 text-center">
            <div className="mx-auto mb-2.5 h-7 w-7 rounded-full border border-navy/25" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/50">
              {meta ? meta.label : slot}
            </p>
          </div>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={cfg.src}
          alt={alt}
          draggable={false}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full select-none object-cover ${imgClassName}`}
          style={{
            objectPosition: `${cfg.x}% ${cfg.y}%`,
            transform: `scale(${cfg.zoom})`,
            transformOrigin: `${cfg.x}% ${cfg.y}%`,
          }}
        />
      )}

      {overlay}

      {editMode && (
        <span className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-navy/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          {meta ? meta.label : slot} · {cfg.x}/{cfg.y} · {cfg.zoom.toFixed(2)}×
        </span>
      )}
    </div>
  );
}
