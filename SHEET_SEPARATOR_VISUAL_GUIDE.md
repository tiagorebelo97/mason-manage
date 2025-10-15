# Sheet Separator Visual Guide

## Before and After Comparison

### Before Enhancement

```
┌─────────────────────────────────────────────────────┐
│ Tab: Arquitectura                                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📄 Sheet 1                                   │   │ ← Static, cannot collapse
│ └──────────────────────────────────────────────┘   │    or move
│                                                      │
│ ▼ 1. Chapter Name              [Move to tab] ▶    │
│   └─ 1.1 Article                                   │
│       [content...]                                  │
│                                                      │
│ ▼ 2. Another Chapter           [Move to tab] ▶    │
│   └─ 2.1 Article                                   │
│       [content...]                                  │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📄 Sheet 2                                   │   │ ← Static, cannot collapse
│ └──────────────────────────────────────────────┘   │    or move
│                                                      │
│ ▼ 3. Third Chapter             [Move to tab] ▶    │
│   └─ 3.1 Article                                   │
│       [content...]                                  │
│                                                      │
└─────────────────────────────────────────────────────┘

Issues:
- Sheet separators cannot be collapsed
- Cannot move entire sheet to another tab
- Must move chapters individually
```

### After Enhancement

```
┌─────────────────────────────────────────────────────┐
│ Tab: Arquitectura                                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ ▼ 📄 Sheet 1          [Move to tab] ▶       │   │ ← NEW: Collapsible & movable
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ▼ 1. Chapter Name              [Move to tab] ▶    │
│   └─ 1.1 Article                                   │
│       [content...]                                  │
│                                                      │
│ ▼ 2. Another Chapter           [Move to tab] ▶    │
│   └─ 2.1 Article                                   │
│       [content...]                                  │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ ▶ 📄 Sheet 2          [Move to tab] ▶       │   │ ← NEW: Collapsed state
│ └──────────────────────────────────────────────┘   │    (chapters hidden)
│                                                      │
└─────────────────────────────────────────────────────┘

Improvements:
✓ Sheet separators are collapsible
✓ Can move entire sheet with all chapters to another tab
✓ Chevron indicates collapsed/expanded state
✓ Bulk operations for better efficiency
```

## Feature Details

### 1. Collapsible Sheet Separator

**Expanded state:**
```
┌────────────────────────────────────────────────────┐
│ ▼ 📄 Sheet Name        [Move to tab] ▶           │ ← Click to collapse
└────────────────────────────────────────────────────┘
│ Chapter 1                                          │
│ Chapter 2                                          │
│ Chapter 3                                          │
```

**Collapsed state:**
```
┌────────────────────────────────────────────────────┐
│ ▶ 📄 Sheet Name        [Move to tab] ▶           │ ← Click to expand
└────────────────────────────────────────────────────┘
```

**Interaction:**
- Click chevron (▼/▶) or sheet name to toggle
- Smooth animation on collapse/expand
- All chapters in the sheet are shown/hidden together

### 2. Move Sheet to Another Tab

**Click "Move to tab" button:**
```
┌────────────────────────────────────────────────────┐
│ ▼ 📄 Sheet 1           [Move to tab] ▶           │
└────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌──────────────────────┐
                  │ Move Sheet           │
                  │                      │
                  │ Select a tab to move │
                  │ all chapters from    │
                  │ "Sheet 1" to         │
                  │                      │
                  │ ┌──────────────────┐ │
                  │ │ ▶ Estruturas     │ │ ← Click to move
                  │ └──────────────────┘ │
                  │ ┌──────────────────┐ │
                  │ │ ▶ Águas          │ │
                  │ └──────────────────┘ │
                  │ ┌──────────────────┐ │
                  │ │ ▶ Electricidade  │ │
                  │ └──────────────────┘ │
                  └──────────────────────┘
```

