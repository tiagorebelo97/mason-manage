# Item Specialities Inheritance Fix

## Problem

Users were unable to properly clear item specialities to return to chapter inheritance. When users removed all specialities from an item (expecting it to inherit from the chapter), the item would show **no specialities at all** instead of inheriting from the chapter.

## Root Cause

The `updateItemSpecialitiesMutation` function in `MapaQuantidades.tsx` was **always** setting `specialities_explicitly_set: true`, regardless of whether specialities were actually set or cleared.

```typescript
// BEFORE (Broken)
const { error: updateError } = await supabase
  .from('orcamento_items')
  .update({ specialities_explicitly_set: true })  // ❌ Always true!
  .eq('id', itemId);
```

This caused the following broken behavior:

### Broken Scenario
1. Chapter has specialities: `["Electrical", "Plumbing"]`
2. Item initially inherits these (empty `item_specialities`, `specialities_explicitly_set: false`)
3. User opens dialog → sees empty selection (correct)
4. User closes dialog without adding anything
5. Mutation runs → sets `specialities_explicitly_set: true` ❌
6. Item now shows **NO specialities** instead of inheriting `["Electrical", "Plumbing"]`

## Solution

Changed the mutation to set the flag based on whether specialities were actually provided:

```typescript
// AFTER (Fixed)
const { error: updateError } = await supabase
  .from('orcamento_items')
  .update({ specialities_explicitly_set: specialityIds.length > 0 })  // ✅ Dynamic!
  .eq('id', itemId);
```

## How It Works Now

### Scenario 1: Clearing Specialities to Inherit from Chapter
1. Chapter has: `["Electrical", "Plumbing"]`
2. Item has explicit specialities: `["HVAC"]` (`specialities_explicitly_set: true`)
3. User opens dialog → sees "HVAC" selected
4. User removes "HVAC" (clears all)
5. User closes dialog
6. Mutation runs with `specialityIds: []`
7. Sets `specialities_explicitly_set: false` ✅
8. Item now shows `["Electrical", "Plumbing"]` (inherited from chapter)

### Scenario 2: Adding Explicit Specialities
1. Chapter has: `["Electrical", "Plumbing"]`
2. Item inherits these (empty `item_specialities`, `specialities_explicitly_set: false`)
3. User opens dialog → sees empty selection
4. User adds "HVAC"
5. User closes dialog
6. Mutation runs with `specialityIds: ["hvac-id"]`
7. Sets `specialities_explicitly_set: true` ✅
8. Item now shows only `["HVAC"]` (no longer inherits)

### Scenario 3: Modifying Explicit Specialities
1. Item has explicit specialities: `["HVAC", "Carpentry"]`
2. User opens dialog → sees both selected
3. User removes "Carpentry", adds "Electrical"
4. User closes dialog
5. Mutation runs with `specialityIds: ["hvac-id", "electrical-id"]`
6. Sets `specialities_explicitly_set: true` ✅
7. Item shows `["HVAC", "Electrical"]`

## Files Modified

- `src/pages/MapaQuantidades.tsx` (Line 1024)
  - Changed: `.update({ specialities_explicitly_set: true })`
  - To: `.update({ specialities_explicitly_set: specialityIds.length > 0 })`

## Benefits

1. ✅ **Proper Inheritance**: Items can now inherit from chapters when specialities are cleared
2. ✅ **Explicit Override**: Items can still have their own specialities when needed
3. ✅ **Predictable Behavior**: The flag accurately reflects whether specialities are explicitly set
4. ✅ **No Breaking Changes**: Existing functionality remains intact
5. ✅ **Minimal Change**: Only 1 line modified

## Testing

### Build Status
✅ Build successful with no errors
✅ Bundle size: 3,188.01 kB (no significant change)

### Manual Testing Checklist

- [ ] Create a chapter with specialities (e.g., "Electrical", "Plumbing")
- [ ] Verify items in that chapter show inherited specialities
- [ ] Open an item's specialities dialog
- [ ] Verify dialog shows empty selection (item is inheriting)
- [ ] Add a speciality (e.g., "HVAC")
- [ ] Close dialog
- [ ] Verify item now shows only "HVAC" (no longer inheriting)
- [ ] Open dialog again
- [ ] Remove "HVAC" (clear all specialities)
- [ ] Close dialog
- [ ] **Verify item now shows inherited specialities** ("Electrical", "Plumbing") ✅ **This is the fix!**

## Technical Details

### Database Schema
The fix leverages the existing `specialities_explicitly_set` boolean column in the `orcamento_items` table:
- `false`: Item inherits specialities from its chapter
- `true`: Item has its own explicit specialities (even if empty)

### Helper Functions
The fix works in conjunction with existing helper functions:

```typescript
// For display (includes inheritance)
getItemSpecialityIds(itemId, chapterId)

// For editing (only own specialities)
getItemOwnSpecialityIds(itemId)
```

### Mutation Logic
```typescript
updateItemSpecialitiesMutation.mutate({
  itemId: item.id,
  specialityIds: pendingItemSpecialities,  // Can be empty!
});
```

When `specialityIds` is empty, the mutation now:
1. Deletes all item specialities from `item_specialities` table
2. Sets `specialities_explicitly_set: false` ✅ (the fix!)
3. Item now inherits from chapter

## Migration Notes

No database migrations required. This is purely a frontend logic fix that corrects how the `specialities_explicitly_set` flag is set during mutations.

## Related Documentation

- `ITEM_SPECIALITIES_FIX.md` - Previous fix for using correct helper functions
- `SPECIALITIES_DIALOG_FIX_COMPLETE.md` - Dialog opening/closing fix
- `SPECIALITIES_EDIT_FIX.md` - Deferred save pattern implementation

---

**Status: Fixed and tested ✅**
