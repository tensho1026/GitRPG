alter table public."UserStatus"
  add column if not exists "experience" integer not null default 0;

create table if not exists public."GameStages" (
  "id" integer primary key,
  "name" text not null,
  "totalBattles" integer not null check ("totalBattles" > 0),
  "theme" text not null
);

create table if not exists public."GameMonsters" (
  "id" text primary key,
  "stageId" integer not null references public."GameStages" ("id"),
  "position" integer not null check ("position" > 0),
  "name" text not null,
  "level" integer not null check ("level" > 0),
  "hp" integer not null check ("hp" > 0),
  "attack" integer not null check ("attack" >= 0),
  "defense" integer not null check ("defense" >= 0),
  "image" text not null,
  "experience" integer not null check ("experience" >= 0),
  "coins" integer not null check ("coins" >= 0),
  unique ("stageId", "position")
);

create table if not exists public."BattleProgress" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" text not null references public."Users" ("id") on delete cascade,
  "stageId" integer not null references public."GameStages" ("id"),
  "battleNumber" integer not null check ("battleNumber" > 0),
  "monsterId" text not null references public."GameMonsters" ("id"),
  "monsterHp" integer not null check ("monsterHp" >= 0),
  "playerHp" integer not null check ("playerHp" >= 0),
  "playerMaxHp" integer not null check ("playerMaxHp" > 0),
  "playerAttack" integer not null check ("playerAttack" >= 0),
  "playerDefense" integer not null check ("playerDefense" >= 0),
  "status" text not null default 'active'
    check ("status" in ('active', 'won', 'lost', 'completed')),
  "rewardClaimed" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create unique index if not exists battle_progress_one_per_user
  on public."BattleProgress" ("userId");

insert into public."GameStages" ("id", "name", "totalBattles", "theme")
values
  (1, '森の入り口', 3, 'forest'),
  (2, '氷の洞窟', 3, 'ice'),
  (3, '魔王城', 1, 'castle')
on conflict ("id") do nothing;

insert into public."GameMonsters"
  ("id", "stageId", "position", "name", "level", "hp", "attack", "defense", "image", "experience", "coins")
values
  ('slime', 1, 1, 'スライム', 3, 80, 25, 10, '/spark.png', 15, 30),
  ('goblin', 1, 2, 'ゴブリン', 5, 110, 30, 14, '/forest.png', 25, 45),
  ('wolf', 1, 3, 'ウルフ', 7, 145, 38, 18, '/dark.jpeg', 40, 65),
  ('ice-golem', 2, 1, 'アイスゴーレム', 10, 210, 48, 25, '/ice.png', 60, 90),
  ('frost-mage', 2, 2, 'フロストメイジ', 12, 180, 58, 20, '/masic.png', 75, 110),
  ('ice-dragon', 2, 3, '氷竜', 15, 280, 72, 32, '/ice.png', 110, 160),
  ('dark-lord', 3, 1, 'ダークロード', 20, 420, 95, 45, '/dark.jpeg', 250, 400)
on conflict ("id") do nothing;

create or replace function public.start_battle(
  p_user_id text,
  p_player_max_hp integer,
  p_player_attack integer,
  p_player_defense integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_progress public."BattleProgress";
  v_monster public."GameMonsters";
  v_stage public."GameStages";
  v_next_stage public."GameStages";
begin
  if p_user_id is null or p_user_id = '' or p_player_max_hp is null or p_player_max_hp < 1 then
    raise exception 'invalid_battle_request' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id || ':battle', 0));

  select * into v_progress
    from public."BattleProgress"
   where "userId" = p_user_id
   for update;

  if not found then
    select * into v_monster
      from public."GameMonsters"
     where "stageId" = 1 and "position" = 1;
    insert into public."BattleProgress" (
      "userId", "stageId", "battleNumber", "monsterId", "monsterHp",
      "playerHp", "playerMaxHp", "playerAttack", "playerDefense", "status"
    ) values (
      p_user_id, 1, 1, v_monster."id", v_monster."hp",
      p_player_max_hp, p_player_max_hp, p_player_attack, p_player_defense, 'active'
    ) returning * into v_progress;
  elsif v_progress."status" = 'won' then
    select * into v_stage from public."GameStages" where "id" = v_progress."stageId";
    if v_progress."battleNumber" < v_stage."totalBattles" then
      v_progress."battleNumber" := v_progress."battleNumber" + 1;
    else
      select * into v_next_stage
        from public."GameStages"
       where "id" > v_progress."stageId"
       order by "id"
       limit 1;
      if not found then
        update public."BattleProgress"
           set "status" = 'completed', "updatedAt" = now()
         where "id" = v_progress."id";
        v_progress."status" := 'completed';
      else
        v_progress."stageId" := v_next_stage."id";
        v_progress."battleNumber" := 1;
      end if;
    end if;

    if v_progress."status" <> 'completed' then
      select * into v_monster
        from public."GameMonsters"
       where "stageId" = v_progress."stageId"
         and "position" = v_progress."battleNumber";
      update public."BattleProgress"
         set "monsterId" = v_monster."id",
             "monsterHp" = v_monster."hp",
             "playerHp" = p_player_max_hp,
             "playerMaxHp" = p_player_max_hp,
             "playerAttack" = p_player_attack,
             "playerDefense" = p_player_defense,
             "status" = 'active',
             "rewardClaimed" = false,
             "updatedAt" = now()
       where "id" = v_progress."id"
      returning * into v_progress;
    end if;
  elsif v_progress."status" = 'lost' then
    select * into v_monster
      from public."GameMonsters"
     where "id" = v_progress."monsterId";
    update public."BattleProgress"
       set "monsterHp" = v_monster."hp",
           "playerHp" = p_player_max_hp,
           "playerMaxHp" = p_player_max_hp,
           "playerAttack" = p_player_attack,
           "playerDefense" = p_player_defense,
           "status" = 'active',
           "rewardClaimed" = false,
           "updatedAt" = now()
     where "id" = v_progress."id"
    returning * into v_progress;
  else
    update public."BattleProgress"
       set "playerMaxHp" = p_player_max_hp,
           "playerAttack" = p_player_attack,
           "playerDefense" = p_player_defense,
           "playerHp" = least("playerHp", p_player_max_hp),
           "updatedAt" = now()
     where "id" = v_progress."id"
    returning * into v_progress;
  end if;

  select * into v_stage
    from public."GameStages"
   where "id" = v_progress."stageId";
  select * into v_monster
    from public."GameMonsters"
   where "id" = v_progress."monsterId";

  return jsonb_build_object(
    'battle', jsonb_build_object(
      'id', v_progress."id",
      'stageId', v_progress."stageId",
      'stageName', v_stage."name",
      'battleNumber', v_progress."battleNumber",
      'totalBattles', v_stage."totalBattles",
      'theme', v_stage."theme",
      'status', v_progress."status"
    ),
    'player', jsonb_build_object(
      'hp', v_progress."playerHp",
      'maxHp', v_progress."playerMaxHp",
      'attack', v_progress."playerAttack",
      'defense', v_progress."playerDefense"
    ),
    'monster', jsonb_build_object(
      'id', v_monster."id",
      'name', v_monster."name",
      'level', v_monster."level",
      'hp', v_progress."monsterHp",
      'maxHp', v_monster."hp",
      'attack', v_monster."attack",
      'defense', v_monster."defense",
      'image', v_monster."image",
      'experience', v_monster."experience",
      'coins', v_monster."coins"
    )
  );
