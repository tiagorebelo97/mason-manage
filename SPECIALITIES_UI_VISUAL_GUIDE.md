# Visual Guide - Specialities UI Changes

## Before vs After Comparison

### 1. Badge Display in Table

#### BEFORE:
```
┌─────────────────────────────────────────────────────────┐
│ Specialities Column                                     │
├─────────────────────────────────────────────────────────┤
│ [Electrical Installation (inherited)] 🏷️               │
│ [Plumbing (inherited)]                                  │
│                                                          │
│ ^ Secondary badges with "(inherited)" label             │
│ ^ Ghost icon button (barely visible)                    │
└─────────────────────────────────────────────────────────┘

OR (for custom specialities):

┌─────────────────────────────────────────────────────────┐
│ [Electrical Installation] 🏷️                            │
│ [HVAC]                                                   │
│                                                          │
│ ^ Default (blue) badges without "(inherited)" label     │
└─────────────────────────────────────────────────────────┘
```

#### AFTER:
```
┌─────────────────────────────────────────────────────────┐
│ Specialities Column                                     │
├─────────────────────────────────────────────────────────┤
│ [Electrical Installation ✕] [Plumbing ✕] [🏷️ Edit]     │
│                                                          │
│ ^ All badges same style (secondary)                     │
│ ^ X button on each badge                                │
│ ^ Clear "Edit" button with outline style               │
└─────────────────────────────────────────────────────────┘
```

### 2. Edit Dialog Behavior

#### BEFORE (Item Inheriting from Chapter):
```
Chapter has: ["Electrical", "Plumbing"]
Item has: [] (inheriting)

When opening Item dialog:
┌─────────────────────────────────────────┐
│ Item Specialities                    ✕  │
├─────────────────────────────────────────┤
│ Select specialities for this item.      │
│ Leave empty to inherit from chapter.    │
│                                          │
│ ┌─────────────────────────────────┐     │
│ │ Select specialities...        ▼│     │
│ └─────────────────────────────────┘     │
│                                          │
│ Dropdown shows:                          │
│ ☐ Electrical    (NOT checked)            │
│ ☐ Plumbing      (NOT checked)            │
│ ☐ HVAC          (NOT checked)            │
└─────────────────────────────────────────┘
```

#### AFTER (Same Scenario):
```
Chapter has: ["Electrical", "Plumbing"]
Item has: [] (inheriting)

When opening Item dialog:
┌─────────────────────────────────────────┐
│ Item Specialities                    ✕  │
├─────────────────────────────────────────┤
│ Select specialities for this item.      │
│                                          │
│ ┌─────────────────────────────────┐     │
│ │ [Electrical ✕] [Plumbing ✕]  ▼│     │
│ └─────────────────────────────────┘     │
│                                          │
│ Dropdown shows:                          │
│ ☑ Electrical    (CHECKED)                │
│ ☑ Plumbing      (CHECKED)                │
│ ☐ HVAC          (NOT checked)            │
└─────────────────────────────────────────┘
```

### 3. Edit Button Design

#### BEFORE:
```
Icon only, ghost style:
┌────┐
│ 🏷️ │  ← Almost invisible, hard to see
└────┘
```

#### AFTER:
```
Outline style with text:
┌──────────┐
│ 🏷️ Edit  │  ← Clear and prominent
└──────────┘
```

## User Interaction Flows

### Flow 1: Remove a Speciality Inline

**BEFORE:**
1. See badge: `[Electrical (inherited)]`
2. Want to remove it
3. Click ghost 🏷️ button → Dialog opens
4. Uncheck "Electrical"
5. Close dialog
6. Badge removed

**AFTER:**
1. See badge: `[Electrical ✕]`
2. Want to remove it
3. Click ✕ on the badge directly
4. Badge removed immediately (no dialog needed)

### Flow 2: Add Multiple Specialities

**BEFORE:**
1. Item inherits: ["Electrical"]
2. Click ghost 🏷️ button → Dialog opens
3. See empty dropdown (nothing selected)
4. Check "Electrical" (have to reselect it!)
5. Check "Plumbing"
6. Check "HVAC"
7. Close dialog

**AFTER:**
1. Item inherits: ["Electrical"]
2. Click "Edit" button → Dialog opens
3. See "Electrical" already checked ✓
4. Just check "Plumbing" and "HVAC"
5. Close dialog

### Flow 3: Understanding What Applies

