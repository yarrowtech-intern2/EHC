create extension if not exists "pgcrypto";

create type public.tenant_category as enum ('organization', 'small_vendor');
create type public.facility_type as enum (
  'hospital',
  'clinic',
  'pharmacy',
  'lab',
  'ambulance_unit',
  'independent_vendor'
);
create type public.app_role as enum (
  'super_admin',
  'tenant_admin',
  'facility_operator',
  'doctor',
  'patient',
  'pharmacy_admin',
  'ambulance_admin',
  'blood_bank_admin'
);
create type public.record_status as enum ('draft', 'active', 'inactive', 'archived');

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text not null,
  category public.tenant_category not null default 'organization',
  country_code text,
  allows_patient_self_service boolean not null default true,
  primary_contact_user_id uuid references auth.users (id),
  status public.record_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  type public.facility_type not null,
  city text,
  contact_number text,
  status public.record_status not null default 'draft',
  serves_patients_directly boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  tenant_id uuid references public.tenants (id) on delete set null,
  facility_id uuid references public.facilities (id) on delete set null,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  onboarding_step integer not null default 1,
  status public.record_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid references public.tenants (id) on delete cascade,
  facility_id uuid references public.facilities (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, tenant_id, facility_id, role)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants (id) on delete cascade,
  facility_id uuid references public.facilities (id) on delete set null,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.tenants enable row level security;
alter table public.facilities enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_user_tenant_ids()
returns setof uuid
language sql
stable
as $$
  select tenant_id
  from public.user_roles
  where user_id = auth.uid()
    and tenant_id is not null
$$;

create policy "tenant members can read tenants"
on public.tenants
for select
using (id in (select public.current_user_tenant_ids()));

create policy "tenant members can read facilities"
on public.facilities
for select
using (tenant_id in (select public.current_user_tenant_ids()));

create policy "users can read own profile"
on public.profiles
for select
using (id = auth.uid() or tenant_id in (select public.current_user_tenant_ids()));

create policy "tenant members can read roles"
on public.user_roles
for select
using (tenant_id in (select public.current_user_tenant_ids()));

create policy "tenant members can read audit logs"
on public.audit_logs
for select
using (tenant_id in (select public.current_user_tenant_ids()));
