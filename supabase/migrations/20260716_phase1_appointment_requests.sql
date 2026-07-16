create table if not exists public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references auth.users (id) on delete cascade,
  facility_id uuid not null references public.facilities (id) on delete cascade,
  service_type text not null,
  preferred_date date not null,
  preferred_time text not null,
  reason text not null,
  notes text,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointment_requests enable row level security;

create policy "patients can read own appointment requests"
on public.appointment_requests
for select
using (patient_user_id = auth.uid());
