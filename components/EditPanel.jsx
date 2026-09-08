"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSite } from "./SiteProvider";
import { IMAGE_SLOTS, IMAGE_GROUPS, DEFAULT_IMAGES } from "@/lib/images";

/* Shrink an uploaded image before storing it, so browser storage doesn't fill up */
async function downscale(file, maxSide = 1800, quality = 0.82) {
  const dataUrl = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
  if (file.type === "image/svg+xml") return dataUrl;

  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });

  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  if (scale === 1 && dataUrl.length < 900_000) return dataUrl;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

function download(filename, content, type = "text/plain") {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function dataUrlToBlob(dataUrl) {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] || "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export default function EditPanel() {
  const {
    images,
    updateImage,
    resetImage,
    resetAll,
    editMode,
    setEditMode,
    unlocked,
    activeSlot,
    setActiveSlot,
    toast,
    setToast,
  } = useSite();

  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const current = activeSlot || IMAGE_SLOTS[0].key;
  const cfg = images[current] || DEFAULT_IMAGES[current];
  const meta = useMemo(() => IMAGE_SLOTS.find((s) => s.key === current), [current]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast, setToast]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await downscale(file);
      updateImage(current, { src: dataUrl, x: 50, y: 50, zoom: 1 });
    } catch (err) {
      setToast({ type: "error", msg: "Couldn't read that image. Try a JPG or PNG." });
    } finally {
      setBusy(false);
    }
  }

  function exportConfig() {
    const rows = IMAGE_SLOTS.map((s) => {
      const c = images[s.key];
      const src = c.src?.startsWith("data:") ? `/images/${s.key}.jpg` : c.src;
      return `  { key: "${s.key}", group: ${JSON.stringify(s.group)}, label: ${JSON.stringify(
        s.label
      )}, hint: ${JSON.stringify(s.hint)}, src: "${src}", x: ${c.x}, y: ${c.y}, zoom: ${c.zoom} },`;
    }).join("\n");

    download(
      "IMAGE_SLOTS.txt",
      `/* Paste over the slot arrays in lib/images.js — see the README */\nexport const IMAGE_SLOTS = [\n${rows}\n];\n`
    );
  }

  function downloadPhotos() {
    const uploaded = IMAGE_SLOTS.filter((s) => images[s.key]?.src?.startsWith("data:"));
    if (!uploaded.length) {
      setToast({ type: "info", msg: "You haven't uploaded any images here yet." });
      return;
    }
    uploaded.forEach((s, i) => {
      setTimeout(() => download(`${s.key}.jpg`, dataUrlToBlob(images[s.key].src)), i * 350);
    });
  }

  if (!unlocked) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setEditMode(!editMode)}
        aria-label="Toggle image editor"
        className="fixed bottom-5 right-5 z-[70] grid h-11 w-11 place-items-center rounded-full bg-navy text-white shadow-lg shadow-navy/25 transition hover:bg-azure focus:outline-none focus-visible:ring-4 focus-visible:ring-azure/30"
      >
        {editMode ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        )}
      </button>

      {toast && (
        <div
          className={`fixed bottom-24 right-5 z-[75] max-w-xs rounded-xl px-4 py-3 text-[13px] leading-snug text-white shadow-xl ${
            toast.type === "error" ? "bg-azure" : "bg-navy"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <aside
        className={`fixed right-0 top-0 z-[65] flex h-full w-[340px] max-w-[90vw] flex-col border-l border-navy-line bg-white shadow-2xl transition-transform duration-300 ${
          editMode ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!editMode}
      >
        <div className="border-b border-navy-line px-5 py-4">
          <p className="eyebrow text-azure">Image editor</p>
          <h2 className="mt-1 font-display text-[19px] text-navy">Your photographs</h2>
          <p className="mt-1 text-[12px] leading-snug text-navy-soft">
            Pick a slot below — or click any image on the page — then upload and drag to frame it.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-5 space-y-4">
            {IMAGE_GROUPS.map((group) => (
              <div key={group.name}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-soft">
                  {group.name}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {group.slots.map((s) => {
                    const c = images[s.key];
                    const active = s.key === current;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setActiveSlot(s.key)}
                        title={s.label}
                        className={`relative aspect-[4/3] overflow-hidden rounded-[3px] border transition ${
                          active
                            ? "border-azure ring-1 ring-azure"
                            : "border-navy-line hover:border-navy/40"
                        }`}
                      >
                        {c?.src ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={c.src} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="block h-full w-full bg-paper-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[4px] border border-navy-line bg-paper-100 p-4">
            <p className="eyebrow text-navy-soft">Editing</p>
            <p className="mt-1 font-display text-[16px] text-navy">{meta ? meta.label : current}</p>
            {meta?.hint && <p className="mt-1 text-[12px] leading-snug text-navy-soft">{meta.hint}</p>}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="mt-3 w-full rounded-[3px] bg-navy px-4 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-azure disabled:opacity-60"
            >
              {busy ? "Processing…" : "Choose an image"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

            <div className="mt-4 space-y-3">
              <Slider label="Horizontal" value={cfg.x} min={0} max={100} suffix="%" onChange={(v) => updateImage(current, { x: v })} />
              <Slider label="Vertical" value={cfg.y} min={0} max={100} suffix="%" onChange={(v) => updateImage(current, { y: v })} />
              <Slider label="Zoom" value={Math.round(cfg.zoom * 100)} min={100} max={260} suffix="%" onChange={(v) => updateImage(current, { zoom: v / 100 })} />
            </div>

            <button
              type="button"
              onClick={() => resetImage(current)}
              className="mt-4 w-full rounded-[3px] border border-navy/20 px-4 py-2 text-[12px] font-semibold text-navy-soft transition hover:border-azure hover:text-azure"
            >
              Reset this slot
            </button>
          </div>

          <div className="mt-4 rounded-[4px] border border-dashed border-navy/25 p-4">
            <p className="eyebrow text-navy-soft">Make it permanent</p>
            <p className="mt-1 text-[12px] leading-snug text-navy-soft">
              Uploads here live only in your browser. To publish them for everyone, download both and commit.
            </p>
            <button
              type="button"
              onClick={downloadPhotos}
              className="mt-3 w-full rounded-[3px] bg-navy px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-azure"
            >
              1. Download the photos
            </button>
            <button
              type="button"
              onClick={exportConfig}
              className="mt-2 w-full rounded-[3px] border border-navy/20 px-4 py-2 text-[12px] font-semibold text-navy transition hover:border-azure hover:text-azure"
            >
              2. Download the config
            </button>
            <p className="mt-2 text-[11px] leading-snug text-navy-soft">
              Put the images in <code className="rounded bg-navy/10 px-1">public/images/</code>, paste the
              config into <code className="rounded bg-navy/10 px-1">lib/images.js</code>, push.
            </p>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="mt-4 w-full px-4 py-2 text-[12px] font-semibold text-navy-soft underline underline-offset-4 transition hover:text-azure"
          >
            Clear every local change
          </button>
        </div>

        <div className="border-t border-navy-line px-5 py-3 text-[11px] text-navy-soft">
          <kbd className="rounded bg-navy/10 px-1">Ctrl/⌘</kbd> +{" "}
          <kbd className="rounded bg-navy/10 px-1">E</kbd> toggles ·{" "}
          <kbd className="rounded bg-navy/10 px-1">Esc</kbd> closes
        </div>
      </aside>
    </>
  );
}

function Slider({ label, value, min, max, onChange, suffix = "" }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[12px] font-semibold text-navy-soft">
        {label}
        <span className="tabular-nums text-navy">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
      />
    </label>
  );
}
