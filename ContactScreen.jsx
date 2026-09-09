"use client";

import EditableImage from "./EditableImage";
import Footer from "./Footer";
import { Reveal, Words, Magnetic, Orbs } from "./Motion";
import { useSite } from "./SiteProvider";

export default function ContactScreen({ settings }) {
  const { ui } = useSite();
  const { profile, contact } = settings;
  const rows = [
    { label: ui.contact.labels.email, value: profile.email, href: `mailto:${profile.email}` },
    { label: ui.contact.labels.phone, value: profile.phone, href: `tel:${profile.phoneHref}` },
    {
      label: ui.contact.labels.linkedin,
      value: profile.linkedinLabel,
      href: profile.linkedinUrl,
      external: true,
    },
    {
      label: ui.contact.labels.facebook,
      value: profile.facebookLabel,
      href: profile.facebookUrl,
      external: true,
      note: ui.contact.messageHint,
    },
    { label: ui.contact.labels.location, value: profile.location },
  ];

  return (
    <main className="pt-16">
      <section className="relative isolate overflow-hidden bg-navy-deep">
        <div className="absolute inset-0 -z-10">
          <EditableImage
            slot="contact"
            alt=""
            className="h-full w-full"
            overlay={<div className="pointer-events-none absolute inset-0 bg-navy-deep/[0.88]" />}
          />
        </div>
        <Orbs className="opacity-80" />

        <div className="wrap relative py-24 md:py-32">
          <Reveal>
            <p className="eyebrow text-azure-light">{contact.eyebrow}</p>
          </Reveal>
          <Words
            as="h1"
            text={contact.title}
            className="display-italic mt-5 block text-[clamp(3rem,13vw,7rem)] text-white"
            stagger={0.06}
          />
          <Reveal delay={120}>
            <p className="mt-7 max-w-2xl text-[15.5px] leading-[1.85] text-white/70 md:text-[16.5px]">
              {contact.lead}
            </p>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-9 sm:grid-cols-2 md:mt-20 md:max-w-3xl">
            {rows.map((r, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="border-t border-white/20 pt-4">
                  <p className="eyebrow text-azure-light">{r.label}</p>
                  {r.href ? (
                    <a
                      href={r.href}
                      target={r.external ? "_blank" : undefined}
                      rel={r.external ? "noreferrer" : undefined}
                      className="link-underline mt-3 inline-block text-[17px] font-medium text-white md:text-[19px]"
                    >
                      {r.value}
                    </a>
                  ) : (
                    <p className="mt-3 text-[17px] font-medium text-white md:text-[19px]">
                      {r.value}
                    </p>
                  )}
                  {r.note && (
                    <p className="mt-2 text-[12.5px] leading-snug text-white/45">{r.note}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={260}>
            <div className="mt-16 max-w-2xl border-t border-white/20 pt-6">
              <p className="eyebrow text-azure-light">{ui.contact.availabilityLabel}</p>
              <p className="mt-3 text-[14.5px] leading-[1.8] text-white/70">
                {contact.availability}
              </p>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-12">
              <Magnetic strength={0.34}>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-3 rounded-full bg-white px-9 py-4 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-navy transition-colors duration-300 hover:bg-azure-light"
                >
                  {ui.contact.cta}
                  <svg width="20" height="10" viewBox="0 0 20 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 5h17M14 1l4 4-4 4" />
                  </svg>
                </a>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
