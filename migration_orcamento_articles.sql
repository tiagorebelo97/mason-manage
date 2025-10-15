-- Create orcamento_articles table to store article-based view data
-- Articles are extracted from Excel files and represent sections with exactly one dot (e.g., "1.1", "2.3")
-- Each article belongs to a chapter and contains structured content

CREATE TABLE orcamento_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES orcamento_chapters(id) ON DELETE CASCADE,
  sheet_name VARCHAR(255) NOT NULL,
  artigo VARCHAR(50) NOT NULL,  -- Article number like "1.1", "2.3"
  title TEXT NOT NULL,  -- Article title from DESCRIÇÃO column
  contents JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Array of content items (text and items)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for foreign keys and common queries
CREATE INDEX idx_orcamento_articles_chapter_id ON orcamento_articles(chapter_id);
CREATE INDEX idx_orcamento_articles_artigo ON orcamento_articles(artigo);
CREATE INDEX idx_orcamento_articles_sheet_name ON orcamento_articles(sheet_name);

-- Enable Row Level Security
ALTER TABLE orcamento_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orcamento_articles
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

-- Add comment to explain the contents JSONB structure
COMMENT ON COLUMN orcamento_articles.contents IS 'Array of content items. Each item has a "type" (text|item) and "data" field. For text: data is a string. For item: data is an object with artigo, descricao, un, qt, and optional observacoes_empreiteiro.';
