# Quick Test Guide - Multi-Sheet Excel Fix

## What Was Fixed
The system now correctly handles multi-sheet Excel files when using article-based view mode.

## How to Test

### Test Case 1: Multi-Sheet Excel File with Article-Based View ✨ (FIXED)

**Setup**:
1. Prepare an Excel file with 2+ sheets (e.g., "Sheet1", "Sheet2", "Sheet3")
2. Each sheet should have chapters and items in the standard format:
   - ARTIGO column with chapter numbers (e.g., "1", "2", "3")
   - ARTIGO column with article numbers (e.g., "1.1", "2.1", "3.1")
   - ARTIGO column with item numbers (e.g., "1.1.1", "2.1.1")
   - DESCRIÇÃO column with descriptions
   - UN and QT columns for items

**Steps**:
1. Navigate to Mapa de Quantidades page
2. Upload the multi-sheet Excel file
3. ✅ Enable "Article-based view" checkbox
4. Click "Analyze"

**Expected Result (FIXED)** ✓:
- ✅ Analysis completes successfully (no "Failed to analyze file" error)
- ✅ 3 tabs created: "Principal", "Arquitetura", "Instalações Especiais"
- ✅ "Principal" tab shows all articles from ALL sheets
- ✅ Articles are properly organized by chapters
- ✅ All items are correctly linked to their chapters
- ✅ No data loss from any sheet

**Before Fix** ❌:
- ❌ Analysis failed with error
- ❌ Only data from first sheet was captured
- ❌ Data from Sheet2, Sheet3, etc. was lost

---

### Test Case 2: Single-Sheet Excel File with Article-Based View (Unchanged)

**Setup**:
1. Prepare an Excel file with 1 sheet
2. Sheet should have chapters and items

**Steps**:
1. Navigate to Mapa de Quantidades page
2. Upload the single-sheet Excel file
3. ✅ Enable "Article-based view" checkbox
4. Click "Analyze"

**Expected Result** ✓:
- ✅ Analysis completes successfully
- ✅ 3 tabs created: "Principal", "Arquitetura", "Instalações Especiais"
- ✅ "Principal" tab shows all articles
- ✅ All items correctly linked

---

### Test Case 3: Multi-Sheet Excel File WITHOUT Article-Based View (Unchanged)

**Setup**:
1. Prepare an Excel file with 2+ sheets

**Steps**:
1. Navigate to Mapa de Quantidades page
2. Upload the multi-sheet Excel file
3. ❌ Disable "Article-based view" checkbox (or leave it unchecked)
4. Click "Analyze"

**Expected Result** ✓:
- ✅ Analysis completes successfully
- ✅ Tabs created from sheet names (e.g., "Sheet1", "Sheet2", "Sheet3")
- ✅ Each tab shows data from its corresponding sheet
- ✅ All items correctly linked

---

### Test Case 4: "Treat as single sheet" Mode (Unchanged)

**Setup**:
1. Prepare an Excel file with 2+ sheets

**Steps**:
1. Navigate to Mapa de Quantidades page
2. Upload the multi-sheet Excel file
3. ✅ Enable "Treat as single sheet" checkbox
4. ❌ Disable "Article-based view" checkbox
5. Click "Analyze"

**Expected Result** ✓:
- ✅ Analysis completes successfully
- ✅ 3 tabs created: "Principal", "Arquitetura", "Instalações Especiais"
- ✅ "Principal" tab shows all data from all sheets
- ✅ All items correctly linked

---

## Key Indicators of Success

### Database Integrity ✓
- No foreign key constraint violations
- All chapters have valid `tab_id`
- All items have valid `chapter_id`

### Data Completeness ✓
- No data loss from any sheet
- All chapters from all sheets are captured
- All items from all sheets are captured

### UI Display ✓
- Correct tabs are created based on mode
- Data is properly organized and visible
- No errors in console logs

### Backward Compatibility ✓
- Single-sheet files work as before
- Multi-sheet files in normal mode work as before
- No breaking changes to existing functionality

---

## Example Test Data Structure

### Excel File: "test-multisheet.xlsx"

**Sheet1**:
```
ARTIGO  DESCRIÇÃO                     UN    QT
1       Trabalhos Preliminares        -     -
1.1     Demolição                     -     -
1.1.1   Demolir parede               m²    50
1.1.2   Remover entulho              m³    10
```

**Sheet2**:
```
ARTIGO  DESCRIÇÃO                     UN    QT
2       Estrutura                     -     -
2.1     Fundações                     -     -
2.1.1   Escavação                    m³    100
2.1.2   Betão de limpeza             m³    5
```

**Sheet3**:
```
ARTIGO  DESCRIÇÃO                     UN    QT
3       Acabamentos                   -     -
3.1     Pintura                       -     -
3.1.1   Pintar paredes               m²    200
3.1.2   Pintar tetos                 m²    150
```

**Expected Result (Article-Based View)** ✓:
- Principal tab contains 3 chapters: 1, 2, 3
- Chapter 1 has 2 articles: 1.1
  - Article 1.1 has 2 items: 1.1.1, 1.1.2
- Chapter 2 has 1 article: 2.1
  - Article 2.1 has 2 items: 2.1.1, 2.1.2
- Chapter 3 has 1 article: 3.1
  - Article 3.1 has 2 items: 3.1.1, 3.1.2

---

## Troubleshooting

### If you see "Failed to analyze file" error:
1. Check browser console for specific error messages
2. Verify the Excel file follows the expected format
3. Check database logs for constraint violations

### If data from some sheets is missing:
1. Verify all sheets have the required columns (ARTIGO, DESCRIÇÃO)
2. Check if the sheet names are correct
3. Review the console logs for processing details

### If items are not linked to chapters:
1. Verify chapter numbers match between sheets
2. Check if the ARTIGO format is correct (e.g., "1", "1.1", "1.1.1")
3. Review the console logs for chapter mapping details
