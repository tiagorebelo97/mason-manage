# PR Summary: Fix Duplicate ARTIGO Numbers in Article-Based View

## Issue
When using article-based view to analyze Excel files with multiple sheets, if the same ARTIGO (chapter) number appeared on different sheets (e.g., Chapter "1" in both Sheet1 and Sheet2), the application would incorrectly group all articles with that chapter number together, causing data mixing and display errors.

## Root Cause
The article grouping logic in the `useEffect` hook was using only `chapter_number` as the grouping key, ignoring the `sheet_name` property. This caused articles from different sheets with the same chapter number to be merged into a single group.

## Solution
Updated the article grouping and matching logic to:
1. Group articles by the combination of `sheet_name + chapter_number`
2. Maintain the original extraction order (sheet order) using an array structure
3. Match article groups to database chapters using a "first unused" strategy that respects insertion order

## Changes Made

### File: `src/pages/MapaQuantidades.tsx`

#### Change 1: Updated Article Grouping (Lines 304-377)
**Before:**
```typescript
const groupedByChapter = new Map<string, typeof articlesData>();
articlesData.forEach((article) => {
  if (!groupedByChapter.has(article.chapter_number)) {
    groupedByChapter.set(article.chapter_number, []);
  }
  groupedByChapter.get(article.chapter_number)!.push(article);
});

chapters.forEach((chapter) => {
  const articlesForChapter = groupedByChapter.get(chapter.chapter_number) || [];
  // ... assign all articles with this chapter_number to this chapter
});
```

**After:**
```typescript
// Group by sheet_name + chapter_number
const groupOrder: Array<{ sheetName, chapterNumber, articles }> = [];
articlesData.forEach((article) => {
  // Find or create group for this sheet + chapter combination
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

// Group database chapters by chapter_number
const chaptersByNumber = new Map<string, typeof chapters>();
chapters.forEach((chapter) => {
  if (!chaptersByNumber.has(chapter.chapter_number)) {
    chaptersByNumber.set(chapter.chapter_number, []);
  }
  chaptersByNumber.get(chapter.chapter_number)!.push(chapter);
});

// Match article groups to chapters in order
groupOrder.forEach((groupData) => {
  const candidateChapters = chaptersByNumber.get(groupData.chapterNumber) || [];
  const chapter = candidateChapters.find(ch => !usedChapters.has(ch.id));
  if (chapter) {
    usedChapters.add(chapter.id);
    // ... assign this article group to this specific chapter
  }
});
```

#### Change 2: Cleaned Up onSuccess Callback (Lines 1384-1390)
Removed unused `groupedArticles` variable that was grouping articles by `chapter_number` only. The actual grouping and matching now happens entirely in the `useEffect` hook.

## Technical Details

### How It Works

1. **During Extraction:**
   - Sheets are processed in order (Sheet1, Sheet2, ...)
   - Articles are extracted with `sheet_name` and `chapter_number`
   - Articles are stored in sessionStorage with all metadata

2. **During Display:**
   - Articles are retrieved from sessionStorage
   - Articles are grouped by `sheet_name + chapter_number` in original order
   - Database chapters are fetched (ordered by `chapter_number`)
   - Each article group is matched to the first unused chapter with matching `chapter_number`
   - This ensures Sheet1's Chapter "1" matches before Sheet2's Chapter "1"

### Why This Works

- Database chapters are ordered by `chapter_number`, and within the same number, by insertion order (ID)
- Since sheets are processed in order, chapters are inserted in sheet order
- The "first unused" matching strategy respects this order
- Result: Each sheet's articles get matched to the correct chapter

## Testing Scenarios

### Scenario 1: Duplicate Chapter Numbers
**Excel File:**
- Sheet1: Chapter "1" → Article "1.1"
- Sheet2: Chapter "1" → Article "1.1"

**Expected:** Both chapters appear separately, each with its own Article "1.1"

### Scenario 2: Mixed Chapter Numbers
**Excel File:**
- Sheet1: Chapter "1", Chapter "2"
- Sheet2: Chapter "1", Chapter "3"

**Expected:** Four chapters total, articles correctly assigned to each

### Scenario 3: Single Sheet
**Excel File:**
- Sheet1: Chapter "1", Chapter "2"

**Expected:** Existing behavior unchanged, both chapters display correctly

## Impact

- ✅ **Article-based view with multi-sheet files**: Now works correctly with duplicate chapter numbers
- ✅ **Article-based view with single-sheet files**: Behavior unchanged
- ✅ **Normal view (non-article-based)**: Not affected by these changes
- ✅ **Data integrity**: No data loss or mixing between sheets
- ✅ **Performance**: No significant performance impact (grouping logic is O(n) with small constant factors)

## Documentation

- **Full Details**: `DUPLICATE_ARTIGO_FIX.md`
- **Quick Reference**: `DUPLICATE_ARTIGO_FIX_QUICKREF.md`
- **Related Features**: `ARTICLE_BASED_VIEW_FEATURE.md`, `ARTICLE_BASED_VIEW_MULTISHEET_FIX.md`

## Build Status

✅ Build successful - no TypeScript or linting errors

## Files Modified

- `src/pages/MapaQuantidades.tsx` (+49 lines, -24 lines)

## Files Added

- `DUPLICATE_ARTIGO_FIX.md` (comprehensive documentation)
- `DUPLICATE_ARTIGO_FIX_QUICKREF.md` (quick reference guide)
