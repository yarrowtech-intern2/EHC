alter table public.profiles
add column if not exists age integer,
add column if not exists blood_group text,
add column if not exists location text;
