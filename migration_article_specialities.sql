-- Migration Script for Article Specialities
-- This migration adds support for attributing specialities at the article level
-- Run this script in your Supabase SQL Editor

-- Create article_specialities table
CREATE TABLE IF NOT EXISTS article_specialities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES orcamento_articles(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, speciality_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_article_specialities_article_id ON article_specialities(article_id);
CREATE INDEX IF NOT EXISTS idx_article_specialities_speciality_id ON article_specialities(speciality_id);

-- Enable RLS on article_specialities
ALTER TABLE article_specialities ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for article_specialities
CREATE POLICY "Allow authenticated users to read article_specialities"
  ON article_specialities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert article_specialities"
  ON article_specialities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update article_specialities"
  ON article_specialities FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete article_specialities"
  ON article_specialities FOR DELETE
  TO authenticated
  USING (true);

-- Verification query
SELECT 'article_specialities count:' as info, COUNT(*) as count FROM article_specialities;
