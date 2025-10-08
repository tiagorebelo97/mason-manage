# Database Migrations Required

This document outlines the database schema changes needed to support the new features added in this PR.

## Table Alterations (MUST BE DONE FIRST)

### Update companies Table
```sql
-- Remove email column and add comments column
ALTER TABLE companies DROP COLUMN IF EXISTS email;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS comments TEXT;
```

## Tables to Create

### 1. main_specialties Table
```sql
CREATE TABLE main_specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(100) NOT NULL,
  main_specialty_en VARCHAR(100) NOT NULL,
  main_specialty_pt VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for better query performance
CREATE INDEX idx_main_specialties_type ON main_specialties(type);
```

### 2. brands Table
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  official_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for name lookups
CREATE INDEX idx_brands_name ON brands(name);
```

### 3. brand_specialities Junction Table
```sql
CREATE TABLE brand_specialities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, speciality_id)
);

-- Add indexes for foreign keys
CREATE INDEX idx_brand_specialities_brand_id ON brand_specialities(brand_id);
CREATE INDEX idx_brand_specialities_speciality_id ON brand_specialities(speciality_id);
```

### 4. brand_companies Junction Table
```sql
CREATE TABLE brand_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, company_id)
);

-- Add indexes for foreign keys
CREATE INDEX idx_brand_companies_brand_id ON brand_companies(brand_id);
CREATE INDEX idx_brand_companies_company_id ON brand_companies(company_id);
```

### 5. locations Table
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for name lookups
CREATE INDEX idx_locations_name ON locations(name);
```

### 6. company_locations Junction Table
```sql
CREATE TABLE company_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, location_id)
);

-- Add indexes for foreign keys
CREATE INDEX idx_company_locations_company_id ON company_locations(company_id);
CREATE INDEX idx_company_locations_location_id ON company_locations(location_id);
```

### 7. people Table
```sql
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for company_id lookups
CREATE INDEX idx_people_company_id ON people(company_id);
```

### 8. contacts Table
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255),
  country_code VARCHAR(10),
  website VARCHAR(500),
  mobile VARCHAR(50),
  fax VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure a contact belongs to either a person or a company, not both or neither
  CHECK (
    (person_id IS NOT NULL AND company_id IS NULL) OR
    (person_id IS NULL AND company_id IS NOT NULL)
  )
);

-- Add indexes for foreign keys
CREATE INDEX idx_contacts_person_id ON contacts(person_id);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
```

## Table Alterations (Additional)

### Update specialities Table
```sql
-- Add foreign key to link specialities to main_specialties
ALTER TABLE specialities 
ADD COLUMN main_specialty_id UUID REFERENCES main_specialties(id) ON DELETE SET NULL;

-- Add index for the foreign key
CREATE INDEX idx_specialities_main_specialty_id ON specialities(main_specialty_id);
```

## Row Level Security (RLS) Policies

If you're using Row Level Security in Supabase, you'll need to add policies for these tables:

```sql
-- Enable RLS on all new tables
ALTER TABLE main_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_specialities ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your security needs)
-- main_specialties
CREATE POLICY "Allow authenticated users to read main_specialties"
  ON main_specialties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert main_specialties"
  ON main_specialties FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update main_specialties"
  ON main_specialties FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete main_specialties"
  ON main_specialties FOR DELETE
  TO authenticated
  USING (true);

-- brands
CREATE POLICY "Allow authenticated users to read brands"
  ON brands FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert brands"
  ON brands FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update brands"
  ON brands FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete brands"
  ON brands FOR DELETE
  TO authenticated
  USING (true);

-- brand_specialities
CREATE POLICY "Allow authenticated users to read brand_specialities"
  ON brand_specialities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert brand_specialities"
  ON brand_specialities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update brand_specialities"
  ON brand_specialities FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete brand_specialities"
  ON brand_specialities FOR DELETE
  TO authenticated
  USING (true);

-- brand_companies
CREATE POLICY "Allow authenticated users to read brand_companies"
  ON brand_companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert brand_companies"
  ON brand_companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update brand_companies"
  ON brand_companies FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete brand_companies"
  ON brand_companies FOR DELETE
  TO authenticated
  USING (true);

-- locations
CREATE POLICY "Allow authenticated users to read locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete locations"
  ON locations FOR DELETE
  TO authenticated
  USING (true);

-- company_locations
CREATE POLICY "Allow authenticated users to read company_locations"
  ON company_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert company_locations"
  ON company_locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update company_locations"
  ON company_locations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete company_locations"
  ON company_locations FOR DELETE
  TO authenticated
  USING (true);

-- people
CREATE POLICY "Allow authenticated users to read people"
  ON people FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert people"
  ON people FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update people"
  ON people FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete people"
  ON people FOR DELETE
  TO authenticated
  USING (true);

-- contacts
CREATE POLICY "Allow authenticated users to read contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);
```

## Notes

1. All tables use UUID as primary key for consistency with existing schema
2. Junction tables have ON DELETE CASCADE to maintain referential integrity
3. The `main_specialty_id` in specialities table uses ON DELETE SET NULL to prevent deletion issues
4. Timestamps are in UTC with timezone support
5. Unique constraints on junction tables prevent duplicate relationships

## Running the Migrations

These migrations can be run in the Supabase SQL Editor or using the Supabase CLI:

1. Navigate to your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste each CREATE TABLE statement
4. Execute them in order
5. Apply RLS policies based on your security requirements

After running the migrations, regenerate your TypeScript types using:
```bash
supabase gen types typescript --project-id <your-project-id> > src/integrations/supabase/types.ts
```

Note: The TypeScript types have already been updated in this PR to match the expected schema.
