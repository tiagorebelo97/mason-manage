# Visual Guide - Single-Sheet Excel Mode Toggle

## UI Location

The new toggle appears in the file analysis section, before the "Analyze" button.

## Before Changes

```
┌─────────────────────────────────────────────────────────────────┐
│ Mapa de Quantidades                                     [< Back] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ [📄] budget.xlsx                            [Analyze] [🗑️] │   │
│ │      Ready to analyze                                      │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## After Changes

```
┌─────────────────────────────────────────────────────────────────┐
│ Mapa de Quantidades                                     [< Back] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ [📄] budget.xlsx                                           │   │
│ │      Ready to analyze                                      │   │
│ │                                                            │   │
│ │      [Toggle] Treat as single sheet  [Analyze] [🗑️]       │   │
│ │       OFF                                                  │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Toggle States

### State 1: Toggle OFF (Default - Auto-detect)

```
[Toggle] Treat as single sheet
 OFF

Behavior:
- Single-sheet Excel → Creates 3 tabs (Principal, Arquitetura, Instalações Especiais)
- Multi-sheet Excel → Creates tabs from sheet names
```

### State 2: Toggle ON (Force Single-Sheet)

```
[Toggle] Treat as single sheet
 ON

Behavior:
- Always creates 3 tabs (Principal, Arquitetura, Instalações Especiais)
- Maps all data to "Principal" tab
- Ignores additional sheets
```

## Analysis Flow Comparison

### Example: Excel file with 2 sheets ("Sheet1" and "Sheet2")

#### With Toggle OFF (Auto-detect):
```
Input: budget.xlsx
├── Sheet1 (has chapters 1, 2, 3)
└── Sheet2 (has chapters 4, 5, 6)

Analysis Result:
├── Tab "Sheet1"
│   ├── Chapter 1
│   ├── Chapter 2
│   └── Chapter 3
└── Tab "Sheet2"
    ├── Chapter 4
    ├── Chapter 5
    └── Chapter 6
```

#### With Toggle ON (Force single-sheet):
```
Input: budget.xlsx
├── Sheet1 (has chapters 1, 2, 3)  ← Only this is processed
└── Sheet2 (has chapters 4, 5, 6)  ← Ignored

Analysis Result:
├── Tab "Principal"
│   ├── Chapter 1
│   ├── Chapter 2
│   └── Chapter 3
├── Tab "Arquitetura" (empty)
└── Tab "Instalações Especiais" (empty)
```

## Excel Structure Requirements

For single-sheet mode to work correctly, the Excel file must have:

```
┌─────────┬──────────────────┬────┬────┐
│ ARTIGO  │ DESCRIÇÃO        │ UN │ QT │  ← Header row
├─────────┼──────────────────┼────┼────┤
│ 1       │ Chapter Name     │    │    │  ← Chapter (no dot in ARTIGO)
├─────────┼──────────────────┼────┼────┤
│ 1.1     │ Item Description │ m² │ 10 │  ← Item (dot in ARTIGO)
├─────────┼──────────────────┼────┼────┤
│ 1.2     │ Item Description │ un │ 5  │  ← Item
├─────────┼──────────────────┼────┼────┤
│ 2       │ Chapter Name     │    │    │  ← Chapter
├─────────┼──────────────────┼────┼────┤
│ 2.1     │ Item Description │ kg │ 20 │  ← Item
└─────────┴──────────────────┴────┴────┘
```

## Result View (After Analysis)

```
┌─────────────────────────────────────────────────────────────────┐
│ Mapa de Quantidades                                     [< Back] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ [✓] budget.xlsx                                    [🗑️]    │   │
│ │     Analysis complete                                      │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│ [Principal] [Arquitetura] [Instalações Especiais]  ← 3 tabs     │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ 1. Chapter Name                                    [🏷️]  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ │ Artigo │ Descrição │ UN │ QT │ Specialities │            │ │
│ │ ├────────┼───────────┼────┼────┼──────────────┤            │ │
│ │ │ 1.1    │ Item Desc │ m² │ 10 │ [Edit]       │            │ │
│ │ │ 1.2    │ Item Desc │ un │ 5  │ [Edit]       │            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ 2. Chapter Name                                    [🏷️]  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ │ Artigo │ Descrição │ UN │ QT │ Specialities │            │ │
│ │ ├────────┼───────────┼────┼────┼──────────────┤            │ │
│ │ │ 2.1    │ Item Desc │ kg │ 20 │ [Edit]       │            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Specialities Dialog (Fixed)

### Chapter Specialities

```
┌─────────────────────────────────────┐
│ Chapter Specialities          [✕]   │
├─────────────────────────────────────┤
│                                     │
│ Select specialities for this        │
│ chapter. All items will inherit     │
│ these by default.                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Search specialities...      [▼] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Main Speciality Group:              │
│   ☑ Speciality 1                    │
│   ☐ Speciality 2                    │
│   ☐ Speciality 3                    │
│                                     │
│ Another Group:                      │
│   ☐ Speciality 4                    │
│   ☑ Speciality 5                    │
│                                     │
└─────────────────────────────────────┘

