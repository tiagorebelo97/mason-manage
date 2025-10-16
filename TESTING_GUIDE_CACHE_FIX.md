# Testing Guide - Cache Clear Fix

## Prerequisites
1. Access to Supabase SQL Editor
2. Test Excel file with articles (rows with one dot in ARTIGO column)
3. Browser with developer tools

## Step 1: Apply Database Migration

1. Open Supabase SQL Editor
2. Copy the contents of `migration_articles.sql`
3. Run the migration
4. Verify table creation:
   ```sql
   SELECT COUNT(*) FROM orcamento_articles;
   ```
5. Should return 0 initially

## Step 2: Test New File Upload and Analysis

### Upload Test File
1. Navigate to an Orcamento in the application
2. Upload an Excel file with article-based structure
3. Click "Analyze" button
4. Wait for analysis to complete

### Verify Database Storage
1. In Supabase SQL Editor, check articles were stored:
   ```sql
   SELECT id, artigo, title, sheet_name 
   FROM orcamento_articles 
   ORDER BY artigo;
   ```
2. Should see all articles from the Excel file

### Verify UI Display
1. Check that articles are displayed in the UI
2. Verify chapter grouping is correct
3. Expand/collapse articles to test functionality
4. Check that text content and items are properly displayed

## Step 3: Test Cache Clear Scenario (Main Test)

### Clear Cache
1. Open browser DevTools (F12)
2. Go to "Application" tab
3. Under "Storage", select:
   - Local Storage
   - Session Storage
4. Click "Clear site data" or delete specific keys:
   - Delete all keys starting with `articles_`
   - Delete all keys starting with `collapsedSheets_`
5. Alternatively, use Console:
   ```javascript
   sessionStorage.clear();
   localStorage.clear();
   ```

### Verify Data Persistence
1. Reload the page (F5 or Ctrl+R)
2. Navigate back to the Orcamento
3. **Expected Result**: Articles should still be displayed
4. **Why**: Articles are now loaded from database, not sessionStorage

### Verify Functionality
1. Expand/collapse chapters - should work
2. Expand/collapse articles - should work
3. Sheet separators (if multi-sheet file) - should work
4. All article content should be intact:
   - Article titles
   - Text content
   - Item tables
   - Quantities and units

## Step 4: Test Backward Compatibility

### With Old Data (sessionStorage only)
If you have old files analyzed before this fix:

1. Check sessionStorage has old data:
   ```javascript
   Object.keys(sessionStorage).filter(k => k.startsWith('articles_'))
   ```
2. These old files should still work
3. Navigate to old Orcamento
4. Articles should load from sessionStorage as fallback

### Trigger Database Migration for Old Files
1. Re-analyze old files by:
   - Deleting the file
   - Re-uploading and analyzing
2. Old data will now be in database
3. sessionStorage is no longer needed

## Step 5: Test File Deletion

### Delete File
1. Navigate to Orcamento with analyzed file
2. Click delete button on file
3. Confirm deletion

### Verify Cleanup
1. In Supabase SQL Editor:
   ```sql
   SELECT COUNT(*) FROM orcamento_articles 
   WHERE chapter_id IN (
     SELECT id FROM orcamento_chapters 
     WHERE tab_id IN (
       SELECT id FROM orcamento_tabs 
       WHERE orcamento_id = 'YOUR_ORCAMENTO_ID'
     )
   );
   ```
2. Should return 0 (articles deleted via cascade)

3. Check sessionStorage:
   ```javascript
   sessionStorage.getItem('articles_YOUR_ORCAMENTO_ID')
   ```
4. Should return null (cleaned up)

## Step 6: Test Multi-Sheet Files

### Upload Multi-Sheet File
1. Upload Excel file with multiple sheets
2. Analyze the file
3. Verify all sheets are processed

### Verify Database Storage
```sql
SELECT DISTINCT sheet_name 
FROM orcamento_articles 
WHERE chapter_id IN (
  SELECT id FROM orcamento_chapters 
  WHERE tab_id IN (
    SELECT id FROM orcamento_tabs 
    WHERE orcamento_id = 'YOUR_ORCAMENTO_ID'
  )
);
```
Should show all sheet names from Excel file

### Clear Cache and Verify
1. Clear cache as before
2. Reload page
3. All sheets should still be displayed
4. Sheet separators should work
5. Can expand/collapse sheets

## Step 7: Performance Testing

### Large Files
1. Upload file with 100+ articles
2. Analyze and wait for completion
3. Check database query performance:
   ```sql
   EXPLAIN ANALYZE 
   SELECT * FROM orcamento_articles 
   WHERE chapter_id IN (SELECT id FROM orcamento_chapters WHERE tab_id = 'TAB_ID');
   ```
4. Should use indexes (check for "Index Scan")

### Clear Cache with Large File
1. Clear cache
2. Reload
3. Measure load time
4. Should be reasonable (< 2 seconds)

## Expected Results Summary

### ✅ Pass Criteria
- Articles load from database after cache clear
- All article content is preserved (titles, text, items)
- UI functionality works (expand/collapse, navigation)
- File deletion cleans up database and sessionStorage
- Multi-sheet files work correctly
- Old files (sessionStorage) still work as fallback
- Performance is acceptable

### ❌ Fail Criteria  
- Articles disappear after cache clear
- Database query errors
- UI rendering issues
- Memory leaks or performance degradation
- Data inconsistencies

## Troubleshooting

### Articles Not Loading
1. Check database migration was applied:
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_name = 'orcamento_articles'
   );
   ```
2. Check articles were stored during analysis:
   ```sql
   SELECT COUNT(*) FROM orcamento_articles;
   ```
3. Check browser console for errors

### Performance Issues
1. Verify indexes exist:
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'orcamento_articles';
   ```
2. Should see:
   - `orcamento_articles_pkey`
   - `idx_orcamento_articles_chapter_id`
   - `idx_orcamento_articles_artigo`

### RLS Policy Issues
1. Check policies are enabled:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'orcamento_articles';
   ```
2. Should see 4 policies (SELECT, INSERT, UPDATE, DELETE)

## Rollback Plan

If issues occur:

1. To revert database changes:
   ```sql
   DROP TABLE IF EXISTS orcamento_articles CASCADE;
   ```

2. To revert code changes:
   ```bash
   git revert HEAD
   ```

3. Old code will still use sessionStorage
4. No data loss - re-analysis will work with old code

## Notes

- Migration is non-destructive (creates new table only)
- Old sessionStorage data continues to work
- No immediate action required for existing files
- Files can be re-analyzed at any time to migrate to database storage
- Performance impact is minimal (additional table joins)
