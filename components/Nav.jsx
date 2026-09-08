"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { nav, defaultSettings } from "@/lib/content";

export default function Nav({ signature }) {
  const name = signature || defaultSettings.profile.signature;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const onHome = pathname === "/";
  const transparent = onHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-navy-line bg-white"
      }`}
    >
      <div className="wrap flex h-16 items-center justify-between">
        <Link
          href="/"
          className={`signature text-[26px] leading-none transition-colors md:text-[30px] ${
            transparent ? "text-white" : "text-navy"
          }`}
        >
          {name}
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                  transparent
                    ? active
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                    : active
                    ? "text-navy"
                    : "text-navy-soft hover:text-azure"
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className={`absolute -bottom-0.5 left-0 right-0 h-px ${
                      transparent ? "bg-white" : "bg-azure"
                    }`}
                    transition={{ type: "spring", stiffness: 340, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className={`grid h-9 w-9 place-items-center md:hidden ${
            transparent ? "text-white" : "text-navy"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            {open ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 8h18" />
                <path d="M3 16h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-navy-line bg-white px-6 pb-4 pt-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-b border-navy-line/70 py-3.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-navy-soft last:border-b-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