Before Fix: Closing dialog sometimes showed error
After Fix: Changes save smoothly, no false errors
```

### Item Specialities

```
┌─────────────────────────────────────┐
│ Item Specialities             [✕]   │
├─────────────────────────────────────┤
│                                     │
│ Select specialities for this item.  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Search specialities...      [▼] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Main Speciality Group:              │
│   ☑ Speciality 1                    │
│   ☐ Speciality 2                    │
│   ☑ Speciality 3                    │
│                                     │
│ Another Group:                      │
│   ☐ Speciality 4                    │
│   ☐ Speciality 5                    │
│                                     │
└─────────────────────────────────────┘

Before Fix: "Failed to update" error even when saving worked
After Fix: Success toast shows correctly
```

## User Workflow

### Upload and Analyze

1. **Upload Excel file**
   ```
   [Upload Excel] button clicked
   → File picker opens
   → User selects budget.xlsx
   → File appears with "Ready to analyze" status
   ```

2. **Choose Analysis Mode** (NEW FEATURE)
   ```
   User sees: [Toggle] Treat as single sheet
   
   Option A: Leave toggle OFF
   → Auto-detect mode (standard behavior)
   
   Option B: Turn toggle ON
   → Force single-sheet mode
   → Creates 3 tabs regardless of actual sheet count
   ```

3. **Analyze**
   ```
   Click [Analyze] button
   → "Analyzing..." shows with spinner
   → System processes Excel file
   → Creates tabs and extracts data
   → "Analysis complete" status
   ```

### Manage Specialities

1. **Chapter Level**
   ```
   Click [🏷️] icon on chapter header
   → Dialog opens
   → Select/deselect specialities
   → Close dialog (click outside or [✕])
   → ✅ Success toast: "Chapter specialities updated"
   → Badges update immediately
   ```

2. **Item Level**
   ```
   Expand chapter (click ▼)
   → Items appear in table
   → Click [Edit] button in Specialities column
   → Dialog opens
   → Add/remove specialities
   → Close dialog
   → ✅ Success toast: "Item specialities updated"
   → Badges update immediately
   ```

## Error States (Fixed)

### Before Fix
```
User closes item specialities dialog
→ ❌ Toast: "Failed to update item specialities"
→ User confused (data was actually saved)
→ User refreshes page
→ ✓ Speciality appears (was saved all along)
```

### After Fix
```
User closes item specialities dialog
→ Mutation completes
→ ✅ Toast: "Item specialities updated successfully"
→ Badges update immediately
→ No refresh needed
```

## Technical Implementation Details

### State Management Flow

```
Dialog Open:
  editingItemId: null → "item-123"
  pendingItemSpecialities: [] → ["spec-1", "spec-2"]

User Makes Changes:
  pendingItemSpecialities: ["spec-1", "spec-2"] → ["spec-1", "spec-3"]

Dialog Close (Before Fix):
  1. Trigger mutation with ["spec-1", "spec-3"]
  2. ❌ Immediately: editingItemId: "item-123" → null
  3. ❌ Race condition: UI updates before mutation completes
  4. ❌ Inconsistent state

Dialog Close (After Fix):
  1. Trigger mutation with ["spec-1", "spec-3"]
  2. ✓ State stays: editingItemId: "item-123"
  3. ✓ Mutation completes successfully
  4. ✓ Callback: editingItemId: "item-123" → null
  5. ✓ Consistent state, proper UI update
```

## Browser Compatibility

The toggle switch uses standard Radix UI components:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Accessibility

The new toggle is fully accessible:
- ✅ Keyboard navigation (Tab, Space)
- ✅ Screen reader compatible
- ✅ Proper ARIA labels
- ✅ Focus indicators

## Summary

### What Changed
1. **New UI Element**: Toggle switch for single-sheet mode
2. **Bug Fix**: Specialities dialogs now work correctly
3. **Better UX**: No more false error messages

### What Stayed the Same
- File upload process
- Excel structure requirements
- Tab and table rendering
- All other functionality

### User Benefits
- ✅ Manual control over sheet detection
- ✅ Reliable speciality management
- ✅ No confusing error messages
- ✅ Immediate feedback on changes
