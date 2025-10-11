# Quick Reference: Article Text Handling Fix

## Problem
Text rows in article-based view were being added to item comments instead of staying as article text.

## Solution
Modified Case 2, Case 3, and Case 4 to conditionally add text to `parentCommentsMap` based on `articleBasedView` flag.

## Key Changes

### Rule 1: Child ARTIGOs in Article View
**When:** ARTIGO like "1.2.1" appears under article "1.2" (no UN, no QT)
**Before:** Added to both `parentCommentsMap` and `currentArticleContents`
**After:** Only added to `currentArticleContents`

### Rule 2: Text Rows in Article View
**When:** Empty ARTIGO row with text (no UN, no QT) in article-based view
**Before:** Added to both `parentCommentsMap` and `currentArticleContents`
**After:** Only added to `currentArticleContents`

### Rule 3: Non-numeric ARTIGO in Article View
**When:** ARTIGO like "Note" or "A" (no UN, no QT) in article-based view
**Before:** Added to both item comments and `currentArticleContents`
**After:** Only added to `currentArticleContents`

## Code Locations

**File:** `src/pages/MapaQuantidades.tsx`

**Case 2 (Parent Comment):** Lines ~881-934
- Added `isChildOfArticle` check
- Conditionally add to `parentCommentsMap` based on `!articleBasedView`

**Case 3 (Multi-line Comment):** Lines ~936-950
- Updated condition to also match `articleBasedView && currentArticleArtigo`
- Only add to `parentCommentsMap` when `!articleBasedView`

**Case 4 (Non-numeric ARTIGO):** Lines ~952-979
- Check `articleBasedView` first with `if...else if` structure
- Only add to item comments in non-article-based view

## Example Scenarios

### Scenario 1: Text After Items
```
| 1.2    | Demolições          |    |    | ← article
|        | Paredes interiores  | m2 | 50 | ← item
|        | Nota: xpto          |    |    | ← text (now in article, not item comments)
```

### Scenario 2: Text Between Items
```
| 1.2    | Demolições          |    |    | ← article
|        | Paredes interiores  | m2 | 50 | ← item 1
|        | Nota: xpto          |    |    | ← text (stays between items)
|        | Paredes testec      | m2 | 50 | ← item 2
```

### Scenario 3: Child ARTIGO
```
| 1.2    | Demolições          |    |    | ← article
| 1.2.1  | Incluir entulho     |    |    | ← text (not a comment parent)
|        | Paredes interiores  | m2 | 50 | ← item
```

## Verification

✅ Build: `npm run build` - Success
✅ Lint: `npm run lint` - No new errors
✅ Logic: All text rows stay in article, not added to item comments
✅ Backward Compatible: Non-article view behavior unchanged

## Related Documentation

- [ARTICLE_TEXT_HANDLING_FIX.md](./ARTICLE_TEXT_HANDLING_FIX.md) - Detailed documentation
- [ARTICLE_BASED_VIEW_FEATURE.md](./ARTICLE_BASED_VIEW_FEATURE.md) - Article-based view overview
- [NON_NUMERIC_ARTIGO_COMMENTS.md](./NON_NUMERIC_ARTIGO_COMMENTS.md) - Non-numeric ARTIGO handling
