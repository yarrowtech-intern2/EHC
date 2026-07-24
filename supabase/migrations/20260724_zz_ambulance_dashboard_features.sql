alter table public.ambulance_units
add column if not exists service_codes text[] not null default array['emergency_ambulance']::text[];

alter table public.emergency_ambulance_requests
add column if not exists service_code text not null default 'emergency_ambulance',
add column if not exists estimated_distance_km numeric(10, 2),
add column if not exists distance_fee_amount numeric(10, 2) not null default 0,
add column if not exists service_fee_amount numeric(10, 2) not null default 0,
add column if not exists platform_fee_amount numeric(10, 2) not null default 0,
add column if not exists total_fare_amount numeric(10, 2) not null default 0,
add column if not exists rating_score integer check (rating_score between 1 and 5),
add column if not exists feedback_comment text,
add column if not exists rated_at timestamptz;

create index if not exists ambulance_units_service_codes_idx
on public.ambulance_units using gin (service_codes);

create index if not exists emergency_ambulance_requests_rating_idx
on public.emergency_ambulance_requests (rating_score, rated_at desc);
