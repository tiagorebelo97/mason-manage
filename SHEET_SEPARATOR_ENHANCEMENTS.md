# Sheet Separator Enhancements - Implementation Summary

## Overview
This document describes the implementation of collapsible and movable sheet separators in the article-based view feature.

## Problem Statement
The user requested the following features for sheet separators:
1. **Minimize/Maximize**: Ability to collapse/expand all content within each sheet separator
2. **Move to Tab**: Ability to move a separator and all its chapters to another tab (similar to the existing chapter move functionality)

## Solution Implemented

### 1. Collapsible Sheet Separators ✓

**Implementation:**
- Added state management for collapsed sheets using a Set: `collapsedSheets`
- Wrapped sheet separator header in a `Collapsible` component
- Added chevron icon that rotates to indicate collapsed/expanded state
- Default state: **expanded** (all chapters visible)
- Only visible when there are multiple sheets in the file

**Visual Result:**

**Expanded state:**
```
┌─────────────────────────────────────────────────┐
│ ▼ 📄 Sheet 1               [Move to tab] ▶    │ ← Chevron down, content visible
├─────────────────────────────────────────────────┤
│ [Chapters displayed here]                       │
└─────────────────────────────────────────────────┘
```

**Collapsed state:**
```
┌─────────────────────────────────────────────────┐
│ ▶ 📄 Sheet 1               [Move to tab] ▶    │ ← Chevron right, content hidden
└─────────────────────────────────────────────────┘
```

**Code Changes:**
```tsx
// State management
const [collapsedSheets, setCollapsedSheets] = useState<Set<string>>(new Set());

// Collapsible wrapper
<Collapsible open={!isSheetCollapsed} onOpenChange={(open) => {
  const newCollapsed = new Set(collapsedSheets);
  if (open) {
    newCollapsed.delete(sheetName);
  } else {
    newCollapsed.add(sheetName);
  }
  setCollapsedSheets(newCollapsed);
}}>
  {/* Sheet separator UI */}
</Collapsible>
```

**Interaction:**
- Click chevron or sheet name to toggle collapse/expand
- Smooth transition animation
- When collapsed, all chapters in that sheet are hidden
- State is maintained during the session (not persisted)

### 2. Move Sheet to Another Tab ✓

**Implementation:**
- Added "Move to tab" button to sheet separator header
- Created `moveSheetMutation` to update all chapters from a sheet in bulk
- Opens a side sheet panel showing available target tabs
- Updates all chapter `tab_id` values in a single database operation

**Visual Result:**
```
┌─────────────────────────────────────────────────┐
│ ▼ 📄 Sheet 1               [Move to tab] ▶    │
└─────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Move Sheet      │
                    │                  │
                    │  Select a tab to │
                    │  move all        │
                    │  chapters from   │
                    │  "Sheet 1" to    │
                    │                  │
                    │  [▶ Tab Name 1]  │
                    │  [▶ Tab Name 2]  │
                    └──────────────────┘
```

**Code Changes:**
```tsx
// Mutation to move all chapters from a sheet
const moveSheetMutation = useMutation({
  mutationFn: async ({ chapterIds, newTabId }: { chapterIds: string[]; newTabId: string }) => {
    const { error } = await supabase
      .from('orcamento_chapters')
      .update({ tab_id: newTabId })
      .in('id', chapterIds);
    
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
    toast.success('Sheet moved successfully');
  },
  onError: () => {
    toast.error('Failed to move sheet');
  },
});
```

**Features:**
- Only available when there are multiple tabs
- Cannot move to the current tab (filtered out)
- All chapters in the sheet are moved together
- Database is updated via mutation in a single operation
- Success/error toast notifications
- View refreshes automatically after move

## Technical Details

### New State Variables

**collapsedSheets:**
```typescript
const [collapsedSheets, setCollapsedSheets] = useState<Set<string>>(new Set());
```
- Tracks which sheet separators are collapsed
- Uses Set for O(1) lookup performance
- Key is the sheet name string

### New Mutations

