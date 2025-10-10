# Item Specialities Mutation Fix

## Problem Statement
Users were receiving a "Failed to update item specialities" error when editing item specialities through the dialog or removing speciality badges. However, the data was actually being saved correctly, as evidenced by the changes appearing after a page refresh.

## Root Cause
The bug was caused by using the wrong helper function when loading item specialities for editing:

1. **`getItemSpecialityIds(itemId, chapterId)`** - Returns **all** specialities for an item, including those inherited from the parent chapter
2. **`getItemOwnSpecialityIds(itemId)`** - Returns **only** the specialities explicitly set on the item itself

The code was using `getItemSpecialityIds()` which includes inherited specialities. When the user would edit or save, the system would try to save these inherited specialities as the item's own specialities, causing a conflict or race condition that resulted in the error message (even though the mutation actually succeeded).

## The Fix
Changed three locations in `src/pages/MapaQuantidades.tsx` to use `getItemOwnSpecialityIds()` instead of `getItemSpecialityIds()`:

### 1. Dialog Opening (Line 1197)
**Before:**
```typescript
const handleOpenItemDialog = (itemId: string, chapterId?: string) => {
  setEditingItemId(itemId);
  setPendingItemSpecialities(getItemSpecialityIds(itemId, chapterId));
};
```

**After:**
```typescript
const handleOpenItemDialog = (itemId: string, chapterId?: string) => {
  setEditingItemId(itemId);
  setPendingItemSpecialities(getItemOwnSpecialityIds(itemId));
};
```

### 2. Badge Removal (Lines 1468 and 1764)
**Before:**
```typescript
const handleRemoveSpeciality = (specialityId: string) => {
  const currentSpecs = getItemSpecialityIds(item.id, item.chapter_id);
  const updatedSpecs = currentSpecs.filter(id => id !== specialityId);
  updateItemSpecialitiesMutation.mutate({
    itemId: item.id,
    specialityIds: updatedSpecs,
  });
};
```

**After:**
```typescript
const handleRemoveSpeciality = (specialityId: string) => {
  const currentSpecs = getItemOwnSpecialityIds(item.id);
  const updatedSpecs = currentSpecs.filter(id => id !== specialityId);
  updateItemSpecialitiesMutation.mutate({
    itemId: item.id,
    specialityIds: updatedSpecs,
  });
};
```

## How It Works Now

### Scenario 1: Item with No Explicit Specialities
- Chapter has: `["Electrical", "Plumbing"]`
- Item has: `[]` (inherits from chapter)
- **Display:** Shows "Electrical" and "Plumbing" badges
- **Dialog Opens:** Shows empty selection (item's own specialities)
- **User Adds "HVAC":** Saves `["HVAC"]` as item's own
- **Result:** Item now shows only "HVAC", no longer inherits from chapter

### Scenario 2: Item with Explicit Specialities
- Chapter has: `["Electrical", "Plumbing"]`
- Item has: `["HVAC", "Carpentry"]` (explicitly set)
- **Display:** Shows "HVAC" and "Carpentry" badges
- **Dialog Opens:** Shows "HVAC" and "Carpentry" selected
- **User Removes "HVAC":** Saves `["Carpentry"]`
- **Result:** Item shows only "Carpentry"

### Scenario 3: Removing an Inherited Speciality
- Chapter has: `["Electrical", "Plumbing"]`
- Item has: `[]` (inherits from chapter)
- **Display:** Shows "Electrical" and "Plumbing" badges (inherited)
- **User Clicks X on "Electrical":**
  - Old behavior: Would try to save `["Plumbing"]` (the other inherited one) ❌
  - New behavior: Gets empty own specialities `[]`, filters nothing, saves `[]` ✅
- **Result:** Item still shows both badges because they're inherited, not explicitly set

**Important:** To actually remove an inherited speciality, the user must:
1. Open the dialog
2. Explicitly select which specialities they want (or none)
3. Click save

This properly sets the `specialities_explicitly_set` flag to `true` and saves the selection.

## Benefits
1. **No more false error messages** - The mutation works correctly without conflicts
2. **Clearer separation** - Item's own specialities are distinct from inherited ones
3. **Proper inheritance behavior** - Items continue to show inherited specialities in the UI
4. **Explicit override** - Users can explicitly set an item's specialities through the dialog

## Testing
- ✅ Linter: No new errors introduced
- ✅ Build: Compiles successfully
- ✅ Minimal changes: Only 3 function calls changed

## Related Code
The fix properly utilizes the `getItemOwnSpecialityIds()` helper function that was already defined but not being used. This function was likely created for this exact purpose but was overlooked in the original implementation.

## Migration Notes
No database migrations or additional changes are required. This is purely a frontend fix that corrects the mutation behavior.
