-- Migration: Add sheet_name column to orcamento_chapters
-- This allows us to display sheet separators in normal view when multiple sheets are mapped to the same tab

-- Add sheet_name column (nullable to support existing records)
ALTER TABLE orcamento_chapters ADD COLUMN IF NOT EXISTS sheet_name VARCHAR(255);

-- Create index for better performance when grouping by sheet_name
CREATE INDEX IF NOT EXISTS idx_orcamento_chapters_sheet_name ON orcamento_chapters(sheet_name);

-- Note: Existing records will have NULL sheet_name, which is fine
-- New records created during Excel analysis will have sheet_name populated
