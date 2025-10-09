# Database Migration for Tabs Feature

## Problem
The current schema has chapters directly linked to orçamentos, but the requirement is:
- Each orçamento can have multiple tabs
- Each tab belongs to one orçamento
- Each chapter belongs to one tab
- Each tab can have multiple chapters

## Solution

### 1. Create orcamento_tabs Table
```sql
CREATE TABLE orcamento_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(orcamento_id, name)
);

-- Add indexes
CREATE INDEX idx_orcamento_tabs_orcamento_id ON orcamento_tabs(orcamento_id);
CREATE INDEX idx_orcamento_tabs_display_order ON orcamento_tabs(display_order);
```

### 2. Update orcamento_chapters Table
```sql
-- Add new column for tab reference
ALTER TABLE orcamento_chapters ADD COLUMN tab_id UUID REFERENCES orcamento_tabs(id) ON DELETE CASCADE;

-- Create index for new foreign key
CREATE INDEX idx_orcamento_chapters_tab_id ON orcamento_chapters(tab_id);

-- After data migration, make it NOT NULL and remove old constraints/columns
-- This will be done in a separate step after migrating existing data
```

### 3. Data Migration (if needed)
If there's existing data, we need to:
1. Create tabs from existing sheet_name values
2. Link chapters to the new tabs
3. Remove the old sheet_name column from chapters

```sql
-- Create tabs from existing sheet names
INSERT INTO orcamento_tabs (orcamento_id, name, display_order)
SELECT DISTINCT 
  orcamento_id, 
  sheet_name,
  ROW_NUMBER() OVER (PARTITION BY orcamento_id ORDER BY sheet_name) - 1
FROM orcamento_chapters
WHERE NOT EXISTS (
  SELECT 1 FROM orcamento_tabs t 
  WHERE t.orcamento_id = orcamento_chapters.orcamento_id 
  AND t.name = orcamento_chapters.sheet_name
);

-- Link chapters to tabs
UPDATE orcamento_chapters c
SET tab_id = t.id
FROM orcamento_tabs t
WHERE c.orcamento_id = t.orcamento_id 
AND c.sheet_name = t.name;

-- After verifying data is correct, drop old columns and constraints
ALTER TABLE orcamento_chapters DROP CONSTRAINT IF EXISTS orcamento_chapters_orcamento_id_sheet_name_chapter_number_key;
ALTER TABLE orcamento_chapters DROP COLUMN sheet_name;
ALTER TABLE orcamento_chapters ALTER COLUMN tab_id SET NOT NULL;

-- Add new unique constraint
ALTER TABLE orcamento_chapters ADD CONSTRAINT orcamento_chapters_tab_id_chapter_number_key UNIQUE(tab_id, chapter_number);
```

### 4. RLS Policies for orcamento_tabs

```sql
ALTER TABLE orcamento_tabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read orcamento_tabs"
  ON orcamento_tabs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert orcamento_tabs"
  ON orcamento_tabs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orcamento_tabs"
  ON orcamento_tabs FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete orcamento_tabs"
  ON orcamento_tabs FOR DELETE
  TO authenticated
  USING (true);
```

## Running the Migration

1. Create the orcamento_tabs table
2. Add tab_id column to orcamento_chapters
3. Run data migration (if there's existing data)
4. Clean up old columns and constraints
5. Add RLS policies
6. Regenerate TypeScript types

```bash
supabase gen types typescript --project-id <your-project-id> > src/integrations/supabase/types.ts
```
