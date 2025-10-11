# Article-Based View Testing Guide

## Test Scenarios

### Scenario 1: Basic Article-Based View

**Setup:**
1. Create an Excel file with the following structure:

```
| ARTIGO | DESCRIÇÃO                    | UN  | QT  |
|--------|------------------------------|-----|-----|
| 1      | Trabalhos Preliminares       |     |     |
| 1.1    | Limpeza do terreno           |     |     |
|        | Limpeza geral do local       |     |     |
| 1.1.1  | Remoção de entulho           | m3  | 50  |
| 1.1.2  | Capina manual                | m2  | 100 |
| 1.2    | Demolições                   |     |     |
| 1.2.1  | Demolição de paredes         | m2  | 25  |
| 2      | Fundações                    |     |     |
| 2.1    | Escavações                   |     |     |
| 2.1.1  | Escavação manual             | m3  | 30  |
```

**Expected Result:**
- 3 tabs created: Principal, Arquitetura, Instalações Especiais
- Under "Principal" tab:
  - Chapter "1. Trabalhos Preliminares" with 2 article pages
  - Chapter "2. Fundações" with 1 article page
- Article "1.1" contains:
  - Text: "Limpeza geral do local"
  - Item table with 2 rows (1.1.1 and 1.1.2)
- Article "1.2" contains:
  - Item table with 1 row (1.2.1)
- Article "2.1" contains:
  - Item table with 1 row (2.1.1)

**Steps:**
1. Upload the Excel file
2. Enable "Article-based view" toggle
3. Click "Analyze"
4. Wait for analysis to complete
5. Verify tabs are created
6. Verify chapter boxes appear
7. Verify article page boxes (4 per row layout)
8. Click on article "1.1"
9. Verify modal opens with title "1.1 - Limpeza do terreno"
10. Verify text row appears
11. Verify item table appears with correct data

### Scenario 2: Multiple Sheets

**Setup:**
Create an Excel file with 3 sheets:
- Sheet1: Contains chapter 1 with articles
- Sheet2: Contains chapter 2 with articles
- Sheet3: Contains chapter 3 with articles

**Expected Result:**
- All sheets are processed
- All chapters appear in the "Principal" tab
- Articles from all sheets are accessible

**Steps:**
1. Upload multi-sheet Excel file
2. Enable "Article-based view" toggle
3. Click "Analyze"
4. Verify all chapters from all sheets appear
5. Verify articles can be clicked and viewed

### Scenario 3: Text-Heavy Articles

**Setup:**
Create an Excel file with articles containing multiple text rows:

```
| ARTIGO | DESCRIÇÃO                           | UN  | QT  |
|--------|-------------------------------------|-----|-----|
| 1      | Chapter Name                        |     |     |
| 1.1    | Article with lots of text           |     |     |
|        | First paragraph of description      |     |     |
|        | Second paragraph of description     |     |     |
|        | Third paragraph of description      |     |     |
| 1.1.1  | Item after text                     | un  | 10  |
|        | More text after the item            |     |     |
|        | Even more text                      |     |     |
| 1.1.2  | Another item                        | m2  | 50  |
```

**Expected Result:**
- Article "1.1" modal shows:
  - 3 text paragraphs
  - Item table with 1 row (1.1.1)
  - 2 more text paragraphs
  - Item table with 1 row (1.1.2)
- Content order is preserved

**Steps:**
1. Upload the Excel file
2. Enable "Article-based view" toggle
3. Click "Analyze"
4. Click on article "1.1"
5. Verify all text rows appear in order
6. Verify item tables appear in correct positions

### Scenario 4: Items Without Text

**Setup:**
Create articles with only items (no text rows):

```
| ARTIGO | DESCRIÇÃO              | UN  | QT  |
|--------|------------------------|-----|-----|
| 1      | Chapter                |     |     |
| 1.1    | Article Title          |     |     |
| 1.1.1  | Item 1                 | m2  | 100 |
| 1.1.2  | Item 2                 | un  | 5   |
| 1.1.3  | Item 3                 | kg  | 50  |
```

**Expected Result:**
- Article "1.1" modal shows:
  - One item table with 3 rows
  - No text rows

**Steps:**
1. Upload the Excel file
2. Enable "Article-based view" toggle
3. Click "Analyze"
4. Click on article "1.1"
5. Verify item table appears with all 3 items

### Scenario 5: Mixed Content Order

**Setup:**
Test various ordering of text and items:

