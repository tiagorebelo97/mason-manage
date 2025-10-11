# Quick Reference: Article-Based View Multi-Sheet Fix

## Problem
- ❌ Multi-sheet Excel files failed with "Failed to analyze file" in article-based view
- ❌ Articles with UN and QT values were not captured

## Solution
Three surgical fixes in `src/pages/MapaQuantidades.tsx`:

### Fix 1: Map All Sheets to Principal Tab (Lines 1063-1079)
```typescript
// Before:
if (principalTab && workbook.SheetNames.length > 0) {
  sheetNameToTabId.set(workbook.SheetNames[0], principalTab.id);
}

// After:
if (principalTab) {
  workbook.SheetNames.forEach(sheetName => {
    sheetNameToTabId.set(sheetName, principalTab.id);
  });
}
```

### Fix 2: Use Original Sheet Names for Chapter Mapping (Lines 1103-1111)
```typescript
// Before: Complex lookup logic that only worked for first sheet

// After: Simple array index mapping
insertedChapters.forEach((chapter, index) => {
  const originalChapter = chaptersToInsert[index];
  if (originalChapter && originalChapter.sheet_name) {
    const key = `${originalChapter.sheet_name}_${chapter.chapter_number}`;
    chapterMap.set(key, chapter.id);
  }
});
```

### Fix 3: Capture Article UN/QT (Lines 822-870)
```typescript
// After detecting article (e.g., "1.1"):
if (hasUN && hasQT) {
  // Extract UN, QT, and observacoes values
  // Add to article contents as an item
  currentArticleContents.push({
    type: 'item',
    data: { artigo, descricao, un, qt, observacoes_empreiteiro }
  });
}
```

## Impact
✅ Multi-sheet Excel files now work in article-based view
✅ All sheets combined into Principal tab
✅ Articles with UN/QT show values in tables
✅ No data loss from any sheet

## Testing
1. Multi-sheet file with article-based view → Should work
2. Article with UN and QT values → Should show in table
3. Single-sheet file → Should work as before

## Files Changed
- `src/pages/MapaQuantidades.tsx` (3 sections, ~60 lines added/modified)

## Build Status
✅ Build successful
✅ Lint clean
✅ Logic verified
