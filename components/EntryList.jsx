"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhotoDeck from "./PhotoDeck";
import Lightbox from "./Lightbox";
import EntryModal from "./EntryModal";
import { CountUp } from "./Motion";
import { useSite } from "./SiteProvider";
import { entryPhotos } from "@/lib/images";

const EASE = [0.22, 1, 0.36, 1];

/**
 * A list of activities with the pop-up wired up.
 *
 *   groups — [{ id, label, blurb?, stats?, entries: [] }]
 *            Pass a single group with no label for a flat list.
 */
export default function EntryList({ groups, showCategoryOnCard = true, categories = [] }) {
  const { ui } = useSite();
  const [open, setOpen] = useState(null);
  const labelOf = (id) => categories.find((c) => c.id === id)?.label ?? id;

  return (
    <>
      {groups.map((group, gi) => (
        <section key={group.id ?? gi} className={gi > 0 ? "mt-16 md:mt-24" : ""}>
          {group.label && (
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b-2 border-navy pb-4">
              <h2 className="display text-[26px] text-navy md:text-[34px]">{group.label}</h2>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-soft">
                {group.entries.length} {ui.portfolio.entryCount}
              </p>
            </div>
          )}

          {group.blurb && (
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-navy-soft">
              {group.blurb}
            </p>
          )}

          {group.stats?.length > 0 && (
            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4">
              {group.stats.map((s, i) => (
                <div key={i}>
                  <p className="display text-[28px] leading-none text-azure md:text-[36px]">
                    <CountUp value={s.value} />
                  </p>
                  <p className="mt-2 text-[11.5px] leading-snug text-navy-soft">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {group.entries.length === 0 ? (
            <p className="mt-8 display-italic text-[18px] text-navy-soft">
              {ui.portfolio.emptyCategory}
            </p>
          ) : (
            <div className={`mt-8 border-t border-navy-line ${group.stats?.length ? "md:mt-10" : ""}`}>
              <AnimatePresence mode="popLayout">
                {group.entries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
                  >
                    <EntryCard
                      entry={entry}
                      categoryLabel={showCategoryOnCard ? labelOf(entry.category) : null}
                      onOpen={() => setOpen(entry)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      ))}

      <EntryModal
        entry={open}
        categoryLabel={open ? labelOf(open.category) : ""}
        onClose={() => setOpen(null)}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  One row                                                                    */
/* -------------------------------------------------------------------------- */
export function EntryCard({ entry, categoryLabel, onOpen, badge }) {
  const { ui, images } = useSite();
  const photos = entryPhotos(entry, images);

  /* Which photograph is open full size, or null. */
  const [zoom, setZoom] = useState(null);

  return (
    <div className="group border-b border-navy-line transition-colors duration-300 hover:bg-paper-200/70">
      <div className="flex items-center gap-5 px-1 py-8 md:gap-10 md:px-4 md:py-10">
        {/* the words — the whole block opens the activity */}
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {categoryLabel && (
              <>
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-azure">
                  {categoryLabel}
                </span>
                <span className="h-px w-5 bg-navy-line" />
              </>
            )}
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-navy-soft">
              {entry.period}
            </span>
            {badge && (
              <span className="rounded-full bg-paper-300 px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-navy-soft">
                {badge}
              </span>
            )}
          </div>

          <motion.h3
            className="mt-3.5 font-display text-[22px] leading-[1.15] text-navy md:text-[30px]"
            whileHover={{ x: 8 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {entry.title}
          </motion.h3>

          {entry.role && (
            <p className="display-italic mt-2 text-[16px] leading-snug text-navy-soft md:text-[18px]">
              {entry.role}
            </p>
          )}

          {entry.summary && (
            <p className="mt-4 max-w-2xl text-[14.5px] leading-[1.75] text-navy-soft">
              {entry.summary}
            </p>
          )}

          <span className="mt-6 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-navy-soft transition-colors group-hover:text-azure">
            {ui.portfolio.openLabel}
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
        </button>

        {/* the pile of photographs, only for activities that have any */}
        <PhotoDeck photos={photos} label={entry.title} onOpen={(i) => setZoom(i)} />
      </div>

      <Lightbox
        images={photos}
        index={zoom}
        onClose={() => setZoom(null)}
        onIndex={(next) => setZoom(next)}
      />
    </div>
  );
}
