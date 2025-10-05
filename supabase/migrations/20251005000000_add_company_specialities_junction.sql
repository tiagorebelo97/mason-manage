-- Create junction table for company-specialities many-to-many relationship
create table if not exists public.company_specialities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  speciality_id uuid not null references public.specialities(id) on delete cascade,
  created_at timestamptz default now(),
  unique(company_id, speciality_id)
);

-- Enable RLS
alter table public.company_specialities enable row level security;

-- Create policies for public access
create policy "Anyone can view company_specialities"
  on public.company_specialities for select
  using (true);

create policy "Anyone can insert company_specialities"
  on public.company_specialities for insert
  with check (true);

create policy "Anyone can delete company_specialities"
  on public.company_specialities for delete
  using (true);

-- Migrate existing data from companies.speciality_id to junction table
insert into public.company_specialities (company_id, speciality_id)
select id, speciality_id 
from public.companies 
where speciality_id is not null
on conflict (company_id, speciality_id) do nothing;

-- Note: We keep the speciality_id column in companies table for backward compatibility
-- It can be removed in a future migration if needed
