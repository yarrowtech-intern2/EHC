alter type public.app_role add value if not exists 'facility_operator';

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
      'blood_bank_admin'
    )
$$;
