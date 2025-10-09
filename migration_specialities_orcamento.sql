-- Migration Script to Add Specialities Support for Chapters and Items
-- This allows attributing specialities to chapters and items in orçamentos

-- Create junction table for chapter specialities (many-to-many relationship)
CREATE TABLE IF NOT EXISTS chapter_specialities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES orcamento_chapters(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id, speciality_id)
);

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_chapter_specialities_chapter_id ON chapter_specialities(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_specialities_speciality_id ON chapter_specialities(speciality_id);

-- Create junction table for item specialities (many-to-many relationship)
CREATE TABLE IF NOT EXISTS item_specialities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES orcamento_items(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, speciality_id)
);

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_item_specialities_item_id ON item_specialities(item_id);
CREATE INDEX IF NOT EXISTS idx_item_specialities_speciality_id ON item_specialities(speciality_id);

-- Enable Row Level Security
ALTER TABLE chapter_specialities ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_specialities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chapter_specialities
CREATE POLICY "Allow authenticated users to read chapter_specialities"
  ON chapter_specialities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert chapter_specialities"
  ON chapter_specialities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update chapter_specialities"
  ON chapter_specialities FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete chapter_specialities"
  ON chapter_specialities FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for item_specialities
CREATE POLICY "Allow authenticated users to read item_specialities"
  ON item_specialities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert item_specialities"
  ON item_specialities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update item_specialities"
  ON item_specialities FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete item_specialities"
  ON item_specialities FOR DELETE
  TO authenticated
  USING (true);

-- Add comments to clarify the purpose
COMMENT ON TABLE chapter_specialities IS 'Junction table linking chapters to specialities. When a chapter has specialities, all items inherit them by default.';
COMMENT ON TABLE item_specialities IS 'Junction table linking items to specialities. Items can override chapter specialities individually.';
