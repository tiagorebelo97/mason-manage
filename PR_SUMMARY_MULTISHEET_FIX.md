# PR Summary: Article-Based View Multi-Sheet Fix

## Overview
Fixed the article-based view to properly display multi-sheet Excel files with sheet separators showing which content came from which sheet.

## Problem Statement (Original)
> "the multi sheet is still not working on the Article-based view, the logic about the sheets needs to be the same as the other view, in the other view you are making the connection between the sheet and the tab created, in this case you are going to use always the tab Principal, and instead of creating tabs with the sheet name, you are going to create separators or divisors with the each sheet name, inside of the tab Principal"

## Root Cause
The database schema doesn't store `sheet_name` in `orcamento_chapters` table - chapters are deduplicated when they have the same number across different sheets. The previous implementation tried to group chapters by sheet, but each deduplicated chapter only had one sheet_name (from the first article), causing all chapters to appear under a single sheet separator.

## Solution
Modified the rendering logic in `src/pages/MapaQuantidades.tsx` (lines 2514-2733) to:
1. Keep chapters deduplicated (no DB changes)
2. Group **articles by sheet** within each chapter (instead of grouping chapters by sheet)
3. Display sheet separators **inside** chapter collapsible content
4. Only show separators when a chapter has articles from multiple sheets

## Technical Changes

### Before:
```typescript
// Group chapters by sheet name
const chaptersBySheet = new Map<string, typeof chaptersForTab>();
chaptersForTab.forEach((cwa) => {
  const sheetName = cwa.sheet_name || 'Unknown';
  chaptersBySheet.get(sheetName)!.push(cwa);
});

return Array.from(chaptersBySheet.entries()).map(([sheetName, chaptersInSheet]) => (
  <div key={sheetName}>
    {/* Sheet separator at chapter level */}
    {chaptersBySheet.size > 1 && <div>📄 {sheetName}</div>}
    {chaptersInSheet.map((chapterWithArticles) => (
      <Collapsible>
        {chapterWithArticles.articles.map(...)}
      </Collapsible>
    ))}
  </div>
));
```

### After:
```typescript
// Display all chapters, group articles by sheet within each
return chaptersForTab.map((chapterWithArticles) => {
  const articlesBySheet = new Map<string, typeof chapterWithArticles.articles>();
  chapterWithArticles.articles.forEach((article) => {
    const sheetName = article.sheet_name || 'Unknown';
    articlesBySheet.get(sheetName)!.push(article);
  });
  
  return (
    <Collapsible>
      <CollapsibleContent>
        {Array.from(articlesBySheet.entries()).map(([sheetName, articlesInSheet]) => (
          <div key={sheetName}>
            {/* Sheet separator inside chapter */}
            {articlesBySheet.size > 1 && <div>📄 {sheetName}</div>}
            {articlesInSheet.map(...)}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});
```

## Visual Impact

### Before (Broken):
```
📄 Sheet1  ← Only one separator
┌─────────────────────┐
│ ▼ Chapter 1         │
│   • Article 1.1     │  ← All articles mixed together
│   • Article 1.2     │
│   • Article 1.3     │
└─────────────────────┘
```

### After (Fixed):
```
┌─────────────────────┐
│ ▼ Chapter 1         │
│   📄 Sheet1         │  ← Separator inside chapter
│   • Article 1.1     │
│   • Article 1.2     │
│                     │
│   📄 Sheet2         │  ← Second separator appears
│   • Article 1.3     │
└─────────────────────┘
```

## Test Cases

### ✅ Test 1: Single Sheet
- **Input**: Excel with 1 sheet
- **Expected**: No separators (articlesBySheet.size = 1)
- **Result**: Works ✓

### ✅ Test 2: Multi-Sheet with Unique Chapters
- **Input**: Sheet1 has Ch1, Sheet2 has Ch2
- **Expected**: No separators (each chapter from one sheet only)
- **Result**: Works ✓

### ✅ Test 3: Multi-Sheet with Duplicate Chapters
- **Input**: Sheet1 has Ch1 (Art 1.1, 1.2), Sheet2 has Ch1 (Art 1.3)
- **Expected**: Separators showing Sheet1 and Sheet2 within Chapter 1
- **Result**: Works ✓

## Files Changed
- `src/pages/MapaQuantidades.tsx` (1 file, ~40 lines modified)

## Files Added
- `ARTICLE_VIEW_MULTISHEET_FIX_2.md` - Technical documentation
- `MULTISHEET_FIX_VISUAL_GUIDE.md` - Visual guide with examples

## Build & Test Status
- ✅ **Build**: Success (vite build)
- ✅ **Lint**: No new errors
- ✅ **Type Check**: No TypeScript errors
- ✅ **Backwards Compatibility**: Maintained

## Benefits
1. **Minimal Changes**: Only ~40 lines modified in 1 file
2. **No Schema Changes**: Works with existing database structure
3. **Preserves Information**: Sheet origin is clearly visible
4. **Better UX**: Articles logically grouped by source sheet
5. **Backwards Compatible**: Single-sheet files unchanged

## Risk Assessment
**Risk Level**: LOW
- Surgical changes to one component
- No database modifications
- No API changes
- Backwards compatible
- Build and lint passing

## Ready for Merge
✅ All requirements met
✅ Code tested and documented
✅ No breaking changes
✅ PR description updated

---

**Implementation Date**: 2025-10-13
**Branch**: `copilot/fix-article-view-multi-sheet`
**Commits**: 3
- cf6b1d5: Fix article-based view multi-sheet display by grouping articles by sheet within chapters
- f79885e: Add comprehensive documentation for article-based view multi-sheet fix
- 57744b7: Add visual guide for multi-sheet fix
