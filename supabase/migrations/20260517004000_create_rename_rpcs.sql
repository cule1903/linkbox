create or replace function public.rename_category(
  p_category_id uuid,
  p_name text
)
returns public.categories
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_category public.categories%rowtype;
  v_new_name text := trim(coalesce(p_name, ''));
  v_old_name text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  if length(v_new_name) = 0 then
    raise exception 'category_name_required' using errcode = '23514';
  end if;

  select *
  into v_category
  from public.categories
  where id = p_category_id
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'category_not_found' using errcode = 'P0002';
  end if;

  v_old_name := v_category.name;

  update public.categories
  set
    name = v_new_name,
    updated_at = now()
  where id = p_category_id
    and user_id = auth.uid()
  returning * into v_category;

  update public.links
  set
    category = v_new_name,
    updated_at = now()
  where user_id = auth.uid()
    and category = v_old_name;

  return v_category;
end;
$$;

create or replace function public.rename_tag(
  p_tag_id uuid,
  p_name text
)
returns public.tags
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tag public.tags%rowtype;
  v_new_name text := lower(trim(coalesce(p_name, '')));
  v_old_name text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  if length(v_new_name) = 0 then
    raise exception 'tag_name_required' using errcode = '23514';
  end if;

  select *
  into v_tag
  from public.tags
  where id = p_tag_id
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'tag_not_found' using errcode = 'P0002';
  end if;

  v_old_name := v_tag.name;

  update public.tags
  set
    name = v_new_name,
    updated_at = now()
  where id = p_tag_id
    and user_id = auth.uid()
  returning * into v_tag;

  update public.links as links
  set
    tags = coalesce(
      (
        select array_agg(deduped.name order by deduped.first_ord)
        from (
          select normalized.name, min(normalized.ord) as first_ord
          from (
            select
              case
                when lower(trim(tag_name)) = v_old_name then v_new_name
                else lower(trim(tag_name))
              end as name,
              ord
            from unnest(links.tags) with ordinality as tag_values(tag_name, ord)
            where length(trim(tag_name)) > 0
          ) as normalized
          group by normalized.name
        ) as deduped
      ),
      array[]::text[]
    ),
    updated_at = now()
  where links.user_id = auth.uid()
    and exists (
      select 1
      from unnest(links.tags) as existing_tag_name
      where lower(trim(existing_tag_name)) = v_old_name
    );

  return v_tag;
end;
$$;

grant execute on function public.rename_category(uuid, text) to authenticated;
grant execute on function public.rename_tag(uuid, text) to authenticated;
