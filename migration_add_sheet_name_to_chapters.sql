-- Migration: Add sheet_name column to orcamento_chapters
-- This allows us to track which Excel sheet each chapter came from
-- so we can display sheet separators in the UI

-- Add sheet_name column to orcamento_chapters if it doesn't exist
ALTER TABLE orcamento_chapters 
ADD COLUMN IF NOT EXISTS sheet_name VARCHAR(255);

-- Create index for better performance when grouping by sheet_name
CREATE INDEX IF NOT EXISTS idx_orcamento_chapters_sheet_name 
ON orcamento_chapters(sheet_name);

-- Verification query
SELECT 
  'Chapters with sheet_name:' as info, 
  COUNT(*) as count 
FROM orcamento_chapters 
WHERE sheet_name IS NOT NULL;

-- Display the new structure
SELECT 
  t.name as tab_name,
  c.sheet_name,
  COUNT(c.id) as chapter_count
FROM orcamento_tabs t
LEFT JOIN orcamento_chapters c ON c.tab_id = t.id
GROUP BY t.name, c.sheet_name
ORDER BY t.name, c.sheet_name;
