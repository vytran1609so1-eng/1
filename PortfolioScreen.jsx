"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import EditableImage from "./EditableImage";
import EntryList from "./EntryList";
import FeatureBands from "./FeatureBands";
import Footer from "./Footer";
import { Reveal, Words, Orbs, MaskImage } from "./Motion";
import { orderedCategories, unassignedCategories } from "@/lib/settings";
import { useSite } from "./SiteProvider";

const EASE = [0.22, 1, 0.36, 1];

export default function PortfolioScreen({ settings, entries }) {
  const { ui } = useSite();
  const [filter, setFilter] = useState("all");

  const cats = useMemo(() => orderedCategories(settings), [settings]);
  const unassigned = useMemo(() => unassignedCategories(settings), [settings]);
  const unassignedIds = new Set(unassigned.map((c) => c.id));

  /* Only the entries you chose to put on the portfolio */
  const shown = useMemo(() => entries.filter((e) => e.inPortfolio !== false), [entries]);

  const byCategory = (id) => shown.filter((e) => e.category === id);

  const groups = useMemo(() => {
    if (filter === "all") {
      return cats.map((c) => ({
        id: c.id,
        label: c.label,
        blurb: c.blurb,
        stats: c.stats,
        entries: byCategory(c.id),
      }));
    }
    const c = cats.find((x) => x.id === filter);
    if (!c) return [];
    return [{ id: c.id, label: c.label, blurb: c.blurb, stats: c.stats, entries: byCategory(c.id) }];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, cats, shown]);

  return (
    <main className="pt-16">
      {/* ==================== HEADER ==================== */}
      <section className="relative overflow-hidden bg-paper pb-12 pt-16 md:pb-16 md:pt-24">
        <Orbs />
        <div className="wrap relative">
          <Reveal>
            <p className="eyebrow text-azure">{ui.portfolio.eyebrow}</p>
          </Reveal>
          <Words
            as="h1"
            text={ui.portfolio.title}
            className="display-italic mt-5 block text-[clamp(3rem,13vw,7rem)] text-navy"
            stagger={0.06}
          />
          <Reveal delay={120}>
            <p className="mt-7 max-w-2xl text-[15.5px] leading-[1.85] text-navy-soft md:text-[16.5px]">
              {ui.portfolio.lead}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="wrap">
        <MaskImage>
          <div data-cursor="">
            <EditableImage
              slot="portfolioCover"
              alt=""
              className="aspect-[21/8] w-full rounded-[4px] ring-1 ring-navy/10"
              imgClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04]"
            />
          </div>
        </MaskImage>
      </div>

      {/* ==================== KEYWORD SHORTCUTS ==================== */}
      <section className="wrap pt-14 md:pt-20">
        <Reveal>
          <p className="eyebrow text-navy-soft">{ui.portfolio.keywordStripLabel}</p>
        </Reveal>
        <div className="mt-6 grid gap-3 md:grid-cols-3 md:gap-5">
          {settings.keywords.map((k, i) => {
            const count = shown.filter((e) => {
              const cat = cats.find((c) => c.id === e.category);
              return cat?.keyword === k.id;
            }).length;
            return (
              <Reveal key={k.id} delay={i * 90}>
                <Link
                  href={`/portfolio/${k.id}`}
                  className="group flex h-full flex-col justify-between rounded-[5px] border border-navy-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-azure hover:shadow-[0_18px_40px_-24px_rgba(22,54,95,0.35)] md:p-7"
                >
                  <div>
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-azure">
                      0{i + 1}
                    </span>
                    <h3 className="display-italic mt-3 text-[28px] text-navy md:text-[32px]">
                      {k.word}
                    </h3>
                    <p className="mt-3 text-[13.5px] leading-[1.65] text-navy-soft">{k.line}</p>
                  </div>
                  <span className="mt-7 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-navy-soft transition-colors group-hover:text-azure">
                    {count} {ui.portfolio.entryCount}
                    <svg
                      width="18"
                      height="10"
                      viewBox="0 0 18 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover:translate-x-1.5"
                    >
                      <path d="M1 5h15M12 1l4 4-4 4" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============ PHOTOGRAPHS BETWEEN THE SECTIONS ============ */}
      <div className="mt-14 md:mt-20">
        <FeatureBands bands={settings.bands} page="portfolio" />
      </div>

      {/* ==================== FILTER ==================== */}
      <section className="sticky top-16 z-30 mt-14 border-y border-navy-line bg-white md:mt-20">
        <div className="wrap flex items-center gap-1 overflow-x-auto py-3">
          {[{ id: "all", label: ui.portfolio.allLabel }, ...cats].map((c) => {
            const active = filter === c.id;
            const count = c.id === "all" ? shown.length : byCategory(c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                className={`relative shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  active ? "text-white" : "text-navy-soft hover:text-azure"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full bg-navy"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">
                  {c.label}
                  <span className={active ? "text-white/50" : "text-navy-soft/50"}> {count}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================== ENTRIES ==================== */}
      <section className="bg-paper py-14 md:py-20">
        <div className="wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {filter === "all" && unassigned.length > 0 && (
                <p className="mb-10 max-w-2xl text-[13px] leading-relaxed text-navy-soft/80">
                  {ui.portfolio.unassignedLabel}:{" "}
                  {unassigned.map((c) => c.label).join(" · ")} — not filed under a keyword yet.
                </p>
              )}
              <EntryList groups={groups} categories={cats} showCategoryOnCard={false} />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
