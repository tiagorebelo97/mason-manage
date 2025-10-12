# Article Order Preservation Fix

## Problem Statement

When analyzing Excel files with the article-based view, articles were being reordered by their ARTIGO number instead of preserving the original order from the Excel sheets. The user reported:

> "you are organizing by ARTIGO, on analysing, but on analysing you need to respect in witch sheet the chapter is, not the number of the ARTIGO or chapter, and you need to respect the order of where the items are, do not organize by ARTIGO number"

## Root Causes

### 1. Articles Grouped Without Sheet Context
**Location**: `src/pages/MapaQuantidades.tsx`, lines 318-324 (before fix)

**Problem**: Articles were grouped by `chapter_number` only, ignoring which sheet they came from. This meant articles from different sheets with the same chapter number would be mixed together.

```typescript
// BEFORE:
const groupedByChapter = new Map<string, typeof articlesData>();
articlesData.forEach((article: typeof articlesData[0]) => {
  if (!groupedByChapter.has(article.chapter_number)) {
    groupedByChapter.set(article.chapter_number, []);
  }
  groupedByChapter.get(article.chapter_number)!.push(article);
});
```

### 2. Chapters Ordered by Chapter Number
**Location**: `src/pages/MapaQuantidades.tsx`, line 227 (before fix)

**Problem**: The chapters query used `.order("chapter_number")` which sorted chapters alphabetically/numerically, not by their insertion order from the Excel sheets.

```typescript
// BEFORE:
.order("chapter_number");
```

### 3. Items Ordered by ARTIGO
**Location**: `src/pages/MapaQuantidades.tsx`, line 247 (before fix)

**Problem**: The items query used `.order("artigo")` which sorted items by their ARTIGO value, not by their insertion order from the Excel sheets.

```typescript
// BEFORE:
.order("artigo");
```

### 4. No Tracking of Insertion Order
**Problem**: The `articlesData` array didn't track the order in which articles were inserted during analysis, so there was no way to restore the original Excel order.

## Solutions Implemented

### Fix 1: Track Insertion Order During Analysis
**File**: `src/pages/MapaQuantidades.tsx`
**Lines**: 564-579, 794-801, 832-839, 1125-1132

**Change**: Added `order_index` field to track the sequential order of articles as they're processed from Excel sheets.

```typescript
// Type definition with order_index
const articlesData: Array<{
  sheet_name: string;
  chapter_number: string;
  artigo: string;
  title: string;
  order_index: number; // NEW: Track insertion order to preserve Excel sheet order
  contents: Array<{
    type: 'text' | 'item';
    data: string | { /* ... */ };
  }>;
}> = [];

// When pushing articles, set order_index
articlesData.push({
  sheet_name: sheetName,
  chapter_number: currentChapterNumber,
  artigo: currentArticleArtigo,
  title: currentArticleTitle,
  order_index: articlesData.length, // Track insertion order
  contents: [...currentArticleContents]
});
```

**Result**: Every article now has an `order_index` that represents its position in the original Excel file.

### Fix 2: Group by Sheet Name + Chapter Number
**File**: `src/pages/MapaQuantidades.tsx`
**Lines**: 310-377

**Change**: Updated grouping logic to use `sheet_name + chapter_number` as the key, and sort articles by `order_index`.

```typescript
// BEFORE:
const groupedByChapter = new Map<string, typeof articlesData>();
articlesData.forEach((article) => {
  if (!groupedByChapter.has(article.chapter_number)) {
    groupedByChapter.set(article.chapter_number, []);
  }
  groupedByChapter.get(article.chapter_number)!.push(article);
});

// AFTER:
// Sort articles by order_index to preserve Excel sheet order
articlesData.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

// Group articles by sheet_name + chapter_number to preserve sheet context
const groupedByChapter = new Map<string, ArticleDataType[]>();
articlesData.forEach((article) => {
  const key = `${article.sheet_name}_${article.chapter_number}`;
  if (!groupedByChapter.has(key)) {
    groupedByChapter.set(key, []);
  }
  groupedByChapter.get(key)!.push(article);
});
```

**Result**: Articles from different sheets are kept separate, and the overall order is preserved.

### Fix 3: Preserve Order When Collecting Articles
**File**: `src/pages/MapaQuantidades.tsx`
**Lines**: 340-350

**Change**: When collecting articles for a chapter, sort them by `order_index` to maintain the original Excel order.

```typescript
// Collect all articles that match this chapter_number from all sheets
groupedByChapter.forEach((articles, key) => {
  const [sheet_name, chapter_num] = key.split('_');
  if (chapter_num === chapter.chapter_number) {
    articlesForChapter.push(...articles);
  }
});

if (articlesForChapter.length > 0) {
  // Sort by order_index to maintain Excel order
  articlesForChapter.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  // ...
}
```

