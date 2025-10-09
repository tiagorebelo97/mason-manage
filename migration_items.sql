-- Create orcamento_items table to store items extracted from Excel sheets
-- Items are rows where the ARTIGO column contains a number with a dot (e.g., "1.1", "2.3")
-- Each item belongs to a chapter, determined by the number before the dot

CREATE TABLE orcamento_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES orcamento_chapters(id) ON DELETE CASCADE,
  artigo VARCHAR(50) NOT NULL,  -- Item number like "1.1", "2.3"
  descricao VARCHAR(1000) NOT NULL,  -- Item description
  un VARCHAR(50),  -- Unit (e.g., "m2", "un", "kg")
  qt DECIMAL(10, 2),  -- Quantity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for foreign keys and common queries
CREATE INDEX idx_orcamento_items_chapter_id ON orcamento_items(chapter_id);
CREATE INDEX idx_orcamento_items_artigo ON orcamento_items(artigo);

-- Enable Row Level Security
ALTER TABLE orcamento_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orcamento_items
CREATE POLICY "Allow authenticated users to read orcamento_items"
  ON orcamento_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert orcamento_items"
  ON orcamento_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orcamento_items"
  ON orcamento_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete orcamento_items"
  ON orcamento_items FOR DELETE
  TO authenticated
  USING (true);
