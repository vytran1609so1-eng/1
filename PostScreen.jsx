"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Footer from "./Footer";
import Markdown from "./Markdown";
import { Reveal, Words } from "./Motion";
import { formatDate, labelOf } from "./BlogScreen";

/**
 * One article, read end to end.
 *
 * A thin bar across the top fills as you read — the only motion on the page,
 * because everything else here should get out of the way of the words.
 */
export default function PostScreen({ settings, post, more = [] }) {
  const ui = settings.blog?.ui || {};
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.3 });

  return (
    <main className="pt-16">
      {/* The reading bar is always in the tree — only its motion is optional.
          Branching the DOM on useReducedMotion() breaks hydration, because the
          server and the browser's first render disagree about it. */}
      <motion.div
        className="fixed left-0 top-16 z-40 h-[2px] w-full origin-left bg-azure"
        style={reduce ? { scaleX: 0 } : { scaleX: progress }}
        aria-hidden="true"
      />

      {/* ==================== HEADER ==================== */}
      <article>
        <header className="wrap max-w-3xl pb-10 pt-14 md:pb-14 md:pt-20">
          <Reveal>
            <Link
              href="/blog"
              className="link-underline text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-soft"
            >
              {ui.backToList || "← Về danh sách bài viết"}
            </Link>
          </Reveal>

          <Reveal delay={60}>
            <p className="eyebrow mt-8 text-azure">
              {labelOf(settings, post.category)}
            </p>
          </Reveal>

          <Words
            as="h1"
            text={post.title}
            className="display mt-4 block text-[clamp(2rem,6.5vw,3.6rem)] leading-[1.05] text-navy"
          />

          <Reveal delay={140}>
            <p className="mt-6 text-[11.5px] uppercase tracking-[0.14em] text-navy-soft/80">
              {formatDate(post.date)}
              {post.minutes ? ` · ${post.minutes} ${ui.minuteRead || "phút đọc"}` : ""}
            </p>
          </Reveal>

          {post.excerpt && (
            <Reveal delay={180}>
              <p className="display-italic mt-8 border-l-2 border-azure pl-6 text-[19px] leading-relaxed text-navy md:text-[22px]">
                {post.excerpt}
              </p>
            </Reveal>
          )}
        </header>

        {post.cover && (
          <Reveal>
            <figure className="wrap max-w-5xl">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[4px] bg-paper-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.cover}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    objectPosition: `${post.coverX}% ${post.coverY}%`,
                    transform: `scale(${post.coverZoom})`,
                    transformOrigin: `${post.coverX}% ${post.coverY}%`,
                  }}
                />
              </div>
              {post.coverCaption && (
                <figcaption className="mt-3 text-[12.5px] leading-relaxed text-navy-soft">
                  {post.coverCaption}
                </figcaption>
              )}
            </figure>
          </Reveal>
        )}

        {/* ==================== BODY ==================== */}
        <div className="wrap max-w-3xl pb-20 pt-4 md:pb-28">
          <Markdown>{post.body}</Markdown>
        </div>
      </article>

      {/* ==================== MORE ==================== */}
      {more.length > 0 && (
        <section className="border-t border-navy-line bg-paper-200 py-14 md:py-20">
          <div className="wrap">
            <p className="eyebrow text-navy-soft">{ui.moreLabel || "Bài khác"}</p>
            <div className="mt-7 grid gap-x-8 gap-y-10 md:grid-cols-3">
              {more.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-azure">
                    {labelOf(settings, p.category)}
                  </p>
                  <h3 className="mt-2 font-display text-[20px] leading-snug text-navy transition-colors group-hover:text-azure">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[11.5px] uppercase tracking-[0.14em] text-navy-soft/80">
                    {formatDate(p.date)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer settings={settings} />
    </main>
  );
}
