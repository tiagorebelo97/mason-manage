# Article Inline Display Update

## Summary

Updated the article-based view to display articles inline within chapters instead of using clickable page boxes with popup modals. Articles are now always visible and items with UN and QT are grouped into tables.

## What Changed

### Before
- Articles were displayed as small clickable boxes in a 4-column grid
- Clicking an article box opened a modal dialog with the article content
- Each item row created a separate table with just one row
- Users had to click to see article content

### After
- Articles are displayed inline directly within the chapter
- All article content is immediately visible (no clicking required)
- Consecutive item rows are grouped into a single table
- Users can simply scroll to view all articles

## Technical Changes

### File Modified
- `src/pages/MapaQuantidades.tsx`

### Key Changes

1. **Removed Dialog Components**
   - Removed `Dialog`, `DialogTrigger`, and `DialogContent` wrappers
   - Articles are now direct children of the chapter container

2. **Inline Article Display**
   - Each article has a bordered container with padding
   - Article header shows the artigo number and title
   - Content is displayed immediately below the header

3. **Item Grouping**
   - Added logic to group consecutive item rows
   - Items are accumulated until a text row is encountered
   - All accumulated items are rendered in a single table
   - This reduces visual clutter and improves readability

4. **Visual Structure**
   ```
   Chapter
   ├── Article 1
   │   ├── Header (1.1 - Title)
   │   ├── Text content (if any)
   │   ├── Table with items (if any)
   │   └── More text/tables...
   ├── Article 2
   │   ├── Header (1.2 - Title)
   │   └── Content...
   └── ...
   ```

## Code Structure

### Content Grouping Logic
The implementation uses a grouping algorithm that:
1. Iterates through article contents
2. Accumulates consecutive items into a group
3. When a text row is encountered, pushes the item group and adds the text
4. Renders grouped items as a single table with multiple rows

### Example
**Before:**
- Item 1.1.1 → Separate table
- Item 1.1.2 → Separate table  
- Item 1.1.3 → Separate table

**After:**
- Items 1.1.1, 1.1.2, 1.1.3 → Single table with 3 rows

## User Benefits

1. **No Interaction Required**: All content is visible immediately
2. **Better Overview**: See all articles and their structure at once
3. **Easier Scrolling**: Natural top-to-bottom reading flow
4. **Cleaner Tables**: Grouped items reduce visual clutter
5. **Print-Friendly**: Inline display is better for printing

## UI/UX Improvements

### Visual Hierarchy
- Chapter header (bg-muted, large font)
  - Article container (border, padding)
    - Article header (border-bottom, primary color)
    - Article content (tables and text)

### Spacing
- 8 spacing units between articles
- 4 spacing units within article content
- Proper padding around all containers

### Responsive Design
- Works on all screen sizes
- Tables are scrollable on small screens
- Maintains readability on mobile devices

## Testing Scenarios

### Scenario 1: Article with Only Items
```
Article 1.1 - Title
┌─────────────────────────────┐
│ ARTIGO │ DESC │ UN │ QT    │
├─────────────────────────────┤
│ 1.1.1  │ ...  │ m2 │ 100   │
│ 1.1.2  │ ...  │ un │ 5     │
│ 1.1.3  │ ...  │ kg │ 50    │
└─────────────────────────────┘
```

### Scenario 2: Article with Text and Items
```
Article 1.2 - Title

Text description here

┌─────────────────────────────┐
│ ARTIGO │ DESC │ UN │ QT    │
├─────────────────────────────┤
│ 1.2.1  │ ...  │ m2 │ 30    │
│ 1.2.2  │ ...  │ un │ 10    │
└─────────────────────────────┘

More text here
```

### Scenario 3: Article with Mixed Content
```
Article 1.3 - Title

Initial description

┌─────────────────────────────┐
│ ARTIGO │ DESC │ UN │ QT    │
├─────────────────────────────┤
│ 1.3.1  │ ...  │ m2 │ 100   │
└─────────────────────────────┘

Middle text

┌─────────────────────────────┐
│ ARTIGO │ DESC │ UN │ QT    │
├─────────────────────────────┤
│ 1.3.2  │ ...  │ un │ 5     │
│ 1.3.3  │ ...  │ kg │ 50    │
└─────────────────────────────┘
```

## Migration Notes

- No database changes required
- No changes to data extraction logic
- Only UI rendering was modified
- Backward compatible with existing article data

## Performance Considerations

- Inline display may use more initial rendering time
- Better than modal approach for articles with many items
- No lazy loading (all articles render at once)
- Consider virtualization if performance issues arise with large datasets

## Future Enhancements

Potential improvements:
- Collapsible articles (optional)
- Jump-to-article navigation
- Article-specific actions (edit, export, etc.)
- Search within articles
- Highlight/bookmark functionality
