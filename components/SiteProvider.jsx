"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_IMAGES, STORAGE_KEY, UNLOCK_KEY } from "@/lib/images";
import { ui as defaultUi } from "@/lib/content";

const SiteContext = createContext(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}

export default function SiteProvider({ children, serverImages, serverUi }) {
  const base = serverImages || DEFAULT_IMAGES;
  /** Every heading and button label, as saved in /admin → Text. */
  const ui = serverUi || defaultUi;
  const [images, setImages] = useState(base);
  const [ready, setReady] = useState(false);

  const [unlocked, setUnlocked] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setImages((prev) => {
          const next = { ...prev };
          Object.keys(saved || {}).forEach((k) => {
            if (next[k]) next[k] = { ...next[k], ...saved[k] };
          });
          return next;
        });
      }
    } catch (_) {}

    try {
      const params = new URLSearchParams(window.location.search);
      const saved = window.localStorage.getItem(UNLOCK_KEY) === "1";
      if (params.has("edit")) {
        window.localStorage.setItem(UNLOCK_KEY, "1");
        setUnlocked(true);
      } else if (saved) {
        setUnlocked(true);
      }
    } catch (_) {}

    setReady(true);
  }, []);

  /* Ctrl / ⌘ + E toggles the image editor */
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "e" || e.key === "E")) {
        e.preventDefault();
        try {
          window.localStorage.setItem(UNLOCK_KEY, "1");
        } catch (_) {}
        setUnlocked(true);
        setEditMode((v) => !v);
      }
      if (e.key === "Escape") setEditMode(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const persist = useCallback((next) => {
    try {
      const diff = {};
      Object.keys(next).forEach((k) => {
        const d = base[k] || {};
        const cur = next[k];
        const entry = {};
        ["src", "x", "y", "zoom"].forEach((f) => {
          if (cur[f] !== d[f]) entry[f] = cur[f];
        });
        if (Object.keys(entry).length) diff[k] = entry;
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(diff));
      return true;
    } catch (err) {
      return false;
    }
  }, [base]);

  const updateImage = useCallback(
    (key, patch) => {
      setImages((prev) => {
        const next = { ...prev, [key]: { ...prev[key], ...patch } };
        if (!persist(next)) {
          setToast({
            type: "error",
            msg: "Browser storage is full. Use “Download the photos” and move them into public/images/.",
          });
        }
        return next;
      });
    },
    [persist]
  );

  const resetImage = useCallback(
    (key) => {
      setImages((prev) => {
        const next = { ...prev, [key]: { ...base[key] } };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetAll = useCallback(() => {
    setImages({ ...base });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }, [base]);

  const value = useMemo(
    () => ({
      images,
      ui,
      updateImage,
      resetImage,
      resetAll,
      ready,
      unlocked,
      setUnlocked,
      editMode,
      setEditMode,
      activeSlot,
      setActiveSlot,
      toast,
      setToast,
    }),
    [
      images,
      ui,
      updateImage,
      resetImage,
      resetAll,
      ready,
      unlocked,
      editMode,
      activeSlot,
      toast,
    ]
  );

  return (
    <SiteContext.Provider value={value}>
      <div className={editMode ? "edit-on" : undefined}>{children}</div>
    </SiteContext.Provider>
  );
}
