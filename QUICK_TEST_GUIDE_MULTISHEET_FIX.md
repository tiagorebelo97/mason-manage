# Quick Test Guide: Multi-Sheet Duplicate Chapter/Article Fix

## Test Case 1: Multi-Sheet with Duplicate Chapter Numbers ✅

### Setup
1. Create an Excel file named `test-multisheet-duplicate.xlsx` with 2 sheets

**Sheet1**:
```
| ARTIGO | DESCRIÇÃO              | UN | QT |
|--------|------------------------|----|----|
| 1      | Foundation Work        |    |    |
| 1.1    | Excavation             | m3 | 10 |
| 1.2    | Concrete               | m3 | 20 |
| 2      | Masonry                |    |    |
| 2.1    | Brick Wall             | m2 | 50 |
```

**Sheet2**:
```
| ARTIGO | DESCRIÇÃO              | UN | QT |
|--------|------------------------|----|----|
| 1      | Steel Structure        |    |    |
| 1.1    | Steel Frame            | kg | 100|
| 1.2    | Connections            | un | 15 |
| 2      | Roofing                |    |    |
| 2.1    | Metal Sheets           | m2 | 80 |
```

### Steps
1. Navigate to Mapa de Quantidades page
2. Upload the Excel file
3. ✅ Enable "Article-based view" checkbox
4. Click "Analyze"

### Expected Results
- ✅ Analysis completes successfully (no "Failed to analyze file" error)
- ✅ Sheet separator appears: "📄 Sheet1"
- ✅ Chapter displays as "1. Foundation Work" (not "Sheet1_1. Foundation Work")
- ✅ Article displays as "1.1 - Excavation" (not "Sheet1_1.1 - Excavation")
- ✅ Items in table show "1.1" (not "Sheet1_1.1")
- ✅ Sheet separator appears: "📄 Sheet2"
- ✅ Chapter displays as "1. Steel Structure" (not "Sheet2_1. Steel Structure")
- ✅ Article displays as "1.1 - Steel Frame" (not "Sheet2_1.1 - Steel Frame")
- ✅ Items in table show "1.1" (not "Sheet2_1.1")
- ✅ All content is properly organized by sheet

### Database Verification
```sql
-- Check chapters are stored with prefixes
SELECT chapter_number, chapter_name FROM orcamento_chapters 
WHERE orcamento_id = '<your_id>';

-- Expected results:
-- Sheet1_1 | Foundation Work
-- Sheet1_2 | Masonry
-- Sheet2_1 | Steel Structure
-- Sheet2_2 | Roofing
```

---

## Test Case 2: Single-Sheet Article-Based View ✅

### Setup
Create an Excel file with 1 sheet:

**Sheet1**:
```
| ARTIGO | DESCRIÇÃO              | UN | QT |
|--------|------------------------|----|----|
| 1      | Foundation Work        |    |    |
| 1.1    | Excavation             | m3 | 10 |
| 2      | Masonry                |    |    |
| 2.1    | Brick Wall             | m2 | 50 |
```

### Steps
1. Upload the Excel file
2. Enable "Article-based view"
3. Click "Analyze"

### Expected Results
- ✅ Analysis completes successfully
- ✅ NO sheet separator (only one sheet)
- ✅ Chapter displays as "1. Foundation Work" (no prefix)
- ✅ Article displays as "1.1 - Excavation" (no prefix)
- ✅ Items show "1.1" (no prefix)

### Database Verification
```sql
-- Check chapters are stored WITHOUT prefixes
SELECT chapter_number, chapter_name FROM orcamento_chapters 
WHERE orcamento_id = '<your_id>';

-- Expected results:
-- 1 | Foundation Work
-- 2 | Masonry
```

---

## Test Case 3: Multi-Sheet Normal View (Not Article-Based) ✅

### Setup
Use the same multi-sheet file from Test Case 1

### Steps
1. Upload the Excel file
2. ❌ Leave "Article-based view" DISABLED
3. Click "Analyze"

### Expected Results
- ✅ Analysis completes successfully
- ✅ Two tabs are created: "Sheet1", "Sheet2"
- ✅ Each tab shows its chapters independently
- ✅ Chapters stored as "1", "2" (no prefix needed because different tab_id)
- ✅ No conflicts (different tab_id values)

