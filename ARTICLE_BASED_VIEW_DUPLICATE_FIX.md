# Article-Based View Multi-Sheet Duplicate Chapter/Article/Item Fix

## Problem Statement

When using article-based view with Excel files containing multiple sheets, if different sheets have the same chapter, article, or item numbers (e.g., both Sheet1 and Sheet2 have chapter "1"), the analysis fails with "Failed to analyze file" error.

### Example Error Scenario

**Excel File Structure:**
```
Sheet: Folha1
┌─────────┬────────────────────────────┬─────┬─────┐
│ ARTIGO  │ DESCRIÇÃO                  │ UN  │ QT  │
├─────────┼────────────────────────────┼─────┼─────┤
│ 1       │ Foundation Work            │ -   │ -   │  ← Chapter 1
│ 1.1     │ Excavation                 │ m3  │ 100 │  ← Article 1.1
│ 1.1.1   │ Manual excavation          │ m3  │  50 │  ← Item
└─────────┴────────────────────────────┴─────┴─────┘

Sheet: Folha2
┌─────────┬────────────────────────────┬─────┬─────┐
│ ARTIGO  │ DESCRIÇÃO                  │ UN  │ QT  │
├─────────┼────────────────────────────┼─────┼─────┤
│ 1       │ Electrical Work            │ -   │ -   │  ← Chapter 1 (DUPLICATE!)
│ 1.1     │ Wiring                     │ m   │ 200 │  ← Article 1.1 (DUPLICATE!)
│ 1.1.1   │ Cable installation         │ m   │ 100 │  ← Item
└─────────┴────────────────────────────┴─────┴─────┘
```

**What Happened Before Fix:**
1. Article-based view enabled → All sheets mapped to "Principal" tab
2. Try to insert Chapter "1" from Folha1 with tab_id = Principal → ✓ Success
3. Try to insert Chapter "1" from Folha2 with tab_id = Principal → ❌ ERROR: Unique constraint violation on (tab_id, chapter_number)
4. Analysis fails with "Failed to analyze file"

## Root Cause

### Database Schema
The `orcamento_chapters` table has a unique constraint:
```sql
ALTER TABLE orcamento_chapters ADD CONSTRAINT 
  orcamento_chapters_tab_id_chapter_number_key 
  UNIQUE(tab_id, chapter_number);
```

### Article-Based View Behavior
- When article-based view is enabled, all sheets are mapped to "Principal" tab
- This is by design to show all articles together in one view
- However, this means all chapters from all sheets have the SAME `tab_id`
- If two sheets have the same chapter number, the unique constraint is violated

## Solution

### Approach
Prefix the chapter_number with the sheet name when in article-based view with multiple sheets. This ensures uniqueness in the database while maintaining correct item-to-chapter mapping.

### Implementation Details

#### 1. Chapter Number Prefixing
**File:** `src/pages/MapaQuantidades.tsx`
**Lines:** ~827-836

```typescript
// In article-based view with multiple sheets, prefix chapter number with sheet name
// to ensure uniqueness in the database (unique constraint on tab_id + chapter_number)
const chapterNumberForDB = (articleBasedView && workbook.SheetNames.length > 1) 
  ? `${sheetName}_${artigoCell}`
  : artigoCell;

chaptersToInsert.push({
  sheet_name: sheetName,
  chapter_number: chapterNumberForDB,  // "Folha1_1" or "Folha2_1"
  chapter_name: descricaoCell,
  chapter_comments: undefined,
});
currentChapterNumber = artigoCell;  // Keep original for item lookup
```

**Result:**
- Folha1 Chapter "1" → stored as "Folha1_1" in database
- Folha2 Chapter "1" → stored as "Folha2_1" in database
- No more unique constraint violations!

#### 2. Chapter Mapping for Item Lookup
**File:** `src/pages/MapaQuantidades.tsx`
**Lines:** ~1222-1240

The chapterMap is used to link items to their parent chapters. Items look up chapters using the key `${sheet_name}_${chapter_number}`.

**Problem:** After prefixing, the chapter_number in the database is already prefixed, so we need to extract the original number:

```typescript
insertedChapters.forEach((chapter, index) => {
  const originalChapter = chaptersToInsert[index];
  if (originalChapter && originalChapter.sheet_name) {
    // Extract the original chapter number (without prefix)
    // In article-based view with multiple sheets, chapter_number in DB is "SheetName_OriginalNumber"
    const originalChapterNumber = (articleBasedView && workbook.SheetNames.length > 1)
      ? chapter.chapter_number.replace(`${originalChapter.sheet_name}_`, '')
      : chapter.chapter_number;
    
    const key = `${originalChapter.sheet_name}_${originalChapterNumber}`;
    chapterMap.set(key, chapter.id);
  }
});
```

**Example:**
- Database has chapter with `chapter_number = "Folha1_1"`
- Extract original: `"Folha1_1".replace("Folha1_", "")` → `"1"`
- Create key: `"Folha1_1"` (sheet_name + original number)
- Items from Folha1 with chapter "1" look for key `"Folha1_1"` → ✓ Found!