**Result**: Articles within each chapter are displayed in the order they appeared in the Excel file.

### Fix 4: Remove Automatic Sorting from Queries
**File**: `src/pages/MapaQuantidades.tsx`
**Lines**: 217-232, 234-252

**Change**: Removed `.order("chapter_number")` and `.order("artigo")` from database queries.

```typescript
// BEFORE:
.eq("orcamento_tabs.orcamento_id", id)
.order("chapter_number");

// AFTER:
.eq("orcamento_tabs.orcamento_id", id);
// Removed .order("chapter_number") to preserve insertion order from Excel
```

**Result**: Chapters and items are returned in their insertion order (which follows the Excel sheet order), not sorted by their numeric values.

### Fix 5: Simplified Article Storage
**File**: `src/pages/MapaQuantidades.tsx**
**Lines**: 1420-1425

**Change**: Removed unnecessary grouping logic in the `onSuccess` handler since grouping happens in the `useEffect`.

```typescript
// BEFORE:
const groupedArticles = new Map<string, typeof data.articlesData>();
data.articlesData.forEach((article) => {
  const key = article.chapter_number;
  // ...
});
sessionStorage.setItem(`articles_${id}`, JSON.stringify(data.articlesData));

// AFTER:
// Store articlesData for later use in useEffect
// The data already has order_index to preserve Excel sheet order
sessionStorage.setItem(`articles_${id}`, JSON.stringify(data.articlesData));
```

**Result**: Cleaner code, and the order preservation is handled consistently in one place.

## Testing Instructions

### Test Case 1: Multi-Sheet Excel with Articles in Different Order
1. Create an Excel file with 2+ sheets
2. In Sheet1, add:
   - Chapter 3 with Article 3.2, 3.1 (reverse order)
3. In Sheet2, add:
   - Chapter 1 with Article 1.5, 1.2, 1.3 (non-sequential)
4. Upload and analyze with article-based view
5. **Expected**: Articles appear in Sheet1-3.2, 3.1, Sheet2-1.5, 1.2, 1.3 order (not reordered by number)

### Test Case 2: Same Chapter Number in Different Sheets
1. Create an Excel file with 2 sheets
2. In Sheet1, add Chapter 1 with Articles 1.1, 1.2
3. In Sheet2, add Chapter 1 with Articles 1.3, 1.4
4. Upload and analyze with article-based view
5. **Expected**: Articles appear as Sheet1-1.1, 1.2, Sheet2-1.3, 1.4 (sheet order preserved)

### Test Case 3: Non-Sequential Article Numbers
1. Create an Excel file with:
   - Chapter 1
   - Article 1.5 (first)
   - Article 1.1 (second)
   - Article 1.9 (third)
2. Upload and analyze with article-based view
3. **Expected**: Articles appear as 1.5, 1.1, 1.9 (Excel order, not sorted)

## Technical Notes

### Order Index Calculation
- `order_index` is set to `articlesData.length` when each article is pushed
- This ensures sequential numbering starting from 0
- The index represents the global order across all sheets

### Sheet-Chapter Key Format
- Key format: `${sheet_name}_${chapter_number}`
- Example: `"Sheet1_1"`, `"Sheet2_1"`, `"Sheet1_2"`
- This allows differentiation between same chapter numbers in different sheets

### Backward Compatibility
- The fix is backward compatible with existing article-based view data
- Articles without `order_index` will default to 0 (they'll appear first but maintain relative order)
- The `sheet_name` field was already tracked in the data structure

### TypeScript Improvements
- Added proper type definition for `ArticleDataType` to eliminate `any` types
- Changed `let` to `const` where appropriate
- Fixed linter errors while maintaining functionality

## Verification

Build status: ✅ Success
Lint status: ✅ No new errors (fixed existing errors in MapaQuantidades.tsx)

## Benefits

1. **Preserves User Intent**: Articles appear in the exact order the user created them in Excel
2. **Respects Sheet Context**: Articles from different sheets maintain their sheet boundaries
3. **More Intuitive**: Users can organize content by placement, not by numbering
4. **Flexible**: Allows non-sequential numbering schemes without confusion
5. **Better Multi-Sheet Support**: Handles complex multi-sheet scenarios correctly

## Files Modified

1. `src/pages/MapaQuantidades.tsx` - Main component with order preservation logic
2. `ARTICLE_ORDER_PRESERVATION_FIX.md` - This documentation file

## Migration Required

No database migration is required. The changes are purely in the application logic and in-memory data structures. Existing articles will work with the new code (they'll use order_index = 0 as default).
