-- Migration Script for Separator (Tab) Specialities
-- This migration adds support for attributing specialities at the separator/tab level
-- Run this script in your Supabase SQL Editor

-- Create tab_specialities table
CREATE TABLE IF NOT EXISTS tab_specialities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab_id UUID NOT NULL REFERENCES orcamento_tabs(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tab_id, speciality_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tab_specialities_tab_id ON tab_specialities(tab_id);
CREATE INDEX IF NOT EXISTS idx_tab_specialities_speciality_id ON tab_specialities(speciality_id);

-- Enable RLS on tab_specialities
ALTER TABLE tab_specialities ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for tab_specialities
CREATE POLICY "Allow authenticated users to read tab_specialities"
  ON tab_specialities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert tab_specialities"
  ON tab_specialities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update tab_specialities"
  ON tab_specialities FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete tab_specialities"
  ON tab_specialities FOR DELETE
  TO authenticated
  USING (true);

-- Verification query
SELECT 'tab_specialities count:' as info, COUNT(*) as count FROM tab_specialities;
