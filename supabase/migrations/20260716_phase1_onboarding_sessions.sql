create table if not exists public.onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null,
  signup_method text not null,
  email text,
  phone text,
  organization_name text,
  full_name text,
  current_step integer not null default 1,
  status public.record_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.onboarding_sessions enable row level security;

