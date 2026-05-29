create extension if not exists "pgcrypto";

create table if not exists public.venues (
  id text primary key,
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  campus text,
  transit_notes text,
  parking_notes text,
  accessibility_notes text,
  map_link text
);

create table if not exists public.sponsors (
  id text primary key,
  slug text not null unique,
  name text not null,
  tier text not null,
  track text,
  description text not null,
  logo text not null,
  contact_links jsonb not null default '{}'::jsonb,
  featured_session_ids text[] not null default '{}'
);

create table if not exists public.speakers (
  id text primary key,
  name text not null,
  role text not null,
  company text not null,
  bio text not null,
  avatar text not null,
  email text,
  profile_id text references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id text primary key,
  auth_user_id uuid unique,
  email text unique,
  name text not null,
  role text not null,
  app_role text not null check (app_role in ('attendee', 'sponsor', 'host', 'admin')),
  company text not null,
  bio text not null,
  avatar text not null,
  interests text[] not null default '{}',
  is_discoverable boolean not null default true,
  visible_contact_fields text[] not null default '{}',
  contact_links jsonb not null default '{}'::jsonb,
  sponsor_id text references public.sponsors(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sessions (
  id text primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  day text not null check (day in ('mon', 'tue', 'wed', 'thu', 'fri')),
  start_time text not null,
  end_time text not null,
  venue_id text not null references public.venues(id) on delete restrict,
  room text not null,
  format text,
  audience text,
  sponsor_id text references public.sponsors(id) on delete set null,
  speaker_ids text[] not null default '{}',
  owner_profile_id text references public.profiles(id) on delete set null,
  source_submission_id text,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  is_sponsored boolean not null default false,
  capacity integer,
  attendee_count integer not null default 0,
  logistics_notes text,
  host_notes text,
  external_registration_url text,
  published_at timestamptz,
  last_schedule_change_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.sessions add column if not exists owner_profile_id text references public.profiles(id) on delete set null;
alter table public.sessions add column if not exists source_submission_id text;
alter table public.sessions add column if not exists format text;
alter table public.sessions add column if not exists audience text;
alter table public.sessions add column if not exists logistics_notes text;
alter table public.sessions add column if not exists host_notes text;
alter table public.sessions add column if not exists external_registration_url text;
alter table public.sessions add column if not exists published_at timestamptz;
alter table public.sessions add column if not exists last_schedule_change_at timestamptz;
alter table public.sessions add column if not exists created_at timestamptz default timezone('utc', now());
alter table public.sessions add column if not exists updated_at timestamptz default timezone('utc', now());
alter table public.speakers add column if not exists email text;
alter table public.speakers add column if not exists profile_id text references public.profiles(id) on delete set null;
alter table public.speakers add column if not exists created_at timestamptz default timezone('utc', now());
alter table public.speakers add column if not exists updated_at timestamptz default timezone('utc', now());
alter table public.profiles add column if not exists interests text[] not null default '{}';

create table if not exists public.saved_schedule (
  profile_id text not null references public.profiles(id) on delete cascade,
  session_id text not null references public.sessions(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (profile_id, session_id)
);

create table if not exists public.sponsor_events (
  id uuid primary key default gen_random_uuid(),
  sponsor_id text not null references public.sponsors(id) on delete cascade,
  profile_id text references public.profiles(id) on delete set null,
  event_type text not null check (event_type in ('profile_view', 'contact_click', 'session_view', 'map_pin_tap', 'cta_click')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.session_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions(id) on delete cascade,
  profile_id text references public.profiles(id) on delete set null,
  event_type text not null check (event_type in ('detail_view', 'save', 'remove')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.session_submissions (
  id text primary key,
  title text not null,
  submitter_name text not null,
  submitter_email text not null,
  submitter_profile_id text references public.profiles(id) on delete set null,
  company text not null,
  track text not null,
  format text not null,
  summary text not null,
  full_description text not null default '',
  intended_audience text not null default '',
  themes text[] not null default '{}',
  speaker_details text not null default '',
  logistics_needs text not null default '',
  submission_resources jsonb not null default '[]'::jsonb,
  requested_day text check (requested_day in ('mon', 'tue', 'wed', 'thu', 'fri')),
  status text not null check (status in ('submitted', 'needs_info', 'in_review', 'approved', 'rejected', 'scheduled')),
  internal_notes text not null default '',
  decision_note text not null default '',
  assigned_reviewer text,
  last_reviewed_at timestamptz,
  linked_session_id text references public.sessions(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.session_submissions add column if not exists submitter_profile_id text references public.profiles(id) on delete set null;
alter table public.session_submissions add column if not exists full_description text not null default '';
alter table public.session_submissions add column if not exists intended_audience text not null default '';
alter table public.session_submissions add column if not exists themes text[] not null default '{}';
alter table public.session_submissions add column if not exists speaker_details text not null default '';
alter table public.session_submissions add column if not exists logistics_needs text not null default '';
alter table public.session_submissions add column if not exists submission_resources jsonb not null default '[]'::jsonb;
alter table public.session_submissions add column if not exists internal_notes text not null default '';
alter table public.session_submissions add column if not exists decision_note text not null default '';
alter table public.session_submissions add column if not exists assigned_reviewer text;
alter table public.session_submissions add column if not exists last_reviewed_at timestamptz;
alter table public.session_submissions add column if not exists linked_session_id text references public.sessions(id) on delete set null;

alter table public.sessions
  drop constraint if exists sessions_source_submission_id_fkey;
alter table public.sessions
  add constraint sessions_source_submission_id_fkey
  foreign key (source_submission_id) references public.session_submissions(id) on delete set null;

alter table public.session_submissions
  drop constraint if exists session_submissions_status_check;
alter table public.session_submissions
  add constraint session_submissions_status_check
  check (status in ('submitted', 'needs_info', 'in_review', 'approved', 'rejected', 'scheduled'));

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'session_submissions'
      and column_name = 'notes'
  ) then
    execute 'update public.session_submissions set internal_notes = notes where coalesce(internal_notes, '''') = ''''';
  end if;
end
$$;

create table if not exists public.schedule_controls (
  id text primary key,
  is_published boolean not null default false,
  locked_at timestamptz,
  published_at timestamptz,
  announcement text not null default '',
  release_version integer not null default 1,
  has_unpublished_changes boolean not null default false,
  last_published_by text,
  last_edited_at timestamptz
);

alter table public.schedule_controls add column if not exists release_version integer not null default 1;
alter table public.schedule_controls add column if not exists has_unpublished_changes boolean not null default false;
alter table public.schedule_controls add column if not exists last_published_by text;
alter table public.schedule_controls add column if not exists last_edited_at timestamptz;

create table if not exists public.attachments (
  id text primary key,
  owner_type text not null check (owner_type in ('session', 'sponsor')),
  owner_id text not null,
  title text not null,
  kind text not null check (kind in ('file', 'link')),
  url text not null,
  file_name text,
  mime_type text,
  visibility text not null check (visibility in ('public', 'internal')),
  featured boolean not null default false,
  uploaded_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.schedule_changes (
  id text primary key,
  session_id text not null references public.sessions(id) on delete cascade,
  release_version integer not null default 0,
  change_type text not null check (change_type in ('time', 'venue', 'room', 'title', 'description', 'status', 'materials')),
  summary text not null,
  is_published boolean not null default false,
  created_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_sessions_updated_at on public.sessions;
create trigger set_sessions_updated_at
before update on public.sessions
for each row
execute function public.set_updated_at();

drop trigger if exists set_speakers_updated_at on public.speakers;
create trigger set_speakers_updated_at
before update on public.speakers
for each row
execute function public.set_updated_at();

alter table public.venues enable row level security;
alter table public.sponsors enable row level security;
alter table public.speakers enable row level security;
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.saved_schedule enable row level security;
alter table public.sponsor_events enable row level security;
alter table public.session_events enable row level security;
alter table public.session_submissions enable row level security;
alter table public.schedule_controls enable row level security;
alter table public.attachments enable row level security;
alter table public.schedule_changes enable row level security;

drop policy if exists "public read venues" on public.venues;
create policy "public read venues"
on public.venues for select
to anon, authenticated
using (true);

drop policy if exists "public read sponsors" on public.sponsors;
create policy "public read sponsors"
on public.sponsors for select
to anon, authenticated
using (true);

drop policy if exists "public read speakers" on public.speakers;
create policy "public read speakers"
on public.speakers for select
to anon, authenticated
using (true);

drop policy if exists "authenticated can update speakers" on public.speakers;
create policy "authenticated can update speakers"
on public.speakers for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and (
        profiles.app_role in ('admin', 'host')
        or profiles.id = speakers.profile_id
        or lower(coalesce(speakers.email, '')) = lower(profiles.email)
      )
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and (
        profiles.app_role in ('admin', 'host')
        or profiles.id = speakers.profile_id
        or lower(coalesce(speakers.email, '')) = lower(profiles.email)
      )
  )
);

drop policy if exists "public read sessions" on public.sessions;
create policy "public read sessions"
on public.sessions for select
to anon, authenticated
using (true);

drop policy if exists "session owner can update limited fields" on public.sessions;
create policy "session owner can update limited fields"
on public.sessions for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = sessions.owner_profile_id
      and profiles.email = auth.jwt() ->> 'email'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = sessions.owner_profile_id
      and profiles.email = auth.jwt() ->> 'email'
  )
);

drop policy if exists "public read discoverable profiles" on public.profiles;
create policy "public read discoverable profiles"
on public.profiles for select
to anon, authenticated
using (is_discoverable or auth.jwt() ->> 'email' = email);

drop policy if exists "profile owner can update profile" on public.profiles;
create policy "profile owner can update profile"
on public.profiles for update
to authenticated
using (auth.jwt() ->> 'email' = email)
with check (auth.jwt() ->> 'email' = email);

drop policy if exists "profile owner can insert self" on public.profiles;
create policy "profile owner can insert self"
on public.profiles for insert
to authenticated
with check (auth.jwt() ->> 'email' = email);

drop policy if exists "profile owner can read saved schedule" on public.saved_schedule;
create policy "profile owner can read saved schedule"
on public.saved_schedule for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = saved_schedule.profile_id
      and profiles.email = auth.jwt() ->> 'email'
  )
);

drop policy if exists "profile owner can write saved schedule" on public.saved_schedule;
create policy "profile owner can write saved schedule"
on public.saved_schedule for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = saved_schedule.profile_id
      and profiles.email = auth.jwt() ->> 'email'
  )
);

drop policy if exists "profile owner can delete saved schedule" on public.saved_schedule;
create policy "profile owner can delete saved schedule"
on public.saved_schedule for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = saved_schedule.profile_id
      and profiles.email = auth.jwt() ->> 'email'
  )
);

