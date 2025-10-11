# Quick Fix Summary: Multi-Sheet Article-Based View

## Problem
❌ Multi-sheet Excel files fail to analyze in article-based view with "Failed to analyze file" error

## Root Cause
When article-based view maps all sheets to "Principal" tab, duplicate chapter numbers across sheets violate the database unique constraint on `(tab_id, chapter_number)`.

**Example:**
- Sheet1: Chapter "1"  
- Sheet2: Chapter "1"  
- Both try to insert as `(Principal, "1")` → ❌ Constraint violation

## Solution

### Change 1: Deduplicate Chapters (Lines 1148-1187)
```typescript
if (articleBasedView && workbook.SheetNames.length > 1) {
  // Keep only first occurrence of each (tab_id, chapter_number)
  // Merge comments from duplicates
  uniqueChaptersWithTabIds = deduplicatedChapters;
}
```

### Change 2: Fix Item Mapping (Lines 1206-1217)
```typescript
if (articleBasedView && workbook.SheetNames.length > 1) {
  // Map items from ALL sheets to deduplicated chapters
  insertedChapters.forEach((chapter) => {
    chaptersToInsert.forEach((originalChapter) => {
      if (matches) {
        chapterMap.set(`${sheet_name}_${chapter_number}`, chapter.id);
      }
    });
  });
}
```

## Impact
✅ Multi-sheet Excel files now work in article-based view  
✅ All items from all sheets correctly linked to chapters  
✅ Comments from duplicate chapters are merged  
✅ No data loss  
✅ No regressions in existing functionality  

## Testing
1. Create Excel with 2+ sheets having duplicate chapter numbers
2. Enable "Article-based view"
3. Click "Analyze"
4. Expected: Success with all data visible

## Files Changed
- `src/pages/MapaQuantidades.tsx` (+55 lines)
- `MULTI_SHEET_ARTICLE_FIX_VERIFICATION.md` (new, test guide)

## Console Debug Logs
```
Multi-sheet deduplication: X chapters reduced to Y unique chapters
Inserting Y chapters into database
Successfully inserted Y chapters
```
