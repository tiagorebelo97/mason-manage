# Multi-Sheet Excel Analysis Fix for Article-Based View

## Problem Statement

When analyzing multi-sheet Excel files with article-based view enabled, the system was failing with errors because:
1. Only the first sheet was being mapped to the Principal tab
2. Chapters from Sheet2, Sheet3, etc. had `tab_id = null`
3. Items couldn't find their parent chapters due to incorrect mapping keys

## Root Cause Analysis

### Issue 1: Incomplete Sheet-to-Tab Mapping
**Location**: `src/pages/MapaQuantidades.tsx`, line 1070-1076 (before fix)

**The Problem**:
```typescript
// When articleBasedView = true, hasMultipleSheets = false
const hasMultipleSheets = (articleBasedView || treatAsSingleSheet) ? false : workbook.SheetNames.length > 1;

// Then only the FIRST sheet got mapped:
if (principalTab && workbook.SheetNames.length > 0) {
  sheetNameToTabId.set(workbook.SheetNames[0], principalTab.id); // Only Sheet1!
}
```

**What Happened**:
- Excel file: ["Sheet1", "Sheet2", "Sheet3"]
- Mapping created: { "Sheet1" → Principal tab ID }
- When processing chapters:
  - Chapter from Sheet1: `tab_id = sheetNameToTabId.get("Sheet1")` ✓ Found!
  - Chapter from Sheet2: `tab_id = sheetNameToTabId.get("Sheet2")` ✗ Not found → `null`
  - Chapter from Sheet3: `tab_id = sheetNameToTabId.get("Sheet3")` ✗ Not found → `null`
- Database insertion fails due to foreign key constraint or chapters have null tab_id

### Issue 2: Incorrect Chapter Mapping
**Location**: `src/pages/MapaQuantidades.tsx`, line 1102-1118 (before fix)

**The Problem**:
```typescript
insertedChapters.forEach(chapter => {
  if (hasMultipleSheets) {
    // Multi-sheet logic...
  } else {
    // For single-sheet files (including article-based view):
    if (workbook.SheetNames.length > 0) {
      const key = `${workbook.SheetNames[0]}_${chapter.chapter_number}`; // Always Sheet1!
      chapterMap.set(key, chapter.id);
    }
  }
});
```

**What Happened**:
- Excel file: ["Sheet1", "Sheet2", "Sheet3"]
- Chapters from Sheet1, chapter 1: Key created = "Sheet1_1" ✓
- Chapters from Sheet2, chapter 2: Key created = "Sheet1_2" ✗ Wrong! Should be "Sheet2_2"
- Chapters from Sheet3, chapter 3: Key created = "Sheet1_3" ✗ Wrong! Should be "Sheet3_3"
- When processing items:
  - Item from Sheet2, chapter 2: Looks for key "Sheet2_2" → Not found → Item has no chapter_id → Orphaned

## Solution Implemented

### Fix 1: Map ALL Sheets to Principal Tab

**File**: `src/pages/MapaQuantidades.tsx`  
**Lines**: 1071-1078

**Change**:
```typescript
// BEFORE:
const principalTab = insertedTabs.find(tab => tab.name === "Principal");
if (principalTab && workbook.SheetNames.length > 0) {
  sheetNameToTabId.set(workbook.SheetNames[0], principalTab.id);
}

// AFTER:
const principalTab = insertedTabs.find(tab => tab.name === "Principal");
if (principalTab) {
  workbook.SheetNames.forEach(sheetName => {
    sheetNameToTabId.set(sheetName, principalTab.id);
  });
}
```

**Result**:
- Excel file: ["Sheet1", "Sheet2", "Sheet3"]
- Mapping created: { "Sheet1" → Principal tab ID, "Sheet2" → Principal tab ID, "Sheet3" → Principal tab ID }
- All chapters now have valid `tab_id` values ✓

### Fix 2: Use Original Sheet Names for Chapter Mapping

**File**: `src/pages/MapaQuantidades.tsx`  
**Lines**: 1105-1112

**Change**:
```typescript
// BEFORE:
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

// AFTER:
insertedChapters.forEach((chapter, index) => {
  const originalChapter = chaptersToInsert[index];
  if (originalChapter && originalChapter.sheet_name) {
    const key = `${originalChapter.sheet_name}_${chapter.chapter_number}`;
    chapterMap.set(key, chapter.id);
  }
});
```

**Result**:
- Uses index-based lookup to get original sheet_name from `chaptersToInsert`
- Chapters from Sheet1, chapter 1: Key = "Sheet1_1" ✓
- Chapters from Sheet2, chapter 2: Key = "Sheet2_2" ✓
- Chapters from Sheet3, chapter 3: Key = "Sheet3_3" ✓
- Items can now correctly find their parent chapters ✓

## Example Flow (After Fix)

### Scenario: Multi-Sheet Excel File in Article-Based View

**Input**: Excel file with 3 sheets
- Sheet1: Contains chapter 1 with items 1.1, 1.2
- Sheet2: Contains chapter 2 with items 2.1, 2.2
- Sheet3: Contains chapter 3 with items 3.1, 3.2

