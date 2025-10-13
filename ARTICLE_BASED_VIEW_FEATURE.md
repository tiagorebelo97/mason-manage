# Article-Based View Feature

## Overview

This feature provides an alternative way to analyze and view Excel files by organizing content into article-based pages. When enabled, the system reads all sheets in the Excel file and presents the data in a more structured, page-like format.

## What is Article-Based View?

Article-Based View is a specialized viewing mode that:
1. Creates one tab per Excel sheet (using sheet names as tab names)
2. Groups content by chapters (pure numbers in ARTIGO column, e.g., "1", "2", "3")
3. Creates "pages" for each article (rows with exactly ONE dot in ARTIGO, e.g., "1.1", "2.3")
4. Captures ALL content between articles, including both text rows and item rows
5. Displays articles as clickable page boxes (4 per row)

## Key Concepts

### Chapter
- Identified by a **pure number** in the ARTIGO column (no dots)
- Example: "1", "2", "10"
- Acts as a container for articles

### Article
- Identified by a number with **exactly ONE dot** in the ARTIGO column
- Example: "1.1", "2.3", "10.5"
- Each article becomes a clickable "page"
- Contains a title (from DESCRIÇÃO column) and content

### Content Types

**Text Rows:**
- Rows without both UN and QT values
- Displayed as regular text paragraphs in the article detail view

**Item Rows:**
- Rows with BOTH UN (unit) and QT (quantity) values
- Displayed as table rows with columns:
  - ARTIGO
  - DESCRIÇÃO
  - UN
  - QT
  - OBSERVAÇÕES EMPREITEIRO

## How to Use

### 1. Enable Article-Based View

Before analyzing an Excel file:
1. Upload your Excel file
2. Check the **"Article-based view"** toggle
3. Click **"Analyze"**

### 2. Navigate the Article-Based View

After analysis:
1. **Tabs at the top**: Each Excel sheet becomes a tab (e.g., "Sheet1", "Sheet2", etc.)
2. **Chapter sections**: Each chapter is displayed as a separate section with header
3. **Articles**: Each article is displayed inline within its chapter, already open and visible
4. **Scroll**: Simply scroll down to view all articles within a chapter

### 3. Article Display

Each article is displayed inline with:
- **Header**: Shows the article number and title (e.g., "1.1 - Article Title")
- **Content**: Displays all content in the order it appears in the Excel:
  - Text rows are shown as paragraphs
  - Item rows (with both UN and QT) are grouped into tables
  - Multiple consecutive items appear in the same table

## Excel File Structure Requirements

For proper extraction, your Excel file should follow this structure:

```
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
|--------|------------------------|-----|------|
| 1      | Chapter Name           |     |      | <- Chapter
| 1.1    | Article Title          |     |      | <- Article starts
|        | Some description text  |     |      | <- Text row
| 1.1.1  | Item description       | m2  | 100  | <- Item row
| 1.1.2  | Another item           | un  | 5    | <- Item row
|        | More text              |     |      | <- Text row
| 1.2    | Next Article           |     |      | <- New article starts
| 1.2.1  | Item in article 1.2    | kg  | 50   | <- Item row
| 2      | Second Chapter         |     |      | <- New chapter
| 2.1    | Article in chapter 2   |     |      | <- Article in new chapter
```

## Technical Details

### Data Extraction

When article-based view is enabled:
1. System processes ALL sheets in the Excel file
2. For each sheet, it:
   - Identifies chapters (ARTIGO = pure number)
   - Identifies articles (ARTIGO = number with one dot)
   - Captures all content between articles
   - Distinguishes between text rows and item rows

### Data Storage

- Articles data is stored in `sessionStorage` with key `articles_{orcamento_id}`
- Data structure:
  ```typescript
  {
    sheet_name: string;
    chapter_number: string;
    artigo: string;
    title: string;
    contents: Array<{
      type: 'text' | 'item';
      data: string | {
        artigo: string;
        descricao: string;
        un: string;
        qt: number;
        observacoes_empreiteiro?: string;
      };
    }>;
  }
  ```

### UI Components

**Chapter Box:**
- Header with chapter number and name
- Contains all articles displayed inline

**Article Display:**
- Each article is shown inline with a border and padding
- Shows article number and title as a header (e.g., "1.1 - Article Title")
- Content is displayed immediately below the header
- No clicking required - all information is visible

**Article Content:**
- Text rows displayed as paragraphs
- Item rows grouped into tables (consecutive items in same table)
- Tables have columns: ARTIGO, DESCRIÇÃO, UN, QT, OBSERVAÇÕES EMPREITEIRO

## Benefits

1. **Better Organization**: Content is grouped by articles rather than scattered in tables
2. **Complete Context**: All content between articles is preserved and displayed
3. **Immediate Visibility**: No need to click - all articles are already open and visible
4. **Efficient Tables**: Items with UN and QT are grouped together in tables
5. **Flexible Content**: Supports both text descriptions and structured item data

## Comparison with Standard View

| Feature | Standard View | Article-Based View |
|---------|--------------|-------------------|
| Tab Creation | From sheet names or 3 default tabs | One tab per Excel sheet |
| Content Grouping | By chapters | By chapters and articles |
| Item Display | Table of all items per chapter | Tables of items grouped within articles |
| Text Rows | Not captured | Captured and displayed |
| Navigation | Expandable chapter sections | Inline article display (scroll to view) |
| Interaction | Click to expand chapters | All content visible, just scroll |

## Limitations

1. Articles must have exactly ONE dot in ARTIGO (e.g., "1.1" yes, "1.1.1" no)
2. Sub-items (e.g., "1.1.1") are treated as items within the parent article
3. The feature requires the ARTIGO and DESCRIÇÃO columns to be present
4. Data is stored in sessionStorage (cleared when browser session ends)

## Future Enhancements

Potential improvements:
- Export article-based view to PDF
- Print individual articles
- Search within articles
- Filter articles by content type
- Bookmark favorite articles
- Support for nested articles (multiple dot levels)