```
| ARTIGO | DESCRIÇÃO              | UN  | QT  |
|--------|------------------------|-----|-----|
| 1      | Chapter                |     |     |
| 1.1    | Article                |     |     |
| 1.1.1  | Item first             | m2  | 100 |
|        | Text after item        |     |     |
| 1.1.2  | Another item           | un  | 5   |
|        | Text after second item |     |     |
|        | More text              |     |     |
| 1.1.3  | Third item             | kg  | 50  |
```

**Expected Result:**
- Article "1.1" modal shows content in this order:
  1. Item table with 1 row (1.1.1)
  2. Text: "Text after item"
  3. Item table with 1 row (1.1.2)
  4. Text: "Text after second item"
  5. Text: "More text"
  6. Item table with 1 row (1.1.3)

### Scenario 6: Standard View vs Article-Based View

**Setup:**
Same Excel file analyzed twice

**Steps:**
1. Upload Excel file
2. First analysis: DON'T enable "Article-based view"
3. Click "Analyze"
4. Verify standard table view appears
5. Delete the analysis (delete file and re-upload)
6. Second analysis: ENABLE "Article-based view"
7. Click "Analyze"
8. Verify article-based view appears with page boxes

**Expected Result:**
- Standard view shows expandable chapters with item tables
- Article-based view shows chapter boxes with article page grids

### Scenario 7: Empty Articles

**Setup:**
Create articles with no content between them:

```
| ARTIGO | DESCRIÇÃO              | UN  | QT  |
|--------|------------------------|-----|-----|
| 1      | Chapter                |     |     |
| 1.1    | Empty Article          |     |     |
| 1.2    | Another Article        |     |     |
| 1.2.1  | Item in 1.2            | m2  | 100 |
```

**Expected Result:**
- Article "1.1" appears as a page box but has no content in modal
- Article "1.2" has one item in the modal

### Scenario 8: Special Characters in Text

**Setup:**
Include special characters, line breaks, and formatting:

```
| ARTIGO | DESCRIÇÃO                        | UN  | QT  |
|--------|----------------------------------|-----|-----|
| 1      | Chapter                          |     |     |
| 1.1    | Article with Special Chars       |     |     |
|        | Text with "quotes" and 'quotes'  |     |     |
|        | Text with numbers: 123, 456      |     |     |
|        | Text with symbols: €, $, %       |     |     |
```

**Expected Result:**
- All special characters are displayed correctly
- No encoding issues

## UI Testing

### Visual Layout Tests

1. **Page Grid Responsiveness:**
   - Desktop: Verify 4 columns
   - Tablet: Verify 3 columns (md breakpoint)
   - Mobile: Verify 1-2 columns (sm breakpoint)

2. **Modal Behavior:**
   - Verify modal opens on article click
   - Verify modal closes on X button
   - Verify modal closes on outside click
   - Verify modal scrolls when content is long

3. **Toggle Behavior:**
   - Verify toggle appears before analysis
   - Verify toggle disappears after analysis
   - Verify toggle state is independent of "Treat as single sheet"

4. **Tab Behavior:**
   - Verify 3 tabs always created in article-based view
   - Verify tab switching works correctly
   - Verify correct chapters appear in each tab

### Edge Cases

1. **No Articles Found:**
   - Excel file has chapters but no articles (only items like 1.1.1)
   - Expected: Standard view fallback or empty state message

2. **Very Long Article Titles:**
   - Article title exceeds 3 lines
   - Expected: Title is truncated with ellipsis in page box

3. **Many Articles (50+):**
   - Chapter contains 50+ articles
   - Expected: Grid layout handles large number of articles, scrolling works

4. **Articles with Many Items (100+):**
   - Single article has 100+ items
   - Expected: Modal scrolls, performance is acceptable

## Performance Testing

1. **Large Excel Files:**
   - Test with Excel file containing 10+ sheets
   - Test with 100+ articles total
   - Test with 1000+ items total
   - Verify analysis completes in reasonable time (<30 seconds)

2. **Modal Performance:**
   - Test opening modals with large content
   - Verify smooth scrolling
   - Verify no lag when switching between articles

## Browser Testing

Test in:
- Chrome
- Firefox
- Safari
- Edge

Verify:
- Toggle works
- Modal opens/closes
- Grid layout displays correctly
- Scrolling works
- sessionStorage persists data

## Known Issues / Limitations

1. Articles with more than one dot (e.g., "1.1.1") are NOT treated as articles
2. SessionStorage is cleared when browser closes (data is temporary)
3. No export feature for article-based view yet
4. No search within articles yet

## Bug Reports

If you encounter issues, please report:
1. Excel file structure (sample)
2. Steps to reproduce
3. Expected vs actual result
4. Browser and version
5. Console errors (if any)
