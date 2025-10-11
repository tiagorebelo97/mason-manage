# Quick Reference: Article Inline Display

## What Changed?

**Articles are now displayed inline** instead of in popup modals.

## How to Use

### 1. Enable Article-Based View
```
Upload Excel → ☑ Article-based view → Analyze
```

### 2. View Articles
After analysis, articles appear inline within chapters:

```
┌─────────────────────────────────────┐
│ Chapter 1. Name                     │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 1.1 - Article Title             │ │
│ │─────────────────────────────────│ │
│ │ Text content...                 │ │
│ │                                 │ │
│ │ [Table with items]              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 1.2 - Article Title             │ │
│ │─────────────────────────────────│ │
│ │ Text content...                 │ │
│ │                                 │ │
│ │ [Table with items]              │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### 3. Navigation
- **Scroll down** to view all articles
- **No clicking** required
- **All content visible** immediately

## Key Features

### ✅ Inline Display
- Articles open automatically within chapters
- No popup modals
- Natural scrolling

### ✅ Item Grouping
Items with both UN and QT are grouped together:

**Example:**
```
┌─────────────────────────────────────────────┐
│ ARTIGO │ DESCRIÇÃO    │ UN │ QT │ OBS      │
├─────────────────────────────────────────────┤
│ 1.1.1  │ Item desc    │ m2 │ 100│ -        │
│ 1.1.2  │ Another item │ un │ 5  │ -        │
│ 1.1.3  │ Third item   │ kg │ 50 │ -        │
└─────────────────────────────────────────────┘
```

All three items appear in **one table** instead of three separate tables.

### ✅ Mixed Content
Articles can contain:
- Text paragraphs
- Tables of items
- Multiple text/table sections

**Example:**
```
┌─────────────────────────┐
│ 1.1 - Article           │
├─────────────────────────┤
│ Introduction text       │
│                         │
│ [Table: Items 1-2]      │
│                         │
│ Middle explanation      │
│                         │
│ [Table: Items 3-5]      │
│                         │
│ Conclusion text         │
└─────────────────────────┘
```

## Differences from Before

| Aspect | Before | After |
|--------|--------|-------|
| **Interaction** | Click to open modal | Auto-displayed inline |
| **Visibility** | One article at a time | All articles visible |
| **Tables** | One table per item | Items grouped in tables |
| **Scrolling** | Modal scrolling | Page scrolling |
| **Printing** | Difficult | Easy |

## Benefits

1. **Faster Access** - No clicking, everything visible
2. **Better Overview** - See all articles at once
3. **Cleaner Layout** - Grouped tables reduce clutter
4. **Easy Printing** - Inline content prints naturally
5. **Natural Flow** - Standard web page experience

## Excel Structure

Your Excel file should follow this structure:

```
| ARTIGO | DESCRIÇÃO         | UN  | QT   |
|--------|-------------------|-----|------|
| 1      | Chapter           |     |      | ← Chapter
| 1.1    | Article Title     |     |      | ← Article (ONE dot)
|        | Some text         |     |      | ← Text row
| 1.1.1  | Item description  | m2  | 100  | ← Item (has UN+QT)
| 1.1.2  | Another item      | un  | 5    | ← Item (has UN+QT)
| 1.2    | Next Article      |     |      | ← New article
| 1.2.1  | Item in article   | kg  | 50   | ← Item (has UN+QT)
```

### Article Detection
- **Article** = ARTIGO with exactly ONE dot (e.g., "1.1", "2.3")
- **Item** = Row with BOTH UN and QT values
- **Text** = Row without UN or QT

## Tips

### For Best Results
1. Use clear article numbers (1.1, 1.2, etc.)
2. Add descriptive text between items
3. Group related items in same article
4. Keep article titles concise but descriptive

### Navigation
- Use browser search (Ctrl+F) to find specific articles
- Use tabs to switch between Principal/Arquitetura/Instalações Especiais
- Scroll naturally through the page

### Printing
- Print directly from browser
- All articles will print continuously
- Tables maintain proper formatting
- Chapter breaks are preserved

## Troubleshooting

### Q: Articles not appearing?
**A:** Check:
- ✓ "Article-based view" toggle is enabled
- ✓ ARTIGO column has numbers with ONE dot (1.1, 2.3)
- ✓ File analysis completed successfully

### Q: Items not grouping?
**A:** Items group only if:
- ✓ They have both UN and QT values
- ✓ They are consecutive (no text rows between them)
- ✓ They belong to same article

### Q: Text not showing?
**A:** Text rows are:
- ✓ Rows without ARTIGO (or with ARTIGO but no UN/QT)
- ✓ Between or within articles
- ✓ Should appear as paragraphs

## Support

For issues or questions:
1. Check the ARTICLE_BASED_VIEW_FEATURE.md documentation
2. Review ARTICLE_INLINE_DISPLAY_UPDATE.md for technical details
3. See ARTICLE_DISPLAY_VISUAL_COMPARISON.md for visual examples

## Summary

**Old Way:**
```
See boxes → Click → Modal opens → View → Close → Repeat
```

**New Way:**
```
See everything → Just scroll
```

**Result:** Faster, cleaner, more intuitive! 🎉
