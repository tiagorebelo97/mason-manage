# Article-Based View Multi-Sheet Duplicate Chapter/Article Fix

## Problem Statement

When using the article-based view with an Excel file containing multiple sheets with the same chapter or article numbers (e.g., Sheet1 has Chapter 1 and Sheet2 also has Chapter 1), the analysis was failing with "Failed to analyze file" error.

### Example Scenario
```
Sheet1:
  Chapter 1
    Article 1.1 - "Foundation Work"
    Article 1.2 - "Concrete Work"

Sheet2:
  Chapter 1
    Article 1.1 - "Steel Structure"
    Article 1.2 - "Roofing"
```

### Error
"Failed to analyze file" due to duplicate key violation in the database.

## Root Cause

The issue occurred during database insertion:
1. In article-based view, all sheets are mapped to the "Principal" tab
2. Sheet1 Chapter 1 → `{tab_id: "Principal", chapter_number: "1"}`
3. Sheet2 Chapter 1 → `{tab_id: "Principal", chapter_number: "1"}`
4. Database has UNIQUE constraint on (tab_id, chapter_number)
5. Second chapter insert fails with uniqueness violation

## Solution Implemented

### 1. Detect Multi-Sheet Article-Based View
Added a flag `needsSheetPrefix` that is set to `true` when:
- `articleBasedView` is enabled AND
- The workbook has more than one sheet

```typescript
const needsSheetPrefix = articleBasedView && workbook.SheetNames.length > 1;
```

### 2. Prefix Chapter Numbers
When `needsSheetPrefix` is true, chapter numbers are prefixed with the sheet name:
- Sheet1 Chapter 1 → `chapter_number: "Sheet1_1"`
- Sheet2 Chapter 1 → `chapter_number: "Sheet2_1"`

This ensures uniqueness in the database while preserving the original sheet information.

### 3. Prefix Article Numbers
Similarly, article numbers are prefixed:
- Sheet1 Article 1.1 → `artigo: "Sheet1_1.1"`
- Sheet2 Article 1.1 → `artigo: "Sheet2_1.1"`

### 4. Prefix Item ARTIGO Numbers
All item ARTIGO values are also prefixed to maintain consistency:
- Sheet1 Item 1.1.1 → `artigo: "Sheet1_1.1.1"`
- Sheet2 Item 1.1.1 → `artigo: "Sheet2_1.1.1"`

### 5. Display Helper Function
Added `displayNumber()` helper function to strip the sheet prefix when displaying in the UI:

```typescript
const displayNumber = (fullNumber: string): string => {
  // If number contains underscore (e.g., "Sheet1_1"), extract the part after underscore
  if (fullNumber.includes('_')) {
    const parts = fullNumber.split('_');
    return parts[parts.length - 1]; // Return the last part after underscore
  }
  return fullNumber; // Return as-is if no prefix
};
```

This ensures the UI still shows clean numbers like "1", "1.1", "1.1.1" instead of "Sheet1_1", "Sheet1_1.1", etc.

### 6. Update Display Locations
Updated all places where chapter numbers, article numbers, and item ARTIGO values are displayed:
- Chapter headers in collapsible sections
- Article headers
- Item table cells

## Database Structure

The fix works within the existing database schema:

```
orcamento_tabs (Principal, Arquitetura, Instalações Especiais)
    ↓
orcamento_chapters (chapter_number: "Sheet1_1", "Sheet2_1")
    ↓
orcamento_items (artigo: "Sheet1_1.1", "Sheet2_1.1")
```

The UNIQUE constraint `(tab_id, chapter_number)` now works correctly because each sheet has a unique prefix.

## UI Behavior

### Sheet Separators
Sheet separators continue to work as expected:
```
┌────────────────────────────┐
│ 📄 Sheet1                  │
└────────────────────────────┘
  Chapter 1
    Article 1.1 - Foundation Work
    Article 1.2 - Concrete Work

┌────────────────────────────┐
│ 📄 Sheet2                  │
└────────────────────────────┘
  Chapter 1
    Article 1.1 - Steel Structure
    Article 1.2 - Roofing
```

### Display Numbers
- Chapters display as "1. Chapter Name" (not "Sheet1_1. Chapter Name")
- Articles display as "1.1 - Article Title" (not "Sheet1_1.1 - Article Title")
- Items display as "1.1" in tables (not "Sheet1_1.1")

