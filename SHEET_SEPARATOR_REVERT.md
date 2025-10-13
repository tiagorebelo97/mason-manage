# Sheet Separator Placement Revert

## Problem Statement

The user reported that:
> "you are inserting the separators inside of the chapters, but what i wont is the chapters inside of the chapters, and the order of the separators should be the order of the sheets"

In the previous implementation (documented in `ARTICLE_VIEW_MULTISHEET_FIX_2.md`), the sheet separators were placed **inside chapters**, grouping articles by sheet within each chapter. However, the user wants the opposite: sheet separators should come **first**, with chapters grouped under each sheet.

## Solution Implemented

Reverted the grouping logic to display:
1. **Sheet separators at the tab level** (not inside chapters)
2. **Chapters grouped under each sheet separator**
3. **Sheet order preserved** from the original Excel file

## Visual Comparison

### Before (Incorrect):
```
[Principal] Tab

▼ 1. Chapter Name
  📄 Sheet1 (Separator inside chapter)
    - Article 1.1 from Sheet1
    - Article 1.2 from Sheet1
  📄 Sheet2 (Separator inside chapter)
    - Article 1.1 from Sheet2
    - Article 1.3 from Sheet2

▼ 2. Another Chapter
  📄 Sheet1
    - Article 2.1 from Sheet1
```

### After (Correct):
```
[Principal] Tab

📄 Sheet1 (Separator at tab level)
  ▼ 1. Chapter Name
    - Article 1.1 from Sheet1
    - Article 1.2 from Sheet1
  ▼ 2. Another Chapter
    - Article 2.1 from Sheet1

📄 Sheet2 (Separator at tab level)
  ▼ 1. Chapter Name
    - Article 1.1 from Sheet2
    - Article 1.3 from Sheet2
```

## Technical Changes

### File: `src/pages/MapaQuantidades.tsx`

#### Changed Section: Lines 2514-2736

**Key Changes:**

1. **Grouping Logic** (Lines 2519-2530):
   - Changed from grouping articles by sheet inside each chapter
   - To grouping chapters by sheet at the tab level
   - Added `sheetOrder` array to preserve the order sheets appear in the data

2. **Rendering Logic** (Lines 2532-2735):
   - Sheet separators now appear **before** chapters
   - Chapters are nested **inside** the sheet groups
   - Removed the nested article-by-sheet grouping that was inside chapters

3. **Sheet Order Preservation**:
   - Uses the order in which sheets first appear in the `chaptersWithArticles` data
   - This naturally preserves the Excel file's sheet order since analysis processes sheets sequentially

## Code Details

### Before:
```typescript
// Group articles by sheet within each chapter
return chaptersForTab.map((chapterWithArticles) => {
  const articlesBySheet = new Map<string, typeof chapterWithArticles.articles>();
  chapterWithArticles.articles.forEach((article) => {
    const sheetName = article.sheet_name || 'Unknown';
    if (!articlesBySheet.has(sheetName)) {
      articlesBySheet.set(sheetName, []);
    }
    articlesBySheet.get(sheetName)!.push(article);
  });
  
  return (
    <Collapsible> {/* Chapter */}
      {Array.from(articlesBySheet.entries()).map(([sheetName, articlesInSheet]) => (
        <div>
          {/* Sheet separator inside chapter */}
          <h4>📄 {sheetName}</h4>
          {/* Articles from this sheet */}
        </div>
      ))}
    </Collapsible>
  );
});
```

### After:
```typescript
// Group chapters by sheet at tab level
const chaptersBySheet = new Map<string, typeof chaptersForTab>();
const sheetOrder: string[] = [];

chaptersForTab.forEach((cwa) => {
  const sheetName = cwa.sheet_name || 'Unknown';
  if (!chaptersBySheet.has(sheetName)) {
    chaptersBySheet.set(sheetName, []);
    sheetOrder.push(sheetName); // Record sheet order
  }
  chaptersBySheet.get(sheetName)!.push(cwa);
});

return sheetOrder.map((sheetName) => {
  const chaptersInSheet = chaptersBySheet.get(sheetName)!;
  
  return (
    <div>
      {/* Sheet separator at tab level */}
      <h2>📄 {sheetName}</h2>
      
      {/* Chapters in this sheet */}
      {chaptersInSheet.map((chapterWithArticles) => (
        <Collapsible> {/* Chapter */}
          {/* All articles in the chapter */}
        </Collapsible>
      ))}
    </div>
  );
});
```

## Benefits

1. **Clearer Visual Hierarchy**: Sheet separators at the top level make it immediately clear which sheet content comes from
2. **Better Organization**: All chapters from a sheet are grouped together
3. **Preserved Order**: Sheets appear in the same order as in the Excel file
4. **No Database Changes**: Works with existing data structure

## Testing

### Build Status
✅ **Success** - No TypeScript errors

### Lint Status
✅ **Success** - No linting errors

### Expected Behavior

1. **Single-sheet files**: No sheet separators shown (chaptersBySheet.size = 1)
2. **Multi-sheet files**: 
   - Sheet separators appear at the tab level
   - Chapters are grouped under their respective sheet separators
   - Sheets appear in the order they were in the Excel file

## Backwards Compatibility

- Single-sheet behavior unchanged (no separators shown)
- Multi-sheet files now display correctly with proper hierarchy
- No breaking changes to data structure or API
