# Fixed Tabs with Sheet Separators Implementation

## Overview

This update changes the behavior of multi-sheet Excel file analysis to maintain 3 fixed tabs regardless of the number of sheets in the Excel file. All sheets are mapped to the "Principal" tab, and sheet separators are displayed to organize the content.

## Problem Statement

**Before:** When uploading an Excel file with multiple sheets, the system created one tab per sheet. This resulted in many tabs in the UI and made it harder to navigate.

**After:** The system now always creates 3 fixed tabs (Principal, Arquitetura, Instalações Especiais), regardless of the number of sheets. All sheets are mapped to the Principal tab, and separators are shown to distinguish content from different sheets.

## Changes Made

### 1. Always Create 3 Fixed Tabs

**File**: `src/pages/MapaQuantidades.tsx`  
**Lines**: ~576-594

**Change**:
```typescript
// BEFORE:
const hasMultipleSheets = treatAsSingleSheet ? false : workbook.SheetNames.length > 1;

if (!hasMultipleSheets) {
  // Create 3 default tabs for single-sheet files
  tabsToInsert.push(...);
}

workbook.SheetNames.forEach((sheetName, index) => {
  if (hasMultipleSheets) {
    tabsToInsert.push({
      orcamento_id: id!,
      name: sheetName,
      display_order: index,
    });
  }
});

// AFTER:
// Always create 3 fixed tabs: Principal, Arquitetura, Instalações Especiais
// All sheets will be mapped to the Principal tab and displayed with separators
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

workbook.SheetNames.forEach((sheetName, index) => {
  // No longer creating tabs per sheet
});
```

**Result**: 3 fixed tabs are always created, regardless of sheet count

### 2. Map All Sheets to Principal Tab

**File**: `src/pages/MapaQuantidades.tsx`  
**Lines**: ~1119-1127

**Change**:
```typescript
// BEFORE: Different mapping logic based on hasMultipleSheets
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

// AFTER: Always map all sheets to Principal tab
// Map all sheets to the "Principal" tab
const principalTab = insertedTabs.find(tab => tab.name === "Principal");
if (principalTab) {
  workbook.SheetNames.forEach(sheetName => {
    sheetNameToTabId.set(sheetName, principalTab.id);
  });
}
```

**Result**: All sheets are mapped to the Principal tab

### 3. Add sheet_name to OrcamentoChapter Type

**File**: `src/pages/MapaQuantidades.tsx`  
**Lines**: ~84-91

**Change**:
```typescript
// BEFORE:
type OrcamentoChapter = {
  id: string;
  tab_id: string;
  chapter_number: string;
  chapter_name: string;
  chapter_comments: string | null;
};

// AFTER:
type OrcamentoChapter = {
  id: string;
  tab_id: string;
  chapter_number: string;
  chapter_name: string;
  chapter_comments: string | null;
  sheet_name?: string | null; // Track original sheet name
};
```

**Result**: Chapters now track which sheet they came from

### 4. Store sheet_name in Database

**File**: `src/pages/MapaQuantidades.tsx`  
**Lines**: ~1141-1147

**Change**:
```typescript
// BEFORE:
const chaptersWithTabIds = chaptersToInsert.map(chapter => ({
  tab_id: sheetNameToTabId.get(chapter.sheet_name!) || null,
  chapter_number: chapter.chapter_number,
  chapter_name: chapter.chapter_name,
  chapter_comments: chapter.chapter_comments || null,
}));

// AFTER:
const chaptersWithTabIds = chaptersToInsert.map(chapter => ({
  tab_id: sheetNameToTabId.get(chapter.sheet_name!) || null,
  chapter_number: chapter.chapter_number,
  chapter_name: chapter.chapter_name,
  chapter_comments: chapter.chapter_comments || null,
  sheet_name: chapter.sheet_name, // Store sheet name for separators
}));
```

**Result**: Sheet name is stored in the database for each chapter

### 5. Add Sheet Separators to Normal View

**File**: `src/pages/MapaQuantidades.tsx`  
**Lines**: ~1886-1923

**Change**: Updated the normal view (non-article-based) to group chapters by sheet and show separators, similar to how article-based view works.

```typescript
// BEFORE:
{tabs.map((tab) => (
  <TabsContent key={tab.id} value={tab.id} className="space-y-6">
    {chaptersByTab[tab.id]?.map((chapter) => (
      // ... render chapter
    ))}
  </TabsContent>
))}

// AFTER:
{tabs.map((tab) => (
  <TabsContent key={tab.id} value={tab.id} className="space-y-6">
    {(() => {
      const chaptersForTab = chaptersByTab[tab.id] || [];
      
      // Group chapters by sheet name for multi-sheet separators
      const chaptersBySheet = new Map<string, typeof chaptersForTab>();
      const sheetOrder: string[] = [];
      
      chaptersForTab.forEach((chapter) => {
        const sheetName = chapter.sheet_name || 'Unknown';
        if (!chaptersBySheet.has(sheetName)) {
          chaptersBySheet.set(sheetName, []);
          sheetOrder.push(sheetName);
        }
        chaptersBySheet.get(sheetName)!.push(chapter);
      });
      
      // Display chapters grouped by sheet
      return sheetOrder.map((sheetName) => {
        const chaptersInSheet = chaptersBySheet.get(sheetName)!;
        
        return (
          <div key={sheetName}>
            {/* Sheet separator - only show if there are multiple sheets */}
            {chaptersBySheet.size > 1 && (
              <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  📄 {sheetName}
                </h2>
              </div>
            )}
            
            {/* Chapters in this sheet */}
            {chaptersInSheet.map((chapter) => (
              // ... render chapter
            ))}
          </div>
        );
      });
    })()}
  </TabsContent>
))}
```

