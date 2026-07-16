alter table public.profiles
add column if not exists account_type text,
add column if not exists preferred_city text,
add column if not exists emergency_contact_name text,
add column if not exists emergency_contact_phone text;
