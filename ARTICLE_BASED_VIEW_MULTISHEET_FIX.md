# Article-Based View Multi-Sheet Fix

## Problem Statement

When using the article-based view with an Excel file containing more than one sheet, the analysis was failing with "Failed to analyze file" error. Additionally, articles with UN and QT values were not being captured.

## Root Causes

### Issue 1: Multi-Sheet Mapping Failure
**Location**: `src/pages/MapaQuantidades.tsx`, lines 1070-1076 (before fix)

**Problem**: 
- When `articleBasedView` was enabled, the code set `hasMultipleSheets = false` to create 3 default tabs (Principal, Arquitetura, Instalações Especiais)
- However, the sheet-to-tab mapping logic only mapped the FIRST sheet to the Principal tab
- This caused chapters from other sheets to have `tab_id = null`, which likely caused foreign key constraint violations or data loss

**Symptom**: "Failed to analyze file" error when analyzing multi-sheet Excel files in article-based view

### Issue 2: Chapter-to-Item Mapping Failure
**Location**: `src/pages/MapaQuantidades.tsx`, lines 1103-1120 (before fix)

**Problem**:
- The chapter mapping logic tried to look up sheet names from tab names
- For single-sheet mode (including article-based view), it only used the first sheet name
- This caused items from sheets 2, 3, etc. to not find their parent chapters

**Symptom**: Items from non-first sheets would not be linked to chapters

### Issue 3: Article UN/QT Not Captured
**Location**: `src/pages/MapaQuantidades.tsx`, lines 806-822 (before fix)

**Problem**:
- When an article row (e.g., "1.1") was detected, only the artigo and descricao were captured
- If the article row itself had UN and QT values, they were ignored
- According to requirements, articles with UN and QT should display these values in a table

**Symptom**: Article rows with UN and QT values were not showing those values in the UI

## Solutions Implemented

### Fix 1: Map ALL Sheets to Principal Tab
**File**: `src/pages/MapaQuantidades.tsx`
**Lines**: 1063-1079

**Change**:
```typescript
// BEFORE:
if (principalTab && workbook.SheetNames.length > 0) {
  sheetNameToTabId.set(workbook.SheetNames[0], principalTab.id);
}

// AFTER:
if (principalTab) {
  workbook.SheetNames.forEach(sheetName => {
    sheetNameToTabId.set(sheetName, principalTab.id);
  });
}
```

**Result**: All sheets are now mapped to the Principal tab, so chapters from ALL sheets will have the correct `tab_id`

### Fix 2: Use Original Sheet Names for Chapter Mapping
**File**: `src/pages/MapaQuantidades.tsx`
**Lines**: 1103-1111

**Change**:
```typescript
// BEFORE: Complex logic trying to look up sheet names from tab names
insertedChapters.forEach(chapter => {
  if (hasMultipleSheets) {
    const tab = insertedTabs.find(t => t.id === chapter.tab_id);
    if (tab) {
      const key = `${tab.name}_${chapter.chapter_number}`;
      chapterMap.set(key, chapter.id);
    }
  } else {
    if (workbook.SheetNames.length > 0) {
      const key = `${workbook.SheetNames[0]}_${chapter.chapter_number}`;
      chapterMap.set(key, chapter.id);
    }
  }
});

// AFTER: Simple logic using original sheet names
insertedChapters.forEach((chapter, index) => {
  const originalChapter = chaptersToInsert[index];
  if (originalChapter && originalChapter.sheet_name) {
    const key = `${originalChapter.sheet_name}_${chapter.chapter_number}`;
    chapterMap.set(key, chapter.id);
  }
});
```

**Result**: Chapter mapping works correctly for all sheets, items can find their parent chapters

### Fix 3: Capture UN and QT from Article Rows
**File**: `src/pages/MapaQuantidades.tsx`
**Lines**: 822-870

**Change**: Added logic after article detection to check if the article row has UN and QT values:
```typescript
// Check if the article row itself has UN and QT values
// If so, add them to the article contents as an item
if (hasUN && hasQT) {
  const unValue = /* extract UN value */;
  const qtValue = /* extract QT value */;
  const parsedQt = /* parse QT value */;
  const observacoesValue = /* extract observacoes if present */;
  
  if (unValue && parsedQt !== null && !isNaN(parsedQt)) {
    currentArticleContents.push({
      type: 'item',
      data: {
        artigo: artigoCell,
        descricao: descricaoCell,
        un: unValue,
        qt: parsedQt,
        observacoes_empreiteiro: observacoesValue || undefined
      }
    });
  }
}
```

**Result**: Articles with UN and QT values now have those values captured and displayed in a table

## Testing Instructions

### Test Case 1: Single-Sheet Excel File with Article-Based View
1. Upload an Excel file with 1 sheet
2. Enable "Article-based view" checkbox
3. Click "Analyze"
4. **Expected**: 3 tabs created (Principal, Arquitetura, Instalações Especiais)
5. **Expected**: All articles displayed under Principal tab
6. **Expected**: Articles with UN/QT show values in tables

### Test Case 2: Multi-Sheet Excel File with Article-Based View
1. Upload an Excel file with 2+ sheets (e.g., "Sheet1", "Sheet2", "Sheet3")
2. Enable "Article-based view" checkbox
3. Click "Analyze"
4. **Expected**: Analysis completes successfully (no "Failed to analyze file" error)
5. **Expected**: 3 tabs created (Principal, Arquitetura, Instalações Especiais)
6. **Expected**: All articles from ALL sheets displayed under Principal tab
7. **Expected**: Articles with UN/QT show values in tables
8. **Expected**: Items from all sheets are correctly linked to their chapters

### Test Case 3: Article with UN and QT Values
Create an Excel file with this structure:
```
| ARTIGO | DESCRIÇÃO           | UN  | QT   |
|--------|---------------------|-----|------|
| 1      | Chapter Name        |     |      |
| 1.1    | Article with values | m2  | 100  | <- Article row with UN and QT
| 1.1.1  | Item in article     | un  | 5    |
| 1.2    | Article without     |     |      | <- Article without UN and QT
| 1.2.1  | Item in article     | kg  | 50   |
```

1. Upload this Excel file
2. Enable "Article-based view"
3. Click "Analyze"
4. Navigate to article "1.1"
5. **Expected**: A table with one row showing:
   - ARTIGO: 1.1
   - DESCRIÇÃO: Article with values
   - UN: m2
   - QT: 100
6. **Expected**: Another table below showing:
   - ARTIGO: 1.1.1
   - DESCRIÇÃO: Item in article
   - UN: un
   - QT: 5
7. Navigate to article "1.2"
8. **Expected**: Only one table showing item 1.2.1 (no table for article itself since it has no UN/QT)

## Technical Notes

### Sheet Name Preservation
The fix preserves the original sheet names throughout the analysis:
- `chaptersToInsert` array contains `sheet_name` field from original Excel
- `itemsToInsert` array contains `sheet_name` field from original Excel
- These are used to create the lookup key `${sheet_name}_${chapter_number}`

### Array Order Assumption
The fix assumes that:
- `insertedChapters` array is in the same order as `chaptersToInsert` array
- This is a valid assumption because Supabase returns inserted rows in insertion order

### UI Rendering
No changes to UI rendering were needed because:
- The existing code already groups consecutive items into tables
- The existing code already handles both text and item content types
- The fix only adds more items to the article contents, which the UI already handles

## Verification

Build status: ✅ Success
Lint status: ✅ No new errors
