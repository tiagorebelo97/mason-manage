# Quick Reference: Article Unique ID Fix

## Problem
Article-based view failing when same article number appears multiple times - duplicate React keys causing rendering issues.

## Solution
Generate unique UUID for each article row during analysis, not from article data.

## Changes Made

### 1. Type Definition (Line 576)
```typescript
const articlesData: Array<{
  id: string; // ← ADDED
  sheet_name: string;
  chapter_number: string;
  artigo: string;
  ...
}>
```

### 2. Generate UUID (3 locations: Lines 806, 845, 1139)
```typescript
articlesData.push({
  id: crypto.randomUUID(), // ← ADDED
  sheet_name: sheetName,
  chapter_number: currentChapterNumber,
  artigo: currentArticleArtigo,
  ...
});
```

### 3. Use Stored ID (Line 344)
```typescript
// BEFORE:
id: `${chapter.id}_${articleData.artigo}`

// AFTER:
id: articleData.id
```

## Test
```bash
npm run build  # ✅ Success
```

## Result
- ✅ Each article row has unique ID
- ✅ Repeated article data works correctly
- ✅ No React key warnings
- ✅ Independent collapse/expand behavior

## Files Modified
- `src/pages/MapaQuantidades.tsx` (5 changes)

## Documentation
- `ARTICLE_UNIQUE_ID_FIX.md` - Detailed explanation
- `ARTICLE_ID_FIX_VISUAL.md` - Visual before/after comparison
