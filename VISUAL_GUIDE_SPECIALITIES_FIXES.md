# Visual Guide: Specialities Display Changes

## Summary of Changes

This guide shows the before and after of the specialities feature fixes for items.

## Change 1: Display Specialities as Tags

### Before
Items showed only a count button indicating how many specialities:

```
┌──────────────────────────────────────────────────┐
│ Artigo │ Description │ ... │ Specialities        │
├────────┼─────────────┼─────┼─────────────────────┤
│ 1.1    │ Item A      │ ... │ [🏷️ 2 (inherited)] │
│ 1.2    │ Item B      │ ... │ [🏷️ 3]             │
│ 1.3    │ Item C      │ ... │ [🏷️ None]          │
└──────────────────────────────────────────────────┘
```

**Problem**: Users couldn't see which specialities were assigned without clicking the button.

### After
Items now show individual badges for each speciality:

```
┌───────────────────────────────────────────────────────────────┐
│ Artigo │ Description │ ... │ Specialities                     │
├────────┼─────────────┼─────┼──────────────────────────────────┤
│ 1.1    │ Item A      │ ... │ [Electrical (inherited)]        │
│        │             │     │ [Plumbing (inherited)] 🏷️       │
│ 1.2    │ Item B      │ ... │ [Electrical] [HVAC]             │
│        │             │     │ [Fire Safety] 🏷️                │
│ 1.3    │ Item C      │ ... │ None 🏷️                         │
└───────────────────────────────────────────────────────────────┘
```

**Benefits**: 
- Immediate visibility of which specialities are assigned
- Clear visual distinction between inherited (secondary style) and custom (default style)
- "(inherited)" label on inherited badges
- Small edit button (🏷️) still available for managing specialities

## Change 2: Fixed Selection Bug in Dialog

### Before - The Bug

**Step 1**: User sets specialities at chapter level
```
Chapter 1: Electrical, Plumbing
  ↓ (items inherit)
Item 1.1: Shows [Electrical (inherited)] [Plumbing (inherited)]
```

**Step 2**: User opens item dialog to edit
```
┌─────────────────────────────────────┐
│ Item Specialities              ×    │
├─────────────────────────────────────┤
│ Select specialities for this item.  │
│ Leave empty to inherit from chapter.│
├─────────────────────────────────────┤
│                                     │
│ Selected: [Electrical ×]            │
│           [Plumbing ×]              │ ← Inherited values appear selected!
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Select specialities...      ⌄   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Step 3**: User tries to clear all (to keep inheritance)
- User clicks × on Electrical badge
- User clicks × on Plumbing badge
- Badges immediately reappear! ❌

**Problem**: Impossible to clear the dialog because inherited values keep reappearing.

### After - The Fix

**Step 1**: User sets specialities at chapter level (same as before)
```
Chapter 1: Electrical, Plumbing
  ↓ (items inherit)
Item 1.1: Shows [Electrical (inherited)] [Plumbing (inherited)]
```

**Step 2**: User opens item dialog to edit
```
┌─────────────────────────────────────┐
│ Item Specialities              ×    │
├─────────────────────────────────────┤
│ Select specialities for this item.  │
│ Leave empty to inherit from chapter.│
├─────────────────────────────────────┤
│                                     │
│ Selected: (none)                    │ ← Empty! Showing inheritance state
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Select specialities...      ⌄   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Step 3**: User can now:
- Leave empty → Item continues to inherit ✓
- Add custom specialities → Item overrides chapter ✓
- Clear custom specialities → Item returns to inherit ✓

## Behavior Comparison Table

| Scenario | Before | After |
|----------|--------|-------|
| Item inherits from chapter | Dialog shows inherited values as SELECTED | Dialog shows EMPTY (inheritance state) |
| User clears all in dialog | Inherited values reappear immediately | Dialog stays empty, inheritance continues |
| Item has custom specialities | Dialog shows custom values (correct) | Dialog shows custom values (same) |
| User adds custom speciality | Works correctly | Works correctly |
| User removes last custom speciality | Returns to inherit (but confusing) | Clearly returns to inherit ✓ |

## Technical Implementation

### Key Changes

1. **New Helper Function**: `getItemOwnSpecialityIds(itemId)`
   - Returns ONLY item-specific specialities (no inheritance)
   - Used in the dialog's `selected` prop
   - Allows proper distinction between inherited and custom states

2. **Existing Function Updated**: `getItemSpecialityIds(itemId, chapterId)`
   - Still returns item OR inherited specialities
   - Used for DISPLAY purposes only (showing badges)
   - Not used in dialog anymore

3. **New Helper Function**: `getSpecialitiesByIds(ids)`
   - Converts speciality IDs to full objects
   - Used for rendering badge labels
   - Supports multi-language display

### Badge Styling

```tsx
// Inherited badge (secondary variant)
<Badge variant="secondary" className="text-xs">
  Electrical Installation 
  <span className="ml-1 opacity-60">(inherited)</span>
</Badge>

// Custom badge (default variant)
<Badge variant="default" className="text-xs">
  Electrical Installation
</Badge>
```

## Example Workflows

### Workflow 1: Using Chapter Inheritance (Default)

1. Set specialities on Chapter 1: "Electrical", "Plumbing"
2. All items in Chapter 1 automatically show:
   - `[Electrical (inherited)]` `[Plumbing (inherited)]` 🏷️
3. Click 🏷️ on any item → Dialog is empty (inheriting)
4. Close dialog → Item still shows inherited badges ✓

### Workflow 2: Custom Item Specialities

1. Chapter has "Electrical", "Plumbing"
2. Click 🏷️ on Item 1.3 → Dialog is empty
3. Add "HVAC" and "Fire Safety" → Click away
4. Item 1.3 now shows:
   - `[HVAC]` `[Fire Safety]` 🏷️
   - (No inherited badges, custom overrides chapter)

### Workflow 3: Removing Custom Specialities

1. Item has custom specialities: `[HVAC]` `[Fire Safety]` 🏷️
2. Click 🏷️ → Dialog shows HVAC and Fire Safety selected
3. Remove both → Dialog becomes empty
4. Close dialog → Item reverts to inherited:
   - `[Electrical (inherited)]` `[Plumbing (inherited)]` 🏷️

## Benefits Summary

✅ **Immediate Visibility**: See speciality names without clicking  
✅ **Clear Indication**: Visual distinction between inherited and custom  
✅ **Fixed Bug**: Can now properly clear and return to inheritance  
✅ **Intuitive UX**: Dialog reflects what can be edited  
✅ **Consistent**: Behavior matches documentation and expectations  

## Files Changed

- `src/pages/MapaQuantidades.tsx` (69 lines changed, 39 removed, 108 total delta)
- Added: `SPECIALITIES_FIXES_DOCUMENTATION.md` (detailed technical documentation)
- Added: `VISUAL_GUIDE_SPECIALITIES_FIXES.md` (this file)
