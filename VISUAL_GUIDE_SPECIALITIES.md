# Visual Guide - Specialities Feature

## Before and After Comparison

### Chapter Header - BEFORE
```
┌───────────────────────────────────────────────────────────────┐
│  ▼  1. Trabalhos Preliminares  💬                             │
│      [Items listed below]                                      │
└───────────────────────────────────────────────────────────────┘
```

### Chapter Header - AFTER
```
┌───────────────────────────────────────────────────────────────┐
│  ▼  1. Trabalhos Preliminares  💬  🏷️                        │
│      [Items listed below]                                      │
└───────────────────────────────────────────────────────────────┘
                                      ↑
                            NEW: Tag icon for specialities
```

## New UI Elements

### 1. Chapter Specialities Dialog

When you click the 🏷️ icon on a chapter:

```
┌─────────────────────────────────────────────────────────────┐
│  Chapter Specialities                                    ✕  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Select specialities for this chapter. All items will       │
│  inherit these by default.                                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ [X] Electrical    [X] Plumbing         ▼         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Options:                                                    │
│  ☐ Electrical                                               │
│  ☑ Plumbing                                                 │
│  ☐ HVAC                                                     │
│  ☐ Masonry                                                  │
│  ☐ Carpentry                                                │
│  ... (searchable list)                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Item Table - BEFORE

```
┌────────┬─────────────────┬────┬────┬────────────────┬────┐
│ Artigo │ Descrição       │ UN │ QT │ Observações    │ 💬 │
├────────┼─────────────────┼────┼────┼────────────────┼────┤
│ 1.1    │ Limpeza terreno │ m² │ 10 │ Text or image  │    │
│ 1.2    │ Demolições      │ m  │ 5  │ Text or image  │ 💬 │
│ 1.3    │ Escavações      │ un │ 2  │ -              │    │
└────────┴─────────────────┴────┴────┴────────────────┴────┘
```

### 3. Item Table - AFTER

```
┌────────┬─────────────────┬────┬────┬──────────────────┬────────────────┬────┐
│ Artigo │ Descrição       │ UN │ QT │ Specialities     │ Observações    │ 💬 │
├────────┼─────────────────┼────┼────┼──────────────────┼────────────────┼────┤
│ 1.1    │ Limpeza terreno │ m² │ 10 │ 🏷️ 2 (inherited) │ Text or image  │    │
│ 1.2    │ Demolições      │ m  │ 5  │ 🏷️ 1             │ Text or image  │ 💬 │
│ 1.3    │ Escavações      │ un │ 2  │ 🏷️ None          │ -              │    │
└────────┴─────────────────┴────┴────┴──────────────────┴────────────────┴────┘
                                        ↑
                              NEW: Specialities column
```

### 4. Item Specialities Dialog

When you click the speciality button on an item:

```
┌─────────────────────────────────────────────────────────────┐
│  Item Specialities                                       ✕  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Select specialities for this item. Leave empty to          │
│  inherit from chapter.                                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ [X] Electrical    [X] HVAC             ▼         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Options:                                                    │
│  ☑ Electrical                                               │
│  ☐ Plumbing                                                 │
│  ☑ HVAC                                                     │
│  ☐ Masonry                                                  │
│  ☐ Carpentry                                                │
│  ... (searchable list)                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## User Interaction Flow

### Flow 1: Setting Chapter Specialities

```
1. User clicks 🏷️ on chapter header
         ↓
2. Dialog opens with multi-select
         ↓
3. User selects "Electrical" and "Plumbing"
         ↓
4. Changes saved automatically
         ↓
5. All items in chapter show "2 (inherited)"
```

### Flow 2: Customizing Item Specialities

```
1. User clicks "2 (inherited)" button on item
         ↓
2. Dialog opens showing current selections
   (Electrical ✓, Plumbing ✓)
         ↓
3. User adds "HVAC" to the selection
   (Electrical ✓, Plumbing ✓, HVAC ✓)
         ↓
4. Changes saved automatically
         ↓
5. Item button changes to "3" (no longer inherited)
```

### Flow 3: Reverting to Chapter Inheritance

```
1. User clicks "3" button on item
         ↓
2. Dialog opens showing custom selections
   (Electrical ✓, Plumbing ✓, HVAC ✓)
         ↓
3. User removes all selections
   (click X on each badge)
         ↓
4. Changes saved automatically
         ↓
5. Item button changes to "2 (inherited)"
```

