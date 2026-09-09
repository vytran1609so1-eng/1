"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EntryModal from "./EntryModal";
import { EntryCard } from "./EntryList";
import Footer from "./Footer";
import { Reveal, Words, Orbs, CountUp } from "./Motion";
import { useSite } from "./SiteProvider";

const EASE = [0.22, 1, 0.36, 1];

/** The complete record: everything published, newest first, grouped by year. */
export default function ArchiveScreen({ settings, entries }) {
  const { ui } = useSite();
  const [open, setOpen] = useState(null);
  const labelOf = (id) => settings.categories.find((c) => c.id === id)?.label ?? id;

  const years = useMemo(() => {
    const map = new Map();
    entries.forEach((e) => {
      const y = (e.sortDate || "").slice(0, 4) || "—";
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(e);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [entries]);

  return (
    <main className="pt-16">
      <section className="relative overflow-hidden bg-paper pb-12 pt-16 md:pb-16 md:pt-24">
        <Orbs />
        <div className="wrap relative">
          <Reveal>
            <p className="eyebrow text-azure">{ui.archive.eyebrow}</p>
          </Reveal>
          <Words
            as="h1"
            text={ui.archive.title}
            className="display-italic mt-5 block text-[clamp(3rem,13vw,7rem)] text-navy"
            stagger={0.06}
          />
          <Reveal delay={120}>
            <p className="mt-7 max-w-2xl text-[15.5px] leading-[1.85] text-navy-soft md:text-[16.5px]">
              {ui.archive.lead}
            </p>
            <p className="mt-8 display text-[34px] leading-none text-azure md:text-[44px]">
              <CountUp value={String(entries.length)} />
              <span className="ml-3 font-sans text-[12px] uppercase tracking-[0.18em] text-navy-soft">
                {ui.archive.count}
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper pb-20 pt-6 md:pb-28">
        <div className="wrap">
          {years.map(([year, list], gi) => (
            <div key={year} className={gi > 0 ? "mt-16 md:mt-20" : ""}>
              <div className="flex items-baseline justify-between border-b-2 border-navy pb-4">
                <h2 className="display text-[30px] text-navy md:text-[40px]">{year}</h2>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-soft">
                  {list.length} {ui.archive.count}
                </p>
              </div>
              <div className="mt-6 border-t border-navy-line">
                <AnimatePresence mode="popLayout">
                  {list.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 6) * 0.04 }}
                    >
                      <EntryCard
                        entry={entry}
                        categoryLabel={labelOf(entry.category)}
                        badge={entry.inPortfolio !== false ? ui.archive.onPortfolio : null}
                        onOpen={() => setOpen(entry)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </section>

      <EntryModal
        entry={open}
        categoryLabel={open ? labelOf(open.category) : ""}
        onClose={() => setOpen(null)}
      />

      <Footer settings={settings} />
    </main>
  );
}
