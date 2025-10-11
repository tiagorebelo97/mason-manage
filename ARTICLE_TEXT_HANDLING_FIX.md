# Article Text Handling Fix

## Problem Statement

When using article-based view mode, text rows (rows without ARTIGO, UN, and QT) were being added to both:
1. Article contents (correct)
2. `parentCommentsMap` (incorrect)

This caused text to appear in item comments instead of just being text in the article.

### Example Problem Cases

**Case 1: Text row after items not being added to article**

```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Chapter             |    |    |
| 1.2    | Demolições          |    |    | ← article
|        | Incluir entulho     |    |    | ← text of the article 1.2
|        | Transporte incluído |    |    | ← text of the article 1.2	
| 1.2.1  | Incluir entulho     |    |    | ← text of the article 1.2
|        | Paredes interiores  | m2 | 50 | ← Gets last Artigo number and full comment
|        | Paredes testec      | m2 | 50 | ← Gets last Artigo number and full comment
|        | Nota: xpto          |    |    | ← text of the article 1.2 (NOT BEING ADDED!)
```

**Result Before Fix**: "Nota: xpto" was not being added to the article content.

**Case 2: Text row between items being added to item comments**

```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Chapter             |    |    |
| 1.2    | Demolições          |    |    | ← article
|        | Incluir entulho     |    |    | ← text of the article 1.2
|        | Transporte incluído |    |    | ← text of the article 1.2	
| 1.2.1  | Incluir entulho     |    |    | ← text of the article 1.2
|        | Paredes interiores  | m2 | 50 | ← Gets last Artigo number and full comment
|        | Paredes testec      | m2 | 50 | ← Gets last Artigo number and full comment
|        | Nota: xpto          |    |    | ← text of the article 1.2
|        | Paredes interiores  | m2 | 50 | ← Gets last Artigo number and full comment
|        | Paredes testec      | m2 | 50 | ← Gets last Artigo number and full comment
```

**Result Before Fix**: "Nota: xpto" was being added to the previous item's comments instead of staying as text in the article between the two sets of items.

## Root Cause

The issue was in three cases:

### Case 2: Parent Comment Handling
When processing rows with ARTIGO but no UN/QT (like "1.2.1" under article "1.2"), the code was:
1. Adding to `parentCommentsMap` (for item comment inheritance)
2. Adding to article contents

This caused the text to appear in both places.

### Case 3: Multi-line Comment Handling
When processing rows without ARTIGO, UN, or QT:
1. Always added to `parentCommentsMap` (for item comment inheritance)
2. Added to article contents (if in article-based view)

This caused text rows to be inherited by items as comments.

### Case 4: Non-numeric ARTIGO Handling
When processing rows with non-numeric ARTIGO (like "Note", "A"):
1. Added to item comments (in non-article view)
2. Added to article contents (in article view)

But in article view, it should ONLY be added to article contents, not item comments.

## Solution

The fix separates the behavior based on whether `articleBasedView` is enabled:

### Case 2 Changes

**Before:**
```typescript
else if (artigoCell && /^\d+\./.test(artigoCell) && !hasUN && !hasQT && descricaoCell) {
  const isChildOfLastComment = lastCommentArtigo && artigoCell.startsWith(lastCommentArtigo + '.');
  
  if (isChildOfLastComment) {
    // Always add to parentCommentsMap
    parentCommentsMap.get(lastCommentArtigo)!.push(descricaoCell);
  } else {
    // Always add to parentCommentsMap
    parentCommentsMap.get(artigoCell)!.push(descricaoCell);
    lastCommentArtigo = artigoCell;
  }
  
  // Also add to article contents if in article view
  if (articleBasedView && currentArticleArtigo) {
    currentArticleContents.push({type: 'text', data: descricaoCell});
  }
}
```

**After:**
```typescript
else if (artigoCell && /^\d+\./.test(artigoCell) && !hasUN && !hasQT && descricaoCell) {
  const isChildOfLastComment = lastCommentArtigo && artigoCell.startsWith(lastCommentArtigo + '.');
  const isChildOfArticle = articleBasedView && currentArticleArtigo && artigoCell.startsWith(currentArticleArtigo + '.');
  
  if (isChildOfArticle) {
    // Article-based view: only add to article contents, not parentCommentsMap
    if (articleBasedView && currentArticleArtigo) {
      currentArticleContents.push({type: 'text', data: descricaoCell});
    }
  } else if (isChildOfLastComment) {
    // Non-article view: add to parentCommentsMap
    if (!articleBasedView) {
      parentCommentsMap.get(lastCommentArtigo)!.push(descricaoCell);
    }
    // Article view: add to article contents
    if (articleBasedView && currentArticleArtigo) {
      currentArticleContents.push({type: 'text', data: descricaoCell});
    }
  } else {
    // Non-article view: add to parentCommentsMap
    if (!articleBasedView) {
      parentCommentsMap.get(artigoCell)!.push(descricaoCell);
      lastCommentArtigo = artigoCell;
    }
    // Article view: add to article contents
    if (articleBasedView && currentArticleArtigo) {
      currentArticleContents.push({type: 'text', data: descricaoCell});
    }
  }
}
```

### Case 3 Changes

