# Quick Testing Guide - Sheet Order Fix

## Test Case 1: Multi-Sheet Excel File ✅

### Prerequisites
- Excel file with 3+ sheets in a specific order (e.g., "Sheet1", "Sheet2", "Sheet3")
- Each sheet should have chapters and articles

### Steps
1. Navigate to an Orcamento (budget) page
2. Upload the multi-sheet Excel file
3. Enable the "Article-based view" toggle
4. Click "Analyze" button
5. Wait for analysis to complete

### Expected Results
✅ Analysis completes successfully
✅ Three tabs created: Principal, Arquitetura, Instalações Especiais
✅ Principal tab shows all content
✅ Sheet separators appear in the correct order matching the Excel file
✅ Each chapter appears under its correct sheet separator
✅ Articles are grouped within their chapters
✅ Items are grouped within their articles

### Verification Points
- Check that sheet separator order matches the Excel sheet order (Sheet1 → Sheet2 → Sheet3)
- Verify that chapters from Sheet1 appear under the "📄 Sheet1" separator
- Verify that chapters from Sheet2 appear under the "📄 Sheet2" separator
- Verify that chapters from Sheet3 appear under the "📄 Sheet3" separator

---

## Test Case 2: Single-Sheet Excel File ✅

### Prerequisites
- Excel file with only 1 sheet
- Sheet should have chapters and articles

### Steps
1. Navigate to an Orcamento (budget) page
2. Upload the single-sheet Excel file
3. Enable the "Article-based view" toggle
4. Click "Analyze" button
5. Wait for analysis to complete

### Expected Results
✅ Analysis completes successfully
✅ Three tabs created: Principal, Arquitetura, Instalações Especiais
✅ Principal tab shows all content
✅ **No sheet separators** (not needed for single sheet)
✅ Chapters and articles display normally

### Verification Points
- No sheet separators should be visible (they only appear for 2+ sheets)
- All content should flow naturally without extra visual breaks

---

## Test Case 3: Re-ordering Verification ✅

### Prerequisites
- Excel file with sheets in a specific order (e.g., "Budget", "Materials", "Labor")

### Steps
1. Upload and analyze the file with article-based view enabled
2. Note the order of sheet separators
3. Refresh the page
4. Check the order again

### Expected Results
✅ Sheet separator order persists after page refresh
✅ Order still matches the original Excel file
✅ Data loads correctly from sessionStorage

### Technical Verification
- Check browser sessionStorage for `sheetOrder_${id}` key
- Verify it contains the correct sheet names in order
- Example: `["Budget", "Materials", "Labor"]`

---

## Test Case 4: Hierarchy Verification ✅

### Setup
Create an Excel file with this structure:
```
Sheet: "Construction"
  Chapter: 1 - Foundation
    Article: 1.1 - Excavation
      Item: 1.1.1 - Site Clearance (with UN and QT)
      Text: "Includes removal of vegetation"
      Item: 1.1.2 - Excavation Work (with UN and QT)
```

### Steps
1. Upload and analyze with article-based view enabled
2. Expand the "Construction" sheet section
3. Expand Chapter 1
4. Expand Article 1.1

### Expected Results
✅ Sheet separator: "📄 Construction"
✅ Below it: Chapter "1. Foundation"
✅ Below that: Article "1.1 - Excavation"
✅ Below that: Item table with rows:
  - 1.1.1 - Site Clearance
  - Text paragraph: "Includes removal of vegetation"
  - 1.1.2 - Excavation Work

### Verification Points
- Hierarchy is visually clear with proper indentation
- Items belong to the correct article
- Article belongs to the correct chapter
- Chapter belongs to the correct sheet separator
- Text comments appear between items where appropriate

---

## Test Case 5: Edge Cases ✅

### Scenario A: Empty Sheets
**Setup:** Excel file with 3 sheets, but Sheet2 has no data
**Expected:** Sheet2 separator should not appear if it has no chapters

### Scenario B: Sheets with Same Name
**Setup:** Excel file with duplicate sheet names (if possible)
**Expected:** Each sheet is processed independently, order preserved

### Scenario C: Special Characters in Sheet Names
**Setup:** Sheets named "Budget (2024)", "Materials & Labor", "Finishes - Final"
**Expected:** All sheets display correctly with full names including special characters

---

## Debugging Tips

### If sheets appear in wrong order:
1. Check browser console for errors
2. Verify `sessionStorage.getItem('sheetOrder_${orcamento_id}')` contains correct order
3. Check that Excel file has sheets in expected order
4. Try re-analyzing the file

### If sheet separators don't appear:
1. Verify "Article-based view" toggle is enabled
2. Check that Excel file has multiple sheets (2+)
3. Verify each sheet has at least one chapter
4. Check browser console for errors during analysis

### If hierarchy seems broken:
1. Verify Excel file structure follows expected format (ARTIGO, DESCRIÇÃO, UN, QT columns)
2. Check that chapter numbers follow pattern (single digit, e.g., "1", "2")
3. Verify article numbers follow pattern (two parts, e.g., "1.1", "2.3")
4. Ensure items follow pattern (three or more parts, e.g., "1.1.1", "2.3.4")

---

## Success Criteria

✅ Sheets appear in correct order matching Excel file
✅ Hierarchy is clear and logical
✅ All content appears in Principal tab
✅ Page refreshes maintain the correct order
✅ No JavaScript errors in console
✅ Build completes successfully
✅ No TypeScript errors
