create or replace function public.current_user_admin_tenant_ids()
returns setof uuid
language sql
stable
as $$
  select tenant_id
  from public.user_roles
  where user_id = auth.uid()
    and tenant_id is not null
    and role in (
      'tenant_admin',
      'facility_operator',
      'pharmacy_admin',
      'ambulance_admin',
      'blood_bank_admin'
    )
$$;

drop policy if exists "tenant members can read audit logs" on public.audit_logs;
create policy "tenant admins can read audit logs"
on public.audit_logs
for select
using (tenant_id in (select public.current_user_admin_tenant_ids()));

drop policy if exists "tenant members can read appointment slots" on public.appointment_slots;
create policy "tenant members can read appointment slots"
on public.appointment_slots
for select
using (
  facility_id in (
    select id
    from public.facilities
    where tenant_id in (select public.current_user_tenant_ids())
  )
);

drop policy if exists "doctors can read own appointment slots" on public.appointment_slots;
create policy "doctors can read own appointment slots"
on public.appointment_slots
for select
using (doctor_user_id = auth.uid());

drop policy if exists "tenant members can read facility appointments" on public.appointments;
create policy "tenant members can read facility appointments"
on public.appointments
for select
using (
  facility_id in (
    select id
    from public.facilities
    where tenant_id in (select public.current_user_tenant_ids())
  )
);

drop policy if exists "doctors can read own appointments" on public.appointments;
create policy "doctors can read own appointments"
on public.appointments
for select
using (doctor_user_id = auth.uid());

drop policy if exists "tenant members can read appointment requests" on public.appointment_requests;
create policy "tenant members can read appointment requests"
on public.appointment_requests
for select
using (
  facility_id in (
    select id
    from public.facilities
    where tenant_id in (select public.current_user_tenant_ids())
  )
);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());