drop policy if exists "public can log sponsor events" on public.sponsor_events;
create policy "public can log sponsor events"
on public.sponsor_events for insert
to anon, authenticated
with check (
  profile_id is null
  or exists (
    select 1
    from public.profiles
    where profiles.id = sponsor_events.profile_id
      and profiles.email = auth.jwt() ->> 'email'
  )
);

drop policy if exists "authenticated can read sponsor events" on public.sponsor_events;
create policy "authenticated can read sponsor events"
on public.sponsor_events for select
to authenticated
using (true);

drop policy if exists "public can log session events" on public.session_events;
create policy "public can log session events"
on public.session_events for insert
to anon, authenticated
with check (
  profile_id is null
  or exists (
    select 1
    from public.profiles
    where profiles.id = session_events.profile_id
      and profiles.email = auth.jwt() ->> 'email'
  )
);

drop policy if exists "authenticated can manage submissions" on public.session_submissions;

drop policy if exists "staff can read submissions" on public.session_submissions;
create policy "staff can read submissions"
on public.session_submissions for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and profiles.app_role = 'admin'
  )
);

drop policy if exists "staff can update submissions" on public.session_submissions;
create policy "staff can update submissions"
on public.session_submissions for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and profiles.app_role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and profiles.app_role = 'admin'
  )
);

