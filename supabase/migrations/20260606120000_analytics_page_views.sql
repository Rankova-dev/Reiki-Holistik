create table if not exists public.page_views (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  visited_at timestamptz default now() not null,
  session_id text
);

alter table public.page_views enable row level security;

create policy "Anyone can insert page views"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated users can read page views"
  on public.page_views for select
  to authenticated
  using (true);

create index if not exists page_views_visited_at_idx on public.page_views (visited_at desc);
create index if not exists page_views_path_idx on public.page_views (path);
