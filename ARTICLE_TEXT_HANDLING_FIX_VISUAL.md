# Visual Guide: Article Text Handling Fix

## Problem Visualization

### Before Fix ❌

```
Excel Structure:
┌────────┬──────────────────────┬────┬────┐
│ ARTIGO │ DESCRIÇÃO            │ UN │ QT │
├────────┼──────────────────────┼────┼────┤
│ 1      │ Chapter              │    │    │ ← Chapter
│ 1.2    │ Demolições           │    │    │ ← Article
│        │ Incluir entulho      │    │    │ ← Text
│ 1.2.1  │ More details         │    │    │ ← Child ARTIGO
│        │ Paredes interiores   │ m2 │ 50 │ ← Item
│        │ Nota: xpto           │    │    │ ← Text
└────────┴──────────────────────┴────┴────┘

Processing (Article-Based View):
1. Row "1.2" → Article created
   - currentArticleArtigo = "1.2"
   - currentArticleContents = []

2. Row "Incluir entulho" → Case 3
   - Added to parentCommentsMap["1.2"] ✗
   - Added to currentArticleContents ✓

3. Row "1.2.1" → Case 2
   - Added to parentCommentsMap["1.2"] ✗
   - Added to currentArticleContents ✓

4. Row "Paredes interiores" → Case 6
   - itemArtigo = "1.2" (inherited)
   - Gets comments from parentCommentsMap["1.2"]:
     "Incluir entulho\nMore details" ✗
   - Added to currentArticleContents ✓

5. Row "Nota: xpto" → Case 3
   - Added to parentCommentsMap["1.2"] ✗
   - Added to currentArticleContents ✓

Result:
┌──────────────────────────────────────────────────┐
│ Article: 1.2 - Demolições                        │
├──────────────────────────────────────────────────┤
│ Text: Incluir entulho                            │
│ Text: More details                               │
│ Item: Paredes interiores (m2, 50)               │
│   ↳ Comments: Incluir entulho                   │ ✗ WRONG!
│               More details                       │ ✗ WRONG!
│ Text: Nota: xpto                                 │
└──────────────────────────────────────────────────┘
```

### After Fix ✅

```
Excel Structure:
┌────────┬──────────────────────┬────┬────┐
│ ARTIGO │ DESCRIÇÃO            │ UN │ QT │
├────────┼──────────────────────┼────┼────┤
│ 1      │ Chapter              │    │    │ ← Chapter
│ 1.2    │ Demolições           │    │    │ ← Article
│        │ Incluir entulho      │    │    │ ← Text
│ 1.2.1  │ More details         │    │    │ ← Child ARTIGO (text)
│        │ Paredes interiores   │ m2 │ 50 │ ← Item
│        │ Nota: xpto           │    │    │ ← Text
└────────┴──────────────────────┴────┴────┘

Processing (Article-Based View):
1. Row "1.2" → Article created
   - currentArticleArtigo = "1.2"
   - currentArticleContents = []

2. Row "Incluir entulho" → Case 3
   - NOT added to parentCommentsMap ✓
   - Added to currentArticleContents ✓

3. Row "1.2.1" → Case 2 (isChildOfArticle)
   - NOT added to parentCommentsMap ✓
   - Added to currentArticleContents ✓

4. Row "Paredes interiores" → Case 6
   - itemArtigo = "1.2" (inherited)
   - Gets comments from parentCommentsMap["1.2"]: EMPTY ✓
   - Added to currentArticleContents ✓

5. Row "Nota: xpto" → Case 3
   - NOT added to parentCommentsMap ✓
   - Added to currentArticleContents ✓

Result:
┌──────────────────────────────────────────────────┐
│ Article: 1.2 - Demolições                        │
├──────────────────────────────────────────────────┤
│ Text: Incluir entulho                            │
│ Text: More details                               │
│ Item: Paredes interiores (m2, 50)               │ ✓ CORRECT!
│   ↳ No item comments                            │ ✓ CORRECT!
│ Text: Nota: xpto                                 │
└──────────────────────────────────────────────────┘
```

## Case-by-Case Changes

### Case 2: Parent Comment (with ARTIGO like "1.2.1")

