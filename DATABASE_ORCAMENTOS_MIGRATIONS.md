# Database Migrations for Orçamentos Feature

This document outlines the database schema changes needed to support the Orçamentos (Budgets) feature.

## Tables to Create

### 1. orcamentos Table
```sql
CREATE TABLE orcamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  state VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'closed')),
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for better query performance
CREATE INDEX idx_orcamentos_state ON orcamentos(state);
CREATE INDEX idx_orcamentos_name ON orcamentos(name);
```

### 2. orcamento_files Table
```sql
CREATE TABLE orcamento_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  file_name VARCHAR(500) NOT NULL,
  file_url VARCHAR(1000) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for foreign keys
CREATE INDEX idx_orcamento_files_orcamento_id ON orcamento_files(orcamento_id);
```

### 3. orcamento_chapters Table
```sql
CREATE TABLE orcamento_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  sheet_name VARCHAR(255) NOT NULL,
  chapter_number VARCHAR(50) NOT NULL,
  chapter_name VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(orcamento_id, sheet_name, chapter_number)
);

-- Add indexes for foreign keys
CREATE INDEX idx_orcamento_chapters_orcamento_id ON orcamento_chapters(orcamento_id);
CREATE INDEX idx_orcamento_chapters_sheet_name ON orcamento_chapters(sheet_name);
```

## Row Level Security (RLS) Policies

If you're using Row Level Security in Supabase, you'll need to add policies for these tables:

```sql
-- Enable RLS on all new tables
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_chapters ENABLE ROW LEVEL SECURITY;

-- orcamentos
CREATE POLICY "Allow authenticated users to read orcamentos"
  ON orcamentos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert orcamentos"
  ON orcamentos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orcamentos"
  ON orcamentos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete orcamentos"
  ON orcamentos FOR DELETE
  TO authenticated
  USING (true);

-- orcamento_files
CREATE POLICY "Allow authenticated users to read orcamento_files"
  ON orcamento_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert orcamento_files"
  ON orcamento_files FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orcamento_files"
  ON orcamento_files FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete orcamento_files"
  ON orcamento_files FOR DELETE
  TO authenticated
  USING (true);

-- orcamento_chapters
CREATE POLICY "Allow authenticated users to read orcamento_chapters"
  ON orcamento_chapters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert orcamento_chapters"
  ON orcamento_chapters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orcamento_chapters"
  ON orcamento_chapters FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete orcamento_chapters"
  ON orcamento_chapters FOR DELETE
  TO authenticated
  USING (true);
```

## Notes

1. All tables use UUID as primary key for consistency with existing schema
2. The `state` field in orcamentos table uses CHECK constraint to ensure only 'open' or 'closed' values
3. Junction relationship between orcamento and chapters allows multiple chapters per orçamento
4. Unique constraint on orcamento_chapters prevents duplicate chapters per sheet
5. Timestamps are in UTC with timezone support

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
