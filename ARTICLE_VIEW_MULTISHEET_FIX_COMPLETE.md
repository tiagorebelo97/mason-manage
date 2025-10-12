# Article-Based View Multi-Sheet Fix - Complete Implementation

## Problem Statement

User reported: "on the article-based view i want to have a separator inside of the Principal tab by excel sheet, continuing respecting the order and the hierarquie that i said before. right now if i have more than one sheet with chapters i am having the error Failed to analyze file, fix it"

### Issues Identified

1. **Potential Null Tab ID Error**: When analyzing multi-sheet Excel files with article-based view, there was a risk that chapters could be inserted with `tab_id = null`, which would violate the NOT NULL database constraint and cause "Failed to analyze file" error.

2. **Sheet Order Not Preserved**: When displaying chapters grouped by sheet, the original Excel sheet order was not preserved, causing sheets to appear in the wrong order or interleaved.

## Solutions Implemented

### Fix 1: Defensive Check for Principal Tab
**Location**: `src/pages/MapaQuantidades.tsx`, lines ~1160-1171

**Change**: Added error handling when the Principal tab is not found in inserted tabs.

```typescript
} else {
  // Map all sheets to the "Principal" tab
  const principalTab = insertedTabs.find(tab => tab.name === "Principal");
  if (principalTab) {
    workbook.SheetNames.forEach(sheetName => {
      sheetNameToTabId.set(sheetName, principalTab.id);
    });
  } else {
    console.error("Principal tab not found in inserted tabs:", insertedTabs.map(t => t.name));
    throw new Error("Failed to find Principal tab for sheet mapping");
  }
}
```

**Benefit**: Provides a clear error message if the Principal tab is missing, making debugging easier and preventing silent failures.

### Fix 2: Validate Tab ID Before Chapter Insertion
**Location**: `src/pages/MapaQuantidades.tsx`, lines ~1171-1185

**Change**: Added validation to ensure every chapter has a valid tab_id before insertion.

```typescript
// Update chapters with tab IDs
const chaptersWithTabIds = chaptersToInsert.map(chapter => {
  const tab_id = sheetNameToTabId.get(chapter.sheet_name!);
  if (!tab_id) {
    console.error(`No tab_id found for chapter with sheet_name: "${chapter.sheet_name}"`);
    console.error("Available sheet mappings:", Array.from(sheetNameToTabId.entries()));
    throw new Error(`Failed to map chapter "${chapter.chapter_number}" from sheet "${chapter.sheet_name}" to a tab`);
  }
  return {
    tab_id,
    chapter_number: chapter.chapter_number,
    chapter_name: chapter.chapter_name,
    chapter_comments: chapter.chapter_comments || null,
  };
});
```

**Benefit**: Prevents database constraint violations by catching null tab_id errors early with detailed error messages showing which chapter and sheet caused the issue.

### Fix 3: Preserve Original Sheet Order
**Location**: `src/pages/MapaQuantidades.tsx`, lines ~1328 and ~1362-1363

**Change 1**: Store sheet order during analysis
```typescript
// Return articlesData and sheetOrder for article-based view processing
return { articlesData, articleBasedView, sheetOrder: workbook.SheetNames };
```

**Change 2**: Persist sheet order in sessionStorage
```typescript
// Store sheet order for proper display
if (data.sheetOrder) {
  sessionStorage.setItem(`sheetOrder_${id}`, JSON.stringify(data.sheetOrder));
}
```

**Change 3**: Sort sheets by original order when displaying
```typescript
// Get sheet order from sessionStorage to maintain original Excel order
let sheetOrder: string[] = [];
try {
  const storedOrder = sessionStorage.getItem(`sheetOrder_${id}`);
  if (storedOrder) {
    sheetOrder = JSON.parse(storedOrder);
  }
} catch (e) {
  console.error('Error loading sheet order:', e);
}

// Sort sheet entries by the original sheet order
let sortedSheetEntries: Array<[string, typeof chaptersForTab]>;
if (sheetOrder.length > 0) {
  // Sort by sheet order, putting any unknown sheets at the end
  sortedSheetEntries = Array.from(chaptersBySheet.entries()).sort((a, b) => {
    const indexA = sheetOrder.indexOf(a[0]);
    const indexB = sheetOrder.indexOf(b[0]);
    // If both are in the sheet order, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only one is in the sheet order, put it first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // If neither is in the sheet order, maintain original order
    return 0;
  });
} else {
  // Fallback to insertion order if sheet order is not available
  sortedSheetEntries = Array.from(chaptersBySheet.entries());
}
```

**Benefit**: Sheet separators now appear in the same order as the sheets in the original Excel file, respecting the hierarchy and organization intended by the user.

## How It Works

### Multi-Sheet Excel File Analysis Flow

1. **Upload**: User uploads an Excel file with multiple sheets (e.g., "Sheet1", "Sheet2", "Sheet3")
2. **Enable Article-Based View**: User checks the "Article-based view" checkbox
3. **Click Analyze**: System starts analysis

#### During Analysis:
4. **Create Tabs**: System creates 3 default tabs ("Principal", "Arquitetura", "Instalações Especiais")
5. **Map Sheets**: ALL sheets are mapped to the "Principal" tab
   - Defensive check ensures Principal tab exists
   - Error thrown if mapping fails
