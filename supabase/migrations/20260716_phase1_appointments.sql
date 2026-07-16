create table if not exists public.appointment_slots (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities (id) on delete cascade,
  slot_date date not null,
  start_time text not null,
  end_time text not null,
  service_type text not null,
  capacity integer not null default 1,
  booked_count integer not null default 0,
  status text not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references auth.users (id) on delete cascade,
  facility_id uuid not null references public.facilities (id) on delete cascade,
  slot_id uuid not null references public.appointment_slots (id) on delete restrict,
  appointment_date date not null,
  start_time text not null,
  end_time text not null,
  service_type text not null,
  reason text not null,
  notes text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointment_slots enable row level security;
alter table public.appointments enable row level security;

create policy "patients can read own appointments"
on public.appointments
for select
using (patient_user_id = auth.uid());
