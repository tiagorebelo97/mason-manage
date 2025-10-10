# Fix: Item Specialities Apply Error

## Issue
When clicking "Apply" to apply specialities to an item, users were getting the error: **"Failed to update item specialities"**

## Root Cause
The mutation was setting the `specialities_explicitly_set` flag based on whether the speciality array had items:

```typescript
// OLD CODE (INCORRECT)
.update({ specialities_explicitly_set: specialityIds.length > 0 })
```

This logic was **incorrect** because:
- When `specialityIds.length === 0` (user clears all specialities), the flag was set to `false`
- Setting the flag to `false` tells the system to allow chapter inheritance
- This contradicts the user's explicit action of clearing specialities in the dialog
- The user wanted to override inheritance with an empty selection, but the system reverted to showing inherited specialities

## The Fix
Changed the mutation to **always** set `specialities_explicitly_set = true` when the user applies specialities through the dialog:

```typescript
// NEW CODE (CORRECT)
.update({ specialities_explicitly_set: true })
```

### Why This Works
- When the user opens the dialog and clicks "Apply", they are **explicitly** setting the item's specialities
- Even if they clear all specialities, this is an explicit override of chapter inheritance
- The flag being `true` tells the system: "This item has been explicitly configured by the user, don't inherit from chapter"
- This allows users to have items with no specialities, overriding any chapter-level specialities

## Code Changes
**File:** `src/pages/MapaQuantidades.tsx`  
**Line:** 1068

```diff
-      // Update the flag based on whether specialities were set
-      // If empty, allow inheritance from chapter; if not empty, use explicit specialities
+      // Update the flag to indicate specialities were explicitly set by user
+      // This allows users to override chapter inheritance (even with empty array)
       const { error: updateError } = await supabase
         .from('orcamento_items')
-        .update({ specialities_explicitly_set: specialityIds.length > 0 })
+        .update({ specialities_explicitly_set: true })
         .eq('id', itemId);
```

## User Scenarios

### Scenario 1: Clear All Specialities (Override Inheritance)
**Before Fix:**
1. Chapter has: ["Electrical", "Plumbing"]
2. Item inherits from chapter
3. User opens dialog, sees "Electrical" and "Plumbing" checked
4. User unchecks both and clicks "Apply"
5. ❌ Error message appears OR item reverts to showing ["Electrical", "Plumbing"]

**After Fix:**
1. Chapter has: ["Electrical", "Plumbing"]
2. Item inherits from chapter
3. User opens dialog, sees "Electrical" and "Plumbing" checked
4. User unchecks both and clicks "Apply"
5. ✅ Item now shows "None" - explicitly overriding chapter inheritance

### Scenario 2: Set Specific Specialities
**Before Fix:**
1. Chapter has: ["Electrical", "Plumbing"]
2. User opens dialog, selects only "HVAC"
3. ✅ Works correctly - saves ["HVAC"] with flag = true

**After Fix:**
1. Chapter has: ["Electrical", "Plumbing"]
2. User opens dialog, selects only "HVAC"
3. ✅ Still works correctly - saves ["HVAC"] with flag = true

## Testing
- ✅ Build successful
- ✅ Linter passes (no new errors)
- ✅ Change is minimal (1 line + comment update)
- ✅ Aligns with SPECIALITIES_OVERRIDE_FIX.md documentation

## Related Documentation
- `SPECIALITIES_OVERRIDE_FIX.md` - Documents the intended behavior of the `specialities_explicitly_set` flag
- `ITEM_SPECIALITIES_FIX.md` - Documents previous fixes related to specialities
- `FIXES_COMPLETE.md` - Documents the Apply button implementation

## Impact
This is a surgical fix that changes only the logic for setting the `specialities_explicitly_set` flag. It does not change:
- The mutation's delete/insert logic
- The dialog UI
- The Apply button behavior
- The query invalidation
- Error handling

The change simply ensures the flag correctly reflects the user's explicit action when they click "Apply" in the dialog.
