"use client";

import Link from "next/link";
import EntryList from "./EntryList";
import Footer from "./Footer";
import { Reveal, Words, Orbs, CountUp, Magnetic } from "./Motion";
import { categoriesForKeyword } from "@/lib/settings";
import { useSite } from "./SiteProvider";

export default function KeywordScreen({ settings, entries, keywordId }) {
  const { ui } = useSite();
  const keyword = settings.keywords.find((k) => k.id === keywordId);
  const cats = categoriesForKeyword(settings, keywordId);
  const others = settings.keywords.filter((k) => k.id !== keywordId);

  const shown = entries.filter((e) => e.inPortfolio !== false);

  const groups = cats.map((c) => ({
    id: c.id,
    label: c.label,
    blurb: c.blurb,
    stats: c.stats,
    entries: shown.filter((e) => e.category === c.id),
  }));

  const total = groups.reduce((n, g) => n + g.entries.length, 0);

  return (
    <main className="pt-16">
      {/* ==================== HEADER ==================== */}
      <section className="relative overflow-hidden bg-navy-deep py-20 md:py-28">
        <Orbs className="opacity-80" />
        <div className="wrap relative">
          <Reveal>
            <Link
              href="/portfolio"
              className="link-underline text-[11px] font-semibold uppercase tracking-[0.16em] text-azure-light"
            >
              ← {ui.keyword.backLabel}
            </Link>
          </Reveal>

          <Words
            as="h1"
            text={keyword?.word ?? ""}
            className="display-italic mt-7 block text-[clamp(2.6rem,11vw,6.5rem)] text-white"
            stagger={0.05}
          />

          <Reveal delay={120}>
            <p className="mt-5 max-w-2xl text-[17px] leading-[1.7] text-azure-light md:text-[19px]">
              {keyword?.line}
            </p>
            {keyword?.lead && (
              <p className="mt-5 max-w-2xl text-[14.5px] leading-[1.85] text-white/60">
                {keyword.lead}
              </p>
            )}
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/15 pt-6">
              <p className="display text-[30px] leading-none text-white md:text-[38px]">
                <CountUp value={String(total)} />
                <span className="ml-2 text-[12px] font-sans uppercase tracking-[0.18em] text-white/50">
                  {ui.portfolio.entryCount}
                </span>
              </p>
              <p className="text-[11.5px] uppercase tracking-[0.16em] text-white/50">
                {cats.map((c) => c.label).join(" · ") || ui.keyword.empty}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================== ENTRIES ==================== */}
      <section className="bg-paper py-16 md:py-24">
        <div className="wrap">
          {groups.length === 0 ? (
            <p className="display-italic text-[20px] text-navy-soft">{ui.keyword.empty}</p>
          ) : (
            <EntryList groups={groups} categories={settings.categories} showCategoryOnCard={false} />
          )}
        </div>
      </section>

      {/* ==================== OTHER KEYWORDS ==================== */}
      <section className="border-t border-navy-line bg-paper-200 py-16 md:py-20">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow text-navy-soft">{ui.keyword.otherKeywords}</p>
          </Reveal>
          <div className="mt-7 grid gap-4 md:grid-cols-2 md:gap-6">
            {others.map((k, i) => (
              <Reveal key={k.id} delay={i * 90}>
                <Magnetic strength={0.12}>
                  <Link
                    href={`/portfolio/${k.id}`}
                    className="group flex items-center justify-between gap-6 rounded-[5px] border border-navy-line bg-white p-6 transition-all duration-300 hover:border-azure hover:shadow-[0_18px_40px_-24px_rgba(22,54,95,0.35)] md:p-8"
                  >
                    <div>
                      <h3 className="display-italic text-[26px] text-navy md:text-[32px]">
                        {k.word}
                      </h3>
                      <p className="mt-2 text-[13.5px] leading-snug text-navy-soft">{k.line}</p>
                    </div>
                    <svg
                      width="26"
                      height="12"
                      viewBox="0 0 26 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-azure transition-transform duration-300 group-hover:translate-x-2"
                    >
                      <path d="M1 6h23M19 1l5 5-5 5" />
                    </svg>
                  </Link>
                </Magnetic>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
