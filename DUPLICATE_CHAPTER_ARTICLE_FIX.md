# Duplicate Chapter/Article Numbers Across Sheets Fix

## Problem Statement

When using article-based view with an Excel file containing multiple sheets with duplicate chapter numbers, the system was incorrectly grouping articles from different sheets together. For example:

**Sheet1:**
- Chapter 1
  - Article 1.1 - "Foundation Work"
  - Article 1.2 - "Concrete Work"

**Sheet2:**
- Chapter 1
  - Article 1.1 - "Steel Structure"
  - Article 1.2 - "Roofing"

The issue was that all articles from both Sheet1 Chapter 1 and Sheet2 Chapter 1 were being grouped together under a single chapter display, instead of being kept separate with their own sheet separators.

## Root Cause

The problem occurred in the article loading logic (`MapaQuantidades.tsx`, lines 304-347):

1. **Incorrect Grouping**: Articles were grouped by `chapter_number` only:
   ```typescript
   const groupedByChapter = new Map<string, typeof articlesData>();
   articlesData.forEach((article) => {
     if (!groupedByChapter.has(article.chapter_number)) {
       groupedByChapter.set(article.chapter_number, []);
     }
     groupedByChapter.get(article.chapter_number)!.push(article);
   });
   ```
   This caused articles from different sheets but with the same chapter number to be mixed together.

2. **Missing Sheet Context**: When matching articles to database chapters, there was no way to distinguish between chapters from different sheets because:
   - Articles include `sheet_name` in their data
   - Database chapters don't store `sheet_name` (only `tab_id`, `chapter_number`, etc.)
   - In article-based view, all sheets map to the "Principal" tab, so multiple chapters can have the same `tab_id` and `chapter_number`

3. **Ambiguous Matching**: When creating `ChapterWithArticles`, the code looked up articles using only `chapter.chapter_number`:
   ```typescript
   const articlesForChapter = groupedByChapter.get(chapter.chapter_number) || [];
   ```
   If there were two chapters in the database (both with `chapter_number="1"` but from different sheets), they would BOTH get the SAME array of articles (mixed from both sheets).

## Solution Implemented

The fix involves three key changes:

### 1. Store Chapter-to-Sheet Mapping (Analysis Phase)

During file analysis, after chapters are inserted into the database, we create a mapping of chapter IDs to their original sheet names and return it:

```typescript
// In analyzeMutation, lines 1328-1340
const chapterIdToSheetName: Record<string, string> = {};
if (chapterMap && insertedChapters) {
  insertedChapters.forEach((chapter, index) => {
    const originalChapter = chaptersToInsert[index];
    if (originalChapter && originalChapter.sheet_name) {
      chapterIdToSheetName[chapter.id] = originalChapter.sheet_name;
    }
  });
}

return { articlesData, articleBasedView, chapterIdToSheetName };
```

### 2. Persist Mapping in SessionStorage

The chapter-to-sheet mapping is stored alongside the articles data:

```typescript
// In onSuccess handler, lines 1355-1361
if (data && data.articleBasedView && data.articlesData) {
  sessionStorage.setItem(`articles_${id}`, JSON.stringify(data.articlesData));
  if (data.chapterIdToSheetName) {
    sessionStorage.setItem(`chapterSheets_${id}`, JSON.stringify(data.chapterIdToSheetName));
  }
}
```

### 3. Use Sheet-Aware Grouping and Matching

When loading articles from sessionStorage, we now:

1. Load both articles data and the chapter-to-sheet mapping
2. Group articles by `${sheet_name}_${chapter_number}` instead of just `chapter_number`
3. For each database chapter, look up its sheet name from the mapping
4. Match articles using both sheet name and chapter number

```typescript
// In useEffect, lines 305-353
const articlesData = JSON.parse(storedArticles);
const chapterIdToSheetName: Record<string, string> = storedChapterSheets ? JSON.parse(storedChapterSheets) : {};

// Group articles by sheet_name + chapter_number
const groupedBySheetAndChapter = new Map<string, typeof articlesData>();
articlesData.forEach((article: typeof articlesData[0]) => {
  const key = `${article.sheet_name}_${article.chapter_number}`;
  if (!groupedBySheetAndChapter.has(key)) {
    groupedBySheetAndChapter.set(key, []);
  }
  groupedBySheetAndChapter.get(key)!.push(article);
});

// Match chapters to articles using sheet name
chapters.forEach((chapter) => {
  const sheetName = chapterIdToSheetName[chapter.id];
  
  if (sheetName) {
    const key = `${sheetName}_${chapter.chapter_number}`;
    const articlesForChapter = groupedBySheetAndChapter.get(key) || [];
    
    if (articlesForChapter.length > 0) {
      chaptersWithArticlesData.push({
        chapter,
        articles: articlesForChapter.map(...),
        sheet_name: sheetName
      });
    }
  }
});
```

