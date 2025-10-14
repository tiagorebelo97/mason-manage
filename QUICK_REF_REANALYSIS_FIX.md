# Quick Reference: Article-Based View Re-Analysis Fix

## What was fixed?
Re-analyzing Excel files in article-based view now works correctly by deleting old tabs before creating new ones.

## Why was this needed?
- Old tabs with same names caused UNIQUE constraint violations
- Chapters remained linked to wrong tabs
- Re-analysis would fail with database error

## How does it work?
Before creating new tabs, the code now:
1. Deletes all existing tabs for the orcamento (cascade deletes chapters/items)
2. Clears sessionStorage articles data
3. Creates fresh tabs with correct mappings

## Location
`src/pages/MapaQuantidades.tsx` lines 1135-1149

## Key Code
```typescript
// Delete existing tabs before re-analyzing
const { error: deleteTabsError } = await supabase
  .from("orcamento_tabs")
  .delete()
  .eq("orcamento_id", id!);

// Clear articles cache
sessionStorage.removeItem(`articles_${id}`);
```

## Benefits
✅ Re-analysis always works  
✅ Chapters appear under correct tabs  
✅ No duplicate or orphaned data  
✅ Can switch between modes freely  

## Test Quickly
1. Upload multi-sheet Excel file
2. Enable article-based view
3. Click Analyze
4. Click Analyze again
5. ✅ Should work both times

## Related Files
- `ARTICLE_TAB_REANALYSIS_FIX.md` - Full documentation
- `migration_tabs.sql` - Database schema with UNIQUE constraint
