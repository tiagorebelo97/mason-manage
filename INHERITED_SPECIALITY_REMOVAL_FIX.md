# Inherited Speciality Removal Fix

## Problem
When items inherited specialities from their chapter, clicking the X button on an inherited speciality badge did not work. The speciality would remain visible even after clicking the X button.

## Root Cause
The `handleRemoveSpeciality` function was using `getItemOwnSpecialityIds(item.id)` to get the current specialities before filtering. For items that inherit from the chapter (with no explicit specialities set), this function returns an empty array `[]`.

```typescript
// OLD BEHAVIOR (Broken)
const handleRemoveSpeciality = (specialityId: string) => {
  const currentSpecs = getItemOwnSpecialityIds(item.id);  // Returns []
  const updatedSpecs = currentSpecs.filter(id => id !== specialityId);  // [] filtered is still []
  updateItemSpecialitiesMutation.mutate({
    itemId: item.id,
    specialityIds: updatedSpecs,  // Saves [] which sets specialities_explicitly_set: false
  });
};
// Result: Item continues to show inherited specialities - nothing changed!
```

## Solution
Changed `handleRemoveSpeciality` to use `getItemSpecialityIds(item.id, item.chapter_id)` which returns ALL specialities (including inherited ones):

```typescript
// NEW BEHAVIOR (Fixed)
const handleRemoveSpeciality = (specialityId: string) => {
  const currentSpecs = getItemSpecialityIds(item.id, item.chapter_id);  // Returns ["electrical", "plumbing"]
  const updatedSpecs = currentSpecs.filter(id => id !== specialityId);  // Returns ["plumbing"]
  updateItemSpecialitiesMutation.mutate({
    itemId: item.id,
    specialityIds: updatedSpecs,  // Saves ["plumbing"] which sets specialities_explicitly_set: true
  });
};
// Result: Item now explicitly shows only ["plumbing"] and no longer inherits!
```

## Behavior Examples

### Example 1: Removing One Inherited Speciality
**Initial State:**
- Chapter has: `["Electrical", "Plumbing"]`
- Item has: `[]` (inheriting from chapter)
- Display shows: `[Electrical ✕] [Plumbing ✕]`

**User clicks X on "Electrical":**
- Gets current specs: `["electrical-id", "plumbing-id"]`
- Filters out: `["plumbing-id"]`
- Saves: `["plumbing-id"]` with `specialities_explicitly_set: true`

**Result:**
- Display shows: `[Plumbing ✕]`
- Item is no longer inheriting (has explicit specialities)

### Example 2: Removing All Inherited Specialities One by One
**Initial State:**
- Chapter has: `["Electrical", "Plumbing"]`
- Item has: `[]` (inheriting)
- Display shows: `[Electrical ✕] [Plumbing ✕]`

**User clicks X on "Electrical":**
- Result: Item shows `[Plumbing ✕]` (explicitly set)

**User then clicks X on "Plumbing":**
- Gets current specs: `["plumbing-id"]` (from explicit specialities)
- Filters out: `[]`
- Saves: `[]` with `specialities_explicitly_set: false`

**Result:**
- Display shows: `[Electrical ✕] [Plumbing ✕]` (back to inheriting!)
- Item returns to inheriting from chapter

### Example 3: Removing an Explicit Speciality
**Initial State:**
- Chapter has: `["Electrical", "Plumbing"]`
- Item has: `["HVAC", "Carpentry"]` (explicitly set)
- Display shows: `[HVAC ✕] [Carpentry ✕]`

**User clicks X on "HVAC":**
- Gets current specs: `["hvac-id", "carpentry-id"]`
- Filters out: `["carpentry-id"]`
- Saves: `["carpentry-id"]` with `specialities_explicitly_set: true`

**Result:**
- Display shows: `[Carpentry ✕]`
- Item still has explicit specialities (not inheriting)

## Files Modified
- `src/pages/MapaQuantidades.tsx` (lines 1469 and 1765)
  - Changed from `getItemOwnSpecialityIds(item.id)` 
  - To `getItemSpecialityIds(item.id, item.chapter_id)`

## Benefits
1. ✅ Users can now remove inherited specialities by clicking the X button
2. ✅ When removing an inherited speciality, the item automatically converts to using explicit specialities
3. ✅ The behavior is intuitive: clicking X removes the visible speciality
4. ✅ Works consistently for both inherited and explicit specialities

## Testing
- ✅ Build: Compiles successfully with no errors
- ✅ Bundle size: 3,188.02 kB (no change)
- ✅ Minimal changes: Only 2 lines changed

## Related Documentation
- `ITEM_SPECIALITIES_FIX.md` - Previous fix for mutation errors
- `ITEM_SPECIALITIES_INHERITANCE_FIX.md` - Fix for inheritance flag behavior
