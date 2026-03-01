-- ════════════════════════════════════════════════════════════
--  Wayfarer – Supabase / PostgreSQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── profiles ────────────────────────────────────────────────
-- Mirrors auth.users; auto-created via trigger on sign-up.

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  full_name       text not null default '',
  avatar_url      text,
  bio             text,
  trip_count      int  not null default 0,
  follower_count  int  not null default 0,
  following_count int  not null default 0,
  created_at      timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── trips ───────────────────────────────────────────────────

create table if not exists public.trips (
  id               uuid primary key default gen_random_uuid(),
  author_id        uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  location         text not null default '',
  country_emoji    text not null default '🌍',
  duration_days    int  not null default 1,
  cover_image_url  text,
  description      text,
  visibility       text not null default 'public' check (visibility in ('public','friends','private')),
  rating           numeric(3,1),   -- avg, recomputed by trigger
  rating_count     int  not null default 0,
  like_count       int  not null default 0,
  tags             text[] not null default '{}',
  lat              double precision,
  lng              double precision,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── days ────────────────────────────────────────────────────

create table if not exists public.days (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references public.trips(id) on delete cascade,
  day_number  int  not null,
  title       text not null default '',
  created_at  timestamptz not null default now(),
  unique (trip_id, day_number)
);

-- ─── activities ──────────────────────────────────────────────

create table if not exists public.activities (
  id         uuid primary key default gen_random_uuid(),
  day_id     uuid not null references public.days(id) on delete cascade,
  emoji      text not null default '📍',
  text       text not null,
  type       text not null default 'other'
             check (type in ('food','culture','outdoors','stay','night','transit','other')),
  notes      text,
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

-- ─── ratings ─────────────────────────────────────────────────

create table if not exists public.ratings (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references public.trips(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  score      int  not null check (score between 1 and 10),
  created_at timestamptz not null default now(),
  unique (trip_id, user_id)
);

-- Recompute trip.rating / rating_count after insert/update/delete
create or replace function public.update_trip_rating()
returns trigger language plpgsql security definer as $$
declare
  v_trip_id uuid;
begin
  v_trip_id := coalesce(new.trip_id, old.trip_id);
  update public.trips
  set
    rating       = (select round(avg(score)::numeric, 1) from public.ratings where trip_id = v_trip_id),
    rating_count = (select count(*)                      from public.ratings where trip_id = v_trip_id),
    updated_at   = now()
  where id = v_trip_id;
  return null;
end;
$$;

drop trigger if exists on_rating_change on public.ratings;
create trigger on_rating_change
  after insert or update or delete on public.ratings
  for each row execute procedure public.update_trip_rating();

-- ─── likes ───────────────────────────────────────────────────

create table if not exists public.likes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  trip_id    uuid not null references public.trips(id)    on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, trip_id)
);

-- Increment / decrement like_count on trips
create or replace function public.update_like_count()
returns trigger language plpgsql security definer as $$
begin
  if (tg_op = 'INSERT') then
    update public.trips set like_count = like_count + 1, updated_at = now() where id = new.trip_id;
  elsif (tg_op = 'DELETE') then
    update public.trips set like_count = greatest(like_count - 1, 0), updated_at = now() where id = old.trip_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_like_change on public.likes;
create trigger on_like_change
  after insert or delete on public.likes
  for each row execute procedure public.update_like_count();

-- ─── saves ───────────────────────────────────────────────────

create table if not exists public.saves (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  trip_id    uuid not null references public.trips(id)    on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, trip_id)
);

-- ─── follows ─────────────────────────────────────────────────

create table if not exists public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- Update follower / following counts
create or replace function public.update_follow_counts()
returns trigger language plpgsql security definer as $$
begin
  if (tg_op = 'INSERT') then
    update public.profiles set follower_count  = follower_count  + 1 where id = new.following_id;
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
  elsif (tg_op = 'DELETE') then
    update public.profiles set follower_count  = greatest(follower_count  - 1, 0) where id = old.following_id;
    update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_follow_change on public.follows;
create trigger on_follow_change
  after insert or delete on public.follows
  for each row execute procedure public.update_follow_counts();

-- ─── photos ──────────────────────────────────────────────────

