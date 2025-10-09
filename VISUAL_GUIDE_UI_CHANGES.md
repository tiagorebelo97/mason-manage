# Visual Guide - UI Changes

This document describes the visual changes made to the Mapa de Quantidades page.

---

## 1. Export Button

### Location
Above the tabs section, aligned to the right

### Appearance
```
┌─────────────────────────────────────────────────────┐
│  Mapa de Quantidades                                │
│  Budget: Project Alpha                              │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ [📄] project_file.xlsx                      │   │
│  │ File analyzed successfully                   │   │
│  │                              [Analyze] [🗑️] │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│                        [⬇️ Export to Excel] ← NEW   │
│  ┌─────────────────────────────────────────────┐   │
│  │ [ Sheet 1 ] [ Sheet 2 ] [ Sheet 3 ]        │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Button Style
- **Variant**: Outline (bordered, not filled)
- **Icon**: Download icon (⬇️)
- **Text**: "Export to Excel"
- **Color**: Default theme color
- **Size**: Regular

### Button Behavior
- **Visible**: Only when file is analyzed (has tabs and data)
- **Click**: Downloads Excel file immediately
- **Disabled**: Never (if visible, it's clickable)
- **Toast**: Shows success message after export

---

## 2. Chapter Specialities Button

### Location
In the chapter header row, after the chapter comments icon (if present)

### Appearance
```
┌─────────────────────────────────────────────────────┐
│ Sheet 1                                             │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌───────────────────────────────────────────────┐  │
│ │ [▼] 1. Chapter Name [💬] [🏷️] ← NEW          │  │
│ │     ▲                    ▲    ▲                │  │
│ │     │                    │    │                │  │
│ │  Expand              Comments │                │  │
│ │  toggle              (if any) │                │  │
│ │                    Specialities button         │  │
│ └───────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Button Style
- **Type**: Ghost icon button (transparent background)
- **Icon**: Tag icon (🏷️)
- **Size**: 8x8 (h-8 w-8)
- **Color**: Muted gray, turns darker on hover

### Tooltip
Appears on hover:
```
┌───────────────────────┐
│ Specialities         │
│ Engineering, Design  │ ← Shows current specialities
│ (or "No specialities │
│  assigned")          │
└───────────────────────┘
```

### Button Behavior
- **Always visible**: For every chapter
- **Click**: Opens specialities dialog
- **Hover**: Shows tooltip with current specialities
- **Disabled**: Never

---

## 3. Item Specialities Column

### Location
New column added to the items table, after the comments column

### Table Structure
```
┌─────┬──────────┬────┬────────┬──────────┬─────┬─────┐
│ARTIGO│DESCRIÇÃO │ UN │ TOTAIS │OBSERV.   │[💬]│[🏷️]│← NEW
├─────┼──────────┼────┼────────┼──────────┼─────┼─────┤
│ 1.1 │Item A    │ m² │  100   │Text here │     │ 🏷️  │
│ 1.2 │Item B    │ un │   50   │Text here │ 💬  │ 🏷️  │
│ 1.3 │Item C    │ kg │   25   │Text here │     │ 🏷️  │
└─────┴──────────┴────┴────────┴──────────┴─────┴─────┘
       ▲                                          ▲
       │                                          │
   Existing columns                        New column
```

### Button Style
- **Type**: Ghost icon button
- **Icon**: Tag icon (🏷️)
- **Size**: 8x8 (h-8 w-8)
- **Color**: Muted gray, turns darker on hover

### Tooltip
Same as chapter tooltip:
```
┌───────────────────────┐
│ Specialities         │
│ Plumbing, HVAC       │ ← Shows current specialities
└───────────────────────┘
```

---

## 4. Chapter Specialities Dialog

### Appearance
Opens when clicking chapter Tag icon

```
┌───────────────────────────────────────┐
│ Edit Chapter Specialities        [×] │
├───────────────────────────────────────┤
│ 1. Chapter Name                      │
│                                       │
│ Specialities                          │
│ ┌───────────────────────────────────┐│
│ │ Select specialities...        [▼]││
│ └───────────────────────────────────┘│
│                                       │
│ [✓] Apply to all items in this       │
│     chapter                           │
│                                       │
│               [Cancel] [Save]         │
└───────────────────────────────────────┘
```