**After move:**
```
Toast notification: "Sheet moved successfully" ✓

┌─────────────────────────────────────────────────────┐
│ Tab: Estruturas                                     │ ← Sheet 1 now here
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ ▼ 📄 Sheet 1          [Move to tab] ▶       │   │ ← All chapters moved
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ▼ 1. Chapter Name              [Move to tab] ▶    │
│ ▼ 2. Another Chapter           [Move to tab] ▶    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Interaction Flow

### Collapsing/Expanding a Sheet

1. **Click sheet separator chevron or name**
   ```
   ▼ → ▶ (collapse - hides all chapters)
   ▶ → ▼ (expand - shows all chapters)
   ```

2. **Visual feedback**
   - Chevron rotates smoothly
   - Chapters fade in/out with animation
   - State is maintained during the session

### Moving a Sheet

1. **Click "Move to tab" on sheet separator**
   ```
   [Move to tab] ▶ → Side panel opens
   ```

2. **Select target tab**
   ```
   [▶ Target Tab Name] → All chapters move
   ```

3. **Confirmation**
   ```
   Toast: "Sheet moved successfully" ✓
   ```

4. **Result**
   - Sheet separator appears in the new tab
   - All chapters from the sheet are moved together
   - View automatically refreshes

## Comparison with Chapter Operations

| Feature | Chapter Level | Sheet Level (NEW) |
|---------|--------------|-------------------|
| Collapse/Expand | ✓ Individual chapter | ✓ All chapters in sheet |
| Move to Tab | ✓ Single chapter | ✓ All chapters in sheet |
| Interaction | Button + Chevron | Button + Chevron |
| Visual Indicator | Grey header | Blue header |
| Bulk Operation | No | Yes |

## Example Scenario

**Use Case:** Construction project with electrical and plumbing sheets mixed in tabs

**Before:**
```
Tab: Arquitectura
  Sheet: Arquitectura Principal
    - Chapter 1
    - Chapter 2
  Sheet: Instalações Eléctricas  ← Wrong tab
    - Chapter 3
    - Chapter 4
```

**Problem:** Need to move "Instalações Eléctricas" sheet to "Electricidade" tab

**Old Solution:** 
- Click "Move to tab" on Chapter 3 → Select "Electricidade"
- Click "Move to tab" on Chapter 4 → Select "Electricidade"
- Requires 2 operations, easy to miss chapters

**New Solution:**
- Click "Move to tab" on "Instalações Eléctricas" sheet separator → Select "Electricidade"
- Done! Both chapters moved in one operation

**After:**
```
Tab: Arquitectura
  Sheet: Arquitectura Principal
    - Chapter 1
    - Chapter 2

Tab: Electricidade
  Sheet: Instalações Eléctricas  ← Correctly placed
    - Chapter 3
    - Chapter 4
```

## Key Differences from Documentation Files

This implementation is similar to but distinct from:
- **Chapter collapse**: Collapses a single chapter
- **Article collapse**: Collapses a single article
- **Chapter move**: Moves a single chapter

Sheet separators now have the **same capabilities** but operate at the **sheet level**, affecting **all chapters** within the sheet.

## Visual Indicators

| Element | Appearance | Meaning |
|---------|-----------|---------|
| ▼ on sheet | Chevron down | Sheet is expanded, chapters visible |
| ▶ on sheet | Chevron right | Sheet is collapsed, chapters hidden |
| Blue background | Blue header box | This is a sheet separator (vs grey for chapters) |
| 📄 icon | File emoji | Visual indicator for sheet |
| [Move to tab] ▶ | Button | Click to move entire sheet |

## Dark Mode

The feature works in both light and dark modes:

**Light Mode:**
```
┌────────────────────────────────────────────────────┐
│ bg-blue-50, text-blue-900                          │
│ ▼ 📄 Sheet Name        [Move to tab] ▶           │
└────────────────────────────────────────────────────┘
```

**Dark Mode:**
```
┌────────────────────────────────────────────────────┐
│ bg-blue-950, text-blue-100                         │
│ ▼ 📄 Sheet Name        [Move to tab] ▶           │
└────────────────────────────────────────────────────┘
```

## Notes

1. Sheet separators only appear when there are **multiple sheets** in the Excel file
2. The "Move to tab" button only shows when there are **multiple tabs**
3. When a sheet is collapsed, **all chapters** in that sheet are hidden
4. When a sheet is moved, **all chapters** move together in a **single database operation**
5. The collapsed state is **not persisted** - it resets when you refresh the page
6. The feature uses the same UI components (Collapsible, Sheet, Button) as the rest of the app
