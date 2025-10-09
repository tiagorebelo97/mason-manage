# Visual Guide - Specialities Edit Fix

## Problem Visualization

### Before Fix (Broken Flow)
```
User clicks "Edit"
    ↓
Dialog Opens
    ↓
User clicks speciality A ──→ onChange event ──→ Mutation fires ──→ DB save
    ↓                                              ↓
Dialog might close/glitch                    Query invalidation
    ↓                                              ↓
User confused 😕                          Component re-renders
```

### After Fix (Working Flow)
```
User clicks "Edit"
    ↓
Dialog Opens ──→ Load current specialities into pending state
    ↓
User clicks speciality A ──→ onChange event ──→ Update pending state
    ↓
User clicks speciality B ──→ onChange event ──→ Update pending state
    ↓
User clicks speciality C ──→ onChange event ──→ Update pending state
    ↓
Dialog stays open ✓
    ↓
User closes dialog ──→ onOpenChange(false) ──→ Mutation fires ──→ DB save
    ↓                                              ↓
Toast: "Success!" 🎉                        Query invalidation
    ↓                                              ↓
Dialog closed                              UI updates with new data
```

## State Management Diagram

### Component State Flow
```
┌─────────────────────────────────────────────────────────────┐
│ MapaQuantidades Component                                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  State Variables:                                            │
│  ┌───────────────────────────────────────┐                  │
│  │ editingChapterId: string | null       │                  │
│  │ editingItemId: string | null          │                  │
│  │ pendingChapterSpecialities: string[]  │ ← Local state   │
│  │ pendingItemSpecialities: string[]     │   (not in DB)   │
│  └───────────────────────────────────────┘                  │
│                                                               │
│  Dialog Flow:                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. User clicks "Edit" button                        │   │
│  │    ↓                                                 │   │
│  │ 2. handleOpenItemDialog(itemId, chapterId)         │   │
│  │    • Sets editingItemId = itemId                   │   │
│  │    • Sets pendingItemSpecialities = current specs  │   │
│  │    ↓                                                 │   │
│  │ 3. Dialog renders with pending state                │   │
│  │    ↓                                                 │   │
│  │ 4. User modifies selections                          │   │
│  │    • onChange updates pendingItemSpecialities      │   │
│  │    • Dialog stays open                              │   │
│  │    ↓                                                 │   │
│  │ 5. User closes dialog                                │   │
│  │    ↓                                                 │   │
│  │ 6. handleCloseItemDialog(false)                     │   │
│  │    • Calls mutation with pending state             │   │
│  │    • Saves to database                              │   │
│  │    • Clears editingItemId                           │   │
│  │    • Clears pendingItemSpecialities                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Code Comparison

### Before (Immediate Save)
```tsx
<Dialog open={editingItemId === item.id} 
        onOpenChange={(open) => setEditingItemId(open ? item.id : null)}>
  <DialogTrigger asChild>
    <Button>Edit</Button>
  </DialogTrigger>
  <DialogContent>
    <MultiSelect
      selected={getItemSpecialityIds(item.id, item.chapter_id)}
      onChange={(selected) => {
        // ❌ PROBLEM: Saves immediately on every change!
        updateItemSpecialitiesMutation.mutate({
          itemId: item.id,
          specialityIds: selected,
        });
      }}
    />
  </DialogContent>
</Dialog>
```

### After (Deferred Save)
```tsx
<Dialog open={editingItemId === item.id} 
        onOpenChange={handleCloseItemDialog}>
  <DialogTrigger asChild>
    <Button onClick={() => handleOpenItemDialog(item.id, item.chapter_id)}>
      Edit
    </Button>
  </DialogTrigger>
  <DialogContent>
    <MultiSelect
      selected={editingItemId === item.id 
        ? pendingItemSpecialities  // ✓ Uses pending state
        : getItemSpecialityIds(item.id, item.chapter_id)}
      onChange={(selected) => {
        // ✓ SOLUTION: Only updates local state
        if (editingItemId === item.id) {
          setPendingItemSpecialities(selected);
        }
      }}
    />
  </DialogContent>
