# Testing Guide: Non-Numeric ARTIGO Comments

## Overview

This guide provides step-by-step instructions for testing the non-numeric ARTIGO comments feature.

## Prerequisites

- Access to the Mason Manage application
- Ability to create and upload Excel files
- Access to a budget/orcamento

## Test 1: Chapter Comment with Text ARTIGO

### Objective
Verify that rows with non-numeric ARTIGO values before the first item are added to chapter comments.

### Steps

1. **Create Test Excel File**

   Create an Excel file with this structure:
   
   | ARTIGO | DESCRIÇÃO           | UN | QT |
   |--------|---------------------|----|----| 
   | 1      | Trabalhos           |    |    |
   | Note   | Important info      |    |    |
   | A      | Additional detail   |    |    |
   | 1.1    | First item          | m2 | 50 |
   | 1.2    | Second item         | m2 | 30 |

2. **Upload and Analyze**
   - Navigate to a budget
   - Upload the Excel file
   - Click "Analyze File"
   - Wait for analysis to complete

3. **Verify Chapter Comments**
   - Find Chapter "1" (Trabalhos) in the UI
   - Click to expand or view chapter details
   - Check the chapter comments field
   
   **Expected Result:**
   ```
   Important info
   Additional detail
   ```

4. **Verify Items**
   - Check that items "1.1" and "1.2" were created correctly
   - Verify they have no item comments (only chapter has comments)

### Success Criteria
✅ Chapter "1" has comments: "Important info\nAdditional detail"
✅ Items created without individual comments
✅ No data loss

---

## Test 2: Post-Item Comment with Text ARTIGO

### Objective
Verify that rows with non-numeric ARTIGO values after items are appended to the previous item's comments.

### Steps

1. **Create Test Excel File**

   Create an Excel file with this structure:
   
   | ARTIGO | DESCRIÇÃO           | UN | QT |
   |--------|---------------------|----|----| 
   | 1      | Trabalhos           |    |    |
   | 1.1    | First item          | m2 | 50 |
   | Note   | Item note 1         |    |    |
   | INFO   | Item note 2         |    |    |
   | 1.2    | Second item         | m2 | 30 |
   | AVISO  | Second item note    |    |    |

2. **Upload and Analyze**
   - Upload the file
   - Click "Analyze File"
   - Wait for completion

3. **Verify Item 1.1 Comments**
   - Find item "1.1" in the table
   - Hover over the comments icon or expand the item
   - Check the item_comments field
   
   **Expected Result:**
   ```
   Item note 1
   Item note 2
   ```

4. **Verify Item 1.2 Comments**
   - Find item "1.2" in the table
   - Check the item_comments field
   
   **Expected Result:**
   ```
   Second item note
   ```

### Success Criteria
✅ Item "1.1" has comments: "Item note 1\nItem note 2"
✅ Item "1.2" has comments: "Second item note"
✅ Chapter "1" has no comments (no comments before first item)

---

## Test 3: Mix of Parent Comments and Text ARTIGO

### Objective
Verify that the feature works correctly alongside existing parent comment patterns.

### Steps

1. **Create Test Excel File**

   Create an Excel file with this structure:
   
   | ARTIGO | DESCRIÇÃO           | UN | QT |
   |--------|---------------------|----|----| 
   | 1      | Trabalhos           |    |    |
   | 1.2    | Demolições          |    |    |
   |        | Incluir entulho     |    |    |
   | 1.2.1  | Paredes             | m2 | 50 |
   | Note   | Post-item note      |    |    |
   | 1.2.2  | Pavimentos          | m2 | 30 |

2. **Upload and Analyze**
   - Upload and analyze the file

3. **Verify Item 1.2.1 Comments**
   - Check item "1.2.1" comments
   
   **Expected Result:**
   ```
   Demolições
   Incluir entulho
   Post-item note
   ```

4. **Verify Item 1.2.2 Comments**
   - Check item "1.2.2" comments
   
   **Expected Result:**
   ```
   Demolições
   Incluir entulho
   ```
   (Gets parent comment but not the post-item note from 1.2.1)

### Success Criteria
✅ Parent comments work as before
✅ Multi-line comments work as before
✅ Post-item notes correctly appended to specific items

---

## Test 4: Edge Case - Text ARTIGO with UN/QT

### Objective
Verify that rows with non-numeric ARTIGO but with UN and QT are treated as items, not comments.

### Steps

