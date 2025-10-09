-- Migration Script to Add Comments and Observacoes Columns
-- This adds support for chapter comments, item comments, observacoes, and unit price

-- Step 1: Add chapter_comments column to orcamento_chapters
ALTER TABLE orcamento_chapters 
ADD COLUMN IF NOT EXISTS chapter_comments TEXT;

-- Step 2: Add columns to orcamento_items
ALTER TABLE orcamento_items 
ADD COLUMN IF NOT EXISTS item_comments TEXT;

ALTER TABLE orcamento_items 
ADD COLUMN IF NOT EXISTS observacoes_empreiteiro TEXT;

-- Rename 'un' to clarify it's the unit, and add preco_unitario for unit price
-- Note: The UN column in Excel appears to be the unit (e.g., "m2", "kg"), not unit price
-- We're keeping it for now, but the UI will display it properly

-- Add unit price column (this was what UN was being confused with)
ALTER TABLE orcamento_items 
ADD COLUMN IF NOT EXISTS preco_unitario DECIMAL(10, 2);

-- Add comment to clarify columns
COMMENT ON COLUMN orcamento_items.un IS 'Unit of measurement (e.g., m2, kg, un)';
COMMENT ON COLUMN orcamento_items.qt IS 'Quantity';
COMMENT ON COLUMN orcamento_items.preco_unitario IS 'Unit price';
COMMENT ON COLUMN orcamento_items.observacoes_empreiteiro IS 'Contractor observations (text, file reference, or image)';
COMMENT ON COLUMN orcamento_items.item_comments IS 'Comments for this item (from rows like 1.2 that precede 1.2.1)';
COMMENT ON COLUMN orcamento_chapters.chapter_comments IS 'Comments for this chapter (from rows without ARTIGO)';
