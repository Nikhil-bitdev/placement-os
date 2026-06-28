-- Run this in your Supabase SQL editor (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  college text,
  batch text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- 3. Tasks
create table tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  category text not null default 'DSA',
  date text not null,
  start_time text not null default '',
  end_time text not null default '',
  status text not null default 'pending',
  priority text not null default 'medium',
  difficulty text not null default 'medium',
  notes text not null default '',
  "order" integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index tasks_user_date_idx on tasks(user_id, date);
alter table tasks enable row level security;

create policy "Users can view own tasks"
  on tasks for select using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on tasks for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on tasks for update using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on tasks for delete using (auth.uid() = user_id);

-- 4. DSA Progress
create table dsa_progress (
  problem_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'unsolved',
  completed_at timestamptz,
  notes text default '',
  primary key (problem_id, user_id)
);

alter table dsa_progress enable row level security;

create policy "Users can view own dsa progress"
  on dsa_progress for select using (auth.uid() = user_id);

create policy "Users can upsert own dsa progress"
  on dsa_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own dsa progress"
  on dsa_progress for update using (auth.uid() = user_id);

create policy "Users can delete own dsa progress"
  on dsa_progress for delete using (auth.uid() = user_id);

-- 5. Roadmap Progress
create table roadmap_progress (
  tech_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'locked',
  completion_date timestamptz,
  notes text default '',
  primary key (tech_id, user_id)
);

alter table roadmap_progress enable row level security;

create policy "Users can view own roadmap progress"
  on roadmap_progress for select using (auth.uid() = user_id);

create policy "Users can upsert own roadmap progress"
  on roadmap_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own roadmap progress"
  on roadmap_progress for update using (auth.uid() = user_id);

create policy "Users can delete own roadmap progress"
  on roadmap_progress for delete using (auth.uid() = user_id);

-- 6. Core Subjects Progress
create table core_subjects_progress (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  completed boolean default false,
  hours_studied real default 0,
  notes text default '',
  completed_at timestamptz,
  primary key (id, user_id)
);

alter table core_subjects_progress enable row level security;

create policy "Users can view own core subjects progress"
  on core_subjects_progress for select using (auth.uid() = user_id);

create policy "Users can upsert own core subjects progress"
  on core_subjects_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own core subjects progress"
  on core_subjects_progress for update using (auth.uid() = user_id);

create policy "Users can delete own core subjects progress"
  on core_subjects_progress for delete using (auth.uid() = user_id);

-- 7. Pomodoro Sessions
create table pomodoro_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text,
  duration_minutes integer not null,
  type text not null default 'focus',
  completed_at timestamptz not null default now()
);

create index pomodoro_sessions_user_idx on pomodoro_sessions(user_id, completed_at desc);
alter table pomodoro_sessions enable row level security;

create policy "Users can view own pomodoro sessions"
  on pomodoro_sessions for select using (auth.uid() = user_id);

create policy "Users can insert own pomodoro sessions"
  on pomodoro_sessions for insert with check (auth.uid() = user_id);

-- 8. Gamification (one row per user)
create table gamification (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  coins integer not null default 0,
  updated_at timestamptz default now()
);

alter table gamification enable row level security;

create policy "Users can view own gamification"
  on gamification for select using (auth.uid() = user_id);

create policy "Users can upsert own gamification"
  on gamification for insert with check (auth.uid() = user_id);

create policy "Users can update own gamification"
  on gamification for update using (auth.uid() = user_id);

-- 9. LeetCode Cache (one row per user)
create table leetcode_cache (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text,
  stats jsonb default '{}',
  activity jsonb default '[]',
  full_state jsonb default '{}',
  last_synced timestamptz,
  updated_at timestamptz default now()
);

alter table leetcode_cache enable row level security;

create policy "Users can view own leetcode cache"
  on leetcode_cache for select using (auth.uid() = user_id);

create policy "Users can upsert own leetcode cache"
  on leetcode_cache for insert with check (auth.uid() = user_id);

create policy "Users can update own leetcode cache"
  on leetcode_cache for update using (auth.uid() = user_id);

-- 10. Activity Log (for Recent Activity feed)
create table activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  description text not null,
  created_at timestamptz default now()
);

create index activity_log_user_idx on activity_log(user_id, created_at desc);
alter table activity_log enable row level security;

create policy "Users can view own activity log"
  on activity_log for select using (auth.uid() = user_id);

create policy "Users can insert own activity log"
  on activity_log for insert with check (auth.uid() = user_id);

-- 11. Auto-create profile on signup & auto-confirm email
create or replace function handle_new_user()
returns trigger as $$
begin
  update auth.users set email_confirmed_at = now() where id = new.id;
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Student'));
  insert into public.gamification (user_id, xp, level, streak, coins)
  values (new.id, 0, 1, 0, 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================
-- COLUMN ADDITIONS (run as ALTER or add to schema)
-- =============================================

-- profiles: add quick_notes and identity_skipped
alter table profiles add column if not exists quick_notes text default '';
alter table profiles add column if not exists identity_skipped boolean default false;

-- dsa_progress: add missing store fields
alter table dsa_progress add column if not exists attempts integer default 0;
alter table dsa_progress add column if not exists favorite boolean default false;
alter table dsa_progress add column if not exists revision_status text default 'new';
alter table dsa_progress add column if not exists time_taken integer default 0;

-- roadmap_progress: add missing store fields
alter table roadmap_progress add column if not exists hours_spent real default 0;
alter table roadmap_progress add column if not exists mini_projects jsonb default '[]';
alter table roadmap_progress add column if not exists main_project text default '';
alter table roadmap_progress add column if not exists revision_count integer default 0;
alter table roadmap_progress add column if not exists confidence integer default 1;
alter table roadmap_progress add column if not exists estimated_remaining_hours integer default 0;

-- core_subjects_progress: store the deeply nested data as jsonb (topics + interview questions)
alter table core_subjects_progress add column if not exists status text default 'not-started';
alter table core_subjects_progress add column if not exists chapters_completed integer default 0;
alter table core_subjects_progress add column if not exists total_chapters integer default 0;
alter table core_subjects_progress add column if not exists last_studied timestamptz;
alter table core_subjects_progress add column if not exists interview_readiness integer default 0;
alter table core_subjects_progress add column if not exists topics jsonb default '[]';

-- gamification: add achievements array
alter table gamification add column if not exists achievements jsonb default '[]';

-- =============================================
-- NEW TABLE: dsa_pattern_progress
-- =============================================
create table if not exists dsa_pattern_progress (
  pattern_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  solved boolean default false,
  completed_at timestamptz,
  primary key (pattern_id, user_id)
);

alter table dsa_pattern_progress enable row level security;

create policy "Users can view own pattern progress"
  on dsa_pattern_progress for select using (auth.uid() = user_id);

create policy "Users can upsert own pattern progress"
  on dsa_pattern_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own pattern progress"
  on dsa_pattern_progress for update using (auth.uid() = user_id);

create policy "Users can delete own pattern progress"
  on dsa_pattern_progress for delete using (auth.uid() = user_id);
