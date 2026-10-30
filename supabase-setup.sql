-- ============================================================
-- ApplyPilot – Supabase setup (Stages 3–7)
-- Run FULL script in SQL Editor (safe to re-run)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, country text, profession text,
  preferred_categories text[] default '{}',
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id text not null, title text not null, company text not null, url text not null,
  source text, location_raw text, eligibility text, job_type text, salary text, published_at text,
  saved_at timestamptz default now(), unique (user_id, job_id)
);
alter table public.saved_jobs enable row level security;
drop policy if exists "Users manage own saved jobs" on public.saved_jobs;
create policy "Users manage own saved jobs" on public.saved_jobs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id text, title text not null, company text not null, url text,
  status text not null default 'interested'
    check (status in ('interested','preparing','applied','interview','rejected','offer')),
  applied_at date, follow_up_at date, interview_at date, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.applications enable row level security;
drop policy if exists "Users manage own applications" on public.applications;
create policy "Users manage own applications" on public.applications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'My CV', template text not null default 'classic',
  data jsonb not null default '{}',
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.cvs enable row level security;
drop policy if exists "Users manage own cvs" on public.cvs;
create policy "Users manage own cvs" on public.cvs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Cover letter', job_title text, company text,
  content text not null default '', tone text default 'professional',
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.cover_letters enable row level security;
drop policy if exists "Users manage own cover letters" on public.cover_letters;
create policy "Users manage own cover letters" on public.cover_letters for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.interview_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null, question_text text not null,
  answer text default '', notes text default '',
  updated_at timestamptz default now(),
  unique (user_id, question_id)
);
alter table public.interview_notes enable row level security;
drop policy if exists "Users manage own interview notes" on public.interview_notes;
create policy "Users manage own interview notes" on public.interview_notes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SAVED SEARCHES / ALERTS (Stage 7)
create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My search',
  keywords text default '',
  category text default '',
  job_type text default '',
  eligibility text default '',
  active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.saved_searches enable row level security;
drop policy if exists "Users manage own saved searches" on public.saved_searches;
create policy "Users manage own saved searches" on public.saved_searches for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.job_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  search_id uuid references public.saved_searches(id) on delete cascade,
  job_id text not null,
  title text not null,
  company text not null,
  url text not null,
  source text,
  read boolean not null default false,
  created_at timestamptz default now(),
  unique (user_id, job_id)
);
alter table public.job_alerts enable row level security;
drop policy if exists "Users manage own job alerts" on public.job_alerts;
create policy "Users manage own job alerts" on public.job_alerts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant all on public.profiles to authenticated;
grant select on public.profiles to anon;
grant all on public.saved_jobs, public.applications, public.cvs, public.cover_letters,
  public.interview_notes, public.saved_searches, public.job_alerts to authenticated;
