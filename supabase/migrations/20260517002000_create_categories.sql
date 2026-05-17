create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_not_blank check (length(trim(name)) > 0),
  constraint categories_user_id_name_key unique (user_id, name)
);

alter table public.categories enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.categories to authenticated;

create policy "Users can read their own categories"
on public.categories
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own categories"
on public.categories
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own categories"
on public.categories
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own categories"
on public.categories
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists categories_user_id_name_idx
on public.categories(user_id, name);

insert into public.categories (user_id, name)
select distinct links.user_id, trim(links.category)
from public.links
where links.category is not null
  and length(trim(links.category)) > 0
on conflict (user_id, name) do nothing;

insert into public.categories (user_id, name)
select distinct links.user_id, default_categories.name
from public.links
cross join (
  values
    ('문서'),
    ('튜토리얼'),
    ('레퍼런스'),
    ('블로그'),
    ('영상'),
    ('강의')
) as default_categories(name)
on conflict (user_id, name) do nothing;
