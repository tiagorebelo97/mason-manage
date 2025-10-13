# Article-Based View Multi-Sheet Duplicate Chapter Fix

## Problem
In Article-based view mode with multiple Excel sheets, having the same chapter or article numbers across different sheets was causing errors. The system was incorrectly mixing articles from different sheets when they had the same chapter number.

## Root Cause
1. Articles were grouped only by `chapter_number`, not considering `sheet_name`
2. When chapters from the database were matched to articles, there was no way to distinguish between:
   - Chapter "1" from Sheet1
   - Chapter "1" from Sheet2
3. This caused articles from both sheets to be mixed together under the same chapter

## Solution
Implemented a composite key approach that uses both `sheet_name` and `chapter_number`:

### 1. Chapter ID to Sheet Name Mapping
During Excel analysis, when chapters are inserted into the database:
- Create a map: `chapterIdToSheetNameMap` that links chapter.id → sheet_name
- Store this mapping in sessionStorage as `chapterMapping_${orcamento_id}`

### 2. Article Grouping with Composite Key
When saving and loading articles:
- Group articles using key: `${sheet_name}_${chapter_number}`
- This ensures articles from different sheets stay separate

### 3. Chapter-to-Article Matching
When loading articles from sessionStorage:
- Load the chapter ID to sheet name mapping
- For each database chapter, look up its sheet_name
- Match articles using composite key: `${sheet_name}_${chapter_number}`

## Code Changes

### Change 1: Create and Store Mapping (MapaQuantidades.tsx ~line 1233)
```typescript
const chapterMap = new Map<string, string>();
const chapterIdToSheetNameMap = new Map<string, string>();
insertedChapters.forEach((chapter, index) => {
  const originalChapter = chaptersToInsert[index];
  if (originalChapter && originalChapter.sheet_name) {
    const key = `${originalChapter.sheet_name}_${chapter.chapter_number}`;
    chapterMap.set(key, chapter.id);
    // Store inverse mapping for article-based view
    chapterIdToSheetNameMap.set(chapter.id, originalChapter.sheet_name);
  }
});
```

### Change 2: Save Mapping to SessionStorage (MapaQuantidades.tsx ~line 1388)
```typescript
sessionStorage.setItem(`articles_${id}`, JSON.stringify(data.articlesData));

// Store the chapter ID to sheet name mapping
if (data.chapterIdToSheetNameMap) {
  const mappingObj = Object.fromEntries(data.chapterIdToSheetNameMap);
  sessionStorage.setItem(`chapterMapping_${id}`, JSON.stringify(mappingObj));
}
```

### Change 3: Load and Use Mapping (MapaQuantidades.tsx ~line 307)
```typescript
const storedArticles = sessionStorage.getItem(`articles_${id}`);
const storedMapping = sessionStorage.getItem(`chapterMapping_${id}`);

if (storedArticles) {
  const articlesData = JSON.parse(storedArticles);
  
  // Load the mapping
  let chapterIdToSheetName = new Map<string, string>();
  if (storedMapping) {
    const mappingObj = JSON.parse(storedMapping);
    chapterIdToSheetName = new Map(Object.entries(mappingObj));
  }
  
  // Group articles by composite key
  const groupedByChapter = new Map<string, typeof articlesData>();
  articlesData.forEach((article) => {
    const key = `${article.sheet_name}_${article.chapter_number}`;
    // ... group articles
  });
  
  // Match chapters to articles
  chapters.forEach((chapter) => {
    const sheetName = chapterIdToSheetName.get(chapter.id);
    if (sheetName) {
      const key = `${sheetName}_${chapter.chapter_number}`;
      const articlesForChapter = groupedByChapter.get(key) || [];
      // ... create ChapterWithArticles
    }
  });
}
```

## Testing Instructions

### Test Case 1: Multiple Sheets with Same Chapter Numbers
1. Create an Excel file with 2 sheets:
   - **Sheet1:**
     - Chapter 1: "Foundation Work"
     - Article 1.1: "Excavation"
     - Item 1.1.1: "Excavate 10m3" (UN: m3, QT: 10)
   - **Sheet2:**
     - Chapter 1: "Electrical Work"  
     - Article 1.1: "Wiring"
     - Item 1.1.1: "Install cables" (UN: m, QT: 100)

2. Upload the file with "Article-based view" enabled
3. Click "Analyze"

**Expected Result:**
- ✅ Analysis completes successfully (no error)
- ✅ Both chapters appear under "Principal" tab
- ✅ Foundation Work chapter shows only its article "Excavation"
- ✅ Electrical Work chapter shows only its article "Wiring"
- ✅ No mixing of articles between the two chapters

### Test Case 2: Multiple Sheets with Same Article Numbers
1. Create an Excel file with 2 sheets:
   - **Sheet1:**
     - Chapter 1: "Masonry"
     - Article 1.1: "Walls"
     - Article 1.2: "Columns"
   - **Sheet2:**
     - Chapter 2: "Plumbing"
     - Article 2.1: "Water Supply"  
     - Article 2.2: "Drainage"

2. Upload with "Article-based view" enabled

**Expected Result:**
- ✅ All articles appear correctly
- ✅ No duplicate or missing articles
- ✅ Each article is under the correct chapter

### Test Case 3: Single Sheet (Regression Test)
1. Upload a single-sheet Excel file with Article-based view enabled
2. Verify it still works correctly

**Expected Result:**
- ✅ Works exactly as before (no regression)

## Verification
- ✅ Build: Successful
- ✅ Lint: No new errors
- ✅ TypeScript: No type errors

## Notes
- The duplicate chapter detection logic (using `seenChapterNumbers`) is per-sheet, which is correct
- This fix only affects article-based view mode
- Regular view (non-article-based) is not affected by this change
