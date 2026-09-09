"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * The body of a blog post.
 *
 * Written in Markdown in /admin → Blog, rendered here with the typography of
 * the rest of the site. Raw HTML is deliberately NOT enabled: a post can only
 * produce the elements below, so a stray angle bracket can never break the
 * page or inject anything.
 */
export default function Markdown({ children }) {
  return (
    <div className="post-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: (props) => (
            <h2 className="display mt-14 text-[26px] leading-tight text-navy md:text-[32px]" {...props} />
          ),
          h3: (props) => (
            <h3 className="mt-10 font-display text-[20px] leading-snug text-navy md:text-[24px]" {...props} />
          ),
          p: (props) => (
            <p className="mt-6 text-[16.5px] leading-[1.85] text-navy-soft md:text-[17.5px]" {...props} />
          ),
          a: (props) => (
            <a
              className="link-underline font-medium text-azure"
              target={String(props.href || "").startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              {...props}
            />
          ),
          strong: (props) => <strong className="font-semibold text-navy" {...props} />,
          em: (props) => <em className="display-italic" {...props} />,
          ul: (props) => <ul className="mt-6 space-y-2.5 pl-1" {...props} />,
          ol: (props) => <ol className="mt-6 list-decimal space-y-2.5 pl-6" {...props} />,
          li: ({ children, ...rest }) => (
            <li
              className="relative pl-6 text-[16.5px] leading-[1.8] text-navy-soft marker:text-azure"
              {...rest}
            >
              <span className="absolute left-0 top-[0.7em] h-1.5 w-1.5 rounded-full bg-azure" />
              {children}
            </li>
          ),
          blockquote: (props) => (
            <blockquote
              className="display-italic mt-8 border-l-2 border-azure pl-6 text-[19px] leading-relaxed text-navy md:text-[22px]"
              {...props}
            />
          ),
          hr: () => <hr className="mt-12 border-navy-line" />,
          code: (props) => (
            <code className="rounded bg-navy/8 px-1.5 py-0.5 text-[14px] text-navy" {...props} />
          ),
          img: ({ src, alt }) => (
            <figure className="mt-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || ""}
                loading="lazy"
                decoding="async"
                className="w-full rounded-[4px]"
              />
              {alt && (
                <figcaption className="mt-3 text-[12px] uppercase tracking-[0.14em] text-navy-soft">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          table: (props) => (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse text-[15px]" {...props} />
            </div>
          ),
          th: (props) => (
            <th className="border-b border-navy px-3 py-2 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-navy" {...props} />
          ),
          td: (props) => (
            <td className="border-b border-navy-line px-3 py-2 text-navy-soft" {...props} />
          ),
        }}
      >
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
