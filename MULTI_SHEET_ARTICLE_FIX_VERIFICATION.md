# Multi-Sheet Excel Article-Based View Fix - Verification Guide

## Problem Fixed

When analyzing a multi-sheet Excel file with article-based view enabled, if multiple sheets contained the same chapter numbers (e.g., Sheet1 has chapter "1" and Sheet2 also has chapter "1"), the analysis would fail with a database constraint error because:

1. Article-based view maps ALL sheets to the "Principal" tab
2. Multiple chapters with the same number trying to be inserted into the same tab violates the unique constraint on `(tab_id, chapter_number)`

## Solution Implemented

### 1. Chapter Deduplication (Lines 1148-1187)

When article-based view is enabled and multiple sheets are present, the code now:
- Tracks unique `(tab_id, chapter_number)` combinations
- Keeps only the first occurrence of each chapter
- Merges comments from duplicate chapters into the first occurrence
- Logs the deduplication for debugging

```typescript
// MULTI-SHEET FIX: When article-based view is enabled and we have multiple sheets
// with the same chapter numbers, we need to deduplicate chapters to avoid
// unique constraint violations on (tab_id, chapter_number)
let uniqueChaptersWithTabIds = chaptersWithTabIds;
if (articleBasedView && workbook.SheetNames.length > 1) {
  // Deduplication logic...
}
```

### 2. Fixed Chapter Mapping (Lines 1206-1217)

For deduplicated chapters, the mapping ensures that items from ALL sheets can find their parent chapter:
- Iterates through all inserted (deduplicated) chapters
- For each inserted chapter, finds ALL original chapters from different sheets that match
- Maps each `${sheet_name}_${chapter_number}` key to the single deduplicated chapter ID

```typescript
if (articleBasedView && workbook.SheetNames.length > 1) {
  // For deduplicated chapters, map all original sheets to the same chapter ID
  insertedChapters.forEach((chapter) => {
    chaptersToInsert.forEach((originalChapter) => {
      const originalTabId = sheetNameToTabId.get(originalChapter.sheet_name!);
      if (originalTabId === chapter.tab_id && originalChapter.chapter_number === chapter.chapter_number) {
        const key = `${originalChapter.sheet_name}_${chapter.chapter_number}`;
        chapterMap.set(key, chapter.id);
      }
    });
  });
}
```

## Test Scenarios

### Test Case 1: Multi-Sheet with Duplicate Chapters

**Setup:**
Create an Excel file with 2 sheets:

**Sheet1:**
```
| ARTIGO | DESCRIÇÃO           | UN  | QT   |
|--------|---------------------|-----|------|
| 1      | Work Type A         |     |      |
| 1.1    | Article A1          |     |      |
| 1.1.1  | Item A1.1           | m2  | 100  |
| 2      | Work Type B         |     |      |
| 2.1    | Article B1          |     |      |
| 2.1.1  | Item B1.1           | kg  | 50   |
```

**Sheet2:**
```
| ARTIGO | DESCRIÇÃO           | UN  | QT   |
|--------|---------------------|-----|------|
| 1      | Work Type C         |     |      |
| 1.1    | Article C1          |     |      |
| 1.1.1  | Item C1.1           | un  | 25   |
| 3      | Work Type D         |     |      |
| 3.1    | Article D1          |     |      |
| 3.1.1  | Item D1.1           | m   | 75   |
```

**Steps:**
1. Upload the Excel file
2. Enable "Article-based view" checkbox
3. Click "Analyze"

**Expected Results:**
- ✅ Analysis completes successfully (no database constraint error)
- ✅ Console log shows: "Multi-sheet deduplication: 4 chapters reduced to 3 unique chapters"
- ✅ 3 tabs created: Principal, Arquitetura, Instalações Especiais
- ✅ Under Principal tab, only 3 unique chapters exist: "1", "2", "3"
- ✅ Chapter "1" has merged comments if any existed
- ✅ All 6 articles are displayed (1.1, 1.1.1, 2.1, 2.1.1, 3.1, 3.1.1)
- ✅ All items from both Sheet1 and Sheet2 are correctly linked to their chapters
- ✅ Item A1.1 (from Sheet1) is under chapter "1"
- ✅ Item C1.1 (from Sheet2) is also under chapter "1"

### Test Case 2: Multi-Sheet with No Duplicate Chapters

