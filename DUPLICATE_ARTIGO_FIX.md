# Duplicate ARTIGO Number Fix for Article-Based View

## Problem Statement

When using article-based view to analyze an Excel file with multiple sheets, if the same ARTIGO (chapter) number appeared on different sheets (e.g., Chapter "1" in Sheet1 AND Chapter "1" in Sheet2), the application would fail to correctly group and display the articles.

### Example Scenario

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

**Previous Behavior:**
- All articles with the same chapter number were grouped together
- Articles from Sheet2's Chapter "1" would be incorrectly mixed with Sheet1's Chapter "1"
- This caused display errors and confusion

## Root Cause

The issue was in the article grouping logic in the `useEffect` hook (around line 305-347 in `MapaQuantidades.tsx`):

### Before Fix:
```typescript
// Group articles by chapter_number only
const groupedByChapter = new Map<string, typeof articlesData>();
articlesData.forEach((article) => {
  if (!groupedByChapter.has(article.chapter_number)) {
    groupedByChapter.set(article.chapter_number, []);
  }
  groupedByChapter.get(article.chapter_number)!.push(article);
});
```

This code grouped articles using only `chapter_number` as the key, ignoring the `sheet_name`. So articles from different sheets with the same chapter number would be grouped together.

## Solution

The fix ensures that articles are grouped by the combination of `sheet_name` AND `chapter_number`, maintaining the original extraction order. Then, database chapters are matched to article groups in the correct order.

### After Fix:
```typescript
// Group articles by sheet_name + chapter_number
// Maintain insertion order by storing groups in an array
const groupOrder: Array<{
  sheetName: string;
  chapterNumber: string;
  articles: typeof articlesData;
}> = [];

articlesData.forEach((article) => {
  // Find or create group for this sheet + chapter combination
  let group = groupOrder.find(g => 
    g.sheetName === article.sheet_name && 
    g.chapterNumber === article.chapter_number
  );
  
  if (!group) {
    group = {
      sheetName: article.sheet_name,
      chapterNumber: article.chapter_number,
      articles: []
    };
    groupOrder.push(group);
  }
  
  group.articles.push(article);
});

// Match article groups to database chapters in order
groupOrder.forEach((groupData) => {
  const candidateChapters = chaptersByNumber.get(groupData.chapterNumber) || [];
  const chapter = candidateChapters.find(ch => !usedChapters.has(ch.id));
  // ... assign articles to the correct chapter
});
```

### Key Improvements:

1. **Unique Grouping**: Articles are now grouped by `sheet_name + chapter_number`, ensuring separation between sheets
2. **Order Preservation**: Using an array instead of a Map maintains the extraction order (sheet order)
3. **Correct Matching**: Database chapters are matched to article groups in the same order they were created

## Technical Details

### How Chapters are Created

During Excel analysis:
1. Sheets are processed in order (Sheet1, Sheet2, Sheet3, ...)
2. Chapters are extracted and stored with their `sheet_name`
3. Chapters are inserted into the database (without `sheet_name`, only `chapter_number`)
4. Database assigns sequential IDs to chapters in insertion order

### How Articles are Matched

After analysis:
1. Articles are stored in sessionStorage with `sheet_name` and `chapter_number`
2. Chapters are fetched from database (ordered by `chapter_number`, then implicitly by ID)
3. Articles are grouped by `sheet_name + chapter_number`
4. Each article group is matched to the first unused database chapter with matching `chapter_number`
5. The "first unused" approach ensures Sheet1's Chapter "1" gets matched before Sheet2's Chapter "1"

## Changes Made

### File: `src/pages/MapaQuantidades.tsx`

#### 1. Updated useEffect Hook (Lines ~305-365)
- Changed article grouping from `chapter_number` only to `sheet_name + chapter_number`
- Implemented order-preserving array structure instead of Map
- Added logic to match articles to database chapters using "first unused" strategy

#### 2. Cleaned Up onSuccess Callback (Lines ~1384-1402)
- Removed unused `groupedArticles` variable that was grouping by `chapter_number` only
- Simplified to just store articles in sessionStorage

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
| 1.1.2  | Excavation                 | m3  | 100  |
```

**Sheet2:**
```
| ARTIGO | DESCRIÇÃO                  | UN  | QT   |
|--------|----------------------------|-----|------|
| 1      | Electrical Work            |     |      |
| 1.1    | Power Distribution         |     |      |
| 1.1.1  | Main panel installation    | un  | 1    |
| 1.1.2  | Cable routing              | m   | 200  |
```

**Steps:**
1. Upload the Excel file to an Orcamento
2. Enable "Article-based view" checkbox
3. Click "Analyze"
4. Navigate to "Principal" tab

**Expected Results:**
- Two chapters displayed: "1. Foundation Work" and "1. Electrical Work"
- Each chapter shows its own articles:
  - First "1.1" article is about "Site Preparation" (from Sheet1)
  - Second "1.1" article is about "Power Distribution" (from Sheet2)
- Click on "1.1 Site Preparation" → shows items 1.1.1 and 1.1.2 from Sheet1
- Click on "1.1 Power Distribution" → shows items 1.1.1 and 1.1.2 from Sheet2
- No mixing of data between sheets

### Test Case 2: Multi-Sheet File with Different Chapter Numbers

**Sheet1:**
```
| ARTIGO | DESCRIÇÃO           | UN  | QT  |
|--------|---------------------|-----|-----|
| 1      | Foundation          |     |     |
| 1.1    | Excavation          |     |     |
| 1.1.1  | Manual work         | m3  | 50  |
```

**Sheet2:**
```
| ARTIGO | DESCRIÇÃO           | UN  | QT  |
|--------|---------------------|-----|-----|
| 2      | Structure           |     |     |
| 2.1    | Concrete work       |     |     |
| 2.1.1  | Pouring             | m3  | 30  |
```

**Expected Results:**
- Two chapters displayed: "1. Foundation" and "2. Structure"
- Each article appears under its correct chapter
- No conflicts or errors

### Test Case 3: Single Sheet with Multiple Chapters

**Sheet1:**
```
| ARTIGO | DESCRIÇÃO           | UN  | QT  |
|--------|---------------------|-----|-----|
| 1      | Foundation          |     |     |
| 1.1    | Excavation          |     |     |
| 2      | Structure           |     |     |
| 2.1    | Concrete            |     |     |
```

**Expected Results:**
- Existing behavior should remain unchanged
- All articles displayed correctly under their chapters

## Verification

After implementing this fix:
- ✅ Articles from different sheets with the same ARTIGO number are correctly separated
- ✅ Each sheet's articles are matched to the correct database chapter
- ✅ Article detail views show the correct content for each sheet
- ✅ No data loss or mixing between sheets
- ✅ Single-sheet behavior remains unchanged

## Impact

- **Article-based view with multi-sheet files**: FIXED - now works correctly
- **Article-based view with single-sheet files**: UNCHANGED - continues to work
- **Normal view (non-article-based)**: UNCHANGED - not affected by these changes
