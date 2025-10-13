# Quick Reference: Sheet/Separator Context Fix

## What Changed

Fixed article-based view to respect sheet/separator boundaries when multiple sheets contain the same chapter numbers.

## Before → After

### Before Fix ❌
```
Multi-sheet Excel with duplicate chapter numbers:
├─ Sheet1: Chapter "1" = "Trabalhos Preliminares"
│  ├─ Item 1.1: Limpeza (100 m2)
│  └─ Item 1.2: Sinalização (5 un)
└─ Sheet2: Chapter "1" = "Fundações"
   ├─ Item 1.1: Escavação (50 m3)
   └─ Item 1.2: Betão (30 m3)

Result in database:
├─ Tab: "Principal" (all sheets merged)
└─ Chapter "1": "Trabalhos Preliminares" (Sheet2's chapter lost!)
   ├─ Item 1.1: Limpeza (100 m2) ← from Sheet1
   ├─ Item 1.2: Sinalização (5 un) ← from Sheet1
   ├─ Item 1.1: Escavação (50 m3) ← from Sheet2 (WRONG CHAPTER!)
   └─ Item 1.2: Betão (30 m3) ← from Sheet2 (WRONG CHAPTER!)
```

### After Fix ✓
```
Same Excel file:
├─ Sheet1: Chapter "1" = "Trabalhos Preliminares"
│  ├─ Item 1.1: Limpeza (100 m2)
│  └─ Item 1.2: Sinalização (5 un)
└─ Sheet2: Chapter "1" = "Fundações"
   ├─ Item 1.1: Escavação (50 m3)
   └─ Item 1.2: Betão (30 m3)

Result in database:
├─ Tab: "Sheet1"
│  └─ Chapter "1": "Trabalhos Preliminares"
│     ├─ Item 1.1: Limpeza (100 m2) ✓
│     └─ Item 1.2: Sinalização (5 un) ✓
└─ Tab: "Sheet2"
   └─ Chapter "1": "Fundações"
      ├─ Item 1.1: Escavação (50 m3) ✓
      └─ Item 1.2: Betão (30 m3) ✓
```

## Code Changes

### File: `src/pages/MapaQuantidades.tsx`

#### 1. Line 581 - Tab Creation
```diff
- const hasMultipleSheets = (articleBasedView || treatAsSingleSheet) ? false : workbook.SheetNames.length > 1;
+ const hasMultipleSheets = treatAsSingleSheet ? false : workbook.SheetNames.length > 1;
```

#### 2. Lines 1148-1150 - Remove Deduplication
```diff
- // Complex 37-line deduplication logic removed
+ const uniqueChaptersWithTabIds = chaptersWithTabIds;
```

#### 3. Lines 1165-1176 - Simplify Mapping
```diff
- // Complex conditional logic for article-based view removed
+ // Simple consistent mapping for all cases
  insertedChapters.forEach((chapter, index) => {
    const originalChapter = chaptersToInsert[index];
    if (originalChapter && originalChapter.sheet_name) {
      const key = `${originalChapter.sheet_name}_${chapter.chapter_number}`;
      chapterMap.set(key, chapter.id);
    }
  });
```

## Impact

✅ **Separator context now respected** - Each sheet maintains its own chapters  
✅ **No data loss** - All chapters and items preserved  
✅ **Correct organization** - Items map to proper chapters in their sheets  
✅ **Simpler code** - Removed 52 lines of complex deduplication logic  
✅ **Build successful** - No errors, passes all linting

## Testing

### To Verify Fix:
1. Create Excel with 2+ sheets
2. Each sheet has same chapter numbers (e.g., both have Chapter "1", "2", "3")
3. Enable article-based view
4. Upload and analyze
5. **Expected:** Each sheet gets its own tab, chapters stay separate

## Documentation

- Full details: `SHEET_SEPARATOR_CONTEXT_FIX.md`
- This summary: `QUICK_REFERENCE_SEPARATOR_FIX.md`