## Article Grouping

The existing article grouping logic continues to work correctly:
1. Articles are stored in sessionStorage with prefixed chapter_number
2. Articles are grouped by chapter_number (which includes the prefix)
3. Each chapter from the database has a matching prefixed chapter_number
4. Articles are correctly matched to their chapters

## Code Changes

### File: `src/pages/MapaQuantidades.tsx`

#### Change 1: Add needsSheetPrefix flag (line 584)
```typescript
const needsSheetPrefix = articleBasedView && workbook.SheetNames.length > 1;
```

#### Change 2: Prefix chapter_number when inserting (line 811)
```typescript
const chapterNumberToStore = needsSheetPrefix ? `${sheetName}_${artigoCell}` : artigoCell;
```

#### Change 3: Prefix article numbers in articlesData (lines 788, 831, 1126)
```typescript
const chapterNumberToStore = needsSheetPrefix ? `${sheetName}_${currentChapterNumber}` : currentChapterNumber;
const artigoToStore = needsSheetPrefix ? `${sheetName}_${currentArticleArtigo}` : currentArticleArtigo;
```

#### Change 4: Prefix item ARTIGO and chapter_number (lines 1028-1029)
```typescript
const itemArtigoToStore = (needsSheetPrefix && itemArtigo) ? `${sheetName}_${itemArtigo}` : itemArtigo;
const chapterNumber = needsSheetPrefix ? `${sheetName}_${currentChapterNumber}` : currentChapterNumber;
```

#### Change 5: Add displayNumber helper (lines 1821-1829)
```typescript
const displayNumber = (fullNumber: string): string => {
  if (fullNumber.includes('_')) {
    const parts = fullNumber.split('_');
    return parts[parts.length - 1];
  }
  return fullNumber;
};
```

#### Change 6: Update display locations (multiple lines)
- Line 1968: Chapter header in multi-tab view
- Line 2240: Chapter header in single-sheet view
- Line 2548: Chapter header in article-based view
- Line 2626: Article header
- Lines 2024, 2296, 2701: Item ARTIGO in tables

## Testing

### Test Case 1: Multi-Sheet Excel File with Duplicate Chapter Numbers
1. Create Excel file with 2 sheets
2. Both sheets have Chapter 1, Chapter 2, etc.
3. Enable "Article-based view" toggle
4. Click "Analyze"
5. **Expected**: Analysis completes successfully (no "Failed to analyze file" error)
6. **Expected**: Sheet separators show both sheets
7. **Expected**: Chapters display as "1", "2" (not "Sheet1_1", "Sheet2_1")
8. **Expected**: All articles from both sheets are displayed correctly

### Test Case 2: Single-Sheet Excel File with Article-Based View
1. Upload Excel file with 1 sheet
2. Enable "Article-based view"
3. Click "Analyze"
4. **Expected**: No sheet prefix added (needsSheetPrefix = false)
5. **Expected**: Chapters display as "1", "2", etc.
6. **Expected**: All features work normally

### Test Case 3: Multi-Sheet Excel File without Article-Based View
1. Upload Excel file with 2 sheets
2. Leave "Article-based view" disabled
3. Click "Analyze"
4. **Expected**: No sheet prefix added (needsSheetPrefix = false)
5. **Expected**: Each sheet creates its own tab
6. **Expected**: Chapters can have duplicate numbers in different tabs

## Benefits

1. **Fixes Database Constraint Violations**: Chapters with same numbers across different sheets no longer cause insert failures
2. **Preserves UI/UX**: Users still see clean chapter/article numbers without sheet prefixes
3. **Maintains Sheet Organization**: Sheet separators continue to group content by sheet
4. **Backward Compatible**: Single-sheet files and non-article-based view are unaffected
5. **Minimal Code Changes**: Only adds prefixing logic where needed, no major architectural changes

## Verification

- ✅ Build status: Success
- ✅ Lint status: No new errors
- ✅ Code review: All changes follow existing patterns
- ✅ Database schema: No changes needed

## Notes

- The sheet prefix is only added when article-based view is enabled AND there are multiple sheets
- The prefix format is `"SheetName_"` followed by the original number
- The displayNumber helper uses the last underscore as the separator, making it robust to sheet names with underscores
- All existing multi-sheet functionality (sheet separators, article grouping) continues to work as before
