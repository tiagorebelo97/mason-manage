# MapaQuantidades Empty Page Fix

## Problem
After analyzing a file on the quantity map page, the page appeared empty with only the file import section visible. The rest of the data (chapters, items, articles) was not displayed.

## Root Cause
The page display was conditional on `isArticleBasedViewActive`, which is determined by `chaptersWithArticles.length > 0`. When:
1. Articles data was not created during file analysis, OR
2. The articles query returned empty results, OR  
3. The useEffect that populates `chaptersWithArticles` didn't run

Then `isArticleBasedViewActive` would be false, and nothing would render even though items existed in the database.

## Solution
1. **Removed the `isArticleBasedViewActive` condition** from the main display check (line 1998)
   - Changed from: `{isAnalyzed && isArticleBasedViewActive && tabs && tabs.length > 0 && (`
   - Changed to: `{isAnalyzed && tabs && tabs.length > 0 && (`
   - This ensures the display section renders whenever the file is analyzed and tabs exist

2. **Added fallback item-based display** (lines 2024-2158)
   - When `isArticleBasedViewActive` is false (no articles available), the page falls back to displaying items directly
   - Items are grouped by chapters within each tab
   - Displays:
     - Chapter headers with collapse/expand functionality
     - Chapter comments (if present)
     - Items in a table format with: Artigo, Descrição, UN, QT, Observações
     - Item comments (displayed as italic text under the artigo)
     - Observações images (displayed as hover cards)
     - Move chapter functionality between tabs

## Changes Made
File: `/src/pages/MapaQuantidades.tsx`

### Line 1998
```typescript
// Before:
{isAnalyzed && isArticleBasedViewActive && tabs && tabs.length > 0 && (

// After:
{isAnalyzed && tabs && tabs.length > 0 && (
```

### Lines 2020-2022
```typescript
// Added fallback condition:
const chaptersForTab = isArticleBasedViewActive 
  ? chaptersWithArticles.filter((cwa) => cwa.chapter.tab_id === tab.id)
  : [];
```

### Lines 2024-2158
Added complete fallback UI for item-based display:
- Chapter collapsibles with headers
- Chapter comments display
- Items table with all columns
- Item comments as sub-text under artigo
- Image hover cards for observações
- Move chapter functionality

## Impact
- ✅ Page now always displays data after file analysis
- ✅ Works with both article-based view (when available) and item-based view (fallback)
- ✅ All existing functionality preserved (move chapters, collapsible sections, etc.)
- ✅ Backward compatible with existing data
- ✅ No breaking changes to data structures

## Testing Scenarios
1. **File with articles**: Should display article-based view as before
2. **File without articles**: Should display item-based view (fallback)
3. **Empty file**: Should still show tabs but with no content (expected)
4. **Multiple tabs**: Should work correctly with chapter movement between tabs

## Related Issues
- Fixes the "empty page after file import" issue
- Ensures data is always visible after file analysis
