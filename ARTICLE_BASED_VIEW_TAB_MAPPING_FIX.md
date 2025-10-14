# Article-Based View Tab Mapping Fix

## Problem Statement

After the previous fix, when using article-based view with multi-sheet Excel files, chapters were being repeated between multiple tabs. The user wanted chapters to be in their corresponding tab (Principal, Arquitetura, or Instalações Especiais) based on the Excel sheet name.

## Root Cause

The previous implementation had article-based view creating **one tab per Excel sheet** (e.g., "Sheet1", "Sheet2", "Sheet3" tabs), which was incorrect. The expected behavior was to:
1. Always create the **3 default tabs** (Principal, Arquitetura, Instalações Especiais)
2. Map Excel sheets intelligently to these tabs based on sheet names

## Solution

### Change 1: Fix Tab Creation Logic (Line 581)

**Before:**
```typescript
const shouldCreateTabsFromSheets = articleBasedView || (!treatAsSingleSheet && workbook.SheetNames.length > 1);
```

**After:**
```typescript
const shouldCreateTabsFromSheets = !articleBasedView && (!treatAsSingleSheet && workbook.SheetNames.length > 1);
```

**Result:** When `articleBasedView` is `true`, `shouldCreateTabsFromSheets` will be `false`, causing the system to create the 3 default tabs instead of tabs from sheet names.

### Change 2: Intelligent Sheet-to-Tab Mapping (Lines 1157-1176)

**Before:**
```typescript
if (articleBasedView || hasMultipleSheets) {
  insertedTabs.forEach(tab => {
    sheetNameToTabId.set(tab.name, tab.id);
  });
}
```

**After:**
```typescript
if (articleBasedView) {
  // Map sheets intelligently to the 3 default tabs
  const principalTab = insertedTabs.find(tab => tab.name === "Principal");
  const arquiteturaTab = insertedTabs.find(tab => tab.name === "Arquitetura");
  const instalacoesTab = insertedTabs.find(tab => tab.name === "Instalações Especiais");
  
  workbook.SheetNames.forEach(sheetName => {
    const sheetNameLower = sheetName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Map sheets based on their names
    if (sheetNameLower.includes('arquitetura') && arquiteturaTab) {
      sheetNameToTabId.set(sheetName, arquiteturaTab.id);
    } else if ((sheetNameLower.includes('instalacoes') || sheetNameLower.includes('instalações') || 
                sheetNameLower.includes('especiais')) && instalacoesTab) {
      sheetNameToTabId.set(sheetName, instalacoesTab.id);
    } else if (principalTab) {
      // Default to Principal tab for all other sheets
      sheetNameToTabId.set(sheetName, principalTab.id);
    }
  });
} else if (hasMultipleSheets) {
  insertedTabs.forEach(tab => {
    sheetNameToTabId.set(tab.name, tab.id);
  });
}
```

**Result:** Excel sheets are now mapped intelligently to the appropriate tab based on their names:
- Sheets with "arquitetura" in the name → Arquitetura tab
- Sheets with "instalacoes", "instalações", or "especiais" → Instalações Especiais tab
- All other sheets (including "Principal", "Sheet1", etc.) → Principal tab

## Mapping Logic Details

The mapping uses normalized lowercase comparison to handle:
- Accented characters (e.g., "instalações" and "instalacoes" both work)
- Case variations (e.g., "ARQUITETURA", "Arquitetura", "arquitetura" all work)

## Expected Behavior

### Example 1: Multi-Sheet Excel with Standard Names
**Excel file with sheets:**
- "Sheet1" (contains general construction data)
- "Arquitetura" (contains architecture-specific data)
- "Instalações Especiais" (contains special installations data)

**Result:**
- 3 tabs created: Principal, Arquitetura, Instalações Especiais
- Chapters from "Sheet1" → Principal tab
- Chapters from "Arquitetura" → Arquitetura tab
- Chapters from "Instalações Especiais" → Instalações Especiais tab

### Example 2: Multi-Sheet Excel with Portuguese Names
**Excel file with sheets:**
- "Principal"
- "Arquitetura"
- "Instalacoes Especiais" (no accent)

**Result:**
- 3 tabs created: Principal, Arquitetura, Instalações Especiais
- Chapters from "Principal" → Principal tab
- Chapters from "Arquitetura" → Arquitetura tab
- Chapters from "Instalacoes Especiais" → Instalações Especiais tab

### Example 3: Multi-Sheet Excel with Generic Names
**Excel file with sheets:**
- "Sheet1"
- "Sheet2"
- "Sheet3"

**Result:**
- 3 tabs created: Principal, Arquitetura, Instalações Especiais
- All chapters from all sheets → Principal tab

## Testing Instructions

### Test Case 1: Multi-Sheet Excel with Matching Names
1. Create an Excel file with 3 sheets: "Principal", "Arquitetura", "Instalações Especiais"
2. Add chapters to each sheet (e.g., Chapter 1 in Principal, Chapter 2 in Arquitetura, Chapter 3 in Instalações)
3. Enable "Article-based view" checkbox
4. Click "Analyze"
5. **Expected**: 3 tabs created (Principal, Arquitetura, Instalações Especiais)
6. **Expected**: Chapter 1 appears only in Principal tab
7. **Expected**: Chapter 2 appears only in Arquitetura tab
8. **Expected**: Chapter 3 appears only in Instalações Especiais tab

### Test Case 2: Multi-Sheet Excel with Generic Names
1. Create an Excel file with 3 sheets: "Sheet1", "Sheet2", "Sheet3"
2. Add chapters to each sheet
3. Enable "Article-based view" checkbox
4. Click "Analyze"
5. **Expected**: 3 tabs created (Principal, Arquitetura, Instalações Especiais)
6. **Expected**: All chapters from all sheets appear in Principal tab
7. **Expected**: Arquitetura and Instalações Especiais tabs are empty

### Test Case 3: Single-Sheet Excel (Unchanged Behavior)
1. Create an Excel file with 1 sheet
2. Enable "Article-based view" checkbox
3. Click "Analyze"
4. **Expected**: 3 tabs created (Principal, Arquitetura, Instalações Especiais)
5. **Expected**: All chapters appear in Principal tab

## Verification

- ✅ Build: Success
- ✅ Lint: No errors
- ⏳ Manual Testing: Pending user verification

## Notes

- This fix ensures article-based view always creates the 3 default tabs, regardless of sheet count
- Chapters are no longer duplicated across tabs
- The intelligent mapping allows users to organize their Excel sheets by tab name
- Non-article-based view behavior remains unchanged (creates tabs from sheet names for multi-sheet files)
