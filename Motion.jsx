"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  animate,
  useReducedMotion,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/* -------------------------------------------------------------------------- */
/*  Reveal — hiện dần + trồi lên khi cuộn tới                                  */
/* -------------------------------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className = "",
  once = true,
  as = "div",
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.15, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay: delay / 1000 }}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/*  Words — chữ trồi lên từng từ, mỗi từ nằm trong một khung che                */
/* -------------------------------------------------------------------------- */
export function Words({
  text,
  className = "",
  delay = 0,
  stagger = 0.045,
  as: Tag = "span",
  once = true,
}) {
  const reduce = useReducedMotion();
  const value = String(text ?? "");

  /**
   * Word-by-word is beautiful on a headline and expensive on a paragraph: each
   * word becomes two nested animated elements, so a long introduction turns
   * into hundreds of them and the whole page stutters as it appears. Anything
   * longer than a headline rises as one block instead — at reading size the
   * difference is invisible.
   */
  if (value.length > 140) {
    return (
      <Tag className={className}>
        <motion.span
          className="inline-block"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once, amount: 0.15 }}
          transition={{ duration: 0.9, ease: EASE, delay: delay / 1000 }}
        >
          {value}
        </motion.span>
      </Tag>
    );
  }

  const words = value.split(/(\s+)/);

  // Lưu ý: cấu trúc DOM phải giống hệt nhau ở mọi chế độ, nếu không React sẽ
  // báo lệch hydration khi người dùng bật "giảm chuyển động".
  return (
    <Tag className={className}>
      <motion.span
        className="inline"
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={{ once, amount: 0.25 }}
        transition={{ staggerChildren: stagger, delayChildren: delay / 1000 }}
      >
        {words.map((w, i) =>
          /^\s+$/.test(w) ? (
            <span key={i}> </span>
          ) : (
            <span
              key={i}
              className="inline-block overflow-hidden align-bottom"
              /* The mask needs headroom above and below so tall glyphs,
                 accents and descenders are never clipped. */
              style={{
                paddingTop: "0.40em",
                marginTop: "-0.40em",
                paddingBottom: "0.16em",
                marginBottom: "-0.16em",
              }}
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "145%" },
                  show: { y: 0 },
                }}
                transition={{ duration: 0.85, ease: EASE }}
              >
                {w}
              </motion.span>
            </span>
          )
        )}
      </motion.span>
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/*  MaskImage — ảnh lộ dần từ dưới lên khi cuộn tới                            */
/* -------------------------------------------------------------------------- */
export function MaskImage({ children, className = "", delay = 0 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  /**
   * The element that watches the viewport must NOT be the element being
   * clipped. While `clip-path: inset(100%)` is applied, the browser reports no
   * visible area for that element, so an observer attached to it never fires
   * and the picture stays hidden for good. Watching the plain wrapper instead
   * keeps the reveal reliable.
   */
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const shown = reduce || inView;

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="overflow-hidden"
        initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
        animate={{ clipPath: shown ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
        transition={{ duration: 1.05, ease: EASE, delay: delay / 1000 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Parallax — con trượt chậm hơn nền khi cuộn                                 */
/* -------------------------------------------------------------------------- */
export function Parallax({ children, distance = 60, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  /* A spring here runs its own animation loop on top of the scroll listener
     for a movement nobody can see. Mapping the scroll straight to `y` is
     smooth already and costs one transform per frame. */
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CountUp — số đếm từ 0 lên khi cuộn tới, giữ nguyên định dạng gốc           */
/*  Ví dụ: "3.69/4.0" · "#2" · "2.000+" · "120+" · "100%"                      */
/* -------------------------------------------------------------------------- */
function parseToken(tok) {
  const m = tok.match(/^(\d+)(?:([.,])(\d+))?$/);
  if (!m) return null;
  const [, intPart, sep, frac] = m;
  if (frac && frac.length === 3 && intPart.length <= 3) {
    // "2.000" -> hai nghìn (dấu phân nhóm)
    return { value: parseInt(intPart + frac, 10), sep, grouped: true, decimals: 0 };
  }
  if (frac) {
    return {
      value: parseFloat(`${intPart}.${frac}`),
      sep,
      grouped: false,
      decimals: frac.length,
    };
  }
  return { value: parseInt(intPart, 10), sep: null, grouped: false, decimals: 0 };
}

function formatNum(n, info) {
  if (info.grouped) {
    const s = Math.round(n).toString();
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, info.sep);
  }
  const s = n.toFixed(info.decimals);
  return info.sep ? s.replace(".", info.sep) : s;
}

export function CountUp({ value, className = "" }) {
  const str = String(value ?? "");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [out, setOut] = useState(null);

  const match = str.match(/\d+(?:[.,]\d+)?/);
  const info = match ? parseToken(match[0]) : null;

  useEffect(() => {
    if (!inView || !info || reduce) return;
    const controls = animate(0, info.value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setOut(formatNum(v, info)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, str]);

  // Trước khi hiệu ứng chạy thì hiển thị đúng chuỗi gốc — nhờ vậy máy chủ và
  // trình duyệt render giống nhau, và người tắt chuyển động vẫn thấy số thật.
  const shown = out === null || !info ? str : str.replace(match[0], out);

  return (
    <span ref={ref} className={className} aria-label={str}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Magnetic — nút hơi hút về phía con trỏ                                     */
/* -------------------------------------------------------------------------- */
export function Magnetic({ children, strength = 0.28, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 20 });
  const sy = useSpring(y, { stiffness: 260, damping: 20 });

  function onMove(e) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={reduce ? undefined : { x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Signature — the handwritten name, revealed left to right as if written     */
/* -------------------------------------------------------------------------- */
export function Signature({ text, className = "", delay = 0, duration = 1.9 }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={reduce ? false : { clipPath: "inset(-25% 100% -25% -2%)" }}
      animate={reduce ? undefined : { clipPath: "inset(-25% -2% -25% -2%)" }}
      transition={{ duration, ease: [0.33, 0, 0.15, 1], delay: delay / 1000 }}
    >
      {text}
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Floating blue orbs — the soft background wash                              */
/* -------------------------------------------------------------------------- */
export function Orbs({ className = "" }) {
  const ref = useRef(null);
  /**
   * The three soft glows drift forever, which is fine on screen and pure waste
   * off it: three large layers being recomposited every frame on every section
   * of the page at once is what makes scrolling feel heavy. They now hold
   * still until their section is actually visible.
   */
  const inView = useInView(ref, { amount: 0 });
  const state = inView ? "running" : "paused";

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ contain: "paint" }}
    >
      <div
        className="glow absolute -left-[12%] top-[-10%] h-[46vw] w-[46vw] animate-drift rounded-full"
        style={{ animationPlayState: state }}
      />
      <div
        className="glow absolute right-[-14%] top-[24%] h-[38vw] w-[38vw] animate-drift rounded-full"
        style={{ animationDelay: "-6s", animationPlayState: state }}
      />
      <div
        className="glow absolute bottom-[-16%] left-[28%] h-[34vw] w-[34vw] animate-drift rounded-full"
        style={{ animationDelay: "-11s", animationPlayState: state }}
      />
    </div>
  );
}