1. **Create Test Excel File**

   Create an Excel file with this structure:
   
   | ARTIGO | DESCRIÇÃO           | UN | QT |
   |--------|---------------------|----|----| 
   | 1      | Trabalhos           |    |    |
   | Note   | Special item        | m2 | 50 |
   | 1.1    | Normal item         | m2 | 30 |

2. **Upload and Analyze**

3. **Verify Items Created**
   - Check that TWO items were created
   - First item should have `artigo = "Note"`, `un = "m2"`, `qt = 50`
   - Second item should have `artigo = "1.1"`, `un = "m2"`, `qt = 30`

### Success Criteria
✅ "Note" row created as an ITEM (not a comment)
✅ Item has correct UN and QT values
✅ Second item also created correctly

---

## Test 5: Multiple Text Markers in Sequence

### Objective
Verify handling of multiple consecutive text ARTIGO values.

### Steps

1. **Create Test Excel File**

   Create an Excel file with this structure:
   
   | ARTIGO | DESCRIÇÃO           | UN | QT |
   |--------|---------------------|----|----| 
   | 1      | Trabalhos           |    |    |
   | A      | Note A              |    |    |
   | B      | Note B              |    |    |
   | C      | Note C              |    |    |
   | 1.1    | First item          | m2 | 50 |
   | X      | Post X              |    |    |
   | Y      | Post Y              |    |    |
   | Z      | Post Z              |    |    |
   | 1.2    | Second item         | m2 | 30 |

2. **Upload and Analyze**

3. **Verify Chapter Comments**
   
   **Expected Result:**
   ```
   Note A
   Note B
   Note C
   ```

4. **Verify Item 1.1 Comments**
   
   **Expected Result:**
   ```
   Post X
   Post Y
   Post Z
   ```

5. **Verify Item 1.2**
   - Should have no comments

### Success Criteria
✅ All pre-item text markers added to chapter
✅ All post-item text markers added to previous item
✅ Correct line breaks between comments

---

## Test 6: Backward Compatibility

### Objective
Verify that existing Excel files still work correctly.

### Steps

1. **Test Existing Patterns**

   Create an Excel file with traditional patterns:
   
   | ARTIGO | DESCRIÇÃO           | UN | QT |
   |--------|---------------------|----|----| 
   | 1      | Trabalhos           |    |    |
   |        | Chapter comment     |    |    |
   | 1.2    | Parent comment      |    |    |
   |        | Multi-line          |    |    |
   | 1.2.1  | Item                | m2 | 50 |

2. **Upload and Analyze**

3. **Verify Behavior**
   - Chapter comments work as before (empty ARTIGO)
   - Parent comments work as before (1.2 pattern)
   - Multi-line comments work as before (empty ARTIGO continuation)
   - Items created correctly

### Success Criteria
✅ All existing patterns still work
✅ No regression in functionality

---

## Database Verification (Optional)

For developers with database access:

### Query Chapter Comments
```sql
SELECT chapter_number, chapter_name, chapter_comments 
FROM orcamento_chapters 
WHERE id = '<chapter_id>';
```

### Query Item Comments
```sql
SELECT artigo, descricao, item_comments, un, qt 
FROM orcamento_items 
WHERE chapter_id = '<chapter_id>'
ORDER BY artigo;
```

---

## Troubleshooting

### Issue: Text ARTIGO not appearing in comments

**Check:**
1. Does the row have UN and QT? (If yes, it becomes an item)
2. Is there a chapter defined before the text ARTIGO?
3. Is the DESCRIÇÃO column empty?

### Issue: Comments appearing in wrong place

**Check:**
1. Verify the order of rows in Excel
2. Check if firstItemFoundInChapter flag is set correctly
3. Ensure the chapter number is present

### Issue: Comments not joining with newlines

**Check:**
1. Database field type (should be TEXT)
2. Application rendering (should use `whitespace-pre-line` CSS)

---

## Expected Behavior Summary

| ARTIGO Type | Before First Item | After Item | With UN/QT |
|-------------|------------------|------------|-----------|
| Pure number (1, 2) | Chapter | N/A | N/A |
| Number pattern (1.2) | Parent comment | Parent comment | Item |
| Empty | Chapter comment | Multi-line comment | Item (inherited ARTIGO) |
| Text (Note, A) | **Chapter comment** | **Post-item comment** | **Item** |

---

## Reporting Issues

If you encounter any issues during testing:

1. Note the Excel structure used
2. Capture the actual vs expected results
3. Check the browser console for errors
4. Include the budget/orcamento ID
5. Report with full details for investigation
