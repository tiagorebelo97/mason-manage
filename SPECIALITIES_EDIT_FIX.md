# Specialities Edit Dialog Fix

## Problem
Users were unable to create or drop specialities in each item due to the dialog closing prematurely when making changes. The issue occurred in both chapter and item specialities dialogs.

## Root Cause
The mutation was being triggered on every `onChange` event from the MultiSelect component. This meant:
1. User clicks a speciality → mutation fires immediately
2. Mutation completes → queries are invalidated
3. Component re-renders → dialog state could be affected
4. Multiple rapid changes caused race conditions and unexpected behavior

## Solution
Implemented a deferred save pattern using local state:

### Changes Made

1. **Added Local State**
   - `pendingChapterSpecialities`: Tracks temporary chapter speciality selections
   - `pendingItemSpecialities`: Tracks temporary item speciality selections

2. **Added Dialog Handlers**
   - `handleOpenChapterDialog()`: Initializes pending state when opening chapter dialog
   - `handleCloseChapterDialog()`: Saves changes when closing chapter dialog
   - `handleOpenItemDialog()`: Initializes pending state when opening item dialog
   - `handleCloseItemDialog()`: Saves changes when closing item dialog

3. **Updated Dialog Components**
   - Changed MultiSelect `selected` prop to use pending state when dialog is open
   - Changed MultiSelect `onChange` to update pending state instead of calling mutation
   - Changed dialog `onOpenChange` to use new handler functions
   - Added explicit `onClick` handlers to DialogTrigger buttons

### User Flow (After Fix)
1. User clicks "Edit" button → Dialog opens
2. Dialog loads current specialities into pending state
3. User adds/removes specialities → Updates pending state only
4. User can make multiple changes without interruption
5. User closes dialog → Changes are saved to database
6. Toast notification confirms successful save

## Benefits
- Dialog stays open during editing
- Users can make multiple changes before saving
- No race conditions from rapid changes
- Cleaner UX with single save operation
- Maintains existing UI/UX patterns (no save button needed)

## Files Modified
- `src/pages/MapaQuantidades.tsx` - Main component with specialities dialogs

## Testing
Build completed successfully with no TypeScript errors related to this fix.

## Impact
This fix applies to:
- Chapter specialities dialogs
- Item specialities dialogs (both in non-tabbed and tabbed views)
