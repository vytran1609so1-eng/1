"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * ============================================================================
 *  /admin → LƯỢT XEM
 * ============================================================================
 *  Two questions, answered on one screen: how many people are reading the
 *  site, and which blog post they are actually reading.
 *
 *  Everything comes from the site's own database, so the numbers are here
 *  rather than in somebody else's dashboard, and nothing about a reader is
 *  stored — only which page was opened, and when.
 * ============================================================================
 */

const VIEWS_SQL = `create table if not exists public.page_views (
  id         bigserial primary key,
  path       text not null,
  created_at timestamptz not null default now()
);
create index if not exists page_views_path_idx on public.page_views (path);
create index if not exists page_views_created_idx on public.page_views (created_at desc);
alter table public.page_views enable row level security;`;

/* The pages that are not blog posts, with the names Vy calls them. */
const PAGE_NAMES = {
  "/": "Trang chủ",
  "/about": "Về tôi",
  "/portfolio": "Hồ sơ",
  "/blog": "Danh sách blog",
  "/archive": "Lưu trữ",
  "/contact": "Liên hệ",
  "/guestbook": "Sổ lưu bút",
};

const nf = new Intl.NumberFormat("vi-VN");

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function Views({ pw, setMsg }) {
  const [data, setData] = useState(null);
  const [noTable, setNoTable] = useState(false);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/views/admin", {
      headers: { "x-admin-password": pw },
      cache: "no-store",
    });
    const body = await res.json().catch(() => ({}));
    if (!body.ok) {
      if (body.reason === "no_table" || /relation|does not exist/i.test(String(body.reason))) {
        setNoTable(true);
      } else {
        setMsg(body.reason || "Không tải được số liệu.");
      }
      setReady(true);
      return;
    }
    setNoTable(false);
    setData(body);
    setReady(true);
  }, [pw, setMsg]);

  useEffect(() => {
    load();
  }, [load]);

  /* Split the pages in two: the blog posts, matched up with their titles, and
     everything else. A list mixing "/" with "/blog/mot-hoc-ky-o-poznan" is
     harder to read than two short lists. */
  const { postRows, pageRows } = useMemo(() => {
    if (!data) return { postRows: [], pageRows: [] };
    const titles = new Map((data.posts || []).map((p) => [p.slug, p]));
    const postRows = [];
    const pageRows = [];

    for (const row of data.pages || []) {
      if (row.path.startsWith("/blog/")) {
        const slug = row.path.slice("/blog/".length);
        const post = titles.get(slug);
        postRows.push({
          ...row,
          title: post?.title || slug,
          slug,
          draft: post ? post.published === false : false,
          missing: !post,
        });
      } else {
        pageRows.push({ ...row, name: PAGE_NAMES[row.path] || row.path });
      }
    }
    return { postRows, pageRows };
  }, [data]);

  /* A post that exists but has never been opened still deserves a row —
     otherwise "no views" looks the same as "post not written yet". */
  const unreadPosts = useMemo(() => {
    if (!data) return [];
    const seen = new Set(postRows.map((r) => r.slug));
    return (data.posts || [])
      .filter((p) => !seen.has(p.slug))
      .map((p) => ({
        path: `/blog/${p.slug}`,
        slug: p.slug,
        title: p.title,
        total: 0,
        last7: 0,
        last30: 0,
        draft: p.published === false,
      }));
  }, [data, postRows]);

  const peak = Math.max(1, ...(data?.perDay || []).map(([, n]) => n));

  async function clearAll() {
    if (!confirm("Xoá toàn bộ lượt xem đã ghi? Không khôi phục lại được.")) return;
    await fetch("/api/views/admin", {
      method: "DELETE",
      headers: { "x-admin-password": pw },
    });
    setMsg("Đã xoá toàn bộ lượt xem.");
    load();
  }

  /* ------------------------------------------------------------------ */

  if (noTable) {
    return (
      <>
        <h1 className="display text-[30px] text-navy">Lượt xem</h1>
        <div className="mt-8 rounded-[5px] border border-azure/50 bg-paper-200 p-6">
          <p className="text-[14px] font-semibold text-navy">
            Chưa đếm được, vì database chưa có bảng lưu lượt xem.
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-navy-soft">
            Mở <strong className="text-navy">Supabase → SQL Editor → New query</strong>, dán đoạn
            dưới, bấm <strong className="text-navy">Run</strong>, rồi tải lại trang này. Đoạn này
            chỉ tạo cái chưa có — mọi thứ đang chạy vẫn nguyên vẹn.
          </p>
          <pre className="mt-4 overflow-auto rounded-[3px] bg-navy p-4 text-[11.5px] leading-relaxed text-white">
{VIEWS_SQL}
          </pre>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(VIEWS_SQL);
                setMsg("Đã copy đoạn SQL.");
              }}
              className="rounded-full bg-navy px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-azure"
            >
              Copy đoạn SQL
            </button>
            <button
              type="button"
              onClick={load}
              className="rounded-full border border-navy-line px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-soft transition hover:border-azure hover:text-azure"
            >
              Đã chạy xong, kiểm tra lại
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!ready) {
    return (
      <>
        <h1 className="display text-[30px] text-navy">Lượt xem</h1>
        <p className="mt-6 display-italic text-[18px] text-navy-soft">Đang tải…</p>
      </>
    );
  }

  /* Loaded, but nothing came back — the database was unreachable, or Supabase
     is not configured on this deployment. Without this the screen would try to
     read numbers that are not there and go blank. */
  if (!data) {
    return (
      <>
        <h1 className="display text-[30px] text-navy">Lượt xem</h1>
        <p className="mt-6 max-w-2xl text-[14px] leading-relaxed text-navy-soft">
          Không đọc được số liệu lúc này. Thường là do database tạm thời không kết nối được, hoặc
          bản deploy này chưa có đủ ba biến môi trường Supabase.
        </p>
        <button
          type="button"
          onClick={load}
          className="mt-5 rounded-full border border-navy-line px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-soft transition hover:border-azure hover:text-azure"
        >
          Thử lại
        </button>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[30px] text-navy">Lượt xem</h1>
        <button
          type="button"
          onClick={load}
          className="rounded-full border border-navy-line px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-soft transition hover:border-azure hover:text-azure"
        >
          Làm mới
        </button>
      </div>

      <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-navy-soft">
        Đếm từ chính database của bạn. Không lưu IP, không cookie, không nhận dạng người đọc — chỉ
        ghi lại trang nào được mở và lúc nào. Lượt bạn vào <strong className="text-navy">/admin</strong>{" "}
        không được tính.
      </p>

      {/* ----------------------------- totals ---------------------------- */}
      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
        <Stat label="Tổng lượt xem" value={data.total} big />
        <Stat label="30 ngày qua" value={data.last30} />
        <Stat label="7 ngày qua" value={data.last7} />
        <Stat
          label="Bắt đầu đếm từ"
          text={data.firstSeen ? formatDate(data.firstSeen) : "—"}
        />
      </div>

      {data.total === 0 && (
        <p className="mt-8 rounded-[5px] border border-navy-line bg-paper-100 p-5 text-[14px] leading-relaxed text-navy-soft">
          Chưa có lượt xem nào được ghi. Mở trang chủ ở một tab khác (không phải /admin) rồi bấm
          <strong className="text-navy"> Làm mới</strong> — nếu số vẫn là 0 thì bảng đã tạo nhưng
          website chưa được deploy lại với bản mới.
        </p>
      )}

      {/* --------------------------- 30-day bars ------------------------- */}
      {data.perDay?.length > 1 && (
        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-soft">
            30 ngày qua
          </h2>
          <div className="mt-4 flex h-28 items-end gap-[3px]">
            {data.perDay.map(([day, n]) => (
              <div
                key={day}
                title={`${formatDate(day)} — ${nf.format(n)} lượt`}
                className="flex-1 rounded-t-[2px] bg-azure/70 transition-colors hover:bg-azure"
                style={{ height: `${Math.max(4, (n / peak) * 100)}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-navy-soft">
            <span>{formatDate(data.perDay[0][0])}</span>
            <span>cao nhất {nf.format(peak)} lượt/ngày</span>
            <span>{formatDate(data.perDay[data.perDay.length - 1][0])}</span>
          </div>
        </section>
      )}

      {/* ------------------------------ posts ---------------------------- */}
      <Table
        title="Bài viết trên blog"
        empty="Chưa có bài nào được mở."
        rows={[...postRows, ...unreadPosts]}
        renderName={(row) => (
          <>
            <span className="text-navy">{row.title}</span>
            {row.draft && (
              <span className="ml-2 rounded-full bg-paper-300 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-navy-soft">
                nháp
              </span>
            )}
            {row.missing && (
              <span className="ml-2 rounded-full bg-paper-300 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-navy-soft">
                đã xoá
              </span>
            )}
            <span className="mt-0.5 block text-[11.5px] text-navy-soft">{row.path}</span>
          </>
        )}
      />

      {/* ------------------------------ pages ---------------------------- */}
      <Table
        title="Các trang khác"
        empty="Chưa có trang nào được mở."
        rows={pageRows}
        renderName={(row) => (
          <>
            <span className="text-navy">{row.name}</span>
            <span className="mt-0.5 block text-[11.5px] text-navy-soft">{row.path}</span>
          </>
        )}
      />

      <div className="mt-12 border-t border-navy-line pt-6">
        <p className="text-[13px] leading-relaxed text-navy-soft">
          Trong lúc xây web, chính bạn đã tạo ra kha khá lượt xem. Muốn đếm lại từ đầu bằng số
          liệu thật thì xoá sạch một lần, ngay trước khi bắt đầu gửi link đi.
        </p>
        <button
          type="button"
          onClick={clearAll}
          className="mt-4 rounded-full border border-navy-line px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-soft transition hover:border-azure hover:text-azure"
        >
          Xoá toàn bộ lượt xem
        </button>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------- */

function Stat({ label, value, text, big = false }) {
  return (
    <div className="rounded-[6px] border border-navy-line bg-white p-5">
      <p
        className={`display leading-none text-azure ${big ? "text-[40px]" : "text-[32px]"}`}
      >
        {text ?? nf.format(value ?? 0)}
      </p>
      <p className="mt-2.5 text-[11.5px] leading-snug text-navy-soft">{label}</p>
    </div>
  );
}

function Table({ title, rows, empty, renderName }) {
  return (
    <section className="mt-10">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-soft">
        {title}
      </h2>

      {rows.length === 0 ? (
        <p className="mt-4 display-italic text-[17px] text-navy-soft">{empty}</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-[6px] border border-navy-line bg-white">
          <table className="w-full min-w-[560px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-navy-line text-[11px] uppercase tracking-[0.1em] text-navy-soft">
                <th className="px-5 py-3.5 text-left font-semibold">Trang</th>
                <th className="w-24 px-5 py-3.5 text-right font-semibold">7 ngày</th>
                <th className="w-24 px-5 py-3.5 text-right font-semibold">30 ngày</th>
                <th className="w-28 px-5 py-3.5 text-right font-semibold">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.path} className="border-b border-navy-line/60 last:border-b-0">
                  <td className="px-5 py-3.5">{renderName(row)}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-navy-soft">
                    {nf.format(row.last7)}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-navy-soft">
                    {nf.format(row.last30)}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-navy">
                    {nf.format(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
