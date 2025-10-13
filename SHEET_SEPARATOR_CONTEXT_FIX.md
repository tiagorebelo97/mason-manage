# Sheet/Separator Context Fix - October 2025

## Problem Statement

When using article-based view with multiple sheets containing the same chapter numbers (e.g., Chapter "1" in Sheet1 AND Chapter "1" in Sheet2), the application was incorrectly merging these chapters together. Articles and items from all sheets with the same chapter number were being inserted into a single chapter, ignoring the sheet/separator context.

**User's Request:**
> "I don't want you to respect the numbers on the ARTIGO first, I want you to respect first in which separator the chapter [is]. We can have the same chapter, article or item number in different separators."

## Root Cause Analysis

The issue was in `src/pages/MapaQuantidades.tsx`:

### Issue 1: Forced Single-Tab Mode (Line 581)
```typescript
// BEFORE
const hasMultipleSheets = (articleBasedView || treatAsSingleSheet) ? false : workbook.SheetNames.length > 1;
```

When `articleBasedView = true`, this forced `hasMultipleSheets = false`, which meant:
- Only 3 default tabs were created (Principal, Arquitetura, Instalações Especiais)
- All sheets were mapped to the "Principal" tab
- Multiple sheets lost their separation

### Issue 2: Chapter Deduplication (Lines 1148-1187)
```typescript
// BEFORE
if (articleBasedView && workbook.SheetNames.length > 1) {
  // Deduplicate chapters based on (tab_id, chapter_number)
  // This merged chapters from different sheets with same numbers
}
```

When multiple sheets had Chapter "1":
- Only the FIRST Chapter "1" was kept in the database
- The others were considered duplicates and discarded
- Their comments were merged into the first chapter

### Issue 3: Item-to-Chapter Mapping (Lines 1206-1217)
```typescript
// BEFORE
if (articleBasedView && workbook.SheetNames.length > 1) {
  // Map ALL sheets with same chapter number to the single deduplicated chapter
  insertedChapters.forEach((chapter) => {
    chaptersToInsert.forEach((originalChapter) => {
      const originalTabId = sheetNameToTabId.get(originalChapter.sheet_name!);
      if (originalTabId === chapter.tab_id && originalChapter.chapter_number === chapter.chapter_number) {
        const key = `${originalChapter.sheet_name}_${chapter.chapter_number}`;
        chapterMap.set(key, chapter.id);
      }
    });
  });
}
```

Result: Items from Sheet1_1 and Sheet2_1 both mapped to the same chapter ID, losing separator context.

## Solution Implemented

### Change 1: Respect Multi-Sheet Mode for Article View (Line 581)
```typescript
// AFTER
const hasMultipleSheets = treatAsSingleSheet ? false : workbook.SheetNames.length > 1;
```

**Impact:**
- Article-based view now creates separate tabs for each sheet when there are multiple sheets
- Each sheet maintains its own separator/tab
- Only single-sheet files or files with `treatAsSingleSheet = true` use the 3 default tabs

### Change 2: Remove Chapter Deduplication (Lines 1148-1150)
```typescript
// AFTER
// Note: Chapter deduplication is no longer needed since we maintain separate tabs
// for each sheet, even in article-based view. Each sheet's chapters are kept separate.
const uniqueChaptersWithTabIds = chaptersWithTabIds;
```

**Impact:**
- Each sheet's chapters are kept separate in the database
- Chapter "1" in Sheet1 and Chapter "1" in Sheet2 are now TWO distinct chapters
- No more merging or loss of data

### Change 3: Simplify Chapter Mapping (Lines 1165-1176)
```typescript
// AFTER
const chapterMap = new Map<string, string>();

// The insertedChapters array should be in the same order as uniqueChaptersWithTabIds
insertedChapters.forEach((chapter, index) => {
  const originalChapter = chaptersToInsert[index];
  if (originalChapter && originalChapter.sheet_name) {
    const key = `${originalChapter.sheet_name}_${chapter.chapter_number}`;
    chapterMap.set(key, chapter.id);
  }
});
```

**Impact:**
- Simple, consistent mapping logic for all cases
- Items correctly map to chapters using `sheet_name + chapter_number` as the key
- Each sheet's items stay within their respective chapters

## Examples

### Example: Multi-Sheet Excel with Duplicate Chapter Numbers

**Excel File Structure:**
```
Sheet1:
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
|--------|------------------------|-----|------|
| 1      | Trabalhos Preliminares |     |      |
| 1.1    | Limpeza do terreno     | m2  | 100  |
| 1.2    | Sinalização            | un  | 5    |

Sheet2:
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
|--------|------------------------|-----|------|
| 1      | Fundações              |     |      |
| 1.1    | Escavação              | m3  | 50   |
| 1.2    | Betão                  | m3  | 30   |
```