**Before:**
```typescript
else if (!artigoCell && !hasUN && !hasQT && descricaoCell && lastCommentArtigo) {
  // Always add to parentCommentsMap
  parentCommentsMap.get(lastCommentArtigo)!.push(descricaoCell);
  
  // Also add to article contents if in article view
  if (articleBasedView && currentArticleArtigo) {
    currentArticleContents.push({type: 'text', data: descricaoCell});
  }
}
```

**After:**
```typescript
else if (!artigoCell && !hasUN && !hasQT && descricaoCell && (lastCommentArtigo || (articleBasedView && currentArticleArtigo))) {
  // Non-article view: add to parentCommentsMap
  if (!articleBasedView && lastCommentArtigo) {
    parentCommentsMap.get(lastCommentArtigo)!.push(descricaoCell);
  }
  
  // Article view: add to article contents
  if (articleBasedView && currentArticleArtigo) {
    currentArticleContents.push({type: 'text', data: descricaoCell});
  }
}
```

**Key changes:**
1. Updated condition to also match when `articleBasedView && currentArticleArtigo` (not just `lastCommentArtigo`)
2. Only add to `parentCommentsMap` when NOT in article-based view

### Case 4 Changes

**Before:**
```typescript
else if (artigoCell && !/^\d+$/.test(artigoCell) && !/^\d+\./.test(artigoCell) && !hasUN && !hasQT && descricaoCell) {
  if (currentChapterNumber && !firstItemFoundInChapter) {
    chapterComments.push(descricaoCell);
  } else if (firstItemFoundInChapter && itemsToInsert.length > 0) {
    // Add to last item's comments
    const lastItem = itemsToInsert[itemsToInsert.length - 1];
    lastItem.item_comments += '\n' + descricaoCell;
  }
  
  // Also add to article contents if in article view
  if (articleBasedView && currentArticleArtigo) {
    currentArticleContents.push({type: 'text', data: descricaoCell});
  }
}
```

**After:**
```typescript
else if (artigoCell && !/^\d+$/.test(artigoCell) && !/^\d+\./.test(artigoCell) && !hasUN && !hasQT && descricaoCell) {
  // In article-based view, treat as article text first
  if (articleBasedView && currentArticleArtigo) {
    currentArticleContents.push({type: 'text', data: descricaoCell});
  }
  // In non-article-based view, handle as before
  else if (currentChapterNumber && !firstItemFoundInChapter) {
    chapterComments.push(descricaoCell);
  } else if (firstItemFoundInChapter && itemsToInsert.length > 0) {
    const lastItem = itemsToInsert[itemsToInsert.length - 1];
    lastItem.item_comments += '\n' + descricaoCell;
  }
}
```

**Key change:** Check for article-based view first, using `if...else if` instead of separate `if` statements.

## Impact

### Article-Based View (Fixed) ✅

**Processing Flow for Case 1:**
1. Row `1.2`: Article detected → `currentArticleArtigo = "1.2"`
2. Rows with empty ARTIGO: Added to `currentArticleContents` ONLY (not `parentCommentsMap`)
3. Row `1.2.1`: Detected as child of article "1.2" → Added to `currentArticleContents` ONLY
4. Items: Added to both `itemsToInsert` and `currentArticleContents`
5. Row "Nota: xpto": Added to `currentArticleContents` as text

**Result:** Article contains all text in proper order, items don't have unwanted comments.

**Processing Flow for Case 2:**
1. Row `1.2`: Article detected
2. Item 1: Added to article
3. Row "Nota: xpto": Added to article as text (between items)
4. Item 2: Added to article

**Result:** "Nota" appears as text between the two sets of items.

### Non-Article-Based View (Unchanged) ✅

**Processing Flow:**
1. Row `1.2`: Comment parent → `parentCommentsMap["1.2"] = ["Demolições"]`, `lastCommentArtigo = "1.2"`
2. Rows with empty ARTIGO: Added to `parentCommentsMap["1.2"]`
3. Row `1.2.1`: Detected as child → Added to `parentCommentsMap["1.2"]`
4. Items: Inherit comments from `parentCommentsMap["1.2"]`

**Result:** Items get complete comments as expected (existing behavior preserved).

## Benefits

✅ **Correct Article Text Handling**: Text rows in article-based view now only appear as text in the article, not in item comments

✅ **Text Between Items**: Text rows between items stay in their correct position in the article

✅ **Backward Compatible**: Non-article-based view behavior unchanged

✅ **Child ARTIGO Handling**: Child ARTIGOs (like "1.2.1" under article "1.2") are properly treated as article text

✅ **Non-numeric ARTIGO Handling**: Rows like "Note:" are properly handled in article-based view

## Files Modified

- `src/pages/MapaQuantidades.tsx` - Updated Case 2, Case 3, and Case 4 to conditionally add to `parentCommentsMap` based on `articleBasedView` flag

## Testing Recommendations

Test the following scenarios in both article-based view and non-article-based view:

1. **Text rows after items** - Verify text is added to article, not to item comments
2. **Text rows between items** - Verify text stays between items in the article
3. **Child ARTIGOs** - Verify "1.2.1" under article "1.2" is treated as text
4. **Non-numeric ARTIGOs** - Verify "Note:" rows are treated as text in article view
5. **Item comment inheritance** - Verify items still get comments from parent ARTIGOs in non-article view
