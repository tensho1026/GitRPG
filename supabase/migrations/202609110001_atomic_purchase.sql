-- Keep coin debits and ownership writes in one database transaction.
-- Server actions call these SECURITY DEFINER functions through the service role.

create unique index if not exists items_user_equipment_unique
  on public."Items" ("userId", "equipmentId");

create unique index if not exists avatar_user_name_unique
  on public."Avatar" ("userId", "name");

create or replace function public.purchase_item(
  p_user_id text,
  p_equipment_id text,
  p_name text,
  p_image text,
  p_description text,
  p_type text,
  p_attack integer,
  p_defense integer,
  p_price integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coin integer;
  v_item public."Items";
begin
  if p_user_id is null or p_user_id = '' then
    raise exception 'user_id_required' using errcode = '22023';
  end if;
  if p_price is null or p_price < 0 then
    raise exception 'invalid_price' using errcode = '22023';
  end if;

  select "coin"
    into v_coin
    from public."UserStatus"
   where "userId" = p_user_id
   for update;

  if not found then
    raise exception 'user_status_not_found' using errcode = 'P0002';
  end if;

  if exists (
    select 1 from public."Items"
     where "userId" = p_user_id and "equipmentId" = p_equipment_id
  ) then
    raise exception 'item_already_owned' using errcode = '23505';
  end if;

  if v_coin < p_price then
    raise exception 'insufficient_coins' using errcode = 'P0001';
  end if;

  insert into public."Items" (
    "equipmentId", "name", "image", "description", "type",
    "attack", "defense", "price", "equipped", "userId",
    "createdAt", "updatedAt"
  ) values (
    p_equipment_id, p_name, p_image, p_description, p_type,
    p_attack, p_defense, p_price, false, p_user_id,
    now(), now()
  ) returning * into v_item;

  update public."UserStatus"
     set "coin" = v_coin - p_price, "updatedAt" = now()
   where "userId" = p_user_id;

  return jsonb_build_object(
    'item', to_jsonb(v_item),
    'remainingCoin', v_coin - p_price
  );
end;
$$;

create or replace function public.purchase_avatar(
  p_user_id text,
  p_avatar_id uuid,
  p_name text,
  p_image text,
  p_description text,
  p_type text,
  p_hp integer,
  p_attack integer,
  p_defense integer,
  p_price integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coin integer;
  v_avatar public."Avatar";
begin
  if p_user_id is null or p_user_id = '' then
    raise exception 'user_id_required' using errcode = '22023';
  end if;
  if p_price is null or p_price < 0 then
    raise exception 'invalid_price' using errcode = '22023';
  end if;

  select "coin"
    into v_coin
    from public."UserStatus"
   where "userId" = p_user_id
   for update;

  if not found then
    raise exception 'user_status_not_found' using errcode = 'P0002';
  end if;

  if exists (
    select 1 from public."Avatar"
     where "userId" = p_user_id and "name" = p_name
  ) then
    raise exception 'avatar_already_owned' using errcode = '23505';
  end if;

  if v_coin < p_price then
    raise exception 'insufficient_coins' using errcode = 'P0001';
  end if;

  insert into public."Avatar" (
    "id", "name", "image", "description", "type", "hp", "attack",
    "defense", "price", "equipped", "userId", "createdAt", "updatedAt"
  ) values (
    p_avatar_id, p_name, p_image, p_description, p_type, p_hp, p_attack,
    p_defense, p_price, false, p_user_id, now(), now()
  ) returning * into v_avatar;

  update public."UserStatus"
     set "coin" = v_coin - p_price, "updatedAt" = now()
   where "userId" = p_user_id;

  return jsonb_build_object(
    'avatar', to_jsonb(v_avatar),
    'remainingCoin', v_coin - p_price
  );
end;
$$;

create or replace function public.unlock_avatar(
  p_user_id text,
  p_avatar_id uuid,
  p_name text,
  p_image text,
  p_description text,
  p_type text,
  p_hp integer,
  p_attack integer,
  p_defense integer,
  p_price integer,
  p_unlock_level integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coin integer;
  v_level integer;
  v_avatar public."Avatar";
begin
  if p_user_id is null or p_user_id = '' then
    raise exception 'user_id_required' using errcode = '22023';
  end if;
  if p_price is null or p_price < 0 or p_unlock_level is null or p_unlock_level < 1 then
    raise exception 'invalid_avatar_requirements' using errcode = '22023';
  end if;

  select "coin", "level"
    into v_coin, v_level
    from public."UserStatus"
   where "userId" = p_user_id
   for update;

  if not found then
    raise exception 'user_status_not_found' using errcode = 'P0002';
  end if;
  if v_level < p_unlock_level then
    raise exception 'level_requirement_not_met' using errcode = 'P0001';
  end if;
  if v_coin < p_price then
    raise exception 'insufficient_coins' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public."Avatar"
     where "userId" = p_user_id and "name" = p_name
  ) then
    raise exception 'avatar_already_owned' using errcode = '23505';
  end if;

  insert into public."Avatar" (
    "id", "name", "image", "description", "type", "hp", "attack",
    "defense", "price", "equipped", "userId", "createdAt", "updatedAt"
  ) values (
    p_avatar_id, p_name, p_image, p_description, p_type, p_hp, p_attack,
    p_defense, p_price, false, p_user_id, now(), now()
  ) returning * into v_avatar;

  update public."UserStatus"
     set "coin" = v_coin - p_price, "updatedAt" = now()
   where "userId" = p_user_id;

  return jsonb_build_object(
    'avatar', to_jsonb(v_avatar),
    'remainingCoin', v_coin - p_price
  );
end;
$$;

revoke execute on function public.purchase_item(text, text, text, text, text, text, integer, integer, integer) from public, anon, authenticated;
revoke execute on function public.purchase_avatar(text, uuid, text, text, text, text, integer, integer, integer, integer) from public, anon, authenticated;
revoke execute on function public.unlock_avatar(text, uuid, text, text, text, text, integer, integer, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.purchase_item(text, text, text, text, text, text, integer, integer, integer) to service_role;
grant execute on function public.purchase_avatar(text, uuid, text, text, text, text, integer, integer, integer, integer) to service_role;
grant execute on function public.unlock_avatar(text, uuid, text, text, text, text, integer, integer, integer, integer, integer) to service_role;
