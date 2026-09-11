"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import EditableImage from "./EditableImage";
import Marquee from "./Marquee";
import FeatureBands from "./FeatureBands";
import { Reveal, Words, Signature, MaskImage, Parallax, CountUp, Magnetic, Orbs } from "./Motion";
import { useSite } from "./SiteProvider";

export default function HomeScreen({ settings }) {
  const { ui } = useSite();
  const { profile, home, keywords } = settings;
  const about = settings.about || {};
  const blog = settings.blog || {};
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <main>
      {/* ==================== HERO ==================== */}
      <section ref={ref} className="relative isolate overflow-hidden bg-navy-deep">
        <motion.div
          className="h-[100svh] min-h-[600px] w-full"
          style={reduce ? undefined : { y: imgY }}
        >
          <EditableImage
            slot="hero"
            eager
            alt=""
            className="h-full w-full"
            overlay={
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-deep/75 via-navy-deep/55 to-navy-deep/85" />
            }
          />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center"
          style={reduce ? undefined : { y: textY, opacity: textOpacity }}
        >
          <div className="wrap text-center">
            <motion.p
              className="eyebrow text-white/60"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.9 }}
            >
              {home.eyebrow}
            </motion.p>

            {/* The name, written out */}
            <h1 className="signature mt-6 text-white [text-shadow:0_2px_40px_rgba(15,41,71,0.45)]">
              <Signature
                text={profile.signature}
                className="whitespace-nowrap text-[clamp(2rem,10vw,7.5rem)] leading-[1.12]"
                delay={500}
                duration={2.1}
              />
            </h1>

            <motion.div
              className="mx-auto mt-4 h-px bg-azure-light/70 md:mt-6"
              initial={{ width: 0 }}
              animate={{ width: 88 }}
              transition={{ delay: 2.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />

            <Words
              as="p"
              text={home.hook}
              className="display-italic mx-auto mt-7 block max-w-3xl text-[clamp(1.35rem,4.4vw,2.8rem)] text-white"
              stagger={0.05}
              delay={2400}
              once={false}
            />
          </div>
        </motion.div>

        <motion.a
          href="#intro"
          className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60 transition-colors hover:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.1, duration: 0.8 }}
        >
          <span className="eyebrow">{ui.home.scroll}</span>
          <motion.span
            animate={reduce ? undefined : { y: [0, 7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="14" height="34" viewBox="0 0 14 34" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1v29" />
              <path d="M1.5 24 7 31l5.5-7" />
            </svg>
          </motion.span>
        </motion.a>
      </section>

      <Marquee items={home.marquee || []} />

      {/* ==================== INTRO ==================== */}
      <section id="intro" className="relative overflow-hidden bg-paper py-24 md:py-32">
        <Orbs />

        <div className="wrap relative grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow text-azure">Hello</p>
            </Reveal>
            <Words
              as="p"
              text={home.intro}
              className="mt-6 block text-[16px] leading-[1.85] text-navy md:text-[17.5px]"
              stagger={0.012}
            />
            <Reveal delay={140}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-navy-line pt-5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-navy-soft">
                <span>{profile.location}</span>
                <a href={`mailto:${profile.email}`} className="link-underline text-azure">
                  {profile.email}
                </a>
              </div>
            </Reveal>
          </div>

          <Parallax distance={30}>
            <MaskImage>
              <div data-cursor="">
                <EditableImage
                  slot="portrait"
                  alt={profile.signature}
                  className="aspect-[4/5] w-full rounded-[3px] ring-1 ring-navy/10"
                />
              </div>
            </MaskImage>
          </Parallax>
        </div>
      </section>

      {/* ============ PHOTOGRAPHS BETWEEN THE SECTIONS ============ */}
      <FeatureBands bands={settings.bands} page="home" />

      {/* ==================== THREE KEYWORDS ==================== */}

      {/* ==================== TWO MORE DOORS ==================== */}
      {/*
        The portfolio answers "what has she done". These two answer the other
        two questions a reader ends up with — who is she, and how does she
        think — and until now both pages were only reachable from the
        navigation, which is the part of a page people skip. The copy is the
        same copy those pages open with, edited in /admin, so the promise made
        here and the page it leads to can never drift apart.
      */}
      <section className="bg-paper-100 py-20 md:py-28">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow text-azure">{ui.home.moreLabel}</p>
          </Reveal>

          <div className="mt-8 grid gap-5 md:mt-10 md:grid-cols-2 md:gap-6">
            {[
              { href: "/about", copy: about, fallback: "About me" },
              { href: "/blog", copy: blog, fallback: "Blog" },
            ].map((card, i) => (
              <Reveal key={card.href} delay={i * 90}>
                <Link
                  href={card.href}
                  data-cursor={ui.home.keywordCta}
                  className="group flex h-full flex-col justify-between rounded-[8px] border border-navy-line bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-azure hover:shadow-[0_28px_60px_-40px_rgba(22,54,95,0.55)] md:p-9"
                >
                  <div>
                    {card.copy.eyebrow && (
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-navy-soft">
                        {card.copy.eyebrow}
                      </p>
                    )}
                    <h2 className="display mt-3 text-[28px] leading-[1.1] text-navy transition-colors duration-300 group-hover:text-azure md:text-[34px]">
                      {card.copy.title || card.fallback}
                    </h2>
                    {card.copy.lead && (
                      <p className="mt-4 max-w-md text-[14.5px] leading-[1.75] text-navy-soft">
                        {card.copy.lead}
                      </p>
                    )}
                  </div>

                  <span className="mt-8 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-azure">
                    {ui.home.keywordCta}
                    <svg
                      width="20"
                      height="10"
                      viewBox="0 0 20 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-500 group-hover:translate-x-1.5"
                    >
                      <path d="M1 5h17M14 1l4 4-4 4" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== KEYWORDS ==================== */}
      <section className="relative overflow-hidden bg-navy-deep py-24 md:py-32">
        <Orbs className="opacity-70" />
        <div className="wrap relative">
          <Reveal>
            <p className="eyebrow text-azure-light">{home.keywordsLabel}</p>
          </Reveal>

          <div className="mt-12 border-t border-white/15 md:mt-16">
            {keywords.map((k, i) => (
              <Reveal key={k.id} delay={i * 90}>
                <Link
                  href={`/portfolio/${k.id}`}
                  className="group flex flex-col gap-2 border-b border-white/15 py-9 transition-colors duration-300 hover:bg-white/[0.04] md:flex-row md:items-baseline md:gap-10 md:py-12"
                >
                  <span className="font-sans text-[11px] font-semibold tracking-[0.22em] text-azure-light md:w-16">
                    0{i + 1}
                  </span>
                  <motion.span
                    className="block flex-1"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Words
                      as="h2"
                      text={k.word}
                      className="display-italic block text-[clamp(2.4rem,9vw,5rem)] text-white transition-colors group-hover:text-azure-light"
                      stagger={0.05}
                    />
                  </motion.span>
                  <div className="flex items-center gap-4 md:justify-end">
                    <p className="max-w-xs text-[14.5px] leading-[1.65] text-white/60 md:text-right">
                      {k.line}
                    </p>
                    <svg
                      width="24"
                      height="12"
                      viewBox="0 0 26 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="hidden shrink-0 text-azure-light transition-transform duration-300 group-hover:translate-x-2 md:block"
                    >
                      <path d="M1 6h23M19 1l5 5-5 5" />
                    </svg>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* Numbers */}
          <Reveal delay={80}>
            <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-9 md:mt-20 md:grid-cols-4">
              {home.stats.map((s, i) => (
                <div key={i}>
                  <p className="display text-[38px] leading-none text-azure-light md:text-[48px]">
                    <CountUp value={s.value} />
                  </p>
                  <p className="mt-3 text-[12px] leading-snug text-white/55">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Buttons */}
          <Reveal delay={160}>
            <div className="mt-16 flex flex-wrap items-center gap-4 md:mt-20">
              <Magnetic strength={0.32}>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-3 rounded-full bg-white px-9 py-4 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-navy transition-colors duration-300 hover:bg-azure-light"
                >
                  {ui.home.cta}
                  <svg width="20" height="10" viewBox="0 0 20 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 5h17M14 1l4 4-4 4" />
                  </svg>
                </Link>
              </Magnetic>
              <Magnetic strength={0.32}>
                <Link
                  href="/contact"
                  className="inline-block rounded-full border border-white/35 px-9 py-4 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
                >
                  {ui.home.ctaSecondary}
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
