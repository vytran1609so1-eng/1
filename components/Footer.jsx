"use client";

import Link from "next/link";
import { nav } from "@/lib/content";
import { useSite } from "./SiteProvider";

export default function Footer({ settings }) {
  const { ui } = useSite();
  const { profile } = settings;
  return (
    <footer className="border-t border-navy-line bg-paper-200">
      <div className="wrap py-12 md:py-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="signature text-[34px] leading-none text-navy md:text-[42px]">
              {profile.signature}
            </p>
            <p className="mt-3 text-[12px] uppercase tracking-[0.18em] text-navy-soft">
              {profile.field} · {profile.since}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-underline text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-soft"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`mailto:${profile.email}`}
              className="link-underline text-[11px] font-semibold uppercase tracking-[0.16em] text-azure"
            >
              {profile.email}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10.5px] uppercase tracking-[0.22em] text-navy-soft/60">
            © {new Date().getFullYear()} · {ui.contact.footer}
          </p>
          {/* Password-protected — kept small on purpose, so you can always find it */}
          <Link
            href="/admin"
            className="text-[10.5px] uppercase tracking-[0.22em] text-navy-soft/40 transition-colors hover:text-azure"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