create table if not exists public.photos (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references public.trips(id) on delete cascade,
  url        text not null,
  caption    text,
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════
--  Row-Level Security
-- ════════════════════════════════════════════════════════════

alter table public.profiles   enable row level security;
alter table public.trips      enable row level security;
alter table public.days       enable row level security;
alter table public.activities enable row level security;
alter table public.ratings    enable row level security;
alter table public.likes      enable row level security;
alter table public.saves      enable row level security;
alter table public.follows    enable row level security;
alter table public.photos     enable row level security;

-- ─── profiles policies ───────────────────────────────────────

create policy "profiles: public read"
  on public.profiles for select using (true);

create policy "profiles: own update"
  on public.profiles for update using (auth.uid() = id);

-- ─── trips policies ──────────────────────────────────────────

-- Public trips visible to everyone; friends-only trips visible to followers + author
create policy "trips: read public"
  on public.trips for select
  using (
    visibility = 'public'
    or author_id = auth.uid()
    or (
      visibility = 'friends'
      and exists (
        select 1 from public.follows
        where follower_id = auth.uid() and following_id = author_id
      )
    )
  );

create policy "trips: insert own"
  on public.trips for insert with check (auth.uid() = author_id);

create policy "trips: update own"
  on public.trips for update using (auth.uid() = author_id);

create policy "trips: delete own"
  on public.trips for delete using (auth.uid() = author_id);

-- ─── days policies ───────────────────────────────────────────

create policy "days: read if trip readable"
  on public.days for select
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id
      and (
        t.visibility = 'public'
        or t.author_id = auth.uid()
        or (t.visibility = 'friends' and exists (
          select 1 from public.follows f
          where f.follower_id = auth.uid() and f.following_id = t.author_id
        ))
      )
    )
  );

create policy "days: manage own trip"
  on public.days for all
  using (
    exists (select 1 from public.trips where id = trip_id and author_id = auth.uid())
  );

-- ─── activities policies ─────────────────────────────────────

create policy "activities: read if day readable"
  on public.activities for select
  using (
    exists (
      select 1 from public.days d
      join public.trips t on t.id = d.trip_id
      where d.id = day_id
      and (
        t.visibility = 'public'
        or t.author_id = auth.uid()
        or (t.visibility = 'friends' and exists (
          select 1 from public.follows f
          where f.follower_id = auth.uid() and f.following_id = t.author_id
        ))
      )
    )
  );

create policy "activities: manage own trip"
  on public.activities for all
  using (
    exists (
      select 1 from public.days d
      join public.trips t on t.id = d.trip_id
      where d.id = day_id and t.author_id = auth.uid()
    )
  );

-- ─── ratings policies ────────────────────────────────────────

create policy "ratings: public read"
  on public.ratings for select using (true);

create policy "ratings: authenticated insert/update"
  on public.ratings for insert with check (auth.uid() = user_id);

create policy "ratings: own update"
  on public.ratings for update using (auth.uid() = user_id);

create policy "ratings: own delete"
  on public.ratings for delete using (auth.uid() = user_id);

-- ─── likes, saves, follows policies ─────────────────────────

create policy "likes: public read"   on public.likes for select using (true);
create policy "likes: own write"     on public.likes for insert with check (auth.uid() = user_id);
create policy "likes: own delete"    on public.likes for delete using (auth.uid() = user_id);

create policy "saves: own read"      on public.saves for select using (auth.uid() = user_id);
create policy "saves: own write"     on public.saves for insert with check (auth.uid() = user_id);
create policy "saves: own delete"    on public.saves for delete using (auth.uid() = user_id);

create policy "follows: public read" on public.follows for select using (true);
create policy "follows: own write"   on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows: own delete"  on public.follows for delete using (auth.uid() = follower_id);

-- ─── photos policies ─────────────────────────────────────────

create policy "photos: read if trip readable"
  on public.photos for select
  using (
    exists (
      select 1 from public.trips t where t.id = trip_id
      and (t.visibility = 'public' or t.author_id = auth.uid())
    )
  );

create policy "photos: manage own"
  on public.photos for all
  using (
    exists (select 1 from public.trips where id = trip_id and author_id = auth.uid())
  );

-- ════════════════════════════════════════════════════════════
--  Indexes for performance
-- ════════════════════════════════════════════════════════════

create index if not exists idx_trips_author       on public.trips(author_id);
create index if not exists idx_trips_visibility   on public.trips(visibility);
create index if not exists idx_trips_created_at   on public.trips(created_at desc);
create index if not exists idx_days_trip          on public.days(trip_id);
create index if not exists idx_activities_day     on public.activities(day_id, position);
create index if not exists idx_ratings_trip       on public.ratings(trip_id);
create index if not exists idx_likes_trip         on public.likes(trip_id);
create index if not exists idx_saves_user         on public.saves(user_id);
create index if not exists idx_follows_follower   on public.follows(follower_id);
create index if not exists idx_follows_following  on public.follows(following_id);
create index if not exists idx_photos_trip        on public.photos(trip_id, position);

-- ════════════════════════════════════════════════════════════
--  Helpful view: feed (public trips, ordered by recency)
-- ════════════════════════════════════════════════════════════

create or replace view public.feed_trips as
select
  t.*,
  p.username         as author_username,
  p.full_name        as author_name,
  p.avatar_url       as author_avatar,
  p.trip_count       as author_trip_count,
  p.follower_count   as author_follower_count
from public.trips t
join public.profiles p on p.id = t.author_id
where t.visibility = 'public'
order by t.created_at desc;