**BEFORE:**
- Table shows: `[Electrical (inherited)]` vs `[HVAC]`
- Confusing: Why are they different?
- Dialog: Empty vs has selections
- User confused about inheritance

**AFTER:**
- Table shows: `[Electrical ✕]` `[HVAC ✕]`
- Simple: All specialities shown equally
- Dialog: Shows all that apply
- User sees complete picture

## Key Improvements

### 1. Consistency ✓
- **Before:** Different badge styles indicated origin
- **After:** Uniform appearance, simpler to understand

### 2. Efficiency ✓
- **Before:** Always need dialog to remove
- **After:** Click ✕ for quick removal

### 3. Clarity ✓
- **Before:** Dialog didn't show inherited selections
- **After:** Dialog shows everything that applies

### 4. Discoverability ✓
- **Before:** Ghost button hard to find
- **After:** "Edit" button clearly visible

## Technical Implementation Details

### Badge Component Structure

**BEFORE:**
```tsx
<Badge 
  variant={hasOwnSpecs ? "default" : "secondary"}
  className="text-xs"
>
  {specialityName}
  {!hasOwnSpecs && <span>(inherited)</span>}
</Badge>
```

**AFTER:**
```tsx
<Badge 
  variant="secondary"
  className="text-xs flex items-center gap-1"
>
  {specialityName}
  <button onClick={handleRemove}>
    <X className="h-3 w-3" />
  </button>
</Badge>
```

### Dialog Selection Logic

**BEFORE:**
```tsx
// Only item-specific specialities
selected={getItemOwnSpecialityIds(item.id)}
```

**AFTER:**
```tsx
// All specialities (item-specific + inherited)
selected={getItemSpecialityIds(item.id, item.chapter_id)}
```

### Removal Handler

**NEW:**
```tsx
const handleRemoveSpeciality = (specialityId: string) => {
  const currentSpecs = getItemSpecialityIds(item.id, item.chapter_id);
  const updatedSpecs = currentSpecs.filter(id => id !== specialityId);
  updateItemSpecialitiesMutation.mutate({
    itemId: item.id,
    specialityIds: updatedSpecs,
  });
};
```

## Behavior Examples

### Example 1: Inheriting from Chapter
```
Initial State:
  Chapter: ["Electrical", "Plumbing"]
  Item DB: [] (no records)
  
Display:
  Table: [Electrical ✕] [Plumbing ✕] [Edit]
  Dialog: Both checked ✓

User clicks ✕ on "Electrical":
  Chapter: ["Electrical", "Plumbing"] (unchanged)
  Item DB: ["Plumbing"] (new record created)
  
Display:
  Table: [Plumbing ✕] [Edit]
  Dialog: Only Plumbing checked ✓
```

### Example 2: Custom Specialities
```
Initial State:
  Chapter: ["Electrical", "Plumbing"]
  Item DB: ["HVAC", "Masonry"]
  
Display:
  Table: [HVAC ✕] [Masonry ✕] [Edit]
  Dialog: HVAC and Masonry checked ✓

User clicks ✕ on "HVAC":
  Chapter: ["Electrical", "Plumbing"] (unchanged)
  Item DB: ["Masonry"]
  
Display:
  Table: [Masonry ✕] [Edit]
  Dialog: Only Masonry checked ✓
```

### Example 3: Clearing All (Back to Inheritance)
```
Initial State:
  Chapter: ["Electrical"]
  Item DB: ["HVAC", "Masonry"]
  
Display:
  Table: [HVAC ✕] [Masonry ✕] [Edit]

User removes both via ✕ or dialog:
  Chapter: ["Electrical"] (unchanged)
  Item DB: [] (all records deleted)
  
Display:
  Table: [Electrical ✕] [Edit]
  Dialog: Electrical checked ✓ (inherited)
```

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Visual complexity** | Two badge styles, labels | One style, clean |
| **Removal speed** | Must use dialog | Click ✕ directly |
| **Dialog accuracy** | Missing inherited items | Shows all applicable |
| **Button visibility** | Ghost icon (subtle) | Outlined "Edit" (clear) |
| **User confusion** | "Why is it inherited?" | "These are my items" |
| **Edit experience** | Have to reselect inherited | Already selected |

## Migration Notes

- Database schema unchanged
- Still stores chapter vs item specialities separately
- UI presents unified view
- All existing data works with new UI
- No data migration needed
