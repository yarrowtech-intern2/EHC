alter table public.appointment_slots
add column if not exists doctor_user_id uuid references auth.users (id) on delete set null;

alter table public.appointments
add column if not exists doctor_user_id uuid references auth.users (id) on delete set null,
add column if not exists consultation_notes text,
add column if not exists diagnosis_summary text,
add column if not exists prescription_notes text;
