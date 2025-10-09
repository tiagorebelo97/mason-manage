-- Migration Script to Add Image Support for Observacoes
-- This adds support for storing image URLs extracted from Excel OBSERVAÇÕES cells

-- Add image_url column to orcamento_items to store URLs of images uploaded to Supabase storage
ALTER TABLE orcamento_items 
ADD COLUMN IF NOT EXISTS observacoes_image_url TEXT;

-- Add comment to clarify the column purpose
COMMENT ON COLUMN orcamento_items.observacoes_image_url IS 'URL of image extracted from OBSERVAÇÕES cell and uploaded to Supabase storage';

-- Note: Images will be stored in the 'orcamento-observacoes' bucket in Supabase storage
-- The observacoes_empreiteiro column will continue to store text descriptions
