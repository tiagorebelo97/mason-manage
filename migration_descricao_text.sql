-- Migration to increase descricao column size from VARCHAR(1000) to TEXT
-- This fixes the "Failed to analyze file" error when descriptions exceed 1000 characters
-- Issue: Users with long descriptions (e.g., 1509 characters) were unable to analyze files

-- Change descricao column type from VARCHAR(1000) to TEXT in orcamento_items
ALTER TABLE orcamento_items 
ALTER COLUMN descricao TYPE TEXT;

-- Update comment to reflect the change
COMMENT ON COLUMN orcamento_items.descricao IS 'Item description (unlimited length)';

-- Verification query to check the column type
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'orcamento_items' 
  AND column_name = 'descricao';
