# Single-Sheet Excel File Analysis Fix

## Problem Statement

When uploading an Excel file with just one sheet, the analysis was failing with "Failed to analyze file" error. The system was not creating any tabs for single-sheet files, which caused the chapters and items to not be properly linked, resulting in data loss.

## Solution

Modified the Excel file analysis logic to create 3 default tabs for single-sheet files:
1. **Principal** - Contains all chapters and items from the single sheet
2. **Arquitetura** - Empty, ready for future use
3. **Instalações Especiais** - Empty, ready for future use

## Changes Made

### File: `src/pages/MapaQuantidades.tsx`

#### 1. Create Default Tabs for Single-Sheet Files (Lines 361-385)

**Before:**
```typescript
const hasMultipleSheets = workbook.SheetNames.length > 1;

workbook.SheetNames.forEach((sheetName, index) => {
  if (hasMultipleSheets) {
    tabsToInsert.push({
      orcamento_id: id!,
      name: sheetName,
      display_order: index,
    });
  }
```

**After:**
```typescript
const hasMultipleSheets = workbook.SheetNames.length > 1;

if (!hasMultipleSheets) {
  // Create 3 default tabs for single-sheet files
  tabsToInsert.push(
    {
      orcamento_id: id!,
      name: "Principal",
      display_order: 0,
    },
    {
      orcamento_id: id!,
      name: "Arquitetura",
      display_order: 1,
    },
    {
      orcamento_id: id!,
      name: "Instalações Especiais",
      display_order: 2,
    }
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
```

#### 2. Map Single Sheet to Principal Tab (Lines 634-660)

**Before:**
```typescript
let sheetNameToTabId = new Map<string, string>();

if (tabsToInsert.length > 0) {
  const { data, error: tabError } = await supabase
    .from("orcamento_tabs")
    .insert(tabsToInsert)
    .select();
  
  if (tabError) throw tabError;
  insertedTabs = data || [];
  
  insertedTabs.forEach(tab => {
    sheetNameToTabId.set(tab.name, tab.id);
  });
}

const chaptersWithTabIds = chaptersToInsert.map(chapter => ({
  tab_id: hasMultipleSheets ? sheetNameToTabId.get(chapter.sheet_name!) : null,
  // ...
}));
```

**After:**
```typescript
const sheetNameToTabId = new Map<string, string>();

if (tabsToInsert.length > 0) {
  const { data, error: tabError } = await supabase
    .from("orcamento_tabs")
    .insert(tabsToInsert)
    .select();
  
  if (tabError) throw tabError;
  insertedTabs = data || [];
  
  if (hasMultipleSheets) {
    insertedTabs.forEach(tab => {
      sheetNameToTabId.set(tab.name, tab.id);
    });
  } else {
    // Map the single sheet to the "Principal" tab
    const principalTab = insertedTabs.find(tab => tab.name === "Principal");
    if (principalTab && workbook.SheetNames.length > 0) {
      sheetNameToTabId.set(workbook.SheetNames[0], principalTab.id);
    }
  }
}

const chaptersWithTabIds = chaptersToInsert.map(chapter => ({
  tab_id: sheetNameToTabId.get(chapter.sheet_name!) || null,
  // ...
}));
```

**Key Changes:**
- Fixed lint error by changing `let` to `const` for `sheetNameToTabId`
- For single-sheet files: map the original sheet name to the "Principal" tab ID
- For multi-sheet files: map each sheet name to its corresponding tab ID (unchanged behavior)

#### 3. Fix Chapter-to-Item Mapping (Lines 679-697)

**Before:**
```typescript
const chapterMap = new Map<string, string>();
insertedChapters.forEach(chapter => {
  const tab = insertedTabs.find(t => t.id === chapter.tab_id);
  if (tab) {
    const key = `${tab.name}_${chapter.chapter_number}`;
    chapterMap.set(key, chapter.id);
  }
});
```

