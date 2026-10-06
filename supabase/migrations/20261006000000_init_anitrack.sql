-- =============================================================================
-- AniTrack — initial schema
-- Tables: profiles, user_anime_list
-- RLS: public read, owner-only write
-- Triggers: auto-create profile on signup, auto-touch updated_at
-- =============================================================================
-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);
comment on table public.profiles is 'Public user profile, 1:1 with auth.users.';
-- -----------------------------------------------------------------------------
-- user_anime_list
-- -----------------------------------------------------------------------------
create table if not exists public.user_anime_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  media_id integer not null,
  title text not null,
  cover_image text,
  total_episodes integer check (
    total_episodes is null
    or total_episodes >= 0
  ),
  status text not null default 'PLANNING' check (
    status in (
      'CURRENT',
      'COMPLETED',
      'PAUSED',
      'DROPPED',
      'PLANNING'
    )
  ),
  progress integer not null default 0 check (progress >= 0),
  score numeric(3, 1) check (
    score >= 0
    and score <= 10
  ),
  notes text,
  updated_at timestamptz not null default now(),
  constraint user_anime_list_user_media_unique unique (user_id, media_id),
  -- Progress can never exceed a known episode count
  constraint user_anime_list_progress_lte_total check (
    total_episodes is null
    or progress <= total_episodes
  )
);
comment on table public.user_anime_list is 'Per-user anime tracking entries (AniList media cached locally).';
create index if not exists user_anime_list_user_id_idx on public.user_anime_list (user_id);
create index if not exists user_anime_list_user_status_updated_idx on public.user_anime_list (user_id, status, updated_at desc);
-- -----------------------------------------------------------------------------
-- updated_at auto-touch
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger language plpgsql
set search_path = '' as $$ begin new.updated_at := now();
return new;
end;
$$;
drop trigger if exists user_anime_list_touch_updated_at on public.user_anime_list;
create trigger user_anime_list_touch_updated_at before
update on public.user_anime_list for each row execute function public.touch_updated_at();
-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_anime_list enable row level security;
-- profiles: anyone may read, only the owner may write
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for
select to anon,
  authenticated using (true);
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for
insert to authenticated with check (
    (
      select auth.uid()
    ) = id
  );
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for
update to authenticated using (
    (
      select auth.uid()
    ) = id
  ) with check (
    (
      select auth.uid()
    ) = id
  );
drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile" on public.profiles for delete to authenticated using (
  (
    select auth.uid()
  ) = id
);
-- user_anime_list: lists are public, writes are owner-only
drop policy if exists "Anime lists are viewable by everyone" on public.user_anime_list;
create policy "Anime lists are viewable by everyone" on public.user_anime_list for
select to anon,
  authenticated using (true);
drop policy if exists "Users can insert their own list entries" on public.user_anime_list;
create policy "Users can insert their own list entries" on public.user_anime_list for
insert to authenticated with check (
    (
      select auth.uid()
    ) = user_id
  );
drop policy if exists "Users can update their own list entries" on public.user_anime_list;
create policy "Users can update their own list entries" on public.user_anime_list for
update to authenticated using (
    (
      select auth.uid()
    ) = user_id
  ) with check (
    (
      select auth.uid()
    ) = user_id
  );
drop policy if exists "Users can delete their own list entries" on public.user_anime_list;
create policy "Users can delete their own list entries" on public.user_anime_list for delete to authenticated using (
  (
    select auth.uid()
  ) = user_id
);
-- -----------------------------------------------------------------------------
-- Auto-create profile on signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer
set search_path = '' as $$
declare base_username text;
final_username text;
begin base_username := coalesce(
  nullif(trim(new.raw_user_meta_data->>'username'), ''),
  split_part(new.email, '@', 1),
  'user'
);
final_username := base_username;
-- Resolve collisions by suffixing part of the UUID
if exists (
  select 1
  from public.profiles
  where username = final_username
) then final_username := base_username || '_' || substr(replace(new.id::text, '-', ''), 1, 6);
end if;
insert into public.profiles (id, username, avatar_url)
values (
    new.id,
    final_username,
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;
return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after
insert on auth.users for each row execute function public.handle_new_user();