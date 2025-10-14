# Duplicate ARTIGO Chapter Order Fix

## Problem Statement

When using article-based view to analyze an Excel file with multiple sheets containing the same chapter numbers (e.g., Chapter "1" in Sheet1 AND Chapter "1" in Sheet2), the application was retrieving an error. Articles from different sheets were being incorrectly matched to chapters.

## Example Scenario

**Excel File Structure:**
```
Sheet1:
| ARTIGO | DESCRIÇÃO           | UN  | QT  |
|--------|---------------------|-----|-----|
| 1      | Foundation Work     |     |     | <- Chapter
| 1.1    | Excavation          |     |     | <- Article
| 1.1.1  | Manual excavation   | m3  | 100 | <- Item

Sheet2:
| ARTIGO | DESCRIÇÃO           | UN  | QT  |
|--------|---------------------|-----|-----|
| 1      | Electrical Work     |     |     | <- Chapter (same number!)
| 1.1    | Wiring              |     |     | <- Article (same number!)
| 1.1.1  | Cable installation  | m   | 50  | <- Item
```

## Root Cause

The chapters query was only ordering by `chapter_number`:

```typescript
.order("chapter_number")
```

When multiple chapters had the same `chapter_number` (from different sheets), they could be returned in any order - not necessarily in insertion order. This caused a mismatch when the article-to-chapter mapping logic tried to match articles to chapters.

### How the Mapping Works

1. **During Analysis:**
   - Sheets are processed in order (Sheet1, Sheet2, ...)
   - Chapters are extracted with their `sheet_name`
   - Chapters are inserted into database in order
   - Articles are stored in sessionStorage with `sheet_name` and `chapter_number`

2. **When Loading Articles:**
   - Chapters are fetched from database
   - Articles are grouped by `sheet_name + chapter_number`
   - Each article group is matched to "first unused chapter" with matching `chapter_number`
   - This relies on chapters being in insertion order!

### The Bug

Without ordering by ID, if we have:
- Database: [Chapter "1" from Sheet2 (ID: 456), Chapter "1" from Sheet1 (ID: 123)]
- Article groups: [Sheet1 Chapter "1" articles, Sheet2 Chapter "1" articles]

The first article group (Sheet1) would be matched to the first database chapter (Sheet2's Chapter "1") - WRONG!

## Solution

Added `.order("id")` to ensure chapters with the same number are ordered by insertion order:

```typescript
.order("chapter_number")
.order("id") // Ensure insertion order for chapters with same number (multi-sheet)
```

Now chapters are guaranteed to be in the order they were inserted, which matches the order articles were extracted.

## Changes Made

### File: `src/pages/MapaQuantidades.tsx`

**Line 223:** Added `.order("id")` to the chapters query

```typescript
const { data: chapters } = useQuery({
  queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("orcamento_chapters")
      .select(`
        *,
        orcamento_tabs!inner(orcamento_id)
      `)
      .eq("orcamento_tabs.orcamento_id", id)
      .order("chapter_number")
      .order("id"); // NEW LINE - Ensure insertion order
    if (error) throw error;
    return data as OrcamentoChapter[];
  },
  enabled: !!id && tabs && tabs.length > 0,
});
```

## Impact

- ✅ Fixes error when analyzing multi-sheet Excel files with duplicate chapter numbers in article-based view
- ✅ Ensures articles from different sheets are correctly matched to their respective chapters
- ✅ No impact on single-sheet files
- ✅ No impact on files without duplicate chapter numbers
- ✅ Minimal change: only one line added

## Testing

### Test Case: Multi-Sheet File with Duplicate Chapter Numbers

1. Create an Excel file with 2 sheets
2. Both sheets have Chapter "1" with Articles "1.1", "1.2", etc.
3. Enable "Article-based view" checkbox
4. Click "Analyze"

**Expected Results:**
- Analysis completes successfully without errors
- Each sheet's articles are displayed under the correct chapter
- Sheet1's Article "1.1" shows Sheet1's items
- Sheet2's Article "1.1" shows Sheet2's items
- No mixing of data between sheets

## Verification

- ✅ Build successful (TypeScript compilation)
- ✅ Lint passes (no new errors)
- ✅ Code change is minimal and surgical
- ✅ Backward compatible with existing functionality
