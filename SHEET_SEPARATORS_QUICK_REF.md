# Quick Reference: Sheet Separators Implementation

## What Was Done

Added sheet name separators to the **normal view** (non-article-based view) in Mason Manage, matching the existing behavior in article-based view.

## Quick Summary

- ✅ Sheet separators now appear in Principal tab when multiple sheets are present
- ✅ Respects original Excel sheet order and hierarchy
- ✅ Blue-themed separators (📄 Sheet Name)
- ✅ Only shows when needed (multiple sheets in same tab)
- ✅ Backwards compatible with existing data

## Files Changed

| File | Purpose |
|------|---------|
| `migration_add_sheet_name_to_chapters.sql` | Adds `sheet_name` column to database |
| `src/pages/MapaQuantidades.tsx` | Implements sheet grouping and separators |
| `SHEET_SEPARATORS_NORMAL_VIEW.md` | Detailed implementation guide |
| `SHEET_SEPARATORS_VISUAL_EXAMPLE.md` | Visual examples and testing guide |

## How It Works

1. **Database**: Preserves `sheet_name` in `orcamento_chapters` table
2. **Data Flow**: Maintains sheet name during Excel analysis and insertion
3. **UI**: Groups chapters by sheet and displays separators

## When Separators Appear

```
✅ Multi-sheet Excel with "Treat as single sheet" enabled
✅ Multiple sheets mapped to Principal tab
✅ Normal view (not article-based view)
✅ More than one sheet in the same tab

❌ Single-sheet Excel files
❌ Each sheet in its own tab (normal multi-sheet mode)
❌ Only one sheet present in a tab
```

## Visual Example

**Before**:
```
Chapter 1
Chapter 2
Chapter 3 (from different sheet - confusing!)
Chapter 4 (which sheet is this?)
```

**After**:
```
📄 Sheet 1
Chapter 1
Chapter 2

📄 Sheet 2
Chapter 3
Chapter 4
```

## Setup Required

1. Run database migration:
```bash
psql -h your-host -U your-user -d your-db -f migration_add_sheet_name_to_chapters.sql
```

2. Restart application (if needed)

3. Analyze new Excel files to see separators

## Testing

1. Upload multi-sheet Excel (2+ sheets)
2. Enable "Treat as single sheet" toggle
3. Click "Analyze"
4. Verify blue separators appear between sheets
5. Verify chapter order is preserved

## Technical Details

- **Database Column**: `sheet_name VARCHAR(255)` (nullable)
- **Index Added**: `idx_orcamento_chapters_sheet_name`
- **TypeScript Type**: `sheet_name?: string | null`
- **UI Component**: Blue themed div with left border
- **Grouping Logic**: `Map<string, OrcamentoChapter[]>`

## Color Scheme

| Mode  | Background | Border | Text |
|-------|-----------|--------|------|
| Light | `bg-blue-50` | `border-blue-500` | `text-blue-900` |
| Dark  | `bg-blue-950` | `border-blue-500` | `text-blue-100` |

## Code Locations

### Sheet Name Preservation
```typescript
// Line ~1186 in MapaQuantidades.tsx
const chaptersWithTabIds = chaptersToInsert.map(chapter => ({
  tab_id: sheetNameToTabId.get(chapter.sheet_name!) || null,
  sheet_name: chapter.sheet_name, // ← Added this
  chapter_number: chapter.chapter_number,
  chapter_name: chapter.chapter_name,
  chapter_comments: chapter.chapter_comments || null,
}));
```

### Sheet Grouping Logic
```typescript
// Line ~1957 and ~2267 in MapaQuantidades.tsx
const chaptersBySheet = new Map<string, typeof chapters>();
chapters.forEach((chapter) => {
  const sheetName = chapter.sheet_name || 'Unknown';
  if (!chaptersBySheet.has(sheetName)) {
    chaptersBySheet.set(sheetName, []);
  }
  chaptersBySheet.get(sheetName)!.push(chapter);
});
```

### Separator Component
```tsx
// Line ~1980 and ~2289 in MapaQuantidades.tsx
{chaptersBySheet.size > 1 && (
  <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
      📄 {sheetName}
    </h2>
  </div>
)}
```

## Backwards Compatibility

- ✅ Existing records without `sheet_name` work normally
- ✅ No separators shown for `NULL` sheet names
- ✅ No breaking changes to API or UI
- ✅ Optional column (nullable)

## Performance

- Index on `sheet_name` for efficient queries
- Client-side grouping (no extra DB calls)
- O(1) Map lookups
- Minimal memory overhead

## Future Enhancements

- [ ] Drag-and-drop sheet reordering
- [ ] Collapse/expand sheet groups
- [ ] Sheet-level statistics
- [ ] Export with sheet structure

## Support

For questions or issues:
1. Check `SHEET_SEPARATORS_NORMAL_VIEW.md` for detailed docs
2. Check `SHEET_SEPARATORS_VISUAL_EXAMPLE.md` for examples
3. Review the code comments in `MapaQuantidades.tsx`

## Related Features

- Article-based view separators (already existed)
- Multi-sheet Excel analysis
- "Treat as single sheet" option
- Sheet order preservation

---

**Last Updated**: October 2025
**Version**: 1.0
**Status**: ✅ Implemented and Tested
