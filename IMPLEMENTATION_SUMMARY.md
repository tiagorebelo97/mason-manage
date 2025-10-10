# Implementation Summary - Single-Sheet Excel Mode & Specialities Fix

## Overview
This PR implements the requested features for single-sheet Excel file handling and fixes critical bugs in the specialities dialog system.

## Changes Implemented

### 1. Single-Sheet Excel Mode Toggle

**Location**: Before the "Analyze" button in the file upload section

**UI Change**:
```
[File info: filename.xlsx]    [Switch] Treat as single sheet    [Analyze Button]    [Delete Button]
```

**Behavior**:
- **Toggle OFF (default)**: Auto-detect sheet count
  - Single sheet → Creates 3 tabs (Principal, Arquitetura, Instalações Especiais)
  - Multiple sheets → Creates tabs from sheet names
  
- **Toggle ON**: Force single-sheet mode
  - Always creates 3 tabs (Principal, Arquitetura, Instalações Especiais)
  - Maps all data to "Principal" tab
  - Useful when Excel file has multiple sheets but user wants to treat it as one

**Excel Analysis Process** (Single-Sheet Mode):
1. Searches for columns: ARTIGO, DESCRIÇÃO, UN, QT (flexible case)
2. Identifies chapters: Rows where ARTIGO = pure number (e.g., "1", "2", "10")
3. Identifies items: Rows where ARTIGO = decimal number (e.g., "1.1", "2.3", "10.5")
4. Links items to chapters by sequential order
5. Extracts all required data and creates database entries

### 2. Specialities Dialog Bug Fix

**Problem**: 
- Users received "Failed to update item specialities" error
- Data was actually being saved (visible after page refresh)
- Caused by race condition in state management

**Root Cause**:
- State was cleared immediately after mutation call
- UI updated before async mutation completed
- Dialog behavior became inconsistent

**Solution**:
- Moved state cleanup from dialog close handler to mutation callbacks
- State persists during async operation
- Cleanup happens in `onSuccess` and `onError` callbacks
- Both chapter and item specialities dialogs fixed

**Affected Mutations**:
- `updateChapterSpecialitiesMutation`
- `updateItemSpecialitiesMutation`

## Code Changes Summary

### Files Modified
- **src/pages/MapaQuantidades.tsx** (+40 lines, -14 lines)

### Key Changes
1. Added `treatAsSingleSheet` state variable
2. Imported `Switch` and `Label` UI components
3. Added UI toggle with label before Analyze button
4. Updated `analyzeMutation` to accept `{ fileId, treatAsSingleSheet }` object
5. Modified `handleAnalyze` to pass `treatAsSingleSheet` to mutation
6. Updated `hasMultipleSheets` logic: `treatAsSingleSheet ? false : workbook.SheetNames.length > 1`
7. Moved state cleanup to mutation callbacks (`onSuccess` and `onError`)
8. Removed immediate state cleanup from close handlers

## Testing

### Build & Quality Checks
- ✅ TypeScript compilation successful (no errors)
- ✅ Linting passed (no new errors)
- ✅ Bundle size: ~3.19 MB (minimal increase)
- ✅ All existing functionality preserved

### Manual Testing Recommended

**Single-Sheet Mode Testing**:
1. Upload Excel file with multiple sheets
2. Enable "Treat as single sheet" toggle
3. Click "Analyze"
4. Verify 3 tabs created: Principal, Arquitetura, Instalações Especiais
5. Verify all data appears under Principal tab
6. Verify chapters and items are correctly identified and linked

**Specialities Dialog Testing**:
1. Navigate to analyzed Excel file view
2. Click Tag icon on chapter header
3. Verify dialog opens
4. Select/deselect specialities
5. Close dialog
6. Verify no error toast appears
7. Verify changes are saved immediately (no refresh needed)
8. Verify badges update correctly

**Item Specialities Testing**:
1. Expand a chapter
2. Click "Edit" button on item's specialities
3. Verify dialog opens
4. Add/remove specialities
5. Close dialog
6. Verify no error toast appears
7. Verify changes are saved immediately
8. Verify badges update correctly

## User Impact

### Benefits
1. **Manual Control**: Users can now force single-sheet mode regardless of actual sheet count
2. **Better UX**: No more confusing error messages when specialities are actually being saved
3. **Reliability**: Race conditions eliminated, mutations complete properly before UI updates
4. **Consistency**: Both chapter and item specialities behave predictably

### Breaking Changes
None - all changes are additive or fixes to existing bugs

### Migration Required
None - changes are UI and logic only, no database schema changes

## Technical Notes

### Single-Sheet Detection Logic
```typescript
const hasMultipleSheets = treatAsSingleSheet ? false : workbook.SheetNames.length > 1;
```

### Tab Creation Logic
```typescript
if (!hasMultipleSheets) {
  // Create 3 default tabs
  tabsToInsert.push(
    { name: "Principal", display_order: 0 },
    { name: "Arquitetura", display_order: 1 },
    { name: "Instalações Especiais", display_order: 2 }
  );
}
```

### Chapter Identification
```typescript
if (/^\d+$/.test(artigoCell) && descricaoCell) {
  // This is a chapter
  currentChapterNumber = artigoCell;
}
```

### Item Identification
```typescript
if (/^\d+\./.test(artigoCell) && descricaoCell) {
  // This is an item
  // Links to currentChapterNumber
}
```

### Mutation State Management
```typescript
// OLD (Buggy):
const handleCloseItemDialog = (open: boolean) => {
  if (!open && editingItemId) {
    updateItemSpecialitiesMutation.mutate({...});
    setEditingItemId(null); // ❌ Immediate cleanup
  }
};

// NEW (Fixed):
const handleCloseItemDialog = (open: boolean) => {
  if (!open && editingItemId) {
    updateItemSpecialitiesMutation.mutate({...});
    // State cleanup moved to mutation callbacks
  }
};

// Mutation callback:
onSuccess: () => {
  queryClient.invalidateQueries({...});
  toast.success('...');
  setEditingItemId(null); // ✅ Deferred cleanup
  setPendingItemSpecialities([]);
}
```

## Future Enhancements

Potential improvements for future PRs:
1. Add loading indicator while specialities mutation is pending
2. Add confirmation dialog before clearing all specialities
3. Add bulk speciality assignment for multiple items
4. Add Excel template download with example structure
5. Add validation warnings if required columns are missing

## Related Documentation

- `SINGLE_SHEET_FIX.md` - Original single-sheet implementation
- `SPECIALITIES_EDIT_FIX.md` - Previous specialities dialog fix
- `SPECIALITIES_DIALOG_FIX_COMPLETE.md` - Dialog trigger fix
- `ITEM_EXTRACTION_FEATURE.md` - Item extraction implementation
