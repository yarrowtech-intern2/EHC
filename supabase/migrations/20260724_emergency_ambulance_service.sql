alter type public.app_role add value if not exists 'ambulance_driver';

do $$
begin
  create type public.ambulance_unit_status as enum (
    'offline',
    'available',
    'busy',
    'maintenance'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.emergency_ambulance_request_status as enum (
    'requested',
    'accepted',
    'en_route',
    'arrived',
    'transporting',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.ambulance_units (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  facility_id uuid not null references public.facilities (id) on delete cascade,
  driver_user_id uuid references auth.users (id) on delete set null,
  vehicle_number text not null,
  driver_name text,
  driver_phone text,
  status public.ambulance_unit_status not null default 'offline',
  current_latitude numeric(10, 7),
  current_longitude numeric(10, 7),
  last_location_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (facility_id, vehicle_number)
);

create table if not exists public.emergency_ambulance_requests (
  id uuid primary key default gen_random_uuid(),
  tracking_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  patient_user_id uuid references auth.users (id) on delete set null,
  patient_name text not null,
  patient_phone text not null,
  pickup_address text,
  pickup_latitude numeric(10, 7) not null,
  pickup_longitude numeric(10, 7) not null,
  status public.emergency_ambulance_request_status not null default 'requested',
  tenant_id uuid references public.tenants (id) on delete set null,
  facility_id uuid references public.facilities (id) on delete set null,
  ambulance_unit_id uuid references public.ambulance_units (id) on delete set null,
  accepted_by_user_id uuid references auth.users (id) on delete set null,
  accepted_at timestamptz,
  status_updated_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.emergency_ambulance_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.emergency_ambulance_requests (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  status public.emergency_ambulance_request_status,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ambulance_units_facility_status_idx
on public.ambulance_units (facility_id, status);

create index if not exists ambulance_units_driver_idx
on public.ambulance_units (driver_user_id);

create index if not exists emergency_ambulance_requests_status_idx
on public.emergency_ambulance_requests (status, created_at desc);

create index if not exists emergency_ambulance_requests_patient_idx
on public.emergency_ambulance_requests (patient_user_id, created_at desc);

create index if not exists emergency_ambulance_requests_facility_idx
on public.emergency_ambulance_requests (facility_id, created_at desc);

create index if not exists emergency_ambulance_events_request_idx
on public.emergency_ambulance_request_events (request_id, created_at desc);

create or replace function public.current_user_ambulance_facility_ids()
returns setof uuid
language sql
stable
as $$
  select facility_id
  from public.user_roles
  where user_id = auth.uid()
    and facility_id is not null
    and role::text in (
      'tenant_admin',
      'facility_operator',
      'ambulance_admin',
      'ambulance_driver'
    )
  union
  select facilities.id
  from public.facilities
  join public.user_roles
    on user_roles.tenant_id = facilities.tenant_id
  where user_roles.user_id = auth.uid()
    and user_roles.facility_id is null
    and user_roles.role::text in (
      'tenant_admin',
      'facility_operator',
      'ambulance_admin'
    )
    and facilities.type = 'ambulance_unit'
$$;

create or replace function public.current_user_admin_tenant_ids()
returns setof uuid
language sql
stable
as $$
  select tenant_id
  from public.user_roles
  where user_id = auth.uid()
    and tenant_id is not null
    and role::text in (
      'tenant_admin',
      'facility_operator',
      'pharmacy_admin',
      'ambulance_admin',
      'ambulance_driver',
      'blood_bank_admin'
    )
$$;

alter table public.ambulance_units enable row level security;
alter table public.emergency_ambulance_requests enable row level security;
alter table public.emergency_ambulance_request_events enable row level security;

drop policy if exists "ambulance operators can read units" on public.ambulance_units;
create policy "ambulance operators can read units"
on public.ambulance_units
for select
using (facility_id in (select public.current_user_ambulance_facility_ids()));

drop policy if exists "patients can read own emergency requests" on public.emergency_ambulance_requests;
create policy "patients can read own emergency requests"
on public.emergency_ambulance_requests
for select
using (patient_user_id = auth.uid());

drop policy if exists "ambulance operators can read emergency requests" on public.emergency_ambulance_requests;
create policy "ambulance operators can read emergency requests"
on public.emergency_ambulance_requests
for select
using (
  facility_id in (select public.current_user_ambulance_facility_ids())
  or status = 'requested'
);

drop policy if exists "request owners can read emergency events" on public.emergency_ambulance_request_events;
create policy "request owners can read emergency events"
on public.emergency_ambulance_request_events
for select
using (
  request_id in (
    select id
    from public.emergency_ambulance_requests
    where patient_user_id = auth.uid()
       or facility_id in (select public.current_user_ambulance_facility_ids())
  )
);