</Dialog>
```

## User Experience Flow

### Scenario: Adding Multiple Specialities

#### Before (Broken) ❌
```
Step 1: Click "Edit" button
        [Dialog opens]

Step 2: Click "Electrical" speciality
        ⚠️  Mutation fires → Database save → Query invalidation
        💥 Dialog closes or behaves unexpectedly

Step 3: User reopens dialog
        Click "Plumbing" speciality
        ⚠️  Mutation fires → Database save → Query invalidation
        💥 Dialog closes again

Result: Frustrated user, multiple database calls, poor UX
```

#### After (Fixed) ✅
```
Step 1: Click "Edit" button
        [Dialog opens]
        [Current specialities: "Electrical" (inherited)]

Step 2: Click "Plumbing" to add it
        ✓ Local state updated: ["Electrical", "Plumbing"]
        ✓ Dialog stays open

Step 3: Click "HVAC" to add it
        ✓ Local state updated: ["Electrical", "Plumbing", "HVAC"]
        ✓ Dialog stays open

Step 4: Click "Electrical" to remove it
        ✓ Local state updated: ["Plumbing", "HVAC"]
        ✓ Dialog stays open

Step 5: Close dialog
        ✓ Mutation fires once with final selection
        ✓ Database saved
        ✓ Toast: "Item specialities updated successfully"
        ✓ UI updates

Result: Happy user, single database call, excellent UX
```

## Handler Functions

### Open Dialog Handler
```tsx
const handleOpenItemDialog = (itemId: string, chapterId?: string) => {
  // 1. Mark this item as being edited
  setEditingItemId(itemId);
  
  // 2. Load current specialities into pending state
  //    (including inherited ones for display)
  setPendingItemSpecialities(getItemSpecialityIds(itemId, chapterId));
};
```

### Close Dialog Handler
```tsx
const handleCloseItemDialog = (open: boolean) => {
  // Only save when closing (open === false)
  if (!open && editingItemId) {
    // 1. Save the pending changes to database
    updateItemSpecialitiesMutation.mutate({
      itemId: editingItemId,
      specialityIds: pendingItemSpecialities,
    });
    
    // 2. Clear the editing state
    setEditingItemId(null);
    setPendingItemSpecialities([]);
  }
};
```

## Database Impact

### Before Fix (Multiple Saves)
```
User makes 3 changes:
  → Delete from item_specialities (1st save)
  → Insert into item_specialities (1st save)
  → Delete from item_specialities (2nd save)
  → Insert into item_specialities (2nd save)
  → Delete from item_specialities (3rd save)
  → Insert into item_specialities (3rd save)
Total: 6 database operations
```

### After Fix (Single Save)
```
User makes 3 changes:
  → User closes dialog
  → Delete from item_specialities (1 save)
  → Insert into item_specialities (1 save)
Total: 2 database operations
```

## Benefits Summary

✅ **Stability**: Dialog remains open during editing
✅ **Performance**: Fewer database calls (1 save vs multiple)
✅ **UX**: Natural editing flow with single save action
✅ **Reliability**: No race conditions from rapid changes
✅ **Consistency**: Same pattern for both chapter and item dialogs

## Testing Scenarios

### Test 1: Add Specialities
1. Open item dialog
2. Select 3 specialities
3. Close dialog
4. ✓ Verify all 3 saved

### Test 2: Remove Specialities
1. Open item with specialities
2. Deselect all
3. Close dialog
4. ✓ Verify all removed

### Test 3: Mix Add/Remove
1. Open item with 2 specialities
2. Remove 1, add 2 new ones
3. Close dialog
4. ✓ Verify correct final state

### Test 4: Cancel Without Saving
1. Open item dialog
2. Make changes
3. Press Escape (or click outside)
4. ✓ Dialog closes
5. ✓ Changes saved (as designed)

Note: Future enhancement could add explicit "Cancel" button to discard changes.
