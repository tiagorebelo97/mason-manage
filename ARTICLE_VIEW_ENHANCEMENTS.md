# Article-Based View Enhancements

## Overview

This document describes the enhancements made to the article-based view feature in the Mason Manage application.

## Features Implemented

### 1. Sheet Name Separators

**Description**: When an Excel file has multiple sheets and article-based view is enabled, the system now displays sheet name separators in the Principal tab.

**Visual Appearance**:
- Blue-themed banner with left border
- Shows sheet icon (📄) and sheet name
- Only appears when there are multiple sheets

**Example**:
```
┌─────────────────────────────────────────┐
│ 📄 Sheet 1                              │
└─────────────────────────────────────────┘

[Chapters and articles from Sheet 1]

┌─────────────────────────────────────────┐
│ 📄 Sheet 2                              │
└─────────────────────────────────────────┘

[Chapters and articles from Sheet 2]
```

### 2. Comments as Text

**Description**: Rows without ARTIGO, UN, and QT are properly treated as text comments and displayed between articles and items.

**Implementation**:
- Text rows are preserved in the article's content array
- They appear as regular paragraphs (not in tables)
- Respects the original order from the Excel file
- Uses `whitespace-pre-line` to preserve line breaks

### 3. Collapsible Chapters

**Description**: Chapters can now be collapsed/expanded using a chevron icon toggle.

**Features**:
- Click the chevron or chapter header to toggle
- Default state: **expanded** (open)
- Smooth animation on collapse/expand
- Icon rotates to indicate state

### 4. Collapsible Articles

**Description**: Individual articles within chapters can be collapsed/expanded.

**Features**:
- Click anywhere on the article header to toggle
- Chevron icon rotates to indicate state (rotated 90° when collapsed)
- Collapsed state persists during the session
- Independent of chapter collapse state

### 5. Move Chapter to Another Tab

**Description**: Chapters can be moved to different tabs using a side sheet interface.

**How to Use**:
1. Click "Move to tab" button on the chapter header
2. Side sheet opens showing available target tabs
3. Click on a tab name to move the chapter
4. Chapter is immediately moved and view refreshes

**Features**:
- Only available when there are multiple tabs
- Cannot move to the current tab (filtered out)
- Database is updated via mutation
- Success/error toast notifications

### 6. Light Grey Background for Articles

**Description**: Each article has a distinctive light grey background to visually separate them.

**Implementation**:
- Articles use `bg-gray-50` (light mode) and `bg-gray-900` (dark mode)
- Hover effect on article header for better interactivity
- Consistent with the existing design system

## Technical Details

### Data Structure Changes

**Article Type**:
```typescript
type Article = {
  id: string;
  chapter_id: string;
  artigo: string;
  title: string;
  contents: ArticleContent[];
  sheet_name?: string; // NEW: Track original sheet name
};
```

**ChapterWithArticles Type**:
```typescript
type ChapterWithArticles = {
  chapter: OrcamentoChapter;
  articles: Article[];
  sheet_name?: string; // NEW: Track original sheet name
};
```

### New State Variables

```typescript
const [collapsedArticles, setCollapsedArticles] = useState<Set<string>>(new Set());
```

### New Mutations

**moveChapterMutation**:
```typescript
const moveChapterMutation = useMutation({
  mutationFn: async ({ chapterId, newTabId }: { chapterId: string; newTabId: string }) => {
    const { error } = await supabase
      .from('orcamento_chapters')
      .update({ tab_id: newTabId })
      .eq('id', chapterId);
    
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
    toast.success('Chapter moved successfully');
  },
  onError: () => {
    toast.error('Failed to move chapter');
  },
});
```

### New Components Used

- **Sheet** (from shadcn/ui): For the move chapter side panel
- **Collapsible**: For chapter and article expand/collapse functionality

## User Experience

### Multi-Sheet Excel Files

When analyzing a multi-sheet Excel file with article-based view enabled:

1. All sheets are processed and mapped to the Principal tab
2. Sheet separators are displayed to organize content
3. Each sheet's chapters and articles are grouped together
4. Users can see at a glance which content came from which sheet

### Single-Sheet Excel Files

When analyzing a single-sheet Excel file:

1. No sheet separators are shown (not needed)
2. Content flows naturally without extra visual breaks
3. All other features work identically

## Examples

### Excel Structure
```
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
|--------|------------------------|-----|------|
| 1      | Chapter Name           |     |      | <- Chapter
| 1.1    | Article Title          |     |      | <- Article starts
|        | Some description text  |     |      | <- Text row (comment)
| 1.1.1  | Item description       | m2  | 100  | <- Item row
| 1.1.2  | Another item           | un  | 5    | <- Item row
|        | More text              |     |      | <- Text row (comment)
| 1.2    | Next Article           |     |      | <- New article starts
```

### Rendered Output

```
┌─────────────────────────────────────────────────────┐
│ 📄 Sheet Name (if multiple sheets)                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ▼ 1. Chapter Name                    [Move to tab] │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▼ 1.1 - Article Title                          │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Some description text                           │ │
│ │                                                  │ │
│ │ ┌──────────────────────────────────────────┐   │ │
│ │ │ ARTIGO │ DESCRIÇÃO │ UN │ QT │ OBS      │   │ │
│ │ ├────────┼───────────┼────┼────┼──────────┤   │ │
│ │ │ 1.1.1  │ Item desc │ m2 │100 │ -        │   │ │
│ │ │ 1.1.2  │ Another   │ un │ 5  │ -        │   │ │
│ │ └──────────────────────────────────────────┘   │ │
│ │                                                  │ │
│ │ More text                                        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▼ 1.2 - Next Article                           │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Testing

To test these features:

1. **Multi-sheet test**:
   - Upload an Excel file with 2+ sheets
   - Enable "Article-based view"
   - Click "Analyze"
   - Verify sheet separators appear
   - Verify all chapters and articles are displayed

2. **Collapse/Expand test**:
   - Click chapter chevron to collapse/expand
   - Click article header to collapse/expand
   - Verify states are independent
   - Verify icons rotate correctly

3. **Move chapter test**:
   - Click "Move to tab" button
   - Select a different tab
   - Verify chapter moves successfully
   - Verify chapter appears in the new tab

4. **Comments test**:
   - Upload Excel with text rows (no ARTIGO, UN, QT)
   - Verify they appear as text paragraphs
   - Verify they respect the original order
   - Verify they're not in tables

## Compatibility

- Works with existing article-based view feature
- Compatible with single-sheet and multi-sheet Excel files
- Preserves all existing functionality
- No breaking changes to the database schema
- Uses existing UI components from shadcn/ui

## Future Enhancements

Potential improvements for future versions:

1. Remember collapsed states across sessions (localStorage)
2. Bulk collapse/expand all chapters/articles
3. Drag-and-drop to reorder chapters
4. Export feature respecting the visual organization
5. Search within articles
