"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const PW_KEY = "vy-guestbook-admin-pw";

/**
 * Trang duyệt lời nhắn. Mật khẩu nhập ở đây được gửi kèm mỗi request
 * qua header x-admin-password và so với biến môi trường ADMIN_PASSWORD
 * ở phía máy chủ — không có gì bí mật nằm trong mã nguồn trình duyệt.
 */
export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [entries, setEntries] = useState([]);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("pending"); // pending | approved | all

  const load = useCallback(async (password) => {
    const res = await fetch("/api/guestbook/admin", {
      headers: { "x-admin-password": password },
      cache: "no-store",
    });
    if (res.status === 401) {
      setMsg("Mật khẩu không đúng.");
      setAuthed(false);
      return false;
    }
    if (res.status === 503) {
      setMsg("Chưa cấu hình Supabase. Xem mục Supabase trong README.");
      return false;
    }
    const data = await res.json();
    if (!data.ok) {
      setMsg(data.reason || "Có lỗi xảy ra.");
      return false;
    }
    setEntries(data.entries);
    setAuthed(true);
    setMsg("");
    return true;
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(PW_KEY);
    if (saved) {
      setPw(saved);
      load(saved);
    }
  }, [load]);

  async function submitPw(e) {
    e.preventDefault();
    const ok = await load(pw);
    if (ok) sessionStorage.setItem(PW_KEY, pw);
  }

  async function setApproved(id, approved) {
    setEntries((prev) => prev.map((x) => (x.id === id ? { ...x, approved } : x)));
    await fetch("/api/guestbook/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ id, approved }),
    });
  }

  async function remove(id) {
    if (!confirm("Xoá hẳn lời nhắn này?")) return;
    setEntries((prev) => prev.filter((x) => x.id !== id));
    await fetch("/api/guestbook/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ id }),
    });
  }

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-6">
        <form onSubmit={submitPw} className="w-full max-w-sm">
          <p className="eyebrow text-azure">KHU VỰC RIÊNG</p>
          <h1 className="display mt-3 text-[28px] text-navy">Duyệt lời nhắn</h1>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Mật khẩu"
            className="mt-7 w-full border-b border-navy/25 bg-transparent pb-2 text-[15px] text-navy outline-none focus:border-azure"
          />
          {msg && <p className="mt-3 text-[13px] text-azure">{msg}</p>}
          <button
            type="submit"
            className="mt-7 w-full border border-navy px-6 py-3 font-display text-[11.5px] font-bold uppercase tracking-[0.2em] text-navy transition-colors hover:bg-navy hover:text-white"
          >
            Vào
          </button>
          <Link
            href="/guestbook"
            className="link-underline mt-6 inline-block text-[11px] uppercase tracking-[0.16em] text-navy-soft"
          >
            ← Về sổ lưu bút
          </Link>
        </form>
      </main>
    );
  }

  const shown = entries.filter((e) =>
    filter === "all" ? true : filter === "pending" ? !e.approved : e.approved
  );
  const pendingCount = entries.filter((e) => !e.approved).length;

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-navy-line">
        <div className="wrap flex h-16 flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-azure">DUYỆT LỜI NHẮN</p>
            <p className="text-[12px] text-navy-soft">
              {entries.length} tổng · {pendingCount} chờ duyệt
            </p>
          </div>
          <div className="flex gap-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
            {[
              ["pending", "Chờ duyệt"],
              ["approved", "Đã hiện"],
              ["all", "Tất cả"],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`px-3 py-1.5 transition-colors ${
                  filter === k ? "bg-navy text-white" : "text-navy-soft hover:text-azure"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="wrap py-10">
        {shown.length === 0 ? (
          <p className="text-[14px] text-navy-soft">Không có gì ở đây.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {shown.map((e) => (
              <article
                key={e.id}
                className={`border p-5 ${
                  e.approved ? "border-navy-line bg-white" : "border-azure/40 bg-white"
                }`}
              >
                <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-navy">
                  {e.message}
                </p>
                <div className="mt-4 border-t border-navy/10 pt-3">
                  <p className="display-italic text-[15px] text-azure">{e.name}</p>
                  {e.relation && (
                    <p className="text-[11px] uppercase tracking-[0.14em] text-navy-soft">
                      {e.relation}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-navy-soft/70">
                    {new Date(e.created_at).toLocaleString("en-GB")}
                  </p>
                </div>
                <div className="mt-4 flex gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  <button
                    type="button"
                    onClick={() => setApproved(e.id, !e.approved)}
                    className="border border-navy px-3 py-1.5 text-navy transition-colors hover:bg-navy hover:text-white"
                  >
                    {e.approved ? "Ẩn đi" : "Cho hiện"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    className="border border-azure/50 px-3 py-1.5 text-azure transition-colors hover:bg-azure hover:text-white"
                  >
                    Xoá
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
