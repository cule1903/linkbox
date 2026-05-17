create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_name_not_blank check (length(trim(name)) > 0),
  constraint tags_user_id_name_key unique (user_id, name)
);

create table if not exists public.link_tags (
  link_id uuid not null references public.links(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (link_id, tag_id)
);

alter table public.tags enable row level security;
alter table public.link_tags enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.tags to authenticated;
grant select, insert, update, delete on public.link_tags to authenticated;

create policy "Users can read their own tags"
on public.tags
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own tags"
on public.tags
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own tags"
on public.tags
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own tags"
on public.tags
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read their own link tags"
on public.link_tags
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own link tags"
on public.link_tags
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.links
    where links.id = link_tags.link_id
      and links.user_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = link_tags.tag_id
      and tags.user_id = auth.uid()
  )
);

create policy "Users can delete their own link tags"
on public.link_tags
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists tags_user_id_name_idx
on public.tags(user_id, name);

create index if not exists link_tags_user_id_idx
on public.link_tags(user_id);

create index if not exists link_tags_tag_id_idx
on public.link_tags(tag_id);

insert into public.tags (user_id, name)
select distinct links.user_id, lower(trim(tag_name))
from public.links
cross join lateral unnest(coalesce(links.tags, array[]::text[])) as tag_name
where length(trim(tag_name)) > 0
on conflict (user_id, name) do nothing;

insert into public.link_tags (link_id, tag_id, user_id)
select distinct links.id, tags.id, links.user_id
from public.links
cross join lateral unnest(coalesce(links.tags, array[]::text[])) as tag_name
join public.tags
  on tags.user_id = links.user_id
 and tags.name = lower(trim(tag_name))
where length(trim(tag_name)) > 0
on conflict (link_id, tag_id) do nothing;