**Before Fix:**
- Tabs: Principal, Arquitetura, Instalações Especiais
- Both sheets mapped to "Principal" tab
- Only ONE Chapter "1" created (from Sheet1)
- Chapter "1" from Sheet2 discarded as duplicate
- Items 1.1 and 1.2 from both sheets mapped to Sheet1's Chapter "1"
- **Result:** All items lumped together, Sheet2's chapter name lost

**After Fix:**
- Tabs: Sheet1, Sheet2
- Each sheet has its own tab
- TWO Chapter "1" created (one for each sheet)
  - Sheet1's Chapter "1": "Trabalhos Preliminares"
  - Sheet2's Chapter "1": "Fundações"
- Sheet1's items (1.1, 1.2) map to Sheet1's Chapter "1"
- Sheet2's items (1.1, 1.2) map to Sheet2's Chapter "1"
- **Result:** Proper separation by separator/sheet context

## Database Impact

### Before Fix
```
orcamento_tabs:
  - id: 1, name: "Principal"
  - id: 2, name: "Arquitetura"
  - id: 3, name: "Instalações Especiais"

orcamento_chapters:
  - id: 1, tab_id: 1, chapter_number: "1", chapter_name: "Trabalhos Preliminares"

orcamento_items:
  - id: 1, chapter_id: 1, artigo: "1.1", descricao: "Limpeza do terreno", un: "m2", qt: 100
  - id: 2, chapter_id: 1, artigo: "1.2", descricao: "Sinalização", un: "un", qt: 5
  - id: 3, chapter_id: 1, artigo: "1.1", descricao: "Escavação", un: "m3", qt: 50  ❌ Wrong chapter!
  - id: 4, chapter_id: 1, artigo: "1.2", descricao: "Betão", un: "m3", qt: 30      ❌ Wrong chapter!
```

### After Fix
```
orcamento_tabs:
  - id: 1, name: "Sheet1"
  - id: 2, name: "Sheet2"

orcamento_chapters:
  - id: 1, tab_id: 1, chapter_number: "1", chapter_name: "Trabalhos Preliminares"
  - id: 2, tab_id: 2, chapter_number: "1", chapter_name: "Fundações"

orcamento_items:
  - id: 1, chapter_id: 1, artigo: "1.1", descricao: "Limpeza do terreno", un: "m2", qt: 100  ✓
  - id: 2, chapter_id: 1, artigo: "1.2", descricao: "Sinalização", un: "un", qt: 5           ✓
  - id: 3, chapter_id: 2, artigo: "1.1", descricao: "Escavação", un: "m3", qt: 50            ✓
  - id: 4, chapter_id: 2, artigo: "1.2", descricao: "Betão", un: "m3", qt: 30                ✓
```

## Testing Recommendations

### Test Case 1: Multi-Sheet with Duplicate Chapter Numbers
1. Create Excel file with 2+ sheets
2. Each sheet has Chapter "1", "2", etc. with different names
3. Enable article-based view
4. Upload and analyze
5. **Expected:** 
   - One tab per sheet created
   - Each sheet's chapters maintained separately
   - Items correctly grouped under their sheet's chapters

### Test Case 2: Single-Sheet File
1. Create Excel file with 1 sheet
2. Has multiple chapters
3. Enable article-based view
4. Upload and analyze
5. **Expected:**
   - 3 default tabs created (Principal, Arquitetura, Instalações Especiais)
   - All chapters under "Principal" tab
   - Behavior unchanged from before

### Test Case 3: Multi-Sheet Without Article View
1. Create Excel file with 2+ sheets
2. Each sheet has different chapters
3. **Disable** article-based view
4. Upload and analyze
5. **Expected:**
   - One tab per sheet created
   - Normal multi-sheet behavior (unchanged)

## Files Modified

- `src/pages/MapaQuantidades.tsx`
  - Line 581: Tab creation logic
  - Lines 1148-1150: Removed deduplication
  - Lines 1165-1176: Simplified chapter mapping

## Benefits

1. **Separator Context Respected:** Chapters and items maintain their sheet/separator boundaries
2. **Data Integrity:** No loss of chapters or items due to deduplication
3. **Correct Organization:** Items map to the correct chapters in their respective sheets
4. **Consistent Behavior:** Article-based view now works the same as regular multi-sheet mode regarding separation
5. **Simpler Code:** Removed complex deduplication logic, making the code easier to maintain

## Backward Compatibility

- **Single-sheet files:** No change in behavior
- **Multi-sheet files with `treatAsSingleSheet = true`:** No change in behavior
- **Multi-sheet files with article-based view:** NOW creates separate tabs (was forcing single tab before)
  - This is the intended behavior to respect separator context
  - Users will see tabs for each sheet instead of all sheets combined into "Principal"