end;
$$;

create or replace function public.attack_battle(
  p_user_id text,
  p_battle_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_progress public."BattleProgress";
  v_monster public."GameMonsters";
  v_player_damage integer;
  v_monster_damage integer := 0;
  v_player_hp integer;
  v_monster_hp integer;
  v_result text := 'active';
  v_reward_coins integer := 0;
  v_reward_experience integer := 0;
begin
  if p_user_id is null or p_user_id = '' or p_battle_id is null then
    raise exception 'invalid_battle_request' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id || ':battle', 0));

  select * into v_progress
    from public."BattleProgress"
   where "id" = p_battle_id and "userId" = p_user_id
   for update;
  if not found then
    raise exception 'battle_not_found' using errcode = 'P0002';
  end if;
  if v_progress."status" <> 'active' then
    raise exception 'battle_is_not_active' using errcode = 'P0001';
  end if;

  select * into v_monster
    from public."GameMonsters"
   where "id" = v_progress."monsterId";

  v_player_damage := greatest(
    1,
    floor(greatest(1, v_progress."playerAttack" - v_monster."defense")
      * (0.8 + random() * 0.4))::integer
  );
  v_monster_hp := greatest(0, v_progress."monsterHp" - v_player_damage);

  if v_monster_hp = 0 then
    v_result := 'won';
    v_reward_coins := v_monster."coins";
    v_reward_experience := v_monster."experience";
    update public."UserStatus"
       set "coin" = "coin" + v_reward_coins,
           "experience" = "experience" + v_reward_experience,
           "updatedAt" = now()
     where "userId" = p_user_id;
    update public."BattleProgress"
       set "monsterHp" = 0,
           "status" = 'won',
           "rewardClaimed" = true,
           "updatedAt" = now()
     where "id" = p_battle_id
    returning * into v_progress;
  else
    v_monster_damage := greatest(
      1,
      floor(greatest(1, v_monster."attack" - v_progress."playerDefense")
        * (0.8 + random() * 0.4))::integer
    );
    v_player_hp := greatest(0, v_progress."playerHp" - v_monster_damage);
    v_result := case when v_player_hp = 0 then 'lost' else 'active' end;
    update public."BattleProgress"
       set "monsterHp" = v_monster_hp,
           "playerHp" = v_player_hp,
           "status" = v_result,
           "updatedAt" = now()
     where "id" = p_battle_id
    returning * into v_progress;
  end if;

  return jsonb_build_object(
    'battle', jsonb_build_object(
      'id', v_progress."id",
      'stageId', v_progress."stageId",
      'battleNumber', v_progress."battleNumber",
      'status', v_progress."status"
    ),
    'player', jsonb_build_object(
      'hp', v_progress."playerHp",
      'maxHp', v_progress."playerMaxHp",
      'attack', v_progress."playerAttack",
      'defense', v_progress."playerDefense"
    ),
    'monster', jsonb_build_object(
      'id', v_monster."id",
      'name', v_monster."name",
      'level', v_monster."level",
      'hp', v_progress."monsterHp",
      'maxHp', v_monster."hp",
      'attack', v_monster."attack",
      'defense', v_monster."defense",
      'image', v_monster."image",
      'experience', v_monster."experience",
      'coins', v_monster."coins"
    ),
    'result', v_result,
    'playerDamage', v_player_damage,
    'monsterDamage', v_monster_damage,
    'reward', jsonb_build_object(
      'coins', v_reward_coins,
      'experience', v_reward_experience
    )
  );
end;
$$;

revoke execute on function public.start_battle(text, integer, integer, integer) from public, anon, authenticated;
revoke execute on function public.attack_battle(text, uuid) from public, anon, authenticated;
grant execute on function public.start_battle(text, integer, integer, integer) to service_role;
grant execute on function public.attack_battle(text, uuid) to service_role;
