-- =============================================================================
--  Run this once in Supabase → SQL Editor → New query
-- =============================================================================

-- ---------------------------------------------------------------------------
--  1. PORTFOLIO ENTRIES — everything you add through /admin
-- ---------------------------------------------------------------------------
create table if not exists public.portfolio_entries (
  id          uuid primary key default gen_random_uuid(),
  category    text        not null,
  title       text        not null check (char_length(title) between 1 and 200),
  role        text        check (char_length(role) <= 200),
  period      text        check (char_length(period) <= 120),
  sort_date   date,
  summary     text        check (char_length(summary) <= 400),
  body        text        check (char_length(body) <= 6000),
  highlights  text[]      not null default '{}',
  images      text[]      not null default '{}',
  links       jsonb       not null default '[]'::jsonb,
  featured    boolean     not null default false,
  published   boolean     not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists portfolio_entries_sort_idx
  on public.portfolio_entries (sort_date desc nulls last);

create index if not exists portfolio_entries_published_idx
  on public.portfolio_entries (published, sort_date desc nulls last);

-- ---------------------------------------------------------------------------
--  1b. Columns added later — safe to run again on an existing table
-- ---------------------------------------------------------------------------
alter table public.portfolio_entries
  add column if not exists in_portfolio boolean not null default true;

alter table public.portfolio_entries
  add column if not exists photo_slots text[] not null default '{}';

-- The category check now includes the fifth section
alter table public.portfolio_entries drop constraint if exists portfolio_entries_category_check;
alter table public.portfolio_entries add constraint portfolio_entries_category_check
  check (category in ('academic','work','leadership','extracurricular','competition'));

-- ---------------------------------------------------------------------------
--  1c. SITE SETTINGS — one row holding all the copy, sections, numbers
--      and image choices you edit at /admin
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id          text primary key,
  data        jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

insert into public.site_settings (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
--  2. GUESTBOOK — built and ready, hidden until closer to graduation
-- ---------------------------------------------------------------------------
create table if not exists public.guestbook_entries (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null check (char_length(name) between 1 and 60),
  relation    text        check (char_length(relation) <= 80),
  message     text        not null check (char_length(message) between 1 and 900),
  approved    boolean     not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists guestbook_entries_created_idx
  on public.guestbook_entries (created_at desc);

create index if not exists guestbook_entries_approved_idx
  on public.guestbook_entries (approved, created_at desc);

-- ---------------------------------------------------------------------------
--  3. LOCK BOTH TABLES DOWN
--  Row Level Security on, and deliberately NO policies. The website reads and
--  writes with the service-role key from the server, which bypasses RLS, so
--  locking things here means nothing can touch these tables from a browser.
-- ---------------------------------------------------------------------------
alter table public.portfolio_entries enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.site_settings    enable row level security;

-- ---------------------------------------------------------------------------
--  4. STORAGE BUCKET for the images you upload through /admin
--  You can also create this in the dashboard: Storage → New bucket →
--  name "portfolio-images", tick Public bucket.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

-- Anyone can view an image once they have its URL; only the server can upload.
drop policy if exists "portfolio images are publicly readable" on storage.objects;
create policy "portfolio images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'portfolio-images');

-- ---------------------------------------------------------------------------
--  5. TIDY UP DUPLICATE ACTIVITIES
--  Safe to run at any time. If the same activity was stored more than once
--  (same section, title and period), this keeps the first copy — the one your
--  edits are attached to — and deletes the repeats. Running it on a clean
--  table does nothing.
-- ---------------------------------------------------------------------------
delete from public.portfolio_entries a
using public.portfolio_entries b
where  a.category = b.category
  and  lower(btrim(a.title))            = lower(btrim(b.title))
  and  lower(btrim(coalesce(a.period,''))) = lower(btrim(coalesce(b.period,'')))
  and  (a.created_at, a.id) > (b.created_at, b.id);
