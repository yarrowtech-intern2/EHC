do $$
begin
  create type public.ambulance_driver_verification_status as enum (
    'pending_verification',
    'approved',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.ambulance_units
add column if not exists verification_status public.ambulance_driver_verification_status not null default 'approved',
add column if not exists verification_notes text,
add column if not exists verified_by_user_id uuid references auth.users (id) on delete set null,
add column if not exists verified_at timestamptz;

create table if not exists public.ambulance_driver_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid references public.tenants (id) on delete set null,
  facility_id uuid references public.facilities (id) on delete set null,
  ambulance_unit_id uuid references public.ambulance_units (id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  service_name text not null,
  city text not null,
  vehicle_number text not null,
  license_number text not null,
  ambulance_permit_number text not null,
  documents jsonb not null default '{}'::jsonb,
  status public.ambulance_driver_verification_status not null default 'pending_verification',
  admin_notes text,
  reviewed_by_user_id uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  unique (vehicle_number)
);

create index if not exists ambulance_driver_applications_status_idx
on public.ambulance_driver_applications (status, created_at desc);

create index if not exists ambulance_driver_applications_user_idx
on public.ambulance_driver_applications (user_id);

alter table public.ambulance_driver_applications enable row level security;

drop policy if exists "drivers can read own ambulance application" on public.ambulance_driver_applications;
create policy "drivers can read own ambulance application"
on public.ambulance_driver_applications
for select
using (user_id = auth.uid());

drop policy if exists "super admins can read ambulance applications" on public.ambulance_driver_applications;
create policy "super admins can read ambulance applications"
on public.ambulance_driver_applications
for select
using (
  exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'super_admin'
  )
);
