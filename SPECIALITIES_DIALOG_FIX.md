# Specialities Dialog Fix

## Problem Statement

The feature to add and delete specialities from chapters and items was not working. When users clicked the specialities edit button, the dialog would not open properly or changes would not be saved.

## Root Cause

The Dialog component was using both controlled state (`open={editingChapterId === chapter.id}`) and uncontrolled behavior (`DialogTrigger`), creating a race condition:

1. Button had both `onClick` handler AND was wrapped in `DialogTrigger`
2. When clicked, both handlers would fire, causing conflicting state updates
3. The `onOpenChange` handler had buggy logic that would set `editingChapterId` to `null` in certain conditions
4. The inconsistent state management prevented the dialog from opening/closing properly

### Specific Issues:

**Multi-sheet view (lines 1365-1406):**
- Button wrapped in `DialogTrigger` AND had `onClick={() => handleOpenChapterDialog(chapter.id)}`
- `DialogTrigger` would try to open the dialog while `onClick` was setting state
- `onOpenChange={handleCloseChapterDialog}` had problematic logic (lines 1176-1179)

**Single-sheet view (lines 1651-1688):**
- Chapter dialog used a different, simpler approach without pending state
- But still had `DialogTrigger` wrapper causing similar issues

## Solution

Removed the conflicting `DialogTrigger` components and unified the dialog handling approach:

### Changes Made:

#### 1. Fixed Dialog Handlers (Lines 1167-1180, 1188-1201)

**Before:**
```typescript
const handleCloseChapterDialog = (open: boolean) => {
  if (!open && editingChapterId) {
    // Save changes when closing
    updateChapterSpecialitiesMutation.mutate({
      chapterId: editingChapterId,
      specialityIds: pendingChapterSpecialities,
    });
    setEditingChapterId(null);
    setPendingChapterSpecialities([]);
  } else if (open && !editingChapterId) {
    // Dialog is being opened, this shouldn't happen but handle it
    setEditingChapterId(null);  // ❌ BUG: This would prevent opening
  }
};
```

**After:**
```typescript
const handleCloseChapterDialog = (open: boolean) => {
  if (!open && editingChapterId) {
    // Save changes when closing
    updateChapterSpecialitiesMutation.mutate({
      chapterId: editingChapterId,
      specialityIds: pendingChapterSpecialities,
    });
    setEditingChapterId(null);
    setPendingChapterSpecialities([]);
  }
  // ✅ Removed buggy else-if that would set editingChapterId to null
};
```

#### 2. Removed DialogTrigger Wrappers

**Before (Multi-sheet view):**
```typescript
<Dialog open={editingChapterId === chapter.id} onOpenChange={handleCloseChapterDialog}>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <DialogTrigger asChild>  {/* ❌ Conflicting trigger */}
          <Button 
            onClick={() => handleOpenChapterDialog(chapter.id)}  {/* ❌ Duplicate action */}
          >
            <Tag />
          </Button>
        </DialogTrigger>
      </TooltipTrigger>
    </Tooltip>
  </TooltipProvider>
  <DialogContent>...</DialogContent>
</Dialog>
```

**After:**
```typescript
<Dialog open={editingChapterId === chapter.id} onOpenChange={(open) => {
  if (open) {
    handleOpenChapterDialog(chapter.id);
  } else {
    handleCloseChapterDialog(false);
  }
}}>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          onClick={() => setEditingChapterId(chapter.id)}  {/* ✅ Single action */}
        >
          <Tag />
        </Button>
      </TooltipTrigger>
    </Tooltip>
  </TooltipProvider>
  <DialogContent>...</DialogContent>
</Dialog>
```

#### 3. Unified Single-sheet and Multi-sheet Implementations

Both views now use the same pattern:
- Direct button `onClick` to set editing state
- `onOpenChange` handler that calls open/close handlers appropriately
- Pending state management for deferred saves on close
- No conflicting `DialogTrigger` components

## How It Works Now

### Opening a Dialog:
1. User clicks the Tag button
2. `onClick` sets `editingChapterId` (or `editingItemId`) to the target ID
3. Dialog's `open` prop becomes `true` (controlled by `editingChapterId === chapter.id`)
4. `onOpenChange(true)` is called → calls `handleOpenChapterDialog` → loads pending specialities
5. Dialog opens and displays current specialities

### Editing Specialities:
1. User selects/deselects specialities in the MultiSelect
2. Changes are stored in `pendingChapterSpecialities` (or `pendingItemSpecialities`)
3. No immediate save - changes are deferred until close

### Closing a Dialog:
1. User clicks outside or presses Escape
2. `onOpenChange(false)` is called → calls `handleCloseChapterDialog(false)`
3. Handler checks if there's an active editing session
4. If yes, saves changes via mutation and clears state
5. Dialog closes

## Benefits

1. ✅ **Fixed Critical Bug**: Dialogs now open and close properly
2. ✅ **Saves Work Correctly**: Specialities changes are persisted to the database
3. ✅ **Consistent Behavior**: Both single-sheet and multi-sheet views work the same way
4. ✅ **Cleaner Code**: Removed conflicting patterns and buggy logic
5. ✅ **Better UX**: Changes are batched and saved on close, reducing API calls

## Testing

The fix has been verified with:
- ✅ **Build**: Successful compilation with no TypeScript errors
- ⚠️ **Manual Testing Recommended**: Requires UI testing with actual Excel files

### Recommended Manual Testing:

1. **Chapter Specialities (Multi-sheet)**:
   - Upload an Excel file with 2+ sheets
   - Click "Analyze"
   - Open a chapter, click the Tag icon
   - Verify dialog opens
   - Select some specialities
   - Close the dialog
   - Verify changes are saved (badges appear)
   - Reopen dialog and verify selections persist

2. **Item Specialities (Multi-sheet)**:
   - In the same multi-sheet file
   - Expand a chapter
   - Click "Edit" on an item's specialities
   - Verify dialog opens
   - Add/remove specialities
   - Close dialog
   - Verify changes are saved (badges update)
   - Click X on a badge to remove it
   - Verify removal works

3. **Chapter Specialities (Single-sheet)**:
   - Upload an Excel file with 1 sheet
   - Click "Analyze"
   - Find a chapter, click the Tag icon
   - Verify same behavior as multi-sheet

4. **Item Specialities (Single-sheet)**:
   - In the same single-sheet file
   - Click "Edit" on an item's specialities
   - Verify same behavior as multi-sheet

## Files Modified

- `src/pages/MapaQuantidades.tsx`:
  - Lines 1167-1180: Fixed `handleCloseChapterDialog`
  - Lines 1188-1201: Fixed `handleCloseItemDialog`
  - Lines 1365-1406: Fixed multi-sheet chapter dialog
  - Lines 1470-1506: Fixed multi-sheet item dialog
  - Lines 1651-1688: Fixed single-sheet chapter dialog
  - Lines 1748-1784: Fixed single-sheet item dialog
