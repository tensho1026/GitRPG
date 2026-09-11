alter table public."UserStatus"
  add column if not exists "lastSyncAt" timestamptz;

alter table public."UserStatus"
  add column if not exists "syncStartedAt" timestamptz;

alter table public."UserStatus"
  add column if not exists "syncStatus" text not null default 'idle';

alter table public."UserStatus"
  add column if not exists "syncError" text;

create index if not exists user_status_sync_lookup
  on public."UserStatus" ("userId", "syncStatus", "lastSyncAt");

alter table public."UserStatus"
  drop constraint if exists user_status_sync_status_check;

alter table public."UserStatus"
  add constraint user_status_sync_status_check
  check ("syncStatus" in ('idle', 'syncing', 'success', 'error'));
