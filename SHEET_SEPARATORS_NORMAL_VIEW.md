# Sheet Separators in Normal View - Implementation Guide

## Overview

This implementation adds sheet name separators to the **normal view** (non-article-based view) in Mason Manage, similar to the existing separators in article-based view. This allows users to see which content came from which Excel sheet when multiple sheets are mapped to the same tab.

## Problem Statement

Previously, sheet separators only appeared in **article-based view**. When using **normal view** with:
- Multi-sheet files treated as single sheet (via `treatAsSingleSheet` flag)
- Multiple sheets mapped to the Principal tab

Users couldn't distinguish which chapters came from which Excel sheet, making navigation and organization confusing.

## Solution

The implementation preserves the `sheet_name` field throughout the data flow and groups chapters by sheet name in the UI, displaying blue-themed separators when multiple sheets exist in the same tab.

## Changes Made

### 1. Database Schema Update

**File**: `migration_add_sheet_name_to_chapters.sql` (new)

```sql
ALTER TABLE orcamento_chapters ADD COLUMN IF NOT EXISTS sheet_name VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_orcamento_chapters_sheet_name ON orcamento_chapters(sheet_name);
```

- Added `sheet_name` column back to `orcamento_chapters` table
- Made it nullable to support existing records
- Added index for performance when grouping

### 2. TypeScript Type Update

**File**: `src/pages/MapaQuantidades.tsx`

```typescript
type OrcamentoChapter = {
  id: string;
  tab_id: string;
  chapter_number: string;
  chapter_name: string;
  chapter_comments: string | null;
  sheet_name?: string | null; // Track original sheet name for separators
};
```

### 3. Preserve Sheet Name During Insertion

**File**: `src/pages/MapaQuantidades.tsx`

Updated the `chaptersWithTabIds` mapping to include `sheet_name`:

```typescript
const chaptersWithTabIds = chaptersToInsert.map(chapter => ({
  tab_id: sheetNameToTabId.get(chapter.sheet_name!) || null,
  sheet_name: chapter.sheet_name, // Preserve sheet name for separators
  chapter_number: chapter.chapter_number,
  chapter_name: chapter.chapter_name,
  chapter_comments: chapter.chapter_comments || null,
}));
```

### 4. Add Sheet Grouping in Multi-Tab View

**File**: `src/pages/MapaQuantidades.tsx`

Modified the normal view tabs rendering to group chapters by sheet and display separators:

```typescript
{tabs.map((tab) => (
  <TabsContent key={tab.id} value={tab.id} className="space-y-6">
    {(() => {
      const chaptersForTab = chaptersByTab[tab.id] || [];
      
      // Group chapters by sheet name for multi-sheet separators
      const chaptersBySheet = new Map<string, typeof chaptersForTab>();
      chaptersForTab.forEach((chapter) => {
        const sheetName = chapter.sheet_name || 'Unknown';
        if (!chaptersBySheet.has(sheetName)) {
          chaptersBySheet.set(sheetName, []);
        }
        chaptersBySheet.get(sheetName)!.push(chapter);
      });
      
      // Get the sheet names in the original order from Excel
      const orderedSheets = sheetOrder.length > 0
        ? sheetOrder.filter(sheetName => chaptersBySheet.has(sheetName))
        : Array.from(chaptersBySheet.keys());
      
      // Display chapters grouped by sheet in the correct order
      return orderedSheets.map((sheetName) => {
        const chaptersInSheet = chaptersBySheet.get(sheetName) || [];
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
            // ... existing chapter rendering code
```

### 5. Add Sheet Grouping in Single-Sheet View

Applied the same logic to the single-sheet view (when `tabs.length <= 1`).

## Visual Appearance

When multiple sheets are mapped to the same tab, users will see:

```
┌─────────────────────────────────────────┐
│ 📄 Sheet 1                              │ ← Blue separator
└─────────────────────────────────────────┘

[Chapter 1 from Sheet 1]
[Chapter 2 from Sheet 1]

┌─────────────────────────────────────────┐
│ 📄 Sheet 2                              │ ← Blue separator
└─────────────────────────────────────────┘

[Chapter 1 from Sheet 2]
[Chapter 2 from Sheet 2]
```

**Colors**:
- Background: `bg-blue-50` (light mode) / `bg-blue-950` (dark mode)
- Border: `border-l-4 border-blue-500` (left blue border)
- Text: `text-blue-900` (light mode) / `text-blue-100` (dark mode)

## When Separators Appear

Sheet separators are displayed when:
1. **Multiple sheets** exist in the same tab (`chaptersBySheet.size > 1`)
2. In **normal view** (not article-based view)
3. Chapters have preserved `sheet_name` information

Separators do NOT appear when:
- Only one sheet exists in a tab
- `sheet_name` is null/undefined for all chapters (backwards compatibility)

## Ordering and Hierarchy

The implementation respects:
1. **Sheet order**: Uses `sheetOrder` state (preserved from Excel file) to maintain original sheet order
2. **Chapter order**: Within each sheet, chapters are ordered by `chapter_number`
3. **Item order**: Within each chapter, items maintain their original order

## Testing

### Manual Testing Steps

1. **Multi-sheet Excel file with treatAsSingleSheet**:
   - Upload Excel file with 2+ sheets
   - Enable "Treat as single sheet" option
   - Click "Analyze"
   - Verify sheet separators appear in Principal tab
   - Verify all chapters are displayed in correct order

2. **Single-sheet Excel file**:
   - Upload Excel file with 1 sheet
   - Click "Analyze"
   - Verify NO sheet separators appear (only one sheet)
   - Verify content displays normally

3. **Multi-sheet Excel file (normal mode)**:
   - Upload Excel file with 2+ sheets
   - Do NOT enable "Treat as single sheet"
   - Click "Analyze"
   - Each sheet becomes its own tab
   - Verify NO sheet separators within individual tabs (only one sheet per tab)

4. **Existing data (backwards compatibility)**:
   - Open existing orcamento analyzed before this change
   - Verify chapters without `sheet_name` display normally
   - Verify no separators appear (expected, as no sheet info)

## Database Migration

Users must run the migration script before using this feature:

```bash
# In Supabase SQL Editor or via psql
psql -h your-db-host -U your-user -d your-database -f migration_add_sheet_name_to_chapters.sql
```

**Important**: Existing records will have `NULL` sheet_name. Only new analyses will populate this field.

## Backwards Compatibility

- ✅ Existing chapters without `sheet_name` continue to work
- ✅ No separators shown for chapters with `NULL` sheet_name
- ✅ No breaking changes to existing functionality
- ✅ Database migration is additive (no data loss)

## Technical Details

### Performance Considerations

- Added index on `sheet_name` for efficient grouping queries
- Grouping logic runs client-side (no additional database queries)
- `Map` data structure provides O(1) lookups

### State Management

- Uses existing `sheetOrder` state from session storage
- No new state variables added
- Leverages existing chapter and item queries

### Code Structure

- Minimal changes to existing code
- Wraps existing chapter rendering in grouping logic
- Reuses separator component style from article-based view

## Future Enhancements

Potential improvements:
1. Allow users to manually reorder sheets via drag-and-drop
2. Add collapse/expand for sheet groups
3. Display sheet statistics (chapter count, item count)
4. Export sheet information in reports

## Related Files

- `src/pages/MapaQuantidades.tsx` - Main implementation
- `migration_add_sheet_name_to_chapters.sql` - Database migration
- `ARTICLE_VIEW_ENHANCEMENTS.md` - Related article-based view documentation

## Summary

This implementation brings the sheet separator feature from article-based view to normal view, maintaining consistency across viewing modes and improving user experience when working with multi-sheet Excel files.