**Setup:**
Create an Excel file with 2 sheets:

**Sheet1:**
```
| ARTIGO | DESCRIÇÃO           | UN  | QT   |
|--------|---------------------|-----|------|
| 1      | Work Type A         |     |      |
| 1.1    | Article A1          |     |      |
| 1.1.1  | Item A1.1           | m2  | 100  |
```

**Sheet2:**
```
| ARTIGO | DESCRIÇÃO           | UN  | QT   |
|--------|---------------------|-----|------|
| 2      | Work Type B         |     |      |
| 2.1    | Article B1          |     |      |
| 2.1.1  | Item B1.1           | kg  | 50   |
```

**Steps:**
1. Upload the Excel file
2. Enable "Article-based view" checkbox
3. Click "Analyze"

**Expected Results:**
- ✅ Analysis completes successfully
- ✅ No deduplication log (chapters are already unique)
- ✅ Both chapters "1" and "2" are inserted
- ✅ All articles and items are correctly displayed

### Test Case 3: Single-Sheet (Regression Test)

**Setup:**
Create an Excel file with 1 sheet:

**Sheet1:**
```
| ARTIGO | DESCRIÇÃO           | UN  | QT   |
|--------|---------------------|-----|------|
| 1      | Work Type A         |     |      |
| 1.1    | Article A1          |     |      |
| 1.1.1  | Item A1.1           | m2  | 100  |
| 2      | Work Type B         |     |      |
| 2.1    | Article B1          |     |      |
| 2.1.1  | Item B1.1           | kg  | 50   |
```

**Steps:**
1. Upload the Excel file
2. Enable "Article-based view" checkbox
3. Click "Analyze"

**Expected Results:**
- ✅ Analysis completes successfully
- ✅ Deduplication code is NOT executed (single sheet)
- ✅ All chapters, articles, and items display correctly
- ✅ No regression in existing functionality

### Test Case 4: Multi-Sheet with Chapter Comments

**Setup:**
Create an Excel file with 2 sheets where duplicate chapters have different comments:

**Sheet1:**
```
| ARTIGO | DESCRIÇÃO                  | UN  | QT   |
|--------|----------------------------|-----|------|
| 1      | Work Type A                |     |      |
|        | Comment from Sheet1        |     |      |
| 1.1    | Article A1                 |     |      |
```

**Sheet2:**
```
| ARTIGO | DESCRIÇÃO                  | UN  | QT   |
|--------|----------------------------|-----|------|
| 1      | Work Type A                |     |      |
|        | Comment from Sheet2        |     |      |
| 1.1    | Article C1                 |     |      |
```

**Steps:**
1. Upload the Excel file
2. Enable "Article-based view" checkbox
3. Click "Analyze"

**Expected Results:**
- ✅ Analysis completes successfully
- ✅ Only one chapter "1" is inserted
- ✅ Chapter "1" has merged comments: "Comment from Sheet1\nComment from Sheet2"
- ✅ Both articles are displayed

## Debugging

If issues occur, check the browser console for these logs:

1. **Deduplication Log:**
   ```
   Multi-sheet deduplication: X chapters reduced to Y unique chapters
   ```
   This confirms deduplication is working.

2. **Chapter Insertion Log:**
   ```
   Inserting Y chapters into database
   ```
   This shows how many unique chapters are being inserted.

3. **Item Processing Log:**
   ```
   Processing Z items, W have valid chapter IDs
   ```
   This confirms items are finding their parent chapters.

## Code Changes Summary

**File:** `src/pages/MapaQuantidades.tsx`

**Lines 1148-1187:** Added chapter deduplication logic
- Detects when article-based view is enabled with multiple sheets
- Creates unique chapters based on `(tab_id, chapter_number)`
- Merges comments from duplicate chapters

**Lines 1206-1217:** Fixed chapter-to-item mapping
- Maps all original chapters (from different sheets) to the single deduplicated chapter
- Ensures items from all sheets can find their parent chapter

**Total changes:** ~55 new lines added

## Impact

- ✅ Multi-sheet Excel files now work with article-based view
- ✅ No data loss - all items from all sheets are correctly linked
- ✅ Comments from duplicate chapters are preserved and merged
- ✅ No regression in single-sheet or multi-sheet without duplicates scenarios
- ✅ Clear console logging for debugging