## Expected Behavior After Fix

With this fix, when analyzing a multi-sheet Excel file with duplicate chapter numbers:

1. **Separate Chapters**: Each sheet's chapters are kept separate in the database (they already were, but now they're properly tracked)
2. **Correct Article Grouping**: Articles from Sheet1 Chapter 1 are only grouped with Sheet1 Chapter 1, not with Sheet2 Chapter 1
3. **Sheet Separators**: The UI correctly displays sheet separators for each sheet's chapters:
   ```
   📄 Sheet1
   Chapter 1. [Chapter Name]
     Article 1.1 - Foundation Work
     Article 1.2 - Concrete Work
   
   📄 Sheet2
   Chapter 1. [Chapter Name]
     Article 1.1 - Steel Structure
     Article 1.2 - Roofing
   ```

## Testing Instructions

### Test Case: Multi-Sheet with Duplicate Chapter Numbers

1. Create an Excel file with 2 sheets:
   - **Sheet1**: 
     - ARTIGO: 1, DESCRIÇÃO: "Civil Works"
     - ARTIGO: 1.1, DESCRIÇÃO: "Foundation Work"
     - ARTIGO: 1.2, DESCRIÇÃO: "Concrete Work"
   - **Sheet2**:
     - ARTIGO: 1, DESCRIÇÃO: "Steel Works"
     - ARTIGO: 1.1, DESCRIÇÃO: "Steel Structure"
     - ARTIGO: 1.2, DESCRIÇÃO: "Roofing"

2. Upload the file to the application
3. Enable "Article-based view" checkbox
4. Click "Analyze"

**Expected Results:**
- ✅ Analysis completes successfully (no errors)
- ✅ Two sheet separators are shown: "📄 Sheet1" and "📄 Sheet2"
- ✅ Under Sheet1 separator: Chapter 1 with articles 1.1 (Foundation Work) and 1.2 (Concrete Work)
- ✅ Under Sheet2 separator: Chapter 1 with articles 1.1 (Steel Structure) and 1.2 (Roofing)
- ✅ Articles are NOT mixed between sheets

### Additional Test Case: Three Sheets with Various Duplicates

1. Create an Excel file with 3 sheets:
   - **Sheet1**: Chapter 1 with articles, Chapter 2 with articles
   - **Sheet2**: Chapter 1 with articles, Chapter 3 with articles
   - **Sheet3**: Chapter 2 with articles, Chapter 4 with articles

2. Follow the same upload and analysis steps

**Expected Results:**
- ✅ Three sheet separators shown
- ✅ Each chapter appears under its correct sheet separator
- ✅ Duplicate chapter numbers (1 and 2) are kept separate by sheet

## Technical Notes

### SessionStorage Keys

The fix uses two sessionStorage keys per orcamento:
- `articles_${id}`: Stores the articles data (as before)
- `chapterSheets_${id}`: NEW - Stores the chapter ID to sheet name mapping

### Backward Compatibility

If `chapterSheets_${id}` doesn't exist in sessionStorage (e.g., for orcamentos analyzed before this fix), the code handles it gracefully:
```typescript
const chapterIdToSheetName: Record<string, string> = storedChapterSheets ? JSON.parse(storedChapterSheets) : {};
```

However, these old orcamentos may need to be re-analyzed to work correctly with duplicate chapter numbers.

### Data Flow

1. **Analysis**: Excel → chaptersToInsert (with sheet_name) → Database (without sheet_name) → chapterIdToSheetName mapping → SessionStorage
2. **Loading**: SessionStorage (articles + mapping) → Group by sheet+chapter → Match to database chapters → Display with separators

## Verification

- ✅ Build status: Success
- ✅ No TypeScript errors
- ✅ No runtime errors expected
- 📝 Manual testing required with multi-sheet Excel files
