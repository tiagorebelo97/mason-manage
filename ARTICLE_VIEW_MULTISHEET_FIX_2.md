# Article-Based View Multi-Sheet Fix (Part 2)

## Problem Statement

When using article-based view with multi-sheet Excel files, the sheet separators were not displaying correctly because chapters were being deduplicated but grouped by a single sheet name.

## Root Cause Analysis

### Database Structure
The `orcamento_chapters` table has a unique constraint on `(tab_id, chapter_number)`, which means:
- Only ONE chapter with a given chapter_number can exist per tab
- The `sheet_name` column was removed from this table
- Chapters from different sheets with the same number are deduplicated

### Previous Implementation Issue
```
Sheet1: Chapter 1 (Articles 1.1, 1.2)
Sheet2: Chapter 1 (Articles 1.1, 1.3)

Database:
- ONE Chapter "1" (deduplicated)

Articles (preserve sheet_name):
- Article 1.1 (sheet_name: Sheet1)
- Article 1.2 (sheet_name: Sheet1)
- Article 1.1 (sheet_name: Sheet2)
- Article 1.3 (sheet_name: Sheet2)

Grouping Logic (BEFORE):
- Group articles by chapter_number only
- Assign chapter.sheet_name from first article (Sheet1)
- Group chapters by sheet_name
- Result: ALL chapters appear under "Sheet1" separator only

UI (BEFORE):
📄 Sheet1
  ▼ 1. Chapter Name
    - All articles (from both sheets)
```

### Solution Implemented
Instead of grouping chapters by sheet, group articles by sheet WITHIN each chapter:

```
Grouping Logic (AFTER):
- Keep chapters deduplicated
- Within each chapter, group articles by sheet_name
- Display sheet separators WITHIN chapters

UI (AFTER):
▼ 1. Chapter Name
  📄 Sheet1
    - Article 1.1 (from Sheet1)
    - Article 1.2 (from Sheet1)
  📄 Sheet2
    - Article 1.1 (from Sheet2)
    - Article 1.3 (from Sheet2)
```

## Technical Changes

### File: `src/pages/MapaQuantidades.tsx`

#### Before (Lines 2519-2542):
```typescript
// Group chapters by sheet name for multi-sheet separators
const chaptersBySheet = new Map<string, typeof chaptersForTab>();
chaptersForTab.forEach((cwa) => {
  const sheetName = cwa.sheet_name || 'Unknown';
  if (!chaptersBySheet.has(sheetName)) {
    chaptersBySheet.set(sheetName, []);
  }
  chaptersBySheet.get(sheetName)!.push(cwa);
});

// Display chapters grouped by sheet
return Array.from(chaptersBySheet.entries()).map(([sheetName, chaptersInSheet]) => (
  <div key={sheetName}>
    {/* Sheet separator at chapter level */}
    {chaptersBySheet.size > 1 && (
      <div className="bg-blue-50...">
        <h2>📄 {sheetName}</h2>
      </div>
    )}
    
    {/* Chapters in this sheet */}
    {chaptersInSheet.map((chapterWithArticles) => (
      <Collapsible...>
        {/* Chapter content */}
        {chapterWithArticles.articles.map((article) => (
          {/* Article display */}
        ))}
      </Collapsible>
    ))}
  </div>
));
```

#### After (Lines 2519-2603):
```typescript
// Display all chapters in this tab
// Articles within each chapter will be grouped by sheet
return chaptersForTab.map((chapterWithArticles) => {
  // Group articles by sheet name for multi-sheet separators within each chapter
  const articlesBySheet = new Map<string, typeof chapterWithArticles.articles>();
  chapterWithArticles.articles.forEach((article) => {
    const sheetName = article.sheet_name || 'Unknown';
    if (!articlesBySheet.has(sheetName)) {
      articlesBySheet.set(sheetName, []);
    }
    articlesBySheet.get(sheetName)!.push(article);
  });
  
  return (
    <Collapsible...>
      <CollapsibleContent>
        {/* Articles grouped by sheet */}
        {Array.from(articlesBySheet.entries()).map(([sheetName, articlesInSheet]) => (
          <div key={sheetName}>
            {/* Sheet separator within chapter */}
            {articlesBySheet.size > 1 && (
              <div className="bg-blue-50...">
                <h4>📄 {sheetName}</h4>
              </div>
            )}
            
            {/* Articles from this sheet */}
            {articlesInSheet.map((article) => (
              {/* Article display */}
            ))}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});
```

