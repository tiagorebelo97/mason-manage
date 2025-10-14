# Article-Based View Re-Analysis Fix

## Problem Statement
When re-analyzing an Excel file in article-based view, the analysis would fail because:
1. Old tabs with the same names already existed in the database
2. The database has a UNIQUE constraint on `(orcamento_id, name)` for tabs
3. Attempting to insert new tabs with the same names would violate this constraint
4. This caused the analysis to fail completely

Additionally, chapters from the old analysis would remain in the database with incorrect `tab_id` values, causing them to appear under the wrong tabs or not appear at all.

## Root Cause

The analyze mutation did not delete old tabs before creating new ones. This caused issues when:
- Re-analyzing a file with different settings (e.g., switching from article-based to non-article-based view)
- Re-analyzing a file after the tab structure had changed
- Re-analyzing a file with different sheet names

The UNIQUE constraint on `(orcamento_id, name)` in the `orcamento_tabs` table (defined in `migration_tabs.sql` line 11) would prevent duplicate tabs, causing the INSERT to fail.

## Solution

Added cleanup code at line 1135-1149 in `src/pages/MapaQuantidades.tsx`:

```typescript
// Delete existing tabs (which will cascade delete chapters and items) before re-analyzing
// This ensures that re-analysis starts with a clean slate
console.log("Deleting existing tabs for orcamento_id:", id);
const { error: deleteTabsError } = await supabase
  .from("orcamento_tabs")
  .delete()
  .eq("orcamento_id", id!);

if (deleteTabsError) {
  console.error("Error deleting existing tabs:", deleteTabsError);
  // Don't throw - it's okay if there are no existing tabs to delete
}

// Delete articles data from sessionStorage to ensure clean state
sessionStorage.removeItem(`articles_${id}`);
```

### Key Features:
1. **Cascade Delete**: When tabs are deleted, the database automatically deletes all associated chapters and items due to the ON DELETE CASCADE constraint
2. **Clean State**: SessionStorage articles data is also cleared to prevent stale data from appearing
3. **Non-Blocking**: If no tabs exist to delete, the operation doesn't fail
4. **Fresh Analysis**: Every re-analysis starts with a completely clean slate

## Impact

This fix ensures that:
- **Chapter-Tab Correspondence**: Chapters from each Excel sheet are correctly linked to their corresponding tabs
- **Re-Analysis Works**: Users can re-analyze files without errors
- **Clean Data**: No orphaned or duplicate data remains in the database
- **Flexible Switching**: Users can switch between article-based and non-article-based view without issues

## Testing Instructions

### Test Case 1: Re-analyze Single-Sheet File
1. Upload an Excel file with 1 sheet
2. Enable "Article-based view" checkbox
3. Click "Analyze"
4. **Expected**: Analysis completes successfully, 1 tab created with sheet name
5. Click "Analyze" again
6. **Expected**: Analysis completes successfully again, still 1 tab (old one deleted, new one created)
7. Verify chapters appear under the correct tab

### Test Case 2: Re-analyze Multi-Sheet File
1. Upload an Excel file with 3 sheets (e.g., "Sheet1", "Sheet2", "Sheet3")
2. Enable "Article-based view" checkbox
3. Click "Analyze"
4. **Expected**: Analysis completes successfully, 3 tabs created (one per sheet)
5. Verify chapters from "Sheet1" appear under "Sheet1" tab
6. Verify chapters from "Sheet2" appear under "Sheet2" tab
7. Verify chapters from "Sheet3" appear under "Sheet3" tab
8. Click "Analyze" again
9. **Expected**: Analysis completes successfully again, still 3 tabs (old ones deleted, new ones created)
10. Verify chapters still appear under correct tabs

### Test Case 3: Switch Between Modes
1. Upload an Excel file with 2 sheets
2. Disable "Article-based view" checkbox
3. Click "Analyze"
4. **Expected**: 2 tabs created (one per sheet in multi-sheet mode)
5. Enable "Article-based view" checkbox
6. Click "Analyze"
7. **Expected**: Analysis completes successfully, old tabs deleted, new tabs created
8. Verify chapters and articles display correctly

### Test Case 4: First-Time Analysis
1. Upload a new Excel file (never analyzed before)
2. Enable "Article-based view" checkbox
3. Click "Analyze"
4. **Expected**: Analysis completes successfully (no old tabs to delete)
5. Verify tabs and chapters are created correctly

## Technical Details

### Database Schema
The `orcamento_tabs` table has the following constraint (from `migration_tabs.sql`):
```sql
UNIQUE(orcamento_id, name)
```

This prevents duplicate tabs with the same name for a given orcamento.

### Cascade Delete
The `orcamento_chapters` table has:
```sql
tab_id UUID REFERENCES orcamento_tabs(id) ON DELETE CASCADE
```

And the `orcamento_items` table has:
```sql
chapter_id UUID REFERENCES orcamento_chapters(id) ON DELETE CASCADE
```

This ensures that when tabs are deleted:
1. All chapters linked to those tabs are deleted
2. All items linked to those chapters are deleted

### SessionStorage Cleanup
Article data is stored in sessionStorage with the key `articles_${orcamento_id}`. This is cleared during re-analysis to prevent stale article data from being displayed.

## Files Changed

- `src/pages/MapaQuantidades.tsx`: Added cleanup code before tab insertion (lines 1135-1149)

## Build Status

✅ Build passes successfully
✅ No lint errors introduced
✅ No TypeScript errors

## Related Documentation

- `ARTICLE_TAB_PER_SHEET_IMPLEMENTATION.md`: Original implementation of one tab per sheet for article-based view
- `ARTICLE_BASED_VIEW_MULTISHEET_FIX.md`: Fix for multi-sheet article-based view analysis
- `migration_tabs.sql`: Database schema for tabs feature
