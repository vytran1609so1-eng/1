"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Footer from "./Footer";
import Lightbox from "./Lightbox";
import PhotoMosaic from "./PhotoMosaic";
import { Reveal, Words, Orbs } from "./Motion";
import { asPhoto, isPlaceholder, thumbOf } from "@/lib/images";

const EASE = [0.22, 1, 0.36, 1];

/**
 * About me — a timeline running down the page, one milestone at a time.
 *
 * Each milestone is a year, a few lines, and its photographs. The year sits in
 * the left column and only appears when it changes, so a run of moments from
 * the same year reads as one chapter.
 */
export default function AboutScreen({ settings }) {
  const about = settings.about || {};
  const milestones = (about.milestones || []).filter(
    (m) => m && (m.title || m.text || (m.images || []).length)
  );

  /* Which picture is open full size, as [milestone index, image index]. */
  const [zoom, setZoom] = useState(null);
  const zoomPhotos = zoom ? (milestones[zoom[0]]?.images || []).map(asPhoto).filter((p) => p.src) : [];

  /**
   * Every real photograph on this page, once each, for the wall behind the
   * title. Uploaded pictures from the site's image slots join in so the wall
   * has enough to work with early on, and the shipped placeholders stay out —
   * a wall of grey squares would look broken rather than deliberate.
   */
  const mosaicPhotos = useMemo(() => {
    const fromMilestones = milestones.flatMap((m) => m.images || []);
    const fromSlots = Object.values(settings.images || {});
    const all = [...fromMilestones, ...fromSlots]
      .map((image) => asPhoto(image).src)
      .filter((src) => src && !isPlaceholder(src));
    return [...new Set(all)];
  }, [milestones, settings.images]);

  /* Below a handful of pictures the wall reads as one photo repeated, which
     looks like a mistake. Until then the header keeps its quiet original. */
  const hasWall = mosaicPhotos.length >= 5;

  return (
    <main className="pt-16">
      {/* ==================== HEADER ==================== */}
      {hasWall ? (
        <section className="relative isolate flex min-h-[clamp(380px,62vh,660px)] flex-col justify-end overflow-hidden bg-navy-deep pb-12 pt-28 md:pb-16 md:pt-36">
          <PhotoMosaic photos={mosaicPhotos} />
          <div className="wrap relative">
            <Reveal>
              <p className="eyebrow text-azure-light">{about.eyebrow}</p>
            </Reveal>
            <Words
              as="h1"
              text={about.title || "About me"}
              className="display mt-4 block text-[clamp(2.6rem,9vw,6rem)] leading-[0.95] text-white [text-shadow:0_2px_30px_rgba(15,41,71,0.45)]"
            />
            {about.lead && (
              <Reveal delay={120}>
                <p className="mt-7 max-w-2xl text-[15.5px] leading-[1.8] text-white/85 md:text-[17px]">
                  {about.lead}
                </p>
              </Reveal>
            )}
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden bg-paper pb-10 pt-16 md:pb-14 md:pt-24">
          <Orbs />
          <div className="wrap relative">
            <Reveal>
              <p className="eyebrow text-azure">{about.eyebrow}</p>
            </Reveal>
            <Words
              as="h1"
              text={about.title || "About me"}
              className="display mt-4 block text-[clamp(2.6rem,9vw,6rem)] leading-[0.95] text-navy"
            />
            {about.lead && (
              <Reveal delay={120}>
                <p className="mt-7 max-w-2xl text-[15.5px] leading-[1.8] text-navy-soft md:text-[17px]">
                  {about.lead}
                </p>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ==================== TIMELINE ==================== */}
      <section className="bg-paper pb-24 pt-6 md:pb-32">
        <div className="wrap">
          {milestones.length === 0 ? (
            <p className="display-italic text-[20px] text-navy-soft">
              Nothing here yet — add your first moment in the admin.
            </p>
          ) : (
            <div className="relative border-t border-navy-line">
              {/* the line the whole page hangs from */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-[7px] top-0 w-px bg-navy-line md:left-[calc(9rem+7px)]"
              />

              {milestones.map((m, i) => (
                <Milestone
                  key={m.id || i}
                  milestone={m}
                  index={i}
                  showYear={i === 0 || milestones[i - 1]?.year !== m.year}
                  onZoom={(imageIndex) => setZoom([i, imageIndex])}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Lightbox
        images={zoomPhotos.map((p) => p.src)}
        captions={zoomPhotos.map((p) => p.caption)}
        index={zoom ? zoom[1] : null}
        onClose={() => setZoom(null)}
        onIndex={(next) => setZoom(([mi]) => [mi, next])}
      />

      <Footer settings={settings} />
    </main>
  );
}

function Milestone({ milestone, index, showYear, onZoom }) {
  const reduce = useReducedMotion();
  const photos = (milestone.images || []).map(asPhoto).filter((p) => p.src);

  return (
    <motion.article
      className="relative grid grid-cols-1 gap-6 py-12 pl-8 md:grid-cols-[9rem_1fr] md:gap-10 md:py-16 md:pl-0"
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.75, ease: EASE }}
    >
      {/* the dot on the line */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-[3.6rem] h-3.5 w-3.5 rounded-full border-2 border-azure bg-paper md:left-[9rem] md:top-[4.4rem]"
      />

      <div className="md:pr-8 md:text-right">
        {showYear && (
          <p className="display text-[30px] leading-none text-azure md:text-[38px]">
            {milestone.year}
          </p>
        )}
      </div>

      <div className="md:pl-10">
        {milestone.title && (
          <h2 className="font-display text-[23px] leading-snug text-navy md:text-[29px]">
            {milestone.title}
          </h2>
        )}
        {milestone.text && (
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.8] text-navy-soft md:text-[16px]">
            {milestone.text}
          </p>
        )}

        {photos.length > 0 && (
          <div
            className={`mt-6 grid gap-x-3 gap-y-5 ${
              photos.length === 1 ? "max-w-2xl" : photos.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
            }`}
          >
            {photos.map((photo, i) => (
              <figure key={photo.src + i}>
                <button
                  type="button"
                  onClick={() => onZoom(i)}
                  data-cursor="XEM"
                  aria-label={photo.caption || `${milestone.title || milestone.year} — ảnh ${i + 1}`}
                  className={`group relative block w-full overflow-hidden rounded-[4px] bg-paper-300 ring-1 ring-navy/10 ${
                    photos.length === 1 ? "aspect-[16/10]" : "aspect-[4/3]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbOf(photo.src)}
                    onError={(e) => (e.currentTarget.src = photo.src)}
                    alt={photo.caption || ""}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </button>
                {photo.caption && (
                  <figcaption className="mt-2.5 text-[12.5px] leading-relaxed text-navy-soft">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