**After:**
```typescript
const chapterMap = new Map<string, string>();
insertedChapters.forEach(chapter => {
  if (hasMultipleSheets) {
    // For multi-sheet files, find the corresponding tab to get sheet name
    const tab = insertedTabs.find(t => t.id === chapter.tab_id);
    if (tab) {
      const key = `${tab.name}_${chapter.chapter_number}`;
      chapterMap.set(key, chapter.id);
    }
  } else {
    // For single-sheet files, use the original sheet name
    // Since we mapped the sheet to Principal tab, we need to use the original sheet name
    if (workbook.SheetNames.length > 0) {
      const key = `${workbook.SheetNames[0]}_${chapter.chapter_number}`;
      chapterMap.set(key, chapter.id);
    }
  }
});
```

**Key Changes:**
- For single-sheet files: use the original sheet name (not "Principal") when building the chapter map key
- This ensures items can be correctly matched to their chapters using the original sheet name

## How It Works

### Single-Sheet Flow:

1. **Upload**: User uploads an Excel file with 1 sheet (e.g., "Sheet1")
2. **Analysis Starts**: System detects `hasMultipleSheets = false`
3. **Create Tabs**: 3 tabs are created: "Principal", "Arquitetura", "Instalações Especiais"
4. **Map Sheet to Tab**: "Sheet1" → "Principal" tab ID
5. **Process Chapters**: Chapters are created with `tab_id = Principal.id`
6. **Process Items**: Items are linked to chapters using key `"Sheet1_chapterNumber"`
7. **Success**: Analysis completes successfully

### Multi-Sheet Flow:

1. **Upload**: User uploads an Excel file with 2+ sheets (e.g., "Sheet1", "Sheet2")
2. **Analysis Starts**: System detects `hasMultipleSheets = true`
3. **Create Tabs**: Tabs are created from sheet names: "Sheet1", "Sheet2"
4. **Map Sheet to Tab**: "Sheet1" → "Sheet1" tab ID, "Sheet2" → "Sheet2" tab ID
5. **Process Chapters**: Chapters are created with `tab_id = corresponding tab ID`
6. **Process Items**: Items are linked to chapters using key `"SheetName_chapterNumber"`
7. **Success**: Analysis completes successfully (unchanged behavior)

## UI Behavior

### Before Fix:
- **Single-sheet**: No tabs displayed → Analysis failed → No data visible
- **Multi-sheet**: Tabs displayed → Analysis succeeded → Data visible

### After Fix:
- **Single-sheet**: 3 tabs displayed (Principal with data, Arquitetura empty, Instalações Especiais empty) → Analysis succeeds → Data visible under "Principal" tab
- **Multi-sheet**: Tabs displayed (unchanged) → Analysis succeeds (unchanged) → Data visible (unchanged)

## Testing

The fix has been verified with:
- ✅ **Build**: Successful compilation with no errors
- ✅ **Linting**: No linting errors (fixed `prefer-const` error)
- ✅ **Logic**: Correct tab creation and data mapping for both single-sheet and multi-sheet files

### Manual Testing Recommended:

1. **Single-sheet file**:
   - Upload an Excel file with 1 sheet
   - Click "Analyze"
   - Verify 3 tabs are created: "Principal", "Arquitetura", "Instalações Especiais"
   - Verify chapters and items are visible under "Principal" tab
   - Verify "Arquitetura" and "Instalações Especiais" tabs are empty

2. **Multi-sheet file**:
   - Upload an Excel file with 2+ sheets
   - Click "Analyze"
   - Verify tabs are created from sheet names
   - Verify chapters and items are visible under their respective tabs
   - Verify behavior is unchanged from before

## Benefits

1. ✅ **Fixes Critical Bug**: Single-sheet files now work correctly
2. ✅ **Consistent UI**: All files display tabs (no special handling needed)
3. ✅ **Future-Proof**: Ready for manual addition of data to "Arquitetura" and "Instalações Especiais" tabs
4. ✅ **Backward Compatible**: Multi-sheet files continue to work as before
5. ✅ **Clean Code**: Fixed linting error and improved code clarity with better comments