**User Action**: Enable "Article-based view" → Click "Analyze"

**Processing Flow**:

1. **Detect Mode**:
   ```typescript
   hasMultipleSheets = (true || false) ? false : 3 > 1
   hasMultipleSheets = false
   ```

2. **Create Tabs**:
   - Creates 3 tabs: "Principal", "Arquitetura", "Instalações Especiais"

3. **Map Sheets to Tabs** (FIX 1):
   ```typescript
   sheetNameToTabId.set("Sheet1", principalTab.id);
   sheetNameToTabId.set("Sheet2", principalTab.id);
   sheetNameToTabId.set("Sheet3", principalTab.id);
   ```
   All sheets mapped! ✓

4. **Process Chapters**:
   ```typescript
   chaptersToInsert = [
     { sheet_name: "Sheet1", chapter_number: "1", chapter_name: "..." },
     { sheet_name: "Sheet2", chapter_number: "2", chapter_name: "..." },
     { sheet_name: "Sheet3", chapter_number: "3", chapter_name: "..." },
   ];
   
   chaptersWithTabIds = [
     { tab_id: principalTab.id, chapter_number: "1", ... },
     { tab_id: principalTab.id, chapter_number: "2", ... },
     { tab_id: principalTab.id, chapter_number: "3", ... },
   ];
   ```
   All chapters have valid tab_id! ✓

5. **Insert Chapters**:
   ```typescript
   insertedChapters = [
     { id: "ch1-id", tab_id: principalTab.id, chapter_number: "1" },
     { id: "ch2-id", tab_id: principalTab.id, chapter_number: "2" },
     { id: "ch3-id", tab_id: principalTab.id, chapter_number: "3" },
   ];
   ```

6. **Create Chapter Map** (FIX 2):
   ```typescript
   chapterMap.set("Sheet1_1", "ch1-id");
   chapterMap.set("Sheet2_2", "ch2-id");
   chapterMap.set("Sheet3_3", "ch3-id");
   ```
   Correct keys using original sheet names! ✓

7. **Process Items**:
   ```typescript
   itemsToInsert = [
     { sheet_name: "Sheet1", chapter_number: "1", artigo: "1.1", ... },
     { sheet_name: "Sheet1", chapter_number: "1", artigo: "1.2", ... },
     { sheet_name: "Sheet2", chapter_number: "2", artigo: "2.1", ... },
     { sheet_name: "Sheet2", chapter_number: "2", artigo: "2.2", ... },
     { sheet_name: "Sheet3", chapter_number: "3", artigo: "3.1", ... },
     { sheet_name: "Sheet3", chapter_number: "3", artigo: "3.2", ... },
   ];
   
   itemsWithChapterIds = [
     { chapter_id: "ch1-id", artigo: "1.1", ... }, // Found "Sheet1_1" ✓
     { chapter_id: "ch1-id", artigo: "1.2", ... }, // Found "Sheet1_1" ✓
     { chapter_id: "ch2-id", artigo: "2.1", ... }, // Found "Sheet2_2" ✓
     { chapter_id: "ch2-id", artigo: "2.2", ... }, // Found "Sheet2_2" ✓
     { chapter_id: "ch3-id", artigo: "3.1", ... }, // Found "Sheet3_3" ✓
     { chapter_id: "ch3-id", artigo: "3.2", ... }, // Found "Sheet3_3" ✓
   ];
   ```
   All items correctly linked to chapters! ✓

8. **Insert Items**: Success! ✓

9. **UI Display**:
   - Principal tab shows all articles from all sheets ✓
   - Arquitetura tab is empty (as expected)
   - Instalações Especiais tab is empty (as expected)

## Testing

### Test Case 1: Single-Sheet File (Unchanged Behavior)
1. Upload Excel file with 1 sheet
2. Enable article-based view
3. Click "Analyze"
4. **Expected**: Success, all data visible under Principal tab ✓

### Test Case 2: Multi-Sheet File (FIXED)
1. Upload Excel file with 3 sheets
2. Enable article-based view
3. Click "Analyze"
4. **Expected**: Success, all data from all sheets visible under Principal tab ✓

### Test Case 3: Multi-Sheet File Without Article-Based View (Unchanged Behavior)
1. Upload Excel file with 3 sheets
2. Disable article-based view
3. Click "Analyze"
4. **Expected**: Success, tabs created from sheet names, data distributed accordingly ✓

## Benefits

✅ **Fixes Critical Bug**: Multi-sheet Excel files now work correctly in article-based view  
✅ **Simpler Logic**: Removed complex conditional logic in favor of straightforward index-based mapping  
✅ **More Maintainable**: Single code path handles all scenarios (single-sheet, multi-sheet, article-based view)  
✅ **Backward Compatible**: Single-sheet files and multi-sheet files in normal mode continue to work as before  
✅ **No Breaking Changes**: Existing functionality is preserved  

## Code Quality

- ✅ **Build**: Passes without errors
- ✅ **Linting**: No new linting issues introduced
- ✅ **Type Safety**: All TypeScript types are correctly maintained
- ✅ **Comments**: Added clear comments explaining the fix
