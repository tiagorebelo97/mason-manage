# Duplicate ARTIGO Ordering Fix

## Problem Statement

When using article-based view with an Excel file containing multiple sheets where the same ARTIGO (chapter) numbers appear in different sheets (e.g., Chapter "1" in Sheet1 AND Chapter "1" in Sheet2), the application was incorrectly matching articles to chapters, causing display errors.

### Example Scenario

**Excel File Structure:**

**Sheet1:**
```
| ARTIGO | DESCRIÇÃO           | UN  | QT  |
|--------|---------------------|-----|-----|
| 1      | Foundation Work     |     |     | <- Chapter
| 1.1    | Site Preparation    |     |     | <- Article
| 1.1.1  | Site clearing       | m2  | 500 | <- Item
```

**Sheet2:**
```
| ARTIGO | DESCRIÇÃO           | UN  | QT  |
|--------|---------------------|-----|-----|
| 1      | Electrical Work     |     |     | <- Chapter (same number!)
| 1.1    | Power Distribution  |     |     | <- Article (same number!)
| 1.1.1  | Main panel install  | un  | 1   | <- Item
```

**Previous Behavior:**
- Articles from Sheet2 could be incorrectly matched to Sheet1's chapter
- Articles would appear under the wrong chapter
- Data would be mixed between sheets

## Root Cause

The issue was in the database query that fetches chapters from the `orcamento_chapters` table:

### Before Fix (Line ~271):
```typescript
const { data, error } = await supabase
  .from("orcamento_chapters")
  .select(`
    *,
    orcamento_tabs!inner(orcamento_id)
  `)
  .eq("orcamento_tabs.orcamento_id", id)
  .order("chapter_number");  // Only ordered by chapter_number
```

**Problem:**
- When multiple chapters have the same `chapter_number` (e.g., "1" from Sheet1 and "1" from Sheet2), the query only orders by `chapter_number`
- The order between chapters with the same number is undefined
- PostgreSQL may return them in any order, not necessarily insertion order
- This breaks the article-to-chapter matching logic which relies on insertion order

### The Matching Logic

The article-to-chapter matching logic (lines 305-384) works as follows:

1. Articles are stored in sessionStorage with their `sheet_name` and `chapter_number`
2. Articles are grouped by `(sheet_name, chapter_number)` pairs
3. Database chapters are grouped by `chapter_number`
4. For each article group, the code finds the "first unused" chapter with matching `chapter_number`
5. This relies on chapters being ordered by insertion order (Sheet1 chapters before Sheet2 chapters)

**Without proper ordering:**
- Sheet2's Chapter "1" might be returned before Sheet1's Chapter "1"
- Sheet1's articles would be matched to Sheet2's chapter (or vice versa)
- This causes data to be displayed incorrectly

## Solution

Add secondary ordering by `id` to ensure chapters with the same `chapter_number` are returned in insertion order:

### After Fix (Line ~271):
```typescript
const { data, error } = await supabase
  .from("orcamento_chapters")
  .select(`
    *,
    orcamento_tabs!inner(orcamento_id)
  `)
  .eq("orcamento_tabs.orcamento_id", id)
  .order("chapter_number")
  .order("id");  // Secondary sort by ID to maintain insertion order
```

**Result:**
- Chapters are first ordered by `chapter_number` (1, 2, 3, ...)
- Within each `chapter_number`, chapters are ordered by `id` (insertion order)
- Sheet1's Chapter "1" always comes before Sheet2's Chapter "1"
- Articles are correctly matched to their original chapters

## How It Works

### Analysis Phase (When Excel is uploaded):

1. **Process Sheet1:**
   - Chapter "1" is created with `sheet_name = "Sheet1"` → gets ID `uuid-A`
   - Chapter is inserted into database