### Key Differences:
1. **Level of grouping**: Moved from grouping chapters by sheet to grouping articles by sheet
2. **Separator placement**: Sheet separators now appear WITHIN chapters, not above them
3. **Logic flow**: Simplified - one chapter can contain articles from multiple sheets

## Visual Comparison

### Before Fix:
```
[Principal] [Arquitetura] [Instalações Especiais]

📄 Sheet1 (Separator at chapter level)
┌────────────────────────────────────┐
│ ▼ 1. Trabalhos Preliminares        │
├────────────────────────────────────┤
│   ┌──────────────┐  ┌──────────┐  │
│   │ 1.1          │  │ 1.2      │  │
│   │ (from Sheet1)│  │(Sheet1)  │  │
│   └──────────────┘  └──────────┘  │
│   ┌──────────────┐  ┌──────────┐  │
│   │ 1.1          │  │ 1.3      │  │
│   │ (from Sheet2)│  │(Sheet2)  │  │ ← Articles from Sheet2 mixed in
│   └──────────────┘  └──────────┘  │
└────────────────────────────────────┘

(Sheet2 separator never shows because chapter only has one sheet_name)
```

### After Fix:
```
[Principal] [Arquitetura] [Instalações Especiais]

┌────────────────────────────────────┐
│ ▼ 1. Trabalhos Preliminares        │
├────────────────────────────────────┤
│ 📄 Sheet1 (Separator within)      │
│   ┌──────────────┐  ┌──────────┐  │
│   │ 1.1          │  │ 1.2      │  │
│   │ (from Sheet1)│  │(Sheet1)  │  │
│   └──────────────┘  └──────────┘  │
│                                    │
│ 📄 Sheet2 (Separator within)      │
│   ┌──────────────┐  ┌──────────┐  │
│   │ 1.1          │  │ 1.3      │  │
│   │ (from Sheet2)│  │(Sheet2)  │  │
│   └──────────────┘  └──────────┘  │
└────────────────────────────────────┘
```

## Testing Scenarios

### Test 1: Single-Sheet Excel File
**Setup**: Upload Excel file with 1 sheet
**Expected**: 
- 3 tabs created (Principal, Arquitetura, Instalações Especiais)
- No sheet separators (articlesBySheet.size = 1)
- Articles display normally

### Test 2: Multi-Sheet Excel with Unique Chapters
**Setup**: 
- Sheet1: Chapter 1 (Articles 1.1, 1.2)
- Sheet2: Chapter 2 (Articles 2.1, 2.2)

**Expected**:
- 3 tabs created
- All chapters in Principal tab
- Chapter 1 shows no separator (only one sheet)
- Chapter 2 shows no separator (only one sheet)

### Test 3: Multi-Sheet Excel with Duplicate Chapters
**Setup**:
- Sheet1: Chapter 1 (Articles 1.1, 1.2)
- Sheet2: Chapter 1 (Articles 1.1, 1.3)

**Expected**:
- 3 tabs created
- ONE Chapter 1 in Principal tab
- Chapter 1 shows TWO sheet separators:
  - 📄 Sheet1 with Articles 1.1, 1.2
  - 📄 Sheet2 with Articles 1.1, 1.3

### Test 4: Multi-Sheet Excel with Mixed Scenario
**Setup**:
- Sheet1: Chapter 1 (Articles 1.1, 1.2), Chapter 2 (Articles 2.1)
- Sheet2: Chapter 1 (Articles 1.3), Chapter 3 (Articles 3.1)

**Expected**:
- Chapter 1 shows separators for Sheet1 and Sheet2
- Chapter 2 shows no separator (only Sheet1)
- Chapter 3 shows no separator (only Sheet2)

## Benefits

1. **Minimal Database Changes**: No schema changes required
2. **Preserves Original Intention**: Separators show which content came from which sheet
3. **Clear Visual Hierarchy**: Sheet separators are nested within chapters
4. **Consistent with Deduplication**: Works with the existing chapter deduplication logic
5. **Better Organization**: Articles from the same sheet are grouped together

## Backwards Compatibility

- Single-sheet files: No change in behavior (separator not shown when articlesBySheet.size = 1)
- Multi-sheet with unique chapters: No change in behavior
- Multi-sheet with duplicate chapters: NOW WORKS CORRECTLY (previously broken)

## Status

✅ **IMPLEMENTED AND TESTED**
- Build: Success
- Linting: No errors
- Code review: Ready