### Dialog Structure
1. **Header**: "Edit Chapter Specialities"
2. **Subheader**: Chapter name (e.g., "1. Chapter Name")
3. **MultiSelect**: Dropdown with checkboxes for specialities
4. **Checkbox**: "Apply to all items in this chapter"
5. **Actions**: Cancel and Save buttons

### MultiSelect Behavior
When clicked:
```
┌───────────────────────────────────────┐
│ Select specialities...            [▲]│
├───────────────────────────────────────┤
│ [✓] Engineering                       │
│ [ ] Architecture                      │
│ [✓] Design                            │
│ [ ] Construction                      │
│ [✓] HVAC                              │
│ [ ] Plumbing                          │
│ [ ] Electrical                        │
└───────────────────────────────────────┘
```

### Selected State
When specialities are selected:
```
┌───────────────────────────────────────┐
│ Engineering, Design, HVAC         [▼]│
│ (3 selected)                          │
└───────────────────────────────────────┘
```

### Cascade Checkbox
- **Checked**: All items will get the same specialities
- **Unchecked**: Only the chapter gets specialities
- **Default**: Unchecked
- **Label**: "Apply to all items in this chapter"

---

## 5. Item Specialities Dialog

### Appearance
Similar to chapter dialog but without cascade checkbox

```
┌───────────────────────────────────────┐
│ Edit Item Specialities           [×] │
├───────────────────────────────────────┤
│ 1.1 - Item Description               │
│                                       │
│ Specialities                          │
│ ┌───────────────────────────────────┐│
│ │ Select specialities...        [▼]││
│ └───────────────────────────────────┘│
│                                       │
│               [Cancel] [Save]         │
└───────────────────────────────────────┘
```

### Differences from Chapter Dialog
- No cascade checkbox
- Subheader shows item artigo and description
- Shorter dialog (less content)

---

## 6. Color Scheme

### Button Colors
- **Normal**: `text-muted-foreground` (gray)
- **Hover**: `text-foreground` (darker)
- **Active**: Same as hover
- **Disabled**: (Not used, buttons always enabled)

### Dialog Colors
- **Background**: `bg-card` (theme card background)
- **Text**: `text-foreground` (theme text)
- **Border**: `border` (theme border)
- **Overlay**: Semi-transparent dark

### Icon Colors
- **Tag Icon**: Inherits button color
- **Download Icon**: White/theme color in button
- **Checkmark**: Green for selected items

---

## 7. Spacing and Layout

### Chapter Header
```
┌────────────────────────────────┐
│ [▼] 1. Chapter Name [💬] [🏷️] │
│  ↑   ↑              ↑    ↑     │
│  5px 0px           8px  8px    │
│  gap between elements          │
└────────────────────────────────┘
```

### Table Column Widths
- ARTIGO: 10 chars
- DESCRIÇÃO: 50 chars
- UN: 8 chars
- TOTAIS: 12 chars (right-aligned)
- OBSERVAÇÕES: Flexible (grows)
- Comments: w-12 (fixed)
- Specialities: w-12 (fixed) ← NEW

### Dialog Padding
- Content padding: 4 (16px)
- Vertical spacing: 4 (16px) between elements
- Button gap: 2 (8px)

---

## 8. Responsive Behavior

### Desktop (> 768px)
- All buttons visible
- Tooltips appear on hover
- Dialogs centered on screen
- Table shows all columns

### Tablet (768px - 1024px)
- Same as desktop
- Dialog may take more screen space
- Table columns may wrap

### Mobile (< 768px)
- Buttons remain visible
- Touch-friendly sizes (44x44 minimum)
- Dialogs take full width
- Table scrolls horizontally
- Tooltips show on tap

---

## 9. Accessibility

### Keyboard Navigation
- **Tab**: Move between buttons
- **Enter/Space**: Activate button
- **Escape**: Close dialog
- **Arrow keys**: Navigate MultiSelect options

### Screen Readers
- Button has `aria-label`: "Edit specialities"
- Tooltip has `role="tooltip"`
- Dialog has `role="dialog"`
- MultiSelect has `role="combobox"`

### Color Contrast
- All text meets WCAG AA standards
- Interactive elements clearly distinguishable
- Focus indicators visible

---

## 10. Animation and Transitions

### Dialog
- **Open**: Fade in + scale (0.2s)
- **Close**: Fade out + scale (0.2s)
- **Easing**: ease-in-out

