# Item Specialities Removal and Duplicate Chapter Fix

## Summary

This PR addresses two issues:
1. **Removed the item specialities feature** - Users can no longer assign specialities to individual items
2. **Fixed duplicate chapter number handling** - When analyzing Excel files, duplicate chapter numbers are now correctly treated as item comments

## Problem Statement

### Issue 1: Remove Item Specialities Feature
The feature to add specialities to individual items needed to be removed from the application.

### Issue 2: Duplicate Chapter Numbers
In single-sheet Excel files, when two rows have the same chapter number (e.g., both have "1" in the ARTIGO column), the system was creating duplicate chapters. According to the requirements:
- The first occurrence should be treated as the chapter
- Subsequent occurrences should be treated as comments for the next item

## Changes Made

### 1. UI Changes - Item Specialities Removed

#### Removed Components:
- **Specialities table column** - The entire column displaying item specialities was removed from both table views
- **Speciality badges** - Badges showing assigned specialities for each item
- **Edit button** - Button to open the specialities selection dialog
- **Specialities dialog** - Modal dialog for selecting specialities for items
- **Remove buttons** - Individual remove buttons on speciality badges

#### Before:
```
| Artigo | Descrição | UN | QT | Specialities | Observações |
| 1.1    | Item 1    | m2 | 10 | [Electrical ✕] [HVAC ✕] [Edit] | - |
```

#### After:
```
| Artigo | Descrição | UN | QT | Observações |
| 1.1    | Item 1    | m2 | 10 | - |
```

### 2. Code Removals

#### Removed State Management:
- `editingItemId` - Tracks which item is being edited
- `pendingItemSpecialities` - Temporary storage for speciality selections

#### Removed Queries:
- `itemSpecialities` - Query to fetch item-speciality mappings

#### Removed Mutations:
- `updateItemSpecialitiesMutation` - Mutation to update item specialities

#### Removed Helper Functions:
- `getItemSpecialityIds()` - Get specialities for an item with inheritance
- `getItemOwnSpecialityIds()` - Get item-specific specialities only
- `getSpecialitiesByIds()` - Convert speciality IDs to objects
- `groupedSpecialityOptions` - Memoized grouped speciality options
- `handleOpenItemDialog()` - Handler for opening item specialities dialog
- `handleCloseItemDialog()` - Handler for closing item specialities dialog
- `handleApplyItemSpecialities()` - Handler for applying speciality changes

#### Removed Types:
- `ItemSpeciality` - Type definition for item-speciality relationship

#### Removed Imports:
- `Tag` icon from lucide-react
- `X` icon from lucide-react
- `MultiSelect` component
- `Badge` component

### 3. Excel Analysis Enhancement - Duplicate Chapter Detection

#### Implementation:
```typescript
// Track seen chapter numbers to detect duplicates
const seenChapterNumbers = new Set<string>();

// In chapter detection logic
if (/^\d+$/.test(artigoCell) && descricaoCell) {
  if (seenChapterNumbers.has(artigoCell)) {
    // Duplicate chapter - treat as item comment
    if (!parentCommentsMap.has(artigoCell)) {
      parentCommentsMap.set(artigoCell, []);
    }
    parentCommentsMap.get(artigoCell)!.push(descricaoCell);
    lastCommentArtigo = artigoCell;
  } else {
    // New chapter - process normally
    chaptersToInsert.push({
      sheet_name: sheetName,
      chapter_number: artigoCell,
      chapter_name: descricaoCell,
      chapter_comments: undefined,
    });
    seenChapterNumbers.add(artigoCell); // Mark as seen
  }
}
```

#### How It Works:
1. **First occurrence** of a chapter number (e.g., "1") → Creates a chapter
2. **Subsequent occurrences** of the same chapter number → Stored as item comments in `parentCommentsMap`
3. Items with matching ARTIGO values will inherit these comments
4. Comments are joined with newlines for multi-line descriptions

#### Example:

**Excel Input:**
```
| ARTIGO | DESCRIÇÃO                  | UN  | QT   |
|--------|----------------------------|-----|------|
| 1      | Foundation Work            | -   | -    |    ← Chapter
| 1      | Requires special attention | -   | -    |    ← Comment (duplicate)
| 1.1    | Excavation                 | m3  | 100  |   ← Item (gets comment)
```

**Result:**
- **Chapter Created:** Number: "1", Name: "Foundation Work"
- **Item Created:** Artigo: "1.1", Description: "Excavation", Comments: "Requires special attention"

## Impact

### User Experience:
- **Simplified UI** - The items table is now cleaner with one less column
- **Reduced Complexity** - Users no longer need to manage specialities at the item level
- **Correct Data Import** - Duplicate chapter numbers in Excel files are now handled correctly

### Code Quality:
- **Reduced Code** - Removed 362 lines of code
- **Better Separation** - Item specialities completely removed, chapter specialities remain intact
- **Cleaner Imports** - Removed unused UI components

## Testing

### Verification:
- ✅ **Linter**: No new errors introduced
- ✅ **Build**: Project builds successfully
- ✅ **Code Reduction**: 362 lines removed, 35 lines added (net -327 lines)

### Test Scenarios:

#### Scenario 1: View Items Table
1. Navigate to an orcamento with analyzed data
2. Expand a chapter
3. **Expected**: No "Specialities" column visible
4. **Expected**: Items display without speciality badges or edit buttons

#### Scenario 2: Upload Excel with Duplicate Chapters
1. Create an Excel file with duplicate chapter numbers
2. Upload to orcamento
3. Analyze the file
4. **Expected**: Only one chapter created per unique chapter number
5. **Expected**: Duplicate chapter descriptions become item comments

#### Scenario 3: Chapter Specialities Still Work
1. Navigate to an orcamento
2. **Expected**: Chapter-level specialities still function normally
3. **Expected**: No impact on chapter speciality assignment

## Database Considerations

### No Migration Required:
- The `item_specialities` table still exists in the database
- Existing item speciality data is preserved but no longer accessible via UI
- The `specialities_explicitly_set` field on items is still present but unused

### Future Cleanup (Optional):
If permanently removing item specialities, consider:
1. Dropping the `item_specialities` table
2. Removing the `specialities_explicitly_set` column from `orcamento_items`
3. Cleaning up any related database triggers or functions

## Notes

- **Chapter specialities remain functional** - This change only affects item-level specialities
- **Backward compatible** - Existing data is not modified or deleted
- **Minimal changes** - Following the principle of surgical, focused modifications
- **Single-sheet focused** - The duplicate chapter fix primarily benefits single-sheet Excel files

## Related Files

- `src/pages/MapaQuantidades.tsx` - Main file with all changes
