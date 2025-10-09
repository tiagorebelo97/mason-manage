# Chapter-Item Relationship Fix and Single-Sheet Support

## Summary

This update fixes the chapter-item relationship logic and adds support for single-sheet Excel files.

## Changes Made

### 1. Fixed Chapter-Item Relationship Logic

**Previous Behavior:**
- Items were linked to chapters by extracting the chapter number from the item's ARTIGO value
- Example: Item "1.1" → Chapter "1", Item "2.3" → Chapter "2"
- This was problematic when ARTIGO numbering didn't follow the expected pattern

**New Behavior:**
- Items are now linked to chapters based on **sequential order**
- Items belong to the most recent chapter that appears before them in the Excel sheet
- The ARTIGO numbering no longer determines the relationship
- Example: After Chapter "1", all items (even "2.1", "3.5") belong to Chapter "1" until a new chapter is encountered

**Code Changes:**
- File: `src/pages/MapaQuantidades.tsx`
- Line ~505: Changed from `const chapterNumber = artigoCell.split('.')[0];` to `const chapterNumber = currentChapterNumber;`
- The algorithm now maintains a `currentChapterNumber` variable that tracks the most recent chapter

### 2. Added Single-Sheet Support

**Previous Behavior:**
- Tabs were always created, even for single-sheet Excel files
- This resulted in unnecessary tab navigation for simple files

**New Behavior:**
- Tabs are only created when the Excel file has 2+ sheets
- Single-sheet files skip tab creation entirely
- The UI adapts to show tabs or direct chapter display based on the number of sheets

**Code Changes:**
- File: `src/pages/MapaQuantidades.tsx`
- Line ~360-370: Added `hasMultipleSheets` check before creating tabs
- Line ~606-625: Modified tab insertion to only occur when multiple sheets exist
- Line ~1203-1697: Added conditional rendering for single-sheet vs multi-sheet display

### 3. Database Schema

**orcamento_chapters table:**
- `tab_id` field is now nullable
- When a single-sheet file is processed, chapters have `tab_id = null`
- This maintains backward compatibility with multi-sheet files

## Examples

### Example 1: Sequential Context (New Behavior)
```
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
|--------|------------------------|-----|------|
| 1      | Trabalhos Preliminares |     |      | <- CHAPTER 1
| 1.1    | Limpeza do terreno     | m2  | 100  | <- Belongs to Chapter 1
| 3.5    | Some other work        | un  | 25   | <- Belongs to Chapter 1 (not Chapter 3!)
| 2      | Fundações              |     |      | <- CHAPTER 2
| 1.5    | Different work         | m3  | 200  | <- Belongs to Chapter 2 (not Chapter 1!)
```

### Example 2: Single-Sheet File
```
Before: [Tab: Sheet1]
        ├─ Chapter 1
        └─ Chapter 2

After:  (No tabs)
        ├─ Chapter 1
        └─ Chapter 2
```

## User Impact

### Positive Changes
1. **More Intuitive**: Items now follow the natural order of the Excel sheet
2. **Flexible Numbering**: ARTIGO numbers can be arbitrary - the relationship is based on order
3. **Simpler UI**: Single-sheet files no longer show unnecessary tabs
4. **Backward Compatible**: Existing multi-sheet files continue to work as before

### Migration Required
No database migration is required. The changes are purely in the application logic and UI.

## Testing

The changes have been tested with:
- ✅ Build successful (TypeScript compilation)
- ✅ Lint passes (no errors)
- ✅ Code follows existing patterns

### Test Cases to Verify
1. Upload a single-sheet Excel file → should not create tabs
2. Upload a multi-sheet Excel file → should create tabs as before
3. Items should belong to the chapter they appear after, regardless of ARTIGO numbering
4. Mixed ARTIGO numbering should work correctly (e.g., "3.5" after Chapter "1")

## Files Modified

1. `src/pages/MapaQuantidades.tsx` - Main component with logic and UI changes
2. `ITEM_EXTRACTION_FEATURE.md` - Updated documentation

## Benefits

1. **Correct Behavior**: Items are associated with the correct chapter based on context
2. **Simplified Interface**: Single-sheet files have a cleaner UI
3. **Flexibility**: Handles non-standard ARTIGO numbering patterns
4. **Performance**: Slightly improved performance for single-sheet files (no unnecessary tabs)
