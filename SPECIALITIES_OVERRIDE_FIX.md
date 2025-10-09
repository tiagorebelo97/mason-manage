# Migration Guide for Specialities Override Fix

## Issue
Users were unable to clear all specialities from an item when those specialities were inherited from the chapter. After clearing, the system would revert to showing the chapter's default specialities.

## Solution
Added a `specialities_explicitly_set` boolean flag to the `orcamento_items` table to track when a user has explicitly configured an item's specialities (even if configured to have none).

## Database Migration

Run the migration file `migration_specialities_override.sql` in your Supabase SQL editor:

```sql
-- Migration to add explicit override flag for item specialities
-- This allows items to explicitly have NO specialities, overriding chapter inheritance

-- Add column to track if item specialities have been explicitly set
ALTER TABLE orcamento_items 
ADD COLUMN IF NOT EXISTS specialities_explicitly_set BOOLEAN DEFAULT FALSE;

-- Add comment to clarify purpose
COMMENT ON COLUMN orcamento_items.specialities_explicitly_set IS 'TRUE if user has explicitly set specialities for this item (even if empty), FALSE if inheriting from chapter';
```

## How It Works

### Before Fix
1. Chapter has specialities: ["Electrical", "Plumbing"]
2. Item has no explicit specialities → inherits from chapter
3. User opens dialog → sees "Electrical" and "Plumbing" checked
4. User unchecks both and saves → system saves empty array
5. **Problem:** Item reverts to showing ["Electrical", "Plumbing"] (inherited)

### After Fix
1. Chapter has specialities: ["Electrical", "Plumbing"]
2. Item has no explicit specialities → inherits from chapter
3. User opens dialog → sees "Electrical" and "Plumbing" checked
4. User unchecks both and saves → system saves empty array AND sets `specialities_explicitly_set = TRUE`
5. **Fixed:** Item shows no specialities (empty override)

## Code Changes

### 1. Type Definition
Added `specialities_explicitly_set?: boolean` to `OrcamentoItem` type.

### 2. Helper Function Update
Modified `getItemSpecialityIds` to check the flag:
- If item has speciality rows → return them
- If `specialities_explicitly_set = TRUE` → return empty array (don't inherit)
- If `specialities_explicitly_set = FALSE/NULL` → inherit from chapter

### 3. Mutation Update
Modified `updateItemSpecialitiesMutation` to:
- Set `specialities_explicitly_set = TRUE` whenever specialities are saved
- Invalidate both `item_specialities` and `orcamento_items` query caches

## Testing

### Test Case 1: Clear inherited specialities via dialog
1. Set chapter specialities to ["Electrical", "Plumbing"]
2. Open item dialog (should show both checked)
3. Uncheck both and close
4. Verify item shows "None" instead of inherited specialities

### Test Case 2: Remove inherited specialities one by one
1. Set chapter specialities to ["Electrical", "Plumbing"]
2. Click X on "Electrical" badge
3. Verify only "Plumbing" remains
4. Click X on "Plumbing" badge
5. Verify item shows "None" instead of reverting to chapter specialities

### Test Case 3: New items still inherit
1. Set chapter specialities to ["HVAC", "Fire Safety"]
2. Create new item (don't touch specialities)
3. Verify item automatically shows ["HVAC", "Fire Safety"]

## No Breaking Changes
- Existing items with no explicit specialities will continue to inherit from chapter (flag defaults to FALSE)
- Only items where user explicitly sets specialities (including clearing all) will have the flag set to TRUE
- The flag is only set when user actively saves changes through the dialog or removes badges
