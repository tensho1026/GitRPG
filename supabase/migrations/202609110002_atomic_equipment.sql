-- A user can have at most one equipped item per type and one equipped avatar.
-- Normalize legacy duplicates before adding the constraints.

delete from public."Items" older
using public."Items" newer
where older."userId" = newer."userId"
  and older."type" = newer."type"
  and older."equipped" = true
  and newer."equipped" = true
  and (
    older."createdAt" < newer."createdAt"
    or (older."createdAt" = newer."createdAt" and older."id"::text < newer."id"::text)
  );

delete from public."Avatar" older
using public."Avatar" newer
where older."userId" = newer."userId"
  and older."equipped" = true
  and newer."equipped" = true
  and (
    older."createdAt" < newer."createdAt"
    or (older."createdAt" = newer."createdAt" and older."id"::text < newer."id"::text)
  );

create unique index if not exists items_one_equipped_per_type
  on public."Items" ("userId", "type")
  where "equipped" = true;

create unique index if not exists avatar_one_equipped_per_user
  on public."Avatar" ("userId")
  where "equipped" = true;

create or replace function public.equip_item(
  p_user_id text,
  p_item_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public."Items";
begin
  if p_user_id is null or p_user_id = '' or p_item_id is null then
    raise exception 'invalid_equipment_request' using errcode = '22023';
  end if;

  select * into v_item
    from public."Items"
   where "id" = p_item_id and "userId" = p_user_id
   for update;

  if not found then
    raise exception 'item_not_found' using errcode = 'P0002';
  end if;

  -- Serialize choices for the same user and type. This makes a concurrent
  -- equip deterministic instead of relying on a unique-index violation.
  perform pg_advisory_xact_lock(
    hashtextextended(p_user_id || ':item:' || v_item."type", 0)
  );

  update public."Items"
     set "equipped" = false, "updatedAt" = now()
   where "userId" = p_user_id and "type" = v_item."type" and "id" <> p_item_id;

  update public."Items"
     set "equipped" = true, "updatedAt" = now()
   where "id" = p_item_id and "userId" = p_user_id
  returning * into v_item;

  return jsonb_build_object('item', to_jsonb(v_item));
end;
$$;

create or replace function public.equip_avatar(
  p_user_id text,
  p_avatar_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avatar public."Avatar";
begin
  if p_user_id is null or p_user_id = '' or p_avatar_id is null then
    raise exception 'invalid_avatar_request' using errcode = '22023';
  end if;

  select * into v_avatar
    from public."Avatar"
   where "id" = p_avatar_id and "userId" = p_user_id
   for update;

  if not found then
    raise exception 'avatar_not_found' using errcode = 'P0002';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_user_id || ':avatar', 0)
  );

  update public."Avatar"
     set "equipped" = false, "updatedAt" = now()
   where "userId" = p_user_id and "id" <> p_avatar_id;

  update public."Avatar"
     set "equipped" = true, "updatedAt" = now()
   where "id" = p_avatar_id and "userId" = p_user_id
  returning * into v_avatar;

  return jsonb_build_object('avatar', to_jsonb(v_avatar));
end;
$$;

revoke execute on function public.equip_item(text, uuid) from public;
revoke execute on function public.equip_avatar(text, uuid) from public;
