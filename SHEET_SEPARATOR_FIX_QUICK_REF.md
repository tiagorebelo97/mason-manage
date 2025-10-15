# Quick Fix Reference - Sheet Separator Visibility

## Problem
Sheet separator disappears when moved to another tab, leaving only chapters visible without context.

## Solution
Changed from checking sheets in current tab to checking total sheets in file.

## Code Change (3 lines)

```typescript
// Add at line 2534-2539
const totalUniqueSheets = new Set(
  chaptersWithArticles
    .filter(cwa => cwa.sheet_name)
    .map(cwa => cwa.sheet_name)
).size;

// Change line 2564
{totalUniqueSheets > 1 && (  // was: chaptersBySheet.size > 1

// Change line 2628
{(!isSheetCollapsed || totalUniqueSheets === 1) && // was: chaptersBySheet.size === 1
```

## Testing
1. Upload multi-sheet file
2. Move sheet to empty tab
3. ✅ Separator should appear in new tab

## Files Changed
- `src/pages/MapaQuantidades.tsx` (3 lines modified)

## Documentation
- `SHEET_SEPARATOR_FIX_VISUAL.md` - Visual examples
- `SHEET_SEPARATOR_FIX_VERIFICATION.md` - Test scenarios
- `SHEET_SEPARATOR_FIX_TECHNICAL_SUMMARY.md` - Technical details

## Status
✅ Code changed
✅ Build successful
✅ No lint errors
✅ Logic verified
✅ Documentation complete
⏳ Manual testing recommended