#### 3. Chapter Comment Comparisons
**File:** `src/pages/MapaQuantidades.tsx`
**Lines:** ~819-829, ~1032-1047, ~1165-1175

Fixed three locations where chapter comments are saved. The issue was that `lastChapter.chapter_number` is now prefixed, but `currentChapterNumber` is the original number.

```typescript
// Extract original chapter number for comparison (may be prefixed in DB)
const lastChapterOriginalNumber = (articleBasedView && workbook.SheetNames.length > 1 && lastChapter?.chapter_number)
  ? lastChapter.chapter_number.replace(`${sheetName}_`, '')
  : lastChapter?.chapter_number;

if (lastChapter && lastChapterOriginalNumber === currentChapterNumber) {
  lastChapter.chapter_comments = chapterComments.join('\n');
}
```

## How It Works Now

### Example Flow: Multi-Sheet with Duplicate Chapter Numbers

**Input:**
- Article-based view enabled ✓
- Two sheets: Folha1 and Folha2
- Both have chapter "1"

**Processing:**

1. **Tab Creation:**
   - Create 3 tabs: Principal, Arquitetura, Instalações Especiais
   - Map Folha1 → Principal tab
   - Map Folha2 → Principal tab

2. **Chapter Insertion:**
   - Process Folha1:
     - Find chapter "1" → Prefix: "Folha1_1"
     - Insert: `{ tab_id: Principal, chapter_number: "Folha1_1", chapter_name: "Foundation Work" }`
   - Process Folha2:
     - Find chapter "1" → Prefix: "Folha2_1"
     - Insert: `{ tab_id: Principal, chapter_number: "Folha2_1", chapter_name: "Electrical Work" }`
   - ✓ No duplicate (tab_id, chapter_number) pairs!

3. **Chapter Mapping:**
   - Build chapterMap:
     - Chapter "Folha1_1" → Extract "1" → Key: "Folha1_1" → chapter.id
     - Chapter "Folha2_1" → Extract "1" → Key: "Folha2_1" → chapter.id

4. **Item Insertion:**
   - Process items from Folha1 with chapter "1":
     - Look for key: "Folha1_1" → ✓ Found!
     - Insert items with correct chapter_id
   - Process items from Folha2 with chapter "1":
     - Look for key: "Folha2_1" → ✓ Found!
     - Insert items with correct chapter_id

5. **Success!** ✓
   - All chapters inserted without errors
   - All items correctly linked to their chapters
   - Analysis completes successfully

## Testing

### Test Case 1: Single-Sheet File (No Change)
**Setup:**
- Upload Excel file with 1 sheet
- Enable article-based view
- Sheet has chapter "1", "2", "3"

**Expected:**
- Chapters stored as "1", "2", "3" (no prefixing needed)
- All items linked correctly
- Analysis succeeds

### Test Case 2: Multi-Sheet File with Unique Chapter Numbers
**Setup:**
- Upload Excel file with 2 sheets
- Enable article-based view
- Folha1 has chapters "1", "2"
- Folha2 has chapters "3", "4"

**Expected:**
- Chapters stored as "Folha1_1", "Folha1_2", "Folha2_3", "Folha2_4"
- All items linked correctly
- Analysis succeeds

### Test Case 3: Multi-Sheet File with Duplicate Chapter Numbers
**Setup:**
- Upload Excel file with 2 sheets
- Enable article-based view
- Folha1 has chapters "1", "2"
- Folha2 has chapters "1", "2" (DUPLICATES!)

**Expected:**
- Chapters stored as "Folha1_1", "Folha1_2", "Folha2_1", "Folha2_2"
- All items linked correctly
- Analysis succeeds (NO ERROR!)

### Test Case 4: Non-Article-Based View (No Change)
**Setup:**
- Upload Excel file with 2 sheets
- DO NOT enable article-based view
- Both sheets have chapter "1"

**Expected:**
- Each sheet creates its own tab
- Chapters stored as "1" in different tabs (different tab_ids)
- No prefixing needed
- Analysis succeeds (unchanged behavior)

## Benefits

1. **Fixes the Error:** Multi-sheet files with duplicate chapter numbers no longer fail
2. **Maintains Compatibility:** Single-sheet files and non-article-based view work exactly as before
3. **Minimal Changes:** Only 4 sections of code modified, no database schema changes needed
4. **Transparent to Users:** Users don't see the prefixed chapter numbers in the UI

## Technical Notes

- The prefixing only happens in the database, not in the Excel parsing logic
- `currentChapterNumber` always stores the original number for consistency
- The `sheet_name` field in `chaptersToInsert` array is used for mapping, not stored in the database after migration
- Article data in `articlesData` array uses original chapter numbers, not prefixed ones

## Verification

✅ **Build Status:** Success
✅ **Linting:** No new errors introduced
✅ **Compilation:** No TypeScript errors