**Result**: Chapters are grouped by sheet with visual separators (only shown when multiple sheets exist)

### 6. Database Migration

**File**: `migration_add_sheet_name_to_chapters.sql` (new file)

Created migration script to add `sheet_name` column to `orcamento_chapters` table:

```sql
-- Add sheet_name column to orcamento_chapters if it doesn't exist
ALTER TABLE orcamento_chapters 
ADD COLUMN IF NOT EXISTS sheet_name VARCHAR(255);

-- Create index for better performance when grouping by sheet_name
CREATE INDEX IF NOT EXISTS idx_orcamento_chapters_sheet_name 
ON orcamento_chapters(sheet_name);
```

## Visual Comparison

### Before (Multi-sheet file)
```
Tabs: [Sheet1] [Sheet2] [Sheet3] [Sheet4]

Tab: Sheet1
  - Chapter 1
  - Chapter 2
  
Tab: Sheet2
  - Chapter 1
  - Chapter 2
  
...
```

### After (Multi-sheet file)
```
Tabs: [Principal] [Arquitetura] [Instalações Especiais]

Tab: Principal
  📄 Sheet1
  - Chapter 1
  - Chapter 2
  
  📄 Sheet2
  - Chapter 1
  - Chapter 2
  
  📄 Sheet3
  - Chapter 1
  - Chapter 2
```

### Single-sheet file (unchanged)
```
Tabs: [Principal] [Arquitetura] [Instalações Especiais]

Tab: Principal
  - Chapter 1
  - Chapter 2
  - Chapter 3
  (No separators shown for single sheet)
```

## Benefits

1. **Consistent UI**: Always 3 tabs, regardless of the number of sheets
2. **Easier Navigation**: Content is organized in one place with clear separators
3. **Better Organization**: Users can move chapters between the 3 fixed tabs as needed
4. **Cleaner Interface**: No proliferation of tabs for files with many sheets
5. **Backward Compatible**: Single-sheet files work exactly the same

## Testing

### Test Case 1: Single-Sheet Excel File
1. Upload an Excel file with 1 sheet
2. Click "Analyze"
3. **Expected**: 3 tabs created (Principal, Arquitetura, Instalações Especiais)
4. **Expected**: All chapters under Principal tab
5. **Expected**: No sheet separators shown (not needed for single sheet)

### Test Case 2: Multi-Sheet Excel File
1. Upload an Excel file with 3+ sheets (e.g., "Sheet1", "Sheet2", "Sheet3")
2. Click "Analyze"
3. **Expected**: 3 tabs created (Principal, Arquitetura, Instalações Especiais)
4. **Expected**: All chapters from all sheets under Principal tab
5. **Expected**: Sheet separators displayed with sheet names
6. **Expected**: Chapters grouped by sheet in order

### Test Case 3: Article-Based View (Multi-Sheet)
1. Upload an Excel file with 2+ sheets
2. Enable "Article-based view" checkbox
3. Click "Analyze"
4. **Expected**: Same behavior as non-article view
5. **Expected**: Articles and chapters grouped by sheet with separators

## Migration Instructions

### For Existing Installations

1. **Run the database migration**:
   ```bash
   # Execute the migration script in Supabase SQL Editor
   psql -f migration_add_sheet_name_to_chapters.sql
   ```

2. **Re-analyze existing files**:
   - Existing data will not have `sheet_name` populated
   - To populate `sheet_name` for existing chapters, you need to re-analyze the Excel files
   - Alternatively, you can manually update the database if you know which chapters came from which sheets

3. **Verification**:
   ```sql
   -- Check if the column was added
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'orcamento_chapters' 
   AND column_name = 'sheet_name';
   
   -- Check how many chapters have sheet_name populated
   SELECT 
     COUNT(*) as total_chapters,
     COUNT(sheet_name) as chapters_with_sheet_name
   FROM orcamento_chapters;
   ```

## Notes

- The `treatAsSingleSheet` flag is no longer used in the tab creation logic
- The `articleBasedView` flag still works as before, but now all views behave consistently with 3 fixed tabs
- Sheet separators are only shown when there are multiple sheets (improves UX for single-sheet files)
- The migration is safe to run multiple times (uses `IF NOT EXISTS`)
