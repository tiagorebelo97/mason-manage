-- Create chapter_specialities junction table to link chapters with specialities
-- This allows chapters to have multiple specialities assigned
CREATE TABLE chapter_specialities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES orcamento_chapters(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id, speciality_id)
);

-- Add indexes for foreign keys
CREATE INDEX idx_chapter_specialities_chapter_id ON chapter_specialities(chapter_id);
CREATE INDEX idx_chapter_specialities_speciality_id ON chapter_specialities(speciality_id);

-- Enable Row Level Security
ALTER TABLE chapter_specialities ENABLE ROW LEVEL SECURITY;

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
