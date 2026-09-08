"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal, Words, Magnetic } from "./Motion";
import { guestbook, defaultSettings } from "@/lib/content";

const profile = defaultSettings.profile;

const TONES = [
  "bg-white",
  "bg-paper-200",
  "bg-white",
  "bg-paper-300",
  "bg-paper-200",
  "bg-paper-100",
];
const TILTS = [-1.4, 0.9, -0.6, 1.6, -1.1, 0.5];

export default function GuestbookPage() {
  const g = guestbook;

  const [entries, setEntries] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | unconfigured | error

  useEffect(() => {
    let alive = true;
    fetch("/api/guestbook")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.configured === false) setState("unconfigured");
        else {
          setEntries(d.entries || []);
          setState("ready");
        }
      })
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      {/* ---------- Header ---------- */}
      <header className="border-b border-navy-line">
        <div className="wrap flex h-14 items-center justify-between md:h-16">
          <Link
            href="/"
            className="link-underline text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-soft"
          >
            ← {g.back}
          </Link>
          <span className="signature text-[26px] leading-none text-navy">
            Tran Thi Thuy Vy
          </span>
        </div>
      </header>

      <section className="wrap pb-16 pt-20 md:pb-20 md:pt-28">
        <Reveal>
          <p className="eyebrow text-azure">{g.eyebrow}</p>
        </Reveal>
        <Words
          as="h1"
          text={g.headline}
          className="display mt-5 block break-words text-[clamp(2.1rem,9vw,4.8rem)] leading-[0.94] text-navy"
          stagger={0.05}
        />
        <Reveal delay={120}>
          <p className="mt-7 max-w-2xl text-[15px] leading-[1.85] text-navy-soft md:text-[16px]">
            {g.lead}
          </p>
        </Reveal>
      </section>

      {/* ---------- Form ---------- */}
      <section className="border-y border-navy-line bg-paper-200">
        <div className="wrap py-14 md:py-20">
          <GuestbookForm
            disabled={state === "unconfigured"}
            onSent={() => {}}
          />
        </div>
      </section>

      {/* ---------- The wall of notes ---------- */}
      <section className="wrap py-16 md:py-24">
        {state === "loading" && (
          <p className="text-[14px] text-navy-soft">…</p>
        )}

        {state === "unconfigured" && (
          <div className="border border-dashed border-navy/25 p-6 text-[14px] leading-relaxed text-navy-soft">
            {g.wall.notConfigured}
          </div>
        )}

        {state === "error" && (
          <p className="text-[14px] text-navy-soft">{g.form.errorGeneric}</p>
        )}

        {state === "ready" && entries.length === 0 && (
          <p className="display-italic text-[17px] text-navy-soft">
            {g.wall.empty}
          </p>
        )}

        {state === "ready" && entries.length > 0 && (
          <>
            <Reveal>
              <p className="eyebrow mb-8 text-azure">
                {entries.length} {g.wall.count}
              </p>
            </Reveal>
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {entries.map((e, i) => (
                <motion.article
                  key={e.id}
                  className={`mb-6 inline-block w-full break-inside-avoid p-6 ring-1 ring-navy/10 ${
                    TONES[i % TONES.length]
                  }`}
                  initial={{ opacity: 0, y: 22, rotate: TILTS[i % TILTS.length] }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover={{ rotate: 0, y: -5 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (i % 6) * 0.05 }}
                >
                  <p className="whitespace-pre-line text-[14.5px] leading-[1.75] text-navy">
                    {e.message}
                  </p>
                  <div className="mt-5 border-t border-navy/10 pt-3.5">
                    <p className="display-italic text-[15px] text-azure">{e.name}</p>
                    {e.relation && (
                      <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-navy-soft">
                        {e.relation}
                      </p>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="border-t border-navy-line">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-7 text-[10.5px] uppercase tracking-[0.2em] text-navy-soft">
          <span>© {new Date().getFullYear()} · Tran Thi Thuy Vy</span>
          <a href={`mailto:${profile.email}`} className="link-underline text-azure">
            {profile.email}
          </a>
        </div>
      </footer>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  The form                                                                   */
/* -------------------------------------------------------------------------- */
function GuestbookForm({ disabled }) {
  const f = guestbook.form;
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (disabled) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: (fd.get("name") || "").toString().trim(),
      relation: (fd.get("relation") || "").toString().trim(),
      message: (fd.get("message") || "").toString().trim(),
      website: (fd.get("website") || "").toString(),
    };
    if (!payload.name || !payload.message) {
      setError(f.errorRequired);
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(
          data.reason === "too_long" ? f.errorTooLong : f.errorGeneric
        );
        setStatus("error");
        return;
      }
      e.target.reset();
      setStatus("sent");
    } catch (_) {
      setError(f.errorGeneric);
      setStatus("error");
    }
  }

  return (
    <AnimatePresence mode="wait">
      {status === "sent" ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-xl text-center"
        >
          <p className="display text-[clamp(1.5rem,4vw,2.2rem)] normal-case text-navy">
            {f.successTitle}
          </p>
          <p className="mt-3 text-[14.5px] leading-relaxed text-navy-soft">
            {f.successBody}
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="link-underline mt-6 text-[11.5px] font-bold uppercase tracking-[0.18em] text-azure"
          >
            {f.another}
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={onSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2"
        >
          <Field
            label={f.name}
            name="name"
            placeholder={f.namePlaceholder}
            maxLength={60}
            required
            disabled={disabled}
          />
          <Field
            label={f.relation}
            name="relation"
            placeholder={f.relationPlaceholder}
            maxLength={80}
            disabled={disabled}
          />

          <label className="md:col-span-2">
            <span className="eyebrow text-navy-soft">{f.message}</span>
            <textarea
              name="message"
              rows={5}
              maxLength={900}
              required
              disabled={disabled}
              placeholder={f.messagePlaceholder}
              className="mt-2.5 w-full resize-y border-b border-navy/25 bg-transparent pb-2 text-[15px] leading-relaxed text-navy outline-none transition-colors placeholder:text-navy-soft/50 focus:border-azure disabled:opacity-50"
            />
          </label>

          {/* bẫy bot — người thật không nhìn thấy trường này */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute h-0 w-0 opacity-0"
          />

          <div className="md:col-span-2 md:flex md:items-center md:justify-between md:gap-6">
            <p className="order-2 mt-4 text-[12px] leading-snug text-navy-soft md:mt-0">
              {status === "error" ? (
                <span className="text-azure">{error}</span>
              ) : (
                guestbook.form.successBody
              )}
            </p>
            <Magnetic className="order-1">
              <button
                type="submit"
                disabled={disabled || status === "sending"}
                className="border border-navy px-9 py-3.5 font-display text-[11.5px] font-bold uppercase tracking-[0.2em] text-navy transition-colors duration-300 hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "sending" ? f.sending : f.submit}
              </button>
            </Magnetic>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="eyebrow text-navy-soft">{label}</span>
      <input
        {...props}
        className="mt-2.5 w-full border-b border-navy/25 bg-transparent pb-2 text-[15px] text-navy outline-none transition-colors placeholder:text-navy-soft/50 focus:border-azure disabled:opacity-50"
      />
    </label>
  );
}
