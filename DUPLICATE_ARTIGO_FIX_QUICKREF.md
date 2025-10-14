# Duplicate ARTIGO Fix - Quick Reference

## What Was Fixed

**Problem 1**: In article-based view, if multiple sheets had the same chapter number (e.g., Chapter "1"), the articles would be incorrectly grouped together, causing display errors.

**Solution 1**: Articles are now grouped by `sheet_name + chapter_number` instead of just `chapter_number`, maintaining proper separation between sheets.

**Problem 2**: Chapters with the same number from different sheets were not returned in insertion order from the database, causing article-to-chapter mapping to fail.

**Solution 2**: Added `.order("id")` to the chapters query to ensure chapters are returned in insertion order.

## Files Changed

- `src/pages/MapaQuantidades.tsx` (Lines ~223, ~305-365, ~1384-1402)

## Code Changes Summary

### Change 1: Chapter Query Ordering (NEW - Latest Fix)

**Before:**
```typescript
.order("chapter_number")
```

**After:**
```typescript
.order("chapter_number")
.order("id"); // Ensure insertion order for chapters with same number (multi-sheet)
```

**Why:** Ensures chapters with same number are returned in insertion order, which matches the order sheets were processed. This allows correct article-to-chapter mapping.

### Change 2: Article Grouping

**Before:**
```typescript
// Grouped by chapter_number only - WRONG for multi-sheet
const groupedByChapter = new Map<string, typeof articlesData>();
articlesData.forEach((article) => {
  groupedByChapter.get(article.chapter_number).push(article);
});
```

**After:**
```typescript
// Group by sheet_name + chapter_number - CORRECT
const groupOrder: Array<{ sheetName, chapterNumber, articles }> = [];
articlesData.forEach((article) => {
  // Find or create group for sheet + chapter combo
  let group = groupOrder.find(g => 
    g.sheetName === article.sheet_name && 
    g.chapterNumber === article.chapter_number
  );
  if (!group) {
    group = { sheetName, chapterNumber, articles: [] };
    groupOrder.push(group);
  }
  group.articles.push(article);
});
```

## Quick Test

1. Create Excel with 2 sheets, both having Chapter "1"
2. Enable "Article-based view"
3. Analyze
4. Verify: Both chapters appear separately, no mixing of articles

## Related Documentation

- Full details on latest fix: `DUPLICATE_ARTIGO_CHAPTER_ORDER_FIX.md`
- Full details on article grouping fix: `DUPLICATE_ARTIGO_FIX.md`
- Original feature: `ARTICLE_BASED_VIEW_FEATURE.md`
- Multi-sheet handling: `ARTICLE_BASED_VIEW_MULTISHEET_FIX.md`