## Button State Reference

### Chapter Specialities Button
- **Icon:** 🏷️ Tag icon
- **Location:** Chapter header, next to comments button
- **Tooltip:** "Manage Chapter Specialities"
- **Always visible:** Yes

### Item Specialities Button

| Button Text | Meaning | When It Appears |
|-------------|---------|-----------------|
| `🏷️ None` | No specialities assigned | Item has no specialities and chapter has none |
| `🏷️1 (inherited)` | One speciality from chapter | Item has no custom specialities, chapter has 1 |
| `🏷️ 2 (inherited)` | Two specialities from chapter | Item has no custom specialities, chapter has 2 |
| `🏷️ 1` | One custom speciality | Item has 1 custom speciality |
| `🏷️ 3` | Three custom specialities | Item has 3 custom specialities |

## Visual Indicators

### Badge Colors in Multi-Select

Selected items appear as badges:

```
┌─────────────────────────────────────────────────────┐
│ [Electrical ✕]  [Plumbing ✕]  [HVAC ✕]      ▼     │
└─────────────────────────────────────────────────────┘
     ↑                                           ↑
  Badge with X to remove                    Dropdown arrow
```

### Inheritance Indicator

```
Items with "(inherited)" = using chapter's specialities
Items without "(inherited)" = using custom specialities
```

## Responsive Design

The UI adapts to different screen sizes:

### Desktop (> 1024px)
```
┌────────┬──────────────┬────┬────┬─────────────┬─────────┬────┐
│ Artigo │ Descrição    │ UN │ QT │ Specialities│ Observ. │ 💬 │
├────────┼──────────────┼────┼────┼─────────────┼─────────┼────┤
│ Full width layout with all columns visible                  │
└──────────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌────────┬───────────┬────┬─────────────┬─────────┬────┐
│ Artigo │ Descrição │ UN │ Specialities│ Observ. │ 💬 │
├────────┼───────────┼────┼─────────────┼─────────┼────┤
│ Quantity column may wrap or scroll horizontally      │
└──────────────────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌────────┬───────────┬──────────────┐
│ Artigo │ Descrição │ 🏷️          │
├────────┼───────────┼──────────────┤
│ Some columns hidden,                │
│ accessible via horizontal scroll    │
└─────────────────────────────────────┘
```

## Accessibility Features

1. **Keyboard Navigation:**
   - Tab through buttons
   - Enter/Space to open dialogs
   - Arrow keys in multi-select
   - Escape to close dialogs

2. **Screen Reader Support:**
   - ARIA labels on all interactive elements
   - Descriptive button text
   - Dialog titles and descriptions
   - Focus management

3. **Visual Feedback:**
   - Hover states on buttons
   - Focus outlines
   - Loading states during save
   - Success/error toasts

## Color Coding

- **Tag Icon (🏷️):** Muted foreground color, highlights on hover
- **Badge Backgrounds:** Secondary variant (light gray)
- **Selected Items:** Primary color checkmarks
- **Buttons:** Outline variant for secondary actions

## Animation & Transitions

1. **Dialog Open/Close:** Smooth fade and scale
2. **Multi-Select Dropdown:** Slide down animation
3. **Badge Add/Remove:** Fade in/out
4. **Hover Effects:** 200ms color transition

## Summary of Visual Changes

| Element | Change | Purpose |
|---------|--------|---------|
| Chapter Header | Added 🏷️ button | Manage chapter specialities |
| Item Table | Added "Specialities" column | Show and manage item specialities |
| Table Cells | Added speciality button | Quick access to item specialities |
| Dialogs | Added 2 new dialogs | Edit specialities with multi-select |
| Badges | Display in multi-select | Show selected specialities |
| Tooltips | Added on buttons | Explain functionality |

## Icons Used

- 🏷️ (`Tag` from lucide-react) - Specialities management
- 💬 (`MessageSquare`) - Comments (existing)
- ▼ (`ChevronDown`) - Expand/collapse (existing)
- ✕ (`X`) - Remove badge items
- ✓ (`Check`) - Selected items in dropdown

## Typography

- **Chapter Title:** 1.125rem (18px), semibold
- **Dialog Title:** Default heading size
- **Dialog Description:** Default body size, muted color
- **Button Text:** 0.75rem (12px) for counts
- **Table Headers:** Default, medium weight
- **Table Cells:** Default body size
