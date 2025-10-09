-- Create item_specialities junction table to link items with specialities
-- This allows items to have multiple specialities assigned
-- Items can inherit specialities from their chapter or have individual assignments
CREATE TABLE item_specialities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES orcamento_items(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, speciality_id)
);

-- Add indexes for foreign keys
CREATE INDEX idx_item_specialities_item_id ON item_specialities(item_id);
CREATE INDEX idx_item_specialities_speciality_id ON item_specialities(speciality_id);

-- Enable Row Level Security
ALTER TABLE item_specialities ENABLE ROW LEVEL SECURITY;

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
