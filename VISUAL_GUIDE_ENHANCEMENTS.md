# Visual Guide: Article-Based View Enhancements

## Before and After Comparison

### Before Enhancement

```
┌─────────────────────────────────────────────────────┐
│ Principal │ Arquitetura │ Instalações Especiais    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 1. Chapter Name                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 1.1 - Article Title                             │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Content always visible                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 2. Another Chapter                              │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘

Issues:
- No visual separation for multi-sheet files
- No way to collapse chapters or articles
- Cannot move chapters between tabs
- Articles don't have distinctive background
```

### After Enhancement

```
┌─────────────────────────────────────────────────────┐
│ Principal │ Arquitetura │ Instalações Especiais    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📄 Sheet 1                                   │   │ ← NEW: Sheet Separator
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▼ 1. Chapter Name         [Move to tab] ▶    │ │ ← NEW: Collapsible + Move
│ ├─────────────────────────────────────────────────┤ │
│ │                                                  │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ ▼ 1.1 - Article Title                      │ │ │ ← NEW: Collapsible Article
│ │ ├─────────────────────────────────────────────┤ │ │    with Grey Background
│ │ │ Text comment shown properly                 │ │ │ ← NEW: Comments as text
│ │ │ ┌─────────────────────────────────────────┐ │ │ │
│ │ │ │ Table with items                        │ │ │ │
│ │ │ └─────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │                                                  │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ ▶ 1.2 - Another Article (collapsed)         │ │ │ ← NEW: Collapsed state
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📄 Sheet 2                                   │   │ ← NEW: Second sheet
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▼ 2. Another Chapter      [Move to tab] ▶    │ │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘

Improvements:
✓ Sheet separators for multi-sheet files
✓ Collapsible chapters and articles
✓ Move chapters between tabs
✓ Distinctive grey background for articles
✓ Comments displayed as text (not tables)
```

## Feature Details

### 1. Sheet Separator (Multi-Sheet Files Only)

**Appearance:**
```
┌──────────────────────────────────────────────┐
│ 📄 Sheet Name                                │ ← Blue background with left border
└──────────────────────────────────────────────┘
```

**When it appears:**
- Only when Excel file has 2+ sheets
- Only in article-based view
- Only in the Principal tab (where all sheets are mapped)

**Color scheme:**
- Background: `bg-blue-50` (light) / `bg-blue-950` (dark)
- Border: `border-l-4 border-blue-500`
- Text: `text-blue-900` (light) / `text-blue-100` (dark)

### 2. Collapsible Chapter

**Expanded state:**
```
┌─────────────────────────────────────────────────┐
│ ▼ 1. Chapter Name                [Move to tab]│ ← Chevron down, content visible
├─────────────────────────────────────────────────┤
│ [Articles displayed here]                       │
└─────────────────────────────────────────────────┘
```

**Collapsed state:**
```
┌─────────────────────────────────────────────────┐
│ ▶ 1. Chapter Name                [Move to tab]│ ← Chevron right, content hidden
└─────────────────────────────────────────────────┘
```

**Interaction:**
- Click chevron or chapter title to toggle
- Smooth transition animation
- Default: **Expanded** (open)

### 3. Collapsible Article

**Expanded state:**
```
┌─────────────────────────────────────────────┐
│ ▼ 1.1 - Article Title                      │ ← Grey background, chevron down
├─────────────────────────────────────────────┤
│ Text comments                               │
│ ┌─────────────────────────────────────────┐ │
│ │ Item Table                              │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Collapsed state:**
```
┌─────────────────────────────────────────────┐
│ ▶ 1.1 - Article Title                      │ ← Grey background, chevron rotated
└─────────────────────────────────────────────┘
```

**Interaction:**
- Click anywhere on the article header to toggle
- Icon rotates -90° when collapsed
- State persists during session
- Hover effect on header

### 4. Move Chapter Side Panel

**Trigger:**
```
┌─────────────────────────────────────────────────┐
│ ▼ 1. Chapter Name         [Move to tab] ▶    │ ← Click this button
└─────────────────────────────────────────────────┘
```

**Side Panel:**
```
                              ┌───────────────────────┐
                              │ Move Chapter          │
                              │                       │
                              │ Select a tab to move  │
                              │ this chapter to       │
                              │                       │
                              │ ┌───────────────────┐ │
                              │ │ ▶ Arquitetura     │ │
                              │ └───────────────────┘ │
                              │                       │
                              │ ┌───────────────────┐ │
                              │ │ ▶ Instalações     │ │
                              │ │   Especiais       │ │
                              │ └───────────────────┘ │
                              │                       │
                              └───────────────────────┘