**moveSheetMutation:**
```typescript
const moveSheetMutation = useMutation({
  mutationFn: async ({ chapterIds, newTabId }) => {
    // Updates multiple chapters at once
    await supabase
      .from('orcamento_chapters')
      .update({ tab_id: newTabId })
      .in('id', chapterIds);
  },
  // ... success/error handlers
});
```

### Logic Flow

**Collapse/Expand:**
1. User clicks chevron or sheet name
2. `onOpenChange` callback is triggered
3. `collapsedSheets` Set is updated
4. Component re-renders with new state
5. Chapters are shown/hidden based on `isSheetCollapsed` flag

**Move Sheet:**
1. User clicks "Move to tab" button
2. Side sheet opens showing available tabs
3. User selects target tab
4. `moveSheetMutation.mutate()` is called with all chapter IDs
5. Database updates all chapters' `tab_id` in bulk
6. Query is invalidated and data refetches
7. View updates to show chapters in new tab

## File Modified

### src/pages/MapaQuantidades.tsx

**Changes made:**
1. Added `collapsedSheets` state variable (line ~170)
2. Added `moveSheetMutation` (after `moveChapterMutation`, line ~1627)
3. Modified sheet separator rendering (lines ~2549-2620):
   - Wrapped in `Collapsible` component
   - Added chevron icon with rotation animation
   - Added "Move to tab" button with side sheet
   - Added conditional rendering for chapters based on collapsed state

## Testing Recommendations

### Test Case 1: Single Sheet (No Separator)
1. Upload Excel file with 1 sheet
2. Enable "Article-based view"
3. Click "Analyze"
4. **Expected:** No sheet separator shown, all chapters displayed normally

### Test Case 2: Multiple Sheets - Collapse/Expand
1. Upload Excel file with 2+ sheets
2. Enable "Article-based view"
3. Click "Analyze"
4. Click chevron on sheet separator
5. **Expected:** All chapters in that sheet collapse
6. Click chevron again
7. **Expected:** All chapters in that sheet expand

### Test Case 3: Move Sheet to Different Tab
1. Upload multi-sheet, multi-tab Excel file
2. Enable "Article-based view"
3. Click "Analyze"
4. Click "Move to tab" on sheet separator
5. Select a different tab
6. **Expected:** 
   - Toast: "Sheet moved successfully"
   - All chapters from that sheet appear in the selected tab
   - Sheet separator appears in the new tab

### Test Case 4: Independent States
1. Collapse a sheet separator
2. Collapse a chapter within another sheet
3. **Expected:** States are independent
4. Expand the collapsed sheet
5. **Expected:** Chapter collapse state is preserved

## Compatibility

- Works with existing article-based view feature
- Compatible with single-sheet and multi-sheet Excel files
- Preserves all existing functionality:
  - Chapter collapse/expand
  - Article collapse/expand
  - Individual chapter move
- No breaking changes to the database schema
- Uses existing UI components from shadcn/ui

## Benefits

1. **Better Organization**: Users can collapse entire sheets to focus on specific content
2. **Easier Navigation**: Reduces clutter when working with multi-sheet documents
3. **Bulk Operations**: Moving all chapters from a sheet at once is faster than moving individually
4. **Consistent UX**: Follows the same interaction patterns as chapter and article collapse
5. **Performance**: Uses Set for efficient state management

## Future Enhancements

Potential improvements for future versions:

1. Remember collapsed sheet states across sessions (localStorage)
2. "Collapse All Sheets" / "Expand All Sheets" button
3. Keyboard shortcuts for sheet operations
4. Drag-and-drop to reorder sheets
5. Export feature respecting the sheet organization

## Notes

- Sheet separators only appear when there are 2+ sheets in the uploaded Excel file
- When there's only one sheet, chapters are displayed without a separator (existing behavior)
- The move sheet feature only shows when there are 2+ tabs
- Collapsed state is session-based and does not persist across page refreshes
- Moving a sheet moves all chapters, regardless of their individual collapsed states