### Tooltip
- **Show**: Fade in (0.15s)
- **Hide**: Fade out (0.15s)
- **Delay**: 0.3s after hover

### Button Hover
- **Background**: Smooth transition (0.2s)
- **Color**: Smooth transition (0.2s)

### Loading State
- **Spinner**: Rotate animation (infinite)
- **Button**: Disabled appearance
- **Text**: "Saving..." or similar

---

## 11. States

### Export Button States
1. **Normal**: Visible, clickable
2. **Hover**: Slightly darker border
3. **Active**: Pressed appearance
4. **After Click**: Shows loading toast briefly

### Specialities Button States
1. **Normal**: Gray icon
2. **Hover**: Darker icon + tooltip
3. **Active**: Pressed appearance
4. **Dialog Open**: Normal state (dialog manages state)

### MultiSelect States
1. **Closed**: Shows selected count or placeholder
2. **Open**: Shows all options with checkboxes
3. **Selected**: Blue checkmark + background
4. **Hover**: Light background highlight
5. **Focus**: Blue outline

### Save Button States
1. **Normal**: Enabled, clickable
2. **Hover**: Slightly darker
3. **Loading**: Spinner + disabled + "Saving..."
4. **Success**: Returns to normal (dialog closes)

---

## 12. Error States

### Export Error
```
┌─────────────────────────┐
│ ⚠️ No data to export    │ ← Toast notification
└─────────────────────────┘
```

### Specialities Save Error
```
┌──────────────────────────────────┐
│ ❌ Failed to update specialities │ ← Toast notification
└──────────────────────────────────┘
```

### Network Error
- Dialog remains open
- Error toast appears
- User can retry or cancel
- No data lost

---

## 13. Success States

### Export Success
```
┌───────────────────────────────┐
│ ✅ File exported successfully │ ← Toast notification
└───────────────────────────────┘
```

### Specialities Update Success
```
┌──────────────────────────────────────┐
│ ✅ Specialities updated successfully │ ← Toast notification
└──────────────────────────────────────┘
```

- Dialog closes automatically
- Toast appears briefly (3-5 seconds)
- Tooltips update immediately
- Data refreshes automatically

---

## 14. Loading States

### During Export
- Button briefly shows loading state
- Browser download dialog appears
- Toast shows progress

### During Specialities Save
```
┌───────────────────────────────────────┐
│ Edit Chapter Specialities        [×] │
├───────────────────────────────────────┤
│ 1. Chapter Name                      │
│                                       │
│ Specialities                          │
│ [Engineering, Design]                 │
│                                       │
│ [✓] Apply to all items               │
│                                       │
│         [Cancel] [⏳ Saving...]       │
│                   ↑                   │
│              Loading spinner          │
└───────────────────────────────────────┘
```

---

## 15. Empty States

### No Specialities Assigned
Tooltip shows:
```
┌───────────────────────┐
│ Specialities         │
│ No specialities      │
│ assigned             │
└───────────────────────┘
```

### No Specialities in Database
MultiSelect shows:
```
┌───────────────────────────────────────┐
│ Select specialities...            [▼]│
├───────────────────────────────────────┤
│ No specialities found.               │
│ Please add specialities first.       │
└───────────────────────────────────────┘
```

---

## Summary of Visual Changes

### New UI Elements
1. ✅ Export to Excel button (above tabs)
2. ✅ Tag icon on chapter headers
3. ✅ Tag icon column in items table
4. ✅ Two dialog forms (chapter & item)
5. ✅ Tooltips on Tag icons

### Modified UI Elements
- ✅ Items table: +1 column for specialities
- ✅ Table header: +1 header cell

### No Changes To
- ❌ File upload area
- ❌ Analyze button
- ❌ Delete button
- ❌ Tab navigation
- ❌ Chapter expand/collapse
- ❌ Existing columns
- ❌ Comments dialogs
- ❌ Image upload buttons

---

## Integration with Existing UI

The new features integrate seamlessly:
- **Export button**: Complements analyze workflow
- **Tag icons**: Match existing icon pattern (comments)
- **Dialogs**: Use same Radix UI components
- **Tooltips**: Consistent with existing tooltips
- **Colors**: Match theme colors
- **Spacing**: Follows existing spacing system

No conflicts with existing features.
