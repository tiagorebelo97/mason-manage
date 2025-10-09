# Specialities Display and Selection Fixes

## Overview
This document describes the fixes applied to the specialities feature for items in the MapaQuantidades page.

## Issues Fixed

### Issue 1: Display Specialities as Tags
**Problem**: Items were showing only a count button (e.g., "2 (inherited)") instead of displaying the actual speciality names as tags.

**Solution**: Updated the UI to display each speciality as an individual badge with its name, making it easier to see which specialities are assigned to each item at a glance.

**Changes Made**:
1. Added `Badge` component import
2. Created helper function `getSpecialitiesByIds(ids: string[]): Speciality[]` to retrieve full speciality objects by their IDs
3. Updated the `TableCell` for specialities column to render individual badges for each speciality
4. Badges show different visual styles:
   - **Default variant** (more prominent): Custom item specialities
   - **Secondary variant** (muted): Inherited specialities from chapter
   - **"(inherited)" label**: Added to inherited badges for clarity
5. Kept the small Tag icon button for opening the edit dialog

### Issue 2: Selection Bug - Inherited Specialities Reappearing
**Problem**: When selecting specialities at the chapter level, items would inherit them. When opening the item dialog to edit, the inherited specialities would appear as selected. When trying to clear them (to keep the item inheriting), they would immediately reappear as selected, making it impossible to return to the inherited state.

**Root Cause**: The `getItemSpecialityIds` function was being used both for display (showing inherited values) and for editing (setting the selected values in the dialog). This caused inherited values to appear as selected in the dialog, and when cleared, they would immediately reappear since the function always returns inherited values when no item-specific values exist.

**Solution**: Separated the concerns by creating a new helper function specifically for editing that only returns item-specific specialities (no inheritance).

**Changes Made**:
1. Renamed the comment for `getItemSpecialityIds` to clarify it's for "display with inheritance"
2. Created new helper function `getItemOwnSpecialityIds(itemId: string): string[]` that:
   - Only returns specialities that are specifically assigned to the item
   - Does NOT include inherited specialities from the chapter
   - Returns empty array if no item-specific specialities exist
3. Updated the `MultiSelect` component in the item dialog to use `getItemOwnSpecialityIds` instead of `getItemSpecialityIds`
4. This allows the dialog to show:
   - Empty selection when item is inheriting from chapter
   - Only custom selections when item has its own specialities
   - Users can now clear all to return to inheritance mode

## Technical Details

### Helper Functions

```typescript
// Get specialities for an item (with inheritance for display)
const getItemSpecialityIds = (itemId: string, chapterId?: string): string[] => {
  // Returns item-specific specialities OR inherited chapter specialities
  // Used for DISPLAY purposes (showing what specialities apply to the item)
}

// Get only item-specific specialities (no inheritance) for editing
const getItemOwnSpecialityIds = (itemId: string): string[] => {
  // Returns ONLY item-specific specialities, never inherited ones
  // Used for EDITING purposes (showing what's selected in the dialog)
}

// Get speciality objects for display
const getSpecialitiesByIds = (ids: string[]): Speciality[] => {
  // Converts speciality IDs to full Speciality objects
  // Used for rendering badge labels
}
```

### UI Changes

#### Before:
```tsx
<TableCell>
  <Button variant="outline" size="sm" className="h-8 gap-2">
    <Tag className="h-3 w-3" />
    <span className="text-xs">2 (inherited)</span>
  </Button>
</TableCell>
```

#### After:
```tsx
<TableCell>
  <div className="flex flex-wrap gap-1 items-center">
    <Badge variant="secondary" className="text-xs">
      Electrical Installation <span className="ml-1 opacity-60">(inherited)</span>
    </Badge>
    <Badge variant="secondary" className="text-xs">
      Plumbing <span className="ml-1 opacity-60">(inherited)</span>
    </Badge>
    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
      <Tag className="h-3 w-3" />
    </Button>
  </div>
</TableCell>
```

### Dialog Selection Behavior

#### Before:
- Item inherits chapter specialities → Dialog shows inherited values as SELECTED
- User clears all → Specialities immediately reappear as selected
- Impossible to distinguish between custom and inherited in the dialog

#### After:
- Item inherits chapter specialities → Dialog shows EMPTY selection
- User clears all → Dialog stays EMPTY (inheritance continues)
- User adds custom specialities → Dialog shows ONLY custom selections
- Clear distinction between inherited and custom states

## Benefits

1. **Better Visibility**: Users can now see the actual speciality names at a glance without opening dialogs
2. **Clear Visual Distinction**: Different badge styles clearly indicate inherited vs. custom specialities
3. **Intuitive Editing**: The dialog now properly reflects what can be edited (only custom selections)
4. **Fixed Bug**: Users can now properly clear item specialities to return to inherited state
5. **Consistent UX**: The inheritance system works as documented and expected

## Testing Recommendations

1. **Test Inheritance**:
   - Set specialities on a chapter
   - Verify items show them as inherited badges with "(inherited)" label
   - Open item dialog and verify selection is empty
   - Close dialog and verify badges still show inherited values

2. **Test Custom Specialities**:
   - Add custom specialities to an item
   - Verify badges change to default variant (no "(inherited)" label)
   - Open item dialog and verify only custom specialities are selected
   - Add/remove specialities and verify changes persist

3. **Test Clearing**:
   - Item with custom specialities
   - Open dialog and clear all selections
   - Verify dialog selection becomes empty
   - Close dialog and verify item now shows inherited badges again

4. **Test Multiple Languages**:
   - Switch between Portuguese and English
   - Verify badge labels update to correct language
   - Verify dialog shows correct language

## Related Files

- `src/pages/MapaQuantidades.tsx`: Main implementation
- `src/components/ui/badge.tsx`: Badge component for displaying tags
- `src/components/ui/multi-select.tsx`: Multi-select dropdown component
