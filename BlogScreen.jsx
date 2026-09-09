"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "./Footer";
import { Reveal, Words, Orbs } from "./Motion";
import { thumbOf } from "@/lib/images";

const EASE = [0.22, 1, 0.36, 1];

/**
 * "20 tháng 7, 2026" — written out by hand rather than with
 * toLocaleDateString, because the server and the browser do not always carry
 * the same language data, and a date that differs between them breaks the page
 * as React takes over.
 */
export function formatDate(value) {
  if (!value) return "";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(value);
  const [, year, month, day] = match;
  return `${Number(day)} tháng ${Number(month)}, ${year}`;
}

/**
 * The blog front page: one lead article, then the rest in a grid, with a strip
 * of categories to filter by. Everything here is in Vietnamese because that is
 * what the posts are written in — every label is editable in /admin → Text.
 */
export default function BlogScreen({ settings, posts }) {
  const blog = settings.blog || {};
  const ui = blog.ui || {};
  const cats = blog.categories || [];
  const [filter, setFilter] = useState("all");

  const shown = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.category === filter)),
    [posts, filter]
  );

  /* The lead article: the one marked as featured, otherwise the newest. */
  const lead = shown.find((p) => p.featured) || shown[0] || null;
  const rest = lead ? shown.filter((p) => p.id !== lead.id) : shown;

  const countFor = (id) =>
    id === "all" ? posts.length : posts.filter((p) => p.category === id).length;

  return (
    <main className="pt-16">
      {/* ==================== HEADER ==================== */}
      <section className="relative overflow-hidden bg-paper pb-10 pt-16 md:pb-12 md:pt-24">
        <Orbs />
        <div className="wrap relative">
          <Reveal>
            <p className="eyebrow text-azure">{blog.eyebrow}</p>
          </Reveal>
          <Words
            as="h1"
            text={blog.title || "Blog"}
            className="display mt-4 block text-[clamp(2.6rem,9vw,6rem)] leading-[0.95] text-navy"
          />
          {blog.lead && (
            <Reveal delay={120}>
              <p className="mt-7 max-w-2xl text-[15.5px] leading-[1.8] text-navy-soft md:text-[17px]">
                {blog.lead}
              </p>
            </Reveal>
          )}
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section className="sticky top-16 z-30 border-y border-navy-line bg-white">
        <div className="wrap flex gap-6 overflow-x-auto py-4 md:gap-9">
          {[{ id: "all", label: ui.allLabel || "Tất cả" }, ...cats].map((c) => {
            const active = filter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                className={`shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  active ? "text-navy" : "text-navy-soft hover:text-azure"
                }`}
              >
                {c.label}
                <span className="ml-1.5 text-azure">{countFor(c.id)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================== POSTS ==================== */}
      <section className="bg-paper py-14 md:py-20">
        <div className="wrap">
          {shown.length === 0 ? (
            <p className="display-italic text-[20px] text-navy-soft">
              {ui.empty || "Chưa có bài nào trong mục này."}
            </p>
          ) : (
            <>
              {lead && <LeadPost post={lead} settings={settings} />}

              {rest.length > 0 && (
                <>
                  <p className="eyebrow mt-16 text-navy-soft md:mt-20">
                    {ui.moreLabel || "Bài khác"}
                  </p>
                  <div className="mt-7 grid gap-x-8 gap-y-12 border-t border-navy-line pt-10 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                      {rest.map((post, i) => (
                        <motion.div
                          key={post.id}
                          layout
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 6) * 0.05 }}
                        >
                          <PostCard post={post} settings={settings} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  The lead article                                                           */
/* -------------------------------------------------------------------------- */
function LeadPost({ post, settings }) {
  const ui = settings.blog?.ui || {};
  return (
    <Reveal>
      <Link href={`/blog/${post.slug}`} className="group grid gap-8 md:grid-cols-2 md:gap-12">
        <Cover post={post} className="aspect-[4/3] md:aspect-[5/4]" eager />
        <div className="flex flex-col justify-center">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-azure">
            {ui.featuredLabel || "Bài nổi bật"}
            {post.category && ` · ${labelOf(settings, post.category)}`}
          </p>
          <h2 className="display mt-4 text-[30px] leading-[1.1] text-navy md:text-[44px]">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-5 max-w-xl text-[15.5px] leading-[1.8] text-navy-soft md:text-[16.5px]">
              {post.excerpt}
            </p>
          )}
          <Meta post={post} ui={ui} className="mt-6" />
          <span className="mt-7 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-navy-soft transition-colors group-hover:text-azure">
            {ui.readMore || "Đọc tiếp"}
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/*  One card in the grid                                                       */
/* -------------------------------------------------------------------------- */
function PostCard({ post, settings }) {
  const ui = settings.blog?.ui || {};
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <Cover post={post} className="aspect-[4/3]" />
      <p className="mt-5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-azure">
        {labelOf(settings, post.category) || " "}
      </p>
      <h3 className="mt-2 font-display text-[21px] leading-snug text-navy transition-colors group-hover:text-azure md:text-[24px]">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-3 line-clamp-3 text-[14.5px] leading-[1.75] text-navy-soft">
          {post.excerpt}
        </p>
      )}
      <Meta post={post} ui={ui} className="mt-4" />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                                */
/* -------------------------------------------------------------------------- */
export function labelOf(settings, id) {
  return (settings.blog?.categories || []).find((c) => c.id === id)?.label ?? id ?? "";
}

function Meta({ post, ui, className = "" }) {
  return (
    <p className={`text-[11.5px] uppercase tracking-[0.14em] text-navy-soft/80 ${className}`}>
      {formatDate(post.date)}
      {post.minutes ? ` · ${post.minutes} ${ui.minuteRead || "phút đọc"}` : ""}
    </p>
  );
}

function Cover({ post, className = "", eager = false }) {
  if (!post.cover) {
    return (
      <div
        className={`grid place-items-center overflow-hidden rounded-[4px] bg-paper-300 ring-1 ring-navy/10 ${className}`}
      >
        <span className="display-italic text-[26px] text-navy/25">{post.title.slice(0, 1)}</span>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden rounded-[4px] bg-paper-300 ring-1 ring-navy/10 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbOf(post.cover)}
        onError={(e) => (e.currentTarget.src = post.cover)}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        style={{
          objectPosition: `${post.coverX}% ${post.coverY}%`,
          transform: `scale(${post.coverZoom})`,
          transformOrigin: `${post.coverX}% ${post.coverY}%`,
        }}
      />
    </div>
  );
}