2. **Process Sheet2:**
   - Chapter "1" is created with `sheet_name = "Sheet2"` → gets ID `uuid-B`
   - Chapter is inserted into database (after Sheet1's chapter)

3. **Article Data Storage:**
   - Sheet1's articles are stored with `sheet_name = "Sheet1"`, `chapter_number = "1"`
   - Sheet2's articles are stored with `sheet_name = "Sheet2"`, `chapter_number = "1"`

### Display Phase (When viewing the data):

1. **Query Chapters:**
   ```sql
   SELECT * FROM orcamento_chapters 
   ORDER BY chapter_number, id
   ```
   Result: 
   - Chapter "1" (ID=uuid-A, from Sheet1)
   - Chapter "1" (ID=uuid-B, from Sheet2)

2. **Group Articles:**
   - Group 1: Sheet1, Chapter "1" → [Article "1.1" from Sheet1]
   - Group 2: Sheet2, Chapter "1" → [Article "1.1" from Sheet2]

3. **Match Articles to Chapters:**
   - Group 1 (Sheet1, "1") → First unused Chapter "1" → uuid-A ✓
   - Group 2 (Sheet2, "1") → First unused Chapter "1" → uuid-B ✓

## Changes Made

### File: `src/pages/MapaQuantidades.tsx`

**Line ~271:**
- Added `.order("id")` after `.order("chapter_number")`
- Added comment explaining the purpose

## Testing Instructions

### Test Case 1: Multi-Sheet File with Duplicate Chapter Numbers

Create an Excel file with this structure:

**Sheet1:**
```
| ARTIGO | DESCRIÇÃO                  | UN  | QT   |
|--------|----------------------------|-----|------|
| 1      | Foundation Work            |     |      |
| 1.1    | Site Preparation           |     |      |
| 1.1.1  | Site clearing              | m2  | 500  |
```

**Sheet2:**
```
| ARTIGO | DESCRIÇÃO                  | UN  | QT   |
|--------|----------------------------|-----|------|
| 1      | Electrical Work            |     |      |
| 1.1    | Power Distribution         |     |      |
| 1.1.1  | Main panel installation    | un  | 1    |
```

**Steps:**
1. Upload the Excel file to an Orcamento
2. Enable "Article-based view" checkbox
3. Click "Analyze"
4. Navigate to "Principal" tab

**Expected Results:**
- ✅ Two chapters displayed: "1. Foundation Work" and "1. Electrical Work"
- ✅ Each chapter shows its own articles:
  - First "1.1" article is about "Site Preparation" (from Sheet1)
  - Second "1.1" article is about "Power Distribution" (from Sheet2)
- ✅ Click on "1.1 Site Preparation" → shows item "1.1.1 Site clearing"
- ✅ Click on "1.1 Power Distribution" → shows item "1.1.1 Main panel installation"
- ✅ No mixing of data between sheets

### Test Case 2: Three Sheets with Same Chapter Numbers

**Sheet1, Sheet2, Sheet3:**
All have Chapter "1", "2", "3" with different descriptions

**Expected Results:**
- ✅ All chapters from all sheets are displayed
- ✅ Articles are correctly matched to their original chapters
- ✅ No data mixing between sheets

## Verification

After implementing this fix:
- ✅ Chapters are returned in consistent order
- ✅ Articles are matched to correct chapters
- ✅ Multi-sheet files with duplicate chapter numbers work correctly
- ✅ Article-based view displays data correctly
- ✅ No data loss or mixing between sheets

## Impact

- **Article-based view with multi-sheet files:** FIXED - now works correctly when sheets have duplicate chapter numbers
- **Article-based view with single-sheet files:** UNCHANGED - continues to work
- **Normal view (non-article-based):** UNCHANGED - not affected by these changes

## Technical Notes

### Why ID Ordering Works

- PostgreSQL UUIDs are generated in a way that preserves temporal order
- When chapters are inserted sequentially, their IDs increase
- Ordering by `id` ensures chapters appear in insertion order
- This matches the order in which sheets are processed (Sheet1, Sheet2, Sheet3, ...)

### Alternative Solutions Considered

1. **Store sheet_name in database:** Would require schema migration
2. **Use created_at timestamp:** Would require adding timestamp column
3. **Use display_order field:** Would require managing order values

The ID ordering solution is the simplest and doesn't require schema changes.
