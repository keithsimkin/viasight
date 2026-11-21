-- ViaSight core schema (from Pauline backup, simplified for new project)

create extension if not exists "pgcrypto";

create table if not exists public.datasets (
  id text primary key,
  name text not null unique,
  description text,
  record_count integer default 0,
  last_updated timestamptz default now(),
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.potholes (
  id uuid primary key default gen_random_uuid(),
  pothole_id bigint not null,
  dataset_id text not null default 'default' references public.datasets (id) on delete cascade,
  latitude double precision not null check (latitude >= -90 and latitude <= 90),
  longitude double precision not null check (longitude >= -180 and longitude <= 180),
  width_m double precision not null check (width_m > 0),
  length_m double precision not null check (length_m > 0 and length_m <= 500),
  depth_m double precision check (depth_m is null or depth_m > 0),
  confidence double precision not null check (confidence >= 0 and confidence <= 1),
  severity text check (severity = any (array['low','moderate','high','patch'])),
  status text not null default 'detected'
    check (status = any (array['detected','verified','assigned','in_progress','repaired','rejected'])),
  detection_timestamp timestamptz not null,
  detection_method text default 'ai_vision',
  photo_url text,
  photo_path text,
  location_description text,
  road_name text,
  district text,
  assigned_to uuid,
  repair_priority integer check (repair_priority is null or (repair_priority >= 1 and repair_priority <= 10)),
  estimated_repair_cost numeric(10,2),
  repair_notes text,
  repaired_at timestamptz,
  repaired_by uuid,
  verified_at timestamptz,
  verified_by uuid,
  rejection_reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  area_sqm double precision check (area_sqm is null or area_sqm > 0)
);

create unique index if not exists potholes_pothole_id_dataset_id_key
  on public.potholes (pothole_id, dataset_id);

create index if not exists idx_potholes_status on public.potholes (status);
create index if not exists idx_potholes_severity on public.potholes (severity);
create index if not exists idx_potholes_confidence on public.potholes (confidence);
create index if not exists idx_potholes_location on public.potholes (latitude, longitude);
create index if not exists idx_potholes_detection_timestamp on public.potholes (detection_timestamp);

alter table public.datasets enable row level security;
alter table public.potholes enable row level security;

drop policy if exists "Authenticated read datasets" on public.datasets;
create policy "Authenticated read datasets"
  on public.datasets for select to authenticated using (true);

drop policy if exists "Authenticated write datasets" on public.datasets;
create policy "Authenticated write datasets"
  on public.datasets for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated read potholes" on public.potholes;
create policy "Authenticated read potholes"
  on public.potholes for select to authenticated using (true);

drop policy if exists "Authenticated insert potholes" on public.potholes;
create policy "Authenticated insert potholes"
  on public.potholes for insert to authenticated with check (true);

drop policy if exists "Authenticated update potholes" on public.potholes;
create policy "Authenticated update potholes"
  on public.potholes for update to authenticated using (true) with check (true);
