-- Migration Script for Tabs Feature
-- Run this script in your Supabase SQL Editor

-- Step 1: Create orcamento_tabs table
CREATE TABLE IF NOT EXISTS orcamento_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(orcamento_id, name)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orcamento_tabs_orcamento_id ON orcamento_tabs(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_tabs_display_order ON orcamento_tabs(display_order);

-- Step 2: Add tab_id column to orcamento_chapters
ALTER TABLE orcamento_chapters ADD COLUMN IF NOT EXISTS tab_id UUID REFERENCES orcamento_tabs(id) ON DELETE CASCADE;

-- Create index for new foreign key
CREATE INDEX IF NOT EXISTS idx_orcamento_chapters_tab_id ON orcamento_chapters(tab_id);

-- Step 3: Migrate existing data (only if you have existing chapters)
-- This creates tabs from existing sheet_name values and links chapters to them
DO $$
BEGIN
  -- Only run migration if there are chapters without tab_id
  IF EXISTS (SELECT 1 FROM orcamento_chapters WHERE tab_id IS NULL LIMIT 1) THEN
    -- Create tabs from existing sheet names
    INSERT INTO orcamento_tabs (orcamento_id, name, display_order)
    SELECT DISTINCT 
      orcamento_id, 
      sheet_name,
      ROW_NUMBER() OVER (PARTITION BY orcamento_id ORDER BY sheet_name) - 1
    FROM orcamento_chapters
    WHERE sheet_name IS NOT NULL
    ON CONFLICT (orcamento_id, name) DO NOTHING;
    
    -- Link chapters to tabs
    UPDATE orcamento_chapters c
    SET tab_id = t.id
    FROM orcamento_tabs t
    WHERE c.orcamento_id = t.orcamento_id 
    AND c.sheet_name = t.name
    AND c.tab_id IS NULL;
    
    RAISE NOTICE 'Data migration completed successfully';
  ELSE
    RAISE NOTICE 'No data migration needed';
  END IF;
END $$;

-- Step 4: Clean up old schema (only after verifying data is correct)
-- IMPORTANT: Verify your data before running these commands!
-- You can comment out these lines if you want to keep the old columns temporarily

-- Drop old unique constraint
ALTER TABLE orcamento_chapters DROP CONSTRAINT IF EXISTS orcamento_chapters_orcamento_id_sheet_name_chapter_number_key;

-- Drop old columns
ALTER TABLE orcamento_chapters DROP COLUMN IF EXISTS sheet_name;
ALTER TABLE orcamento_chapters DROP COLUMN IF EXISTS orcamento_id;

-- Make tab_id required
ALTER TABLE orcamento_chapters ALTER COLUMN tab_id SET NOT NULL;

-- Add new unique constraint
ALTER TABLE orcamento_chapters ADD CONSTRAINT orcamento_chapters_tab_id_chapter_number_key UNIQUE(tab_id, chapter_number);

-- Step 5: Enable RLS on orcamento_tabs
ALTER TABLE orcamento_tabs ENABLE ROW LEVEL SECURITY;

-- Step 6: Add RLS policies for orcamento_tabs
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

-- Verification queries
-- Run these to verify the migration was successful
SELECT 'orcamento_tabs count:' as info, COUNT(*) as count FROM orcamento_tabs;
SELECT 'chapters with tab_id:' as info, COUNT(*) as count FROM orcamento_chapters WHERE tab_id IS NOT NULL;
SELECT 'chapters without tab_id (should be 0):' as info, COUNT(*) as count FROM orcamento_chapters WHERE tab_id IS NULL;

-- Display the new structure
SELECT 
  o.name as orcamento,
  t.name as tab,
  t.display_order,
  COUNT(c.id) as chapter_count
FROM orcamentos o
LEFT JOIN orcamento_tabs t ON t.orcamento_id = o.id
LEFT JOIN orcamento_chapters c ON c.tab_id = t.id
GROUP BY o.id, o.name, t.id, t.name, t.display_order
ORDER BY o.name, t.display_order;
