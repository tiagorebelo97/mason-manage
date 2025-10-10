# Non-Numeric ARTIGO Comments Feature

## Overview

This feature extends the comment handling logic to support rows with non-numeric ARTIGO values (e.g., "Note", "A", "Special") as comments.

## Problem Statement

Previously, only rows with:
- Pure numbers (e.g., "1", "2") → Chapters
- Numbers with dots (e.g., "1.2", "1.2.1") → Item comments or Items
- Empty ARTIGO → Chapter comments or multi-line comments

Were properly handled. Rows with non-numeric ARTIGO values (text like "Note", "A", "Special") were ignored.

## Solution

Added a new case (Case 4) to handle non-numeric ARTIGO values:

1. **Before first item**: Non-numeric ARTIGO rows are added to chapter comments
2. **After first item**: Non-numeric ARTIGO rows are appended to the previous item's comments

## Implementation

### Location
File: `src/pages/MapaQuantidades.tsx`

### Logic Flow

```typescript
// Case 4: Non-numeric ARTIGO (text, not a number or number.number pattern)
else if (artigoCell && !/^\d+$/.test(artigoCell) && !/^\d+\./.test(artigoCell) && !hasUN && !hasQT && descricaoCell) {
  // This is a row with non-numeric ARTIGO (e.g., "Note", "A", "Special")
  if (currentChapterNumber && !firstItemFoundInChapter) {
    // Before first item → add to chapter comments
    chapterComments.push(descricaoCell);
    lastCommentArtigo = null;
  } else if (firstItemFoundInChapter && itemsToInsert.length > 0) {
    // After first item → add to the last inserted item's comments
    const lastItem = itemsToInsert[itemsToInsert.length - 1];
    if (lastItem.item_comments) {
      lastItem.item_comments += '\n' + descricaoCell;
    } else {
      lastItem.item_comments = descricaoCell;
    }
  }
}
```

### Pattern Detection

The condition checks for ARTIGO values that are:
- NOT empty/null
- NOT pure numbers (`!/^\d+$/`)
- NOT number patterns like "1.2" (`!/^\d+\./`)
- Has no UN and QT (not an item)
- Has DESCRIÇÃO (has content)

Examples of matching values:
- "Note" ✓
- "A" ✓
- "Special" ✓
- "TODO" ✓
- "1" ✗ (pure number - chapter)
- "1.2" ✗ (number.number - item comment)
- "" ✗ (empty - handled by other cases)

## Test Scenarios

### Scenario 1: Non-Numeric ARTIGO Before First Item (Chapter Comment)

**Excel Structure:**
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Trabalhos           |    |    | <- Chapter
| Note   | Important info      |    |    | <- Non-numeric ARTIGO → Chapter comment
|        | More details        |    |    | <- Empty ARTIGO → Chapter comment (existing behavior)
| 1.1    | First item          | m2 | 50 | <- First item
```

**Expected Result:**
- Chapter "1" has `chapter_comments = "Important info\nMore details"`
- Item "1.1" has no comments

### Scenario 2: Non-Numeric ARTIGO After Item (Post-Item Comment)

**Excel Structure:**
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Trabalhos           |    |    | <- Chapter
| 1.1    | First item          | m2 | 50 | <- First item (firstItemFoundInChapter = true)
| Note   | Item note           |    |    | <- Non-numeric ARTIGO → Added to item 1.1 comments
| 1.2    | Second item         | m2 | 30 | <- Second item
```

**Expected Result:**
- Chapter "1" has `chapter_comments = NULL`
- Item "1.1" has `item_comments = "Item note"`
- Item "1.2" has no comments

### Scenario 3: Multiple Non-Numeric ARTIGO After Item

**Excel Structure:**
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Trabalhos           |    |    | <- Chapter
| 1.1    | First item          | m2 | 50 | <- First item
| A      | Note A              |    |    | <- Added to item 1.1
| B      | Note B              |    |    | <- Added to item 1.1
| 1.2    | Second item         | m2 | 30 | <- Second item
```

**Expected Result:**
- Item "1.1" has `item_comments = "Note A\nNote B"`
- Item "1.2" has no comments

### Scenario 4: Mix of Parent Comment and Non-Numeric ARTIGO

**Excel Structure:**
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Trabalhos           |    |    | <- Chapter
| 1.2    | Parent comment      |    |    | <- Item comment (parent)
|        | Multi-line          |    |    | <- Part of parent comment
| 1.2.1  | Child item          | m2 | 50 | <- Gets parent comment
| Note   | Post-item note      |    |    | <- Added to item 1.2.1
| 1.2.2  | Second child        | m2 | 30 | <- Gets parent comment
```

**Expected Result:**
- Item "1.2.1" has `item_comments = "Parent comment\nMulti-line\nPost-item note"`
- Item "1.2.2" has `item_comments = "Parent comment\nMulti-line"`

### Scenario 5: Non-Numeric ARTIGO with UN/QT (Treated as Item)

**Excel Structure:**
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Trabalhos           |    |    | <- Chapter
| Note   | Item with text ID   | m2 | 50 | <- Has UN and QT → Treated as item!
```

**Expected Result:**
- Item created with `artigo = "Note"`, `un = "m2"`, `qt = 50`
- Not treated as a comment because it has both UN and QT

## Benefits

✅ **More Flexible**: Handles Excel files with text-based notes/markers in ARTIGO column

✅ **Chapter Comments**: Text markers before first item correctly added to chapter comments

✅ **Post-Item Notes**: Text markers after items correctly attached to previous items

✅ **Backward Compatible**: Existing behavior for numeric ARTIGO values unchanged

✅ **Minimal Change**: Only adds one new case, doesn't modify existing logic

## Related Cases

The complete case structure is now:

1. **Case 1**: Chapter (pure number in ARTIGO)
2. **Case 2**: Parent comment (number.number pattern without UN/QT)
3. **Case 3**: Multi-line comment (empty ARTIGO continuing previous comment)
4. **Case 4**: Non-numeric ARTIGO comment (NEW)
5. **Case 5**: Chapter comment (empty ARTIGO before first item)
6. **Case 6**: Item (has both UN and QT)

## Files Modified

- `src/pages/MapaQuantidades.tsx` - Added Case 4 and updated documentation comments
