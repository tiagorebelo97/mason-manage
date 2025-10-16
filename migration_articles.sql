-- Migration Script for Articles Storage
-- This migration adds a table to store article-based view data
-- Run this script in your Supabase SQL Editor

-- Create orcamento_articles table
CREATE TABLE IF NOT EXISTS orcamento_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES orcamento_chapters(id) ON DELETE CASCADE,
  artigo VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  sheet_name VARCHAR(255),
  contents JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id, artigo)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orcamento_articles_chapter_id ON orcamento_articles(chapter_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_articles_artigo ON orcamento_articles(artigo);

-- Enable RLS on orcamento_articles
ALTER TABLE orcamento_articles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for orcamento_articles
CREATE POLICY "Allow authenticated users to read orcamento_articles"
  ON orcamento_articles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert orcamento_articles"
  ON orcamento_articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orcamento_articles"
  ON orcamento_articles FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete orcamento_articles"
  ON orcamento_articles FOR DELETE
  TO authenticated
  USING (true);

-- Verification query
SELECT 'orcamento_articles count:' as info, COUNT(*) as count FROM orcamento_articles;
