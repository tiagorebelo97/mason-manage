-- Migration to add explicit override flag for item specialities
-- This allows items to explicitly have NO specialities, overriding chapter inheritance

-- Add column to track if item specialities have been explicitly set
ALTER TABLE orcamento_items 
ADD COLUMN IF NOT EXISTS specialities_explicitly_set BOOLEAN DEFAULT FALSE;

-- Add comment to clarify purpose
COMMENT ON COLUMN orcamento_items.specialities_explicitly_set IS 'TRUE if user has explicitly set specialities for this item (even if empty), FALSE if inheriting from chapter';