```

**Behavior:**
- Opens from the right side
- Shows only other tabs (not current tab)
- Click to move chapter
- Success toast on completion
- Automatic panel close

### 5. Comments as Text

**Before (incorrect):**
```
┌─────────────────────────────────────────┐
│ ARTIGO │ DESCRIÇÃO         │ UN  │ QT  │
├────────┼───────────────────┼─────┼─────┤
│        │ This is a comment │     │     │ ← Comment in table (wrong!)
├────────┼───────────────────┼─────┼─────┤
│ 1.1.1  │ Item description  │ m2  │ 100 │
└─────────────────────────────────────────┘
```

**After (correct):**
```
This is a comment                          ← Comment as text (correct!)

┌─────────────────────────────────────────┐
│ ARTIGO │ DESCRIÇÃO         │ UN  │ QT  │
├────────┼───────────────────┼─────┼─────┤
│ 1.1.1  │ Item description  │ m2  │ 100 │
└─────────────────────────────────────────┘
```

**Characteristics:**
- Plain text paragraphs
- Not in table format
- Preserves line breaks (`whitespace-pre-line`)
- Respects order from Excel

### 6. Article Background

**Visual difference:**
```
Without background:                  With background:
┌─────────────────────┐             ┌─────────────────────┐
│ 1.1 - Article Title │             │ 1.1 - Article Title │
├─────────────────────┤             ├─────────────────────┤
│ Content             │             │ Content             │ ← Grey background
└─────────────────────┘             └─────────────────────┘
```

**Color scheme:**
- Light mode: `bg-gray-50`
- Dark mode: `bg-gray-900`
- Hover: `hover:bg-gray-100` / `hover:bg-gray-800`

## Interaction Flow

### Analyzing a Multi-Sheet Excel File

1. **Upload file**
   ```
   [Choose file] → multi-sheet.xlsx
   ```

2. **Enable article-based view**
   ```
   [✓] Article-based view
   ```

3. **Click Analyze**
   ```
   [Analyze] → Processing...
   ```

4. **Result:**
   ```
   ┌─────────────────────────────────────┐
   │ Principal │ Arquitetura │ ...       │
   ├─────────────────────────────────────┤
   │ 📄 Sheet 1                          │ ← Separator
   │ [Chapters and articles]             │
   │                                     │
   │ 📄 Sheet 2                          │ ← Separator
   │ [Chapters and articles]             │
   └─────────────────────────────────────┘
   ```

### Collapsing/Expanding Content

1. **Click chapter header**
   ```
   ▼ → ▶ (collapse)
   ▶ → ▼ (expand)
   ```

2. **Click article header**
   ```
   ▼ → ▶ (collapse)
   ▶ → ▼ (expand)
   ```

### Moving a Chapter

1. **Click "Move to tab"**
   ```
   [Move to tab] ▶ → Side panel opens
   ```

2. **Select target tab**
   ```
   [▶ Arquitetura] → Chapter moves
   ```

3. **Confirmation**
   ```
   Toast: "Chapter moved successfully" ✓
   ```

## Responsive Behavior

### Desktop View
- Side panel opens from right
- Full width for sheet separators
- Comfortable spacing for all elements

### Tablet View
- Side panel slightly narrower
- Sheet separators remain full width
- Touch-friendly collapse/expand buttons

### Mobile View
- Side panel full screen
- Sheet separators adapt to viewport
- Larger touch targets for interactions

## Accessibility

- **Keyboard navigation**: Tab through interactive elements
- **Screen readers**: Descriptive labels for all controls
- **Focus indicators**: Visible focus states
- **Color contrast**: WCAG AA compliant
- **Touch targets**: Minimum 44x44 pixels

## Performance

- **Lazy rendering**: Articles only render when chapter is expanded
- **Efficient state**: Set-based collapsed tracking
- **Optimized re-renders**: React.memo where applicable
- **Database queries**: Cached with react-query

## Browser Compatibility

- ✓ Chrome/Edge (latest)
- ✓ Firefox (latest)
- ✓ Safari (latest)
- ✓ Mobile browsers (iOS Safari, Chrome Mobile)
