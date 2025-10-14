# Article-Based View: One Tab Per Excel Sheet Implementation

## Problem Statement
When article-based view was enabled, the system created 3 fixed tabs (Principal, Arquitetura, Instalações Especiais) regardless of the number of Excel sheets. The requirement was to create one tab per Excel sheet instead.

## Solution Overview
Modified the tab creation logic to create tabs from Excel sheet names when in article-based view, instead of always creating 3 default tabs.

## Changes Made

### File: `src/pages/MapaQuantidades.tsx`

#### Change 1: Tab Creation Logic (Lines 576-610)

**Before:**
```typescript
const hasMultipleSheets = (articleBasedView || treatAsSingleSheet) ? false : workbook.SheetNames.length > 1;

if (!hasMultipleSheets) {
  // Create 3 default tabs for single-sheet files
  tabsToInsert.push(
    { orcamento_id: id!, name: "Principal", display_order: 0 },
    { orcamento_id: id!, name: "Arquitetura", display_order: 1 },
    { orcamento_id: id!, name: "Instalações Especiais", display_order: 2 }
  );
}

workbook.SheetNames.forEach((sheetName, index) => {
  if (hasMultipleSheets) {
    tabsToInsert.push({
      orcamento_id: id!,
      name: sheetName,
      display_order: index,
    });
  }
}
```

**After:**
```typescript
const shouldCreateTabsFromSheets = articleBasedView || (!treatAsSingleSheet && workbook.SheetNames.length > 1);
const hasMultipleSheets = !treatAsSingleSheet && workbook.SheetNames.length > 1;

if (!shouldCreateTabsFromSheets) {
  // Create 3 default tabs for single-sheet files or when treating as single sheet (only in non-article-based view)
  tabsToInsert.push(
    { orcamento_id: id!, name: "Principal", display_order: 0 },
    { orcamento_id: id!, name: "Arquitetura", display_order: 1 },
    { orcamento_id: id!, name: "Instalações Especiais", display_order: 2 }
  );
}

workbook.SheetNames.forEach((sheetName, index) => {
  if (shouldCreateTabsFromSheets) {
    tabsToInsert.push({
      orcamento_id: id!,
      name: sheetName,
      display_order: index,
    });
  }
}
```

**Key Changes:**
- Introduced `shouldCreateTabsFromSheets` flag that determines when to create tabs from sheet names
- When `articleBasedView` is true, always create tabs from sheet names
- Simplified conditional logic by removing redundant code branches

#### Change 2: Sheet-to-Tab Mapping (Lines 1152-1168)

**Before:**
```typescript
// For article-based view, map ALL sheets to "Principal" tab
if (hasMultipleSheets) {
  insertedTabs.forEach(tab => {
    sheetNameToTabId.set(tab.name, tab.id);
  });
} else {
  // Map all sheets to the "Principal" tab
  const principalTab = insertedTabs.find(tab => tab.name === "Principal");
  if (principalTab) {
    workbook.SheetNames.forEach(sheetName => {
      sheetNameToTabId.set(sheetName, principalTab.id);
    });
  }
}
```

**After:**
```typescript
// For article-based view or multi-sheet files, map each sheet to its corresponding tab
if (articleBasedView || hasMultipleSheets) {
  insertedTabs.forEach(tab => {
    sheetNameToTabId.set(tab.name, tab.id);
  });
} else {
  // Map all sheets to the "Principal" tab
  const principalTab = insertedTabs.find(tab => tab.name === "Principal");
  if (principalTab) {
    workbook.SheetNames.forEach(sheetName => {
      sheetNameToTabId.set(sheetName, principalTab.id);
    });
  }
}
```

**Key Changes:**
- When in article-based view, map each sheet to its corresponding tab (by sheet name)
- This ensures chapters from each sheet are displayed under the correct tab

## Behavior Matrix

| Scenario | Article-Based View | Treat as Single Sheet | Sheets | Result |
|----------|-------------------|----------------------|--------|--------|
| 1 | OFF | OFF | 1 | 3 default tabs |
| 2 | OFF | OFF | 3 | 3 sheet tabs |
| 3 | OFF | ON | 3 | 3 default tabs |
| 4 | ON | OFF | 1 | 1 sheet tab |
| 5 | ON | OFF | 3 | 3 sheet tabs |
| 6 | ON | ON | 1 | 1 sheet tab |

## Visual Example

### Before (Article-Based View with 3 sheets):
```
[Principal] [Arquitetura] [Instalações Especiais]
     |
     └─ All articles from all 3 sheets
```

### After (Article-Based View with 3 sheets):
```
[Sheet1] [Sheet2] [Sheet3]
   |        |        |
   └─ Articles from Sheet1
            └─ Articles from Sheet2
                     └─ Articles from Sheet3
```

## Benefits

1. **Clearer Organization**: Each tab represents an Excel sheet, making navigation intuitive
2. **Scalability**: Works seamlessly with any number of sheets
3. **No Redundant Separators**: Sheet separator banners are no longer needed (won't show because each tab only has chapters from one sheet)
4. **Consistency**: Single-sheet and multi-sheet files behave consistently in article-based view

## Testing

To test this feature:

1. **Single-Sheet Test:**
   - Upload an Excel file with 1 sheet
   - Enable "Article-based view"
   - Click "Analyze"
   - **Expected**: 1 tab with the sheet name, containing all articles

2. **Multi-Sheet Test:**
   - Upload an Excel file with 3 sheets (e.g., "Construction", "Electrical", "Plumbing")
   - Enable "Article-based view"
   - Click "Analyze"
   - **Expected**: 3 tabs ("Construction", "Electrical", "Plumbing"), each containing articles from its respective sheet

3. **Compatibility Test:**
   - Test all scenarios in the Behavior Matrix above
   - Verify tabs are created correctly in each case