```
┌─────────────────────────────────────────────────────────────┐
│ BEFORE                                                      │
├─────────────────────────────────────────────────────────────┤
│ if (isChildOfLastComment) {                                 │
│   parentCommentsMap.get(lastCommentArtigo).push(...)  ✗    │
│ } else {                                                    │
│   parentCommentsMap.get(artigoCell).push(...)         ✗    │
│   lastCommentArtigo = artigoCell;                           │
│ }                                                           │
│ // Always add to article                                   │
│ if (articleBasedView) { currentArticleContents.push(...) } │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AFTER                                                       │
├─────────────────────────────────────────────────────────────┤
│ if (isChildOfArticle) {                                     │
│   // Only add to article, not parentCommentsMap       ✓    │
│   if (articleBasedView) { currentArticleContents.push(..)}  │
│ } else if (isChildOfLastComment) {                          │
│   if (!articleBasedView) {                                  │
│     parentCommentsMap.get(lastCommentArtigo).push(...)  ✓  │
│   }                                                         │
│   if (articleBasedView) { currentArticleContents.push(..)}  │
│ } else {                                                    │
│   if (!articleBasedView) {                                  │
│     parentCommentsMap.get(artigoCell).push(...)        ✓   │
│     lastCommentArtigo = artigoCell;                         │
│   }                                                         │
│   if (articleBasedView) { currentArticleContents.push(..)}  │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### Case 3: Multi-line Comment (empty ARTIGO)

```
┌─────────────────────────────────────────────────────────────┐
│ BEFORE                                                      │
├─────────────────────────────────────────────────────────────┤
│ Condition: lastCommentArtigo                                │
│                                                             │
│ parentCommentsMap.get(lastCommentArtigo).push(...)    ✗    │
│ if (articleBasedView) { currentArticleContents.push(...) }  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AFTER                                                       │
├─────────────────────────────────────────────────────────────┤
│ Condition: lastCommentArtigo OR                             │
│            (articleBasedView && currentArticleArtigo)  ✓    │
│                                                             │
│ if (!articleBasedView && lastCommentArtigo) {          ✓    │
│   parentCommentsMap.get(lastCommentArtigo).push(...)        │
│ }                                                           │
│ if (articleBasedView) { currentArticleContents.push(...) }  │
└─────────────────────────────────────────────────────────────┘
```

### Case 4: Non-numeric ARTIGO (like "Note")

```
┌─────────────────────────────────────────────────────────────┐
│ BEFORE                                                      │
├─────────────────────────────────────────────────────────────┤
│ if (!firstItemFoundInChapter) {                             │
│   chapterComments.push(...)                                 │
│ } else if (firstItemFoundInChapter) {                       │
│   lastItem.item_comments += ...                       ✗    │
│ }                                                           │
│ // Always add to article                                   │
│ if (articleBasedView) { currentArticleContents.push(...) }  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AFTER                                                       │
├─────────────────────────────────────────────────────────────┤
│ if (articleBasedView && currentArticleArtigo) {        ✓    │
│   currentArticleContents.push(...)                          │
│ }                                                           │
│ else if (!firstItemFoundInChapter) {                        │
│   chapterComments.push(...)                                 │
│ } else if (firstItemFoundInChapter) {                       │
│   lastItem.item_comments += ...                             │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Summary of Changes

```
┌──────────────────────────────────────────────────────────────┐
│ Key Principle                                                │
├──────────────────────────────────────────────────────────────┤
│ In article-based view:                                       │
│   ✓ Text rows → currentArticleContents ONLY                  │
│   ✗ Text rows → NOT added to parentCommentsMap               │
│                                                              │
│ In non-article-based view:                                   │
│   ✓ Comment rows → parentCommentsMap (for item inheritance)  │
│   ✗ Comment rows → NOT in article (no article exists)       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Result                                                       │
├──────────────────────────────────────────────────────────────┤
│ ✓ Text stays as article text                                │
│ ✓ Text between items stays in correct position              │
│ ✓ Items don't get unwanted comments                         │
│ ✓ Non-article view behavior unchanged                       │
└──────────────────────────────────────────────────────────────┘
```

## Testing Scenarios

### Test 1: Text After Items
```
Input:
┌────────┬──────────────────────┬────┬────┐
│ 1.2    │ Article              │    │    │
│        │ Paredes interiores   │ m2 │ 50 │
│        │ Nota: xpto           │    │    │ ← Should be text
└────────┴──────────────────────┴────┴────┘

Expected Output (Article-Based View):
  Article: 1.2 - Article
    Item: Paredes interiores (m2, 50)
    Text: Nota: xpto  ✓
```

### Test 2: Text Between Items
```
Input:
┌────────┬──────────────────────┬────┬────┐
│ 1.2    │ Article              │    │    │
│        │ Paredes A            │ m2 │ 50 │
│        │ Nota: xpto           │    │    │ ← Should be text
│        │ Paredes B            │ m2 │ 50 │
└────────┴──────────────────────┴────┴────┘

Expected Output (Article-Based View):
  Article: 1.2 - Article
    Item: Paredes A (m2, 50)
    Text: Nota: xpto  ✓
    Item: Paredes B (m2, 50)
```

### Test 3: Child ARTIGO
```
Input:
┌────────┬──────────────────────┬────┬────┐
│ 1.2    │ Article              │    │    │
│ 1.2.1  │ Details              │    │    │ ← Should be text
│        │ Paredes              │ m2 │ 50 │
└────────┴──────────────────────┴────┴────┘

Expected Output (Article-Based View):
  Article: 1.2 - Article
    Text: Details  ✓
    Item: Paredes (m2, 50) [no comments]  ✓
```
