# Cache Clear Fix - Article Data Persistence

## Problem
When users cleared their browser cache (localStorage/sessionStorage), the article-based view data was lost because it was only stored in sessionStorage. The database had all the raw data (tabs, chapters, items), but the article structure needed for the UI was missing.

## Root Cause
The article-based view groups and structures data differently than how it's stored in the database:
- Articles (e.g., "1.2") contain both text content and items
- Text rows between items are part of the article content
- This structured data was only stored in `sessionStorage` and not persisted to the database
- When cache was cleared, this data was permanently lost until the file was re-analyzed

## Solution
Store article data in the database for persistence across cache clears.

### Changes Made

#### 1. Database Migration (`migration_articles.sql`)
Created a new table `orcamento_articles` to store article data:
```sql
CREATE TABLE orcamento_articles (
  id UUID PRIMARY KEY,
  chapter_id UUID REFERENCES orcamento_chapters(id) ON DELETE CASCADE,
  artigo VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  sheet_name VARCHAR(255),
  contents JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(chapter_id, artigo)
);
```

The `contents` field stores the article structure as JSONB, which includes:
- Text content (paragraphs, descriptions)
- Item data (artigo, descricao, un, qt, observacoes_empreiteiro)

#### 2. Code Changes (`src/pages/MapaQuantidades.tsx`)

**Added new query to fetch articles from database:**
```typescript
const { data: articlesFromDB } = useQuery({
  queryKey: ["orcamento_articles", id, import.meta.env.VITE_SUPABASE_URL],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("orcamento_articles")
      .select(`*, orcamento_chapters!inner(...)`)
      .eq("orcamento_chapters.orcamento_tabs.orcamento_id", id)
      .order("artigo");
    if (error) throw error;
    return data;
  },
  enabled: !!id && chapters && chapters.length > 0,
});
```

**Updated useEffect to load from database first, sessionStorage as fallback:**
```typescript
React.useEffect(() => {
  if (chapters && chapters.length > 0 && id) {
    // First, try to load from database
    if (articlesFromDB && articlesFromDB.length > 0) {
      // Load from database
      setChaptersWithArticles(chaptersWithArticlesData);
    } else {
      // Fallback to sessionStorage for backward compatibility
      const storedArticles = sessionStorage.getItem(`articles_${id}`);
      // ...
    }
  }
}, [chapters, id, articlesFromDB]);
```

**Updated analysis mutation to store articles in database:**
```typescript
// After creating chapters and items, store articles in database
if (articleBasedView && articlesData.length > 0) {
  const articlesToInsert = articlesData.map(article => ({
    chapter_id: chapterId,
    artigo: article.artigo,
    title: article.title,
    sheet_name: article.sheet_name,
    contents: article.contents
  }));
  
  await supabase.from("orcamento_articles").insert(articlesToInsert);
}
```

**Updated delete mutation to clean up sessionStorage:**
```typescript
if (id) {
  sessionStorage.removeItem(`articles_${id}`);
}
```

**Updated query invalidation to include articles:**
```typescript
queryClient.invalidateQueries({ 
  queryKey: ["orcamento_articles", id, import.meta.env.VITE_SUPABASE_URL] 
});
```

## Benefits
1. **Data Persistence**: Article data survives cache clears
2. **Backward Compatibility**: Still uses sessionStorage as fallback for old data
3. **No Re-analysis Needed**: Users don't need to re-analyze files after clearing cache
4. **Minimal Changes**: Only added new table and updated loading logic
5. **Cascade Deletion**: Articles are automatically deleted when tabs/chapters are deleted

## Testing
After applying this fix:
1. Upload and analyze an Excel file
2. Verify articles are displayed correctly
3. Clear browser cache (sessionStorage + localStorage)
4. Reload the page
5. Verify articles are still displayed (loaded from database)

## Migration Instructions
1. Run the SQL migration in Supabase SQL Editor: `migration_articles.sql`
2. Deploy the updated code
3. Existing files will need to be re-analyzed to populate the new table
4. New files will automatically have articles stored in the database

## Notes
- The JSONB field allows flexible storage of article contents
- Cascade deletion ensures cleanup when chapters are removed
- RLS policies follow the same pattern as other tables
- sessionStorage is kept for backward compatibility during transition
