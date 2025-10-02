-- Create specialities table
create table if not exists public.specialities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- Create companies table
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  speciality_id uuid references public.specialities(id) on delete set null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.specialities enable row level security;
alter table public.companies enable row level security;

-- Create policies for public access
create policy "Anyone can view specialities"
  on public.specialities for select
  using (true);

create policy "Anyone can insert specialities"
  on public.specialities for insert
  with check (true);

create policy "Anyone can view companies"
  on public.companies for select
  using (true);

create policy "Anyone can insert companies"
  on public.companies for insert
  with check (true);

create policy "Anyone can update companies"
  on public.companies for update
  using (true);

create policy "Anyone can delete companies"
  on public.companies for delete
  using (true);

-- Insert sample specialities
insert into public.specialities (name) values
  ('Electrical'),
  ('Plumbing'),
  ('HVAC'),
  ('Carpentry'),
  ('Masonry')
on conflict (name) do nothing;