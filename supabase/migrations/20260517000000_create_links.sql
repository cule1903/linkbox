create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  description text,
  category text,
  tags text[] not null default '{}',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'unread' check (status in ('unread', 'reading', 'completed')),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint links_user_id_url_key unique (user_id, url)
);

alter table public.links enable row level security;

drop policy if exists "Users can read their own links" on public.links;
create policy "Users can read their own links"
  on public.links for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own links" on public.links;
create policy "Users can create their own links"
  on public.links for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own links" on public.links;
create policy "Users can update their own links"
  on public.links for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own links" on public.links;
create policy "Users can delete their own links"
  on public.links for delete
  using (auth.uid() = user_id);

create index if not exists links_user_id_created_at_idx
  on public.links (user_id, created_at desc);

create index if not exists links_user_id_status_idx
  on public.links (user_id, status);

create index if not exists links_user_id_is_favorite_idx
  on public.links (user_id, is_favorite);