drop policy if exists "staff can delete submissions" on public.session_submissions;
create policy "staff can delete submissions"
on public.session_submissions for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and profiles.app_role = 'admin'
  )
);

drop policy if exists "public can submit sessions" on public.session_submissions;
create policy "public can submit sessions"
on public.session_submissions for insert
to anon, authenticated
with check (
  char_length(trim(title)) > 0
  and char_length(trim(submitter_name)) > 0
  and char_length(trim(submitter_email)) > 3
  and position('@' in submitter_email) > 1
  and char_length(trim(company)) > 0
  and char_length(trim(track)) > 0
  and char_length(trim(format)) > 0
  and char_length(trim(summary)) > 0
  and char_length(trim(full_description)) > 0
  and char_length(trim(intended_audience)) > 0
  and char_length(trim(speaker_details)) > 0
);

drop policy if exists "authenticated can read schedule controls" on public.schedule_controls;
create policy "authenticated can read schedule controls"
on public.schedule_controls for select
to authenticated
using (true);

drop policy if exists "authenticated can update schedule controls" on public.schedule_controls;
create policy "authenticated can update schedule controls"
on public.schedule_controls for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and profiles.app_role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and profiles.app_role = 'admin'
  )
);

drop policy if exists "public read attachments" on public.attachments;
create policy "public read attachments"
on public.attachments for select
to anon, authenticated
using (visibility = 'public' or exists (
  select 1
  from public.profiles
  where profiles.email = auth.jwt() ->> 'email'
    and profiles.app_role in ('admin', 'host', 'sponsor')
));

drop policy if exists "staff can manage attachments" on public.attachments;
create policy "staff can manage attachments"
on public.attachments for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and profiles.app_role in ('admin', 'host', 'sponsor')
  )
);

drop policy if exists "staff can delete attachments" on public.attachments;
create policy "staff can delete attachments"
on public.attachments for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and profiles.app_role in ('admin', 'host', 'sponsor')
  )
);

drop policy if exists "authenticated read schedule changes" on public.schedule_changes;
create policy "authenticated read schedule changes"
on public.schedule_changes for select
to authenticated
using (true);

drop policy if exists "staff write schedule changes" on public.schedule_changes;
create policy "staff write schedule changes"
on public.schedule_changes for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and profiles.app_role in ('admin', 'host', 'sponsor')
  )
);

drop policy if exists "admin update schedule changes" on public.schedule_changes;
create policy "admin update schedule changes"
on public.schedule_changes for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and profiles.app_role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.email = auth.jwt() ->> 'email'
      and profiles.app_role = 'admin'
  )
);