---

## Test Case 4: Three Sheets with Same Chapter Numbers ✅

### Setup
Create Excel with 3 sheets, all with Chapter 1:

**Sheet1**: Chapter 1 - "Foundation"
**Sheet2**: Chapter 1 - "Structure"
**Sheet3**: Chapter 1 - "Finishes"

### Steps
1. Upload the Excel file
2. Enable "Article-based view"
3. Click "Analyze"

### Expected Results
- ✅ All 3 sheets analyzed successfully
- ✅ Three sheet separators: "📄 Sheet1", "📄 Sheet2", "📄 Sheet3"
- ✅ All chapters display as "1. [Name]"
- ✅ Database stores as "Sheet1_1", "Sheet2_1", "Sheet3_1"

---

## Test Case 5: Mixed Chapter Numbers ✅

### Setup
**Sheet1**:
```
| ARTIGO | DESCRIÇÃO     |
|--------|---------------|
| 1      | Chapter 1     |
| 2      | Chapter 2     |
| 3      | Chapter 3     |
```

**Sheet2**:
```
| ARTIGO | DESCRIÇÃO     |
|--------|---------------|
| 2      | Chapter 2     | ← Same as Sheet1 Chapter 2
| 3      | Chapter 3     | ← Same as Sheet1 Chapter 3
| 4      | Chapter 4     |
```

### Steps
1. Upload and enable "Article-based view"
2. Analyze

### Expected Results
- ✅ All chapters analyzed successfully
- ✅ Sheet1 has: "1. Chapter 1", "2. Chapter 2", "3. Chapter 3"
- ✅ Sheet2 has: "2. Chapter 2", "3. Chapter 3", "4. Chapter 4"
- ✅ Database: "Sheet1_1", "Sheet1_2", "Sheet1_3", "Sheet2_2", "Sheet2_3", "Sheet2_4"
- ✅ No conflicts

---

## Verification Checklist

### UI Checks
- [ ] Chapter numbers display without sheet prefix (e.g., "1" not "Sheet1_1")
- [ ] Article numbers display without sheet prefix (e.g., "1.1" not "Sheet1_1.1")
- [ ] Item ARTIGO displays without sheet prefix in tables
- [ ] Sheet separators show for multi-sheet files
- [ ] No sheet separators for single-sheet files
- [ ] Collapsible chapters work correctly
- [ ] Collapsible articles work correctly

### Database Checks
- [ ] Chapters have prefixed chapter_number when needed
- [ ] No UNIQUE constraint violations
- [ ] Items have prefixed artigo when needed
- [ ] Articles in sessionStorage have prefixed chapter_number
- [ ] Articles in sessionStorage have prefixed artigo

### Functionality Checks
- [ ] Analysis completes without errors
- [ ] All sheets are processed
- [ ] All chapters are displayed
- [ ] All articles are displayed
- [ ] All items are displayed in tables
- [ ] Article grouping works correctly
- [ ] Move chapter functionality still works
- [ ] Specialities can be assigned
- [ ] Comments are preserved

---

## Debugging Tips

### If analysis fails:
1. Check browser console for error messages
2. Look for "Failed to analyze file" toast
3. Check database constraints
4. Verify needsSheetPrefix is calculated correctly

### If display shows prefixes (e.g., "Sheet1_1"):
1. Check if displayNumber() is called in the render
2. Verify displayNumber() logic is correct
3. Check if the value being passed contains underscore

### If articles don't appear:
1. Check sessionStorage for `articles_<id>`
2. Verify article grouping uses prefixed chapter_number
3. Check if chapters have matching chapter_number values
4. Verify article contents are populated

### If sheet separators don't appear:
1. Check if there are multiple sheets in the Excel file
2. Verify `chaptersBySheet` Map has multiple entries
3. Check if `chaptersBySheet.size > 1` condition is met

---

## Success Criteria

✅ No "Failed to analyze file" errors
✅ All sheets processed and displayed
✅ Chapters display with clean numbers (no sheet prefix)
✅ Articles display with clean numbers (no sheet prefix)
✅ Items display with clean numbers (no sheet prefix)
✅ Sheet separators appear for multi-sheet files
✅ Database has no UNIQUE constraint violations
✅ Article grouping works correctly
✅ All existing functionality preserved