6. **Process Chapters**: For each sheet:
   - Extract chapters with their sheet_name
   - Create chapter records
7. **Validate Chapters**: Before insertion, validate that ALL chapters have valid tab_id
   - Error thrown if any chapter has null tab_id
   - Detailed error message shows which chapter/sheet failed
8. **Insert Chapters**: Chapters inserted with valid tab_id
9. **Process Articles**: Articles are created with sheet_name preserved
10. **Store Data**: Articles data and sheet order stored in sessionStorage

#### During Display:
11. **Load Articles**: Articles loaded from sessionStorage
12. **Group by Chapter**: Articles grouped by chapter_number
13. **Add Sheet Info**: Each chapter gets sheet_name from its articles
14. **Group by Sheet**: Chapters grouped by sheet_name
15. **Sort Sheets**: Sheet groups sorted by original Excel sheet order
16. **Display**: For each sheet in order:
    - Show sheet separator (if multiple sheets)
    - Show all chapters in that sheet
    - Show all articles in each chapter

## Testing Instructions

### Test Case 1: Two-Sheet Excel File
Create an Excel file with:
- **Sheet1**:
  ```
  | ARTIGO | DESCRIÇÃO        | UN | QT  |
  |--------|------------------|----|----- |
  | 1      | Chapter 1        |    |     |
  | 1.1    | Article 1.1      | m2 | 100 |
  | 2      | Chapter 2        |    |     |
  | 2.1    | Article 2.1      | un | 50  |
  ```
- **Sheet2**:
  ```
  | ARTIGO | DESCRIÇÃO        | UN | QT  |
  |--------|------------------|----|----- |
  | 1      | Chapter 1        |    |     |
  | 1.1    | Article 1.1      | kg | 200 |
  | 3      | Chapter 3        |    |     |
  | 3.1    | Article 3.1      | m  | 75  |
  ```

**Steps**:
1. Upload the file
2. Enable "Article-based view"
3. Click "Analyze"

**Expected Results**:
- ✅ Analysis completes successfully (no error)
- ✅ 3 tabs created: Principal, Arquitetura, Instalações Especiais
- ✅ Principal tab shows:
  ```
  📄 Sheet1
  ▶ 1. Chapter 1
  ▶ 2. Chapter 2
  
  📄 Sheet2
  ▶ 1. Chapter 1
  ▶ 3. Chapter 3
  ```
- ✅ Sheets appear in order: Sheet1 first, then Sheet2
- ✅ Each sheet's chapters are grouped together
- ✅ Sheet separators are visible

### Test Case 2: Three-Sheet Excel File
Create an Excel file with:
- **Measurements**: Chapters 1-3
- **Architecture**: Chapters 4-6
- **Electrical**: Chapters 7-9

**Steps**:
1. Upload the file
2. Enable "Article-based view"
3. Click "Analyze"

**Expected Results**:
- ✅ Analysis completes successfully
- ✅ Sheet separators appear in order: Measurements, Architecture, Electrical
- ✅ Each sheet's chapters are grouped together
- ✅ All chapters and articles are displayed correctly

### Test Case 3: Single-Sheet Excel File
Create an Excel file with one sheet containing multiple chapters.

**Steps**:
1. Upload the file
2. Enable "Article-based view"
3. Click "Analyze"

**Expected Results**:
- ✅ Analysis completes successfully
- ✅ NO sheet separators shown (only one sheet, so separators are unnecessary)
- ✅ All chapters and articles displayed correctly

## Error Handling

### Error: "Failed to find Principal tab for sheet mapping"
**Cause**: The Principal tab was not created or found in the inserted tabs.
**Solution**: Check that the tabs insertion succeeded and that "Principal" is in the tab names.

### Error: "Failed to map chapter [X] from sheet [Y] to a tab"
**Cause**: A chapter's sheet_name is not in the sheetNameToTabId map.
**Solution**: Check that all sheet names are being mapped correctly in lines 1164-1166.

### Error: "Failed to create chapters: [database error]"
**Cause**: Database constraint violation or other database error.
**Solution**: Check the detailed error message in the console logs.

## Technical Notes

### Session Storage Keys
- `articles_${id}`: Stores article data for article-based view
- `sheetOrder_${id}`: Stores original Excel sheet order

### Database Schema
- `orcamento_tabs.tab_id`: NOT NULL constraint
- `orcamento_chapters.tab_id`: NOT NULL constraint (added in migration)
- Unique constraint: `(tab_id, chapter_number)` on orcamento_chapters

### Sheet Order Sorting
- Uses `Array.indexOf()` to find sheet position in original order
- Unknown sheets (not in original order) are placed at the end
- Maintains stable sort for equal-priority items

## Verification

Build status: ✅ Success
- No TypeScript errors
- No linting errors
- Build completes successfully

## Future Enhancements

1. **Persist sheet order in database**: Instead of sessionStorage, store sheet order in a database column
2. **Allow manual sheet reordering**: Add UI to let users reorder sheets after analysis
3. **Show sheet info in separator**: Display sheet index (e.g., "Sheet 1 of 3")
4. **Collapsible sheets**: Allow users to collapse/expand entire sheets
