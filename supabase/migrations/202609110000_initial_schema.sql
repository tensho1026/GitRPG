-- Initial application schema for Neon Postgres.
-- The original database had these tables outside the repository, which is why
-- the later migrations reference them.

create extension if not exists pgcrypto;

create table if not exists public."Users" (
  "id" text primary key,
  "name" text not null,
  "image" text not null default '',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."UserStatus" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" text not null unique references public."Users" ("id") on delete cascade,
  "level" integer not null default 1 check ("level" >= 1),
  "commit" integer not null default 0 check ("commit" >= 0),
  "coin" integer not null default 100 check ("coin" >= 0),
  "hp" integer not null default 100 check ("hp" >= 0),
  "attack" integer not null default 10 check ("attack" >= 0),
  "defense" integer not null default 5 check ("defense" >= 0),
  "selectedAvatar" text,
  "unlockedAvatars" jsonb not null default '["warrior"]'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."Items" (
  "id" uuid primary key default gen_random_uuid(),
  "equipmentId" text not null,
  "name" text not null,
  "image" text not null,
  "description" text not null,
  "type" text not null,
  "attack" integer,
  "defense" integer,
  "price" integer not null check ("price" >= 0),
  "equipped" boolean not null default false,
  "userId" text not null references public."Users" ("id") on delete cascade,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."Avatar" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "image" text not null,
  "description" text not null,
  "type" text not null,
  "hp" integer,
  "attack" integer,
  "defense" integer,
  "price" integer not null check ("price" >= 0),
  "equipped" boolean not null default false,
  "userId" text not null references public."Users" ("id") on delete cascade,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists users_name_lookup
  on public."Users" ("name");

create index if not exists items_user_lookup
  on public."Items" ("userId", "createdAt" desc);

create index if not exists avatar_user_lookup
  on public."Avatar" ("userId", "createdAt" desc);
