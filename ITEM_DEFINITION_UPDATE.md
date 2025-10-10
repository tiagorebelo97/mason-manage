# Item Definition and Comment Handling Update

## Overview
This document describes the updates made to the Excel analysis logic in `MapaQuantidades.tsx` to align with the new item definition and comment handling requirements.

## Key Changes

### 1. Item Definition (CRITICAL CHANGE)
**Before:** An item was any row with QT **OR** UN  
**After:** An item is a row with QT **AND** UN

This is a fundamental change in how items are identified. Now both values must be present for a row to be considered an item.

```typescript
// OLD LOGIC
if (hasQT || hasUN) {
  // This is an item
}

// NEW LOGIC  
if (hasQT && hasUN) {
  // This is an item
}
```

### 2. Chapter Comments Timing
**Before:** Chapter comments were accumulated for all rows without ARTIGO after a chapter  
**After:** Chapter comments are only accumulated **between the chapter and the first item**

This prevents rows that appear after items from being incorrectly classified as chapter comments.

**Example:**
```
| ARTIGO | DESCRIÇÃO                    | UN | QT |
|--------|------------------------------|----|----|
| 1      | Trabalhos Preliminares       |    |    | <- CHAPTER
|        | Inclui limpeza               |    |    | <- CHAPTER COMMENT ✓
|        | e preparação                 |    |    | <- CHAPTER COMMENT ✓
| 1.1    | Limpeza do terreno           | m2 | 50 | <- FIRST ITEM (comments stop here)
|        | Nota adicional               |    |    | <- NOT a chapter comment ✗
```

### 3. Multi-line Parent Comments (NEW)
Parent comments (rows with ARTIGO but no UN/QT) can now span multiple lines. Subsequent rows without ARTIGO, UN, or QT are accumulated as part of the parent comment.

**Example:**
```
| ARTIGO | DESCRIÇÃO                    | UN | QT |
|--------|------------------------------|----|----|
| 1.2    | Demolições gerais            |    |    | <- PARENT COMMENT (line 1)
|        | Incluir remoção de entulho   |    |    | <- PARENT COMMENT (line 2)
|        | Transporte incluído          |    |    | <- PARENT COMMENT (line 3)
| 1.2.1  | Paredes interiores           | m2 | 50 | <- ITEM (receives all 3 lines)
```

The item "1.2.1" will have `item_comments` containing:
```
Demolições gerais
Incluir remoção de entulho
Transporte incluído
```

### 4. Items Without ARTIGO (NEW)
Items (rows with both UN and QT) that don't have an ARTIGO value will inherit the ARTIGO from the most recent parent comment.

**Example:**
```
| ARTIGO | DESCRIÇÃO              | UN | QT |
|--------|------------------------|----|----|
| 1.2    | Demolições gerais      |    |    | <- PARENT COMMENT (ARTIGO = 1.2)
| 1.2.1  | Paredes interiores     | m2 | 50 | <- ITEM with explicit ARTIGO
|        | Portas                 | un | 3  | <- ITEM assumes ARTIGO from last parent (1.2)
```

## Implementation Details

### New Variables Added
```typescript
const parentCommentsMap = new Map<string, string[]>(); // Changed from Map<string, string>
let lastCommentArtigo: string | null = null;          // NEW - tracks last parent comment
let firstItemFoundInChapter = false;                   // NEW - limits chapter comments
```

### Processing Logic Flow

1. **Chapter Row** (pure number in ARTIGO)
   - Create new chapter
   - Reset `firstItemFoundInChapter` to false
   - Reset `lastCommentArtigo` to null
   - Clear `chapterComments` array

2. **Chapter Comment Row** (no ARTIGO, UN, QT but has DESCRIÇÃO)
   - Only add if `!firstItemFoundInChapter`
   - Reset `lastCommentArtigo` to null

3. **Parent Comment Row** (has ARTIGO matching `\d+\.` but no UN and QT)
   - Store DESCRIÇÃO in `parentCommentsMap` as an array
   - Set `lastCommentArtigo` to this ARTIGO

4. **Multi-line Comment Row** (no ARTIGO, UN, QT after a parent comment)
   - Append to the array in `parentCommentsMap` for `lastCommentArtigo`

5. **Item Row** (has BOTH UN and QT)
   - Mark `firstItemFoundInChapter` as true
   - Determine ARTIGO (use row's ARTIGO or inherit from `lastCommentArtigo`)
   - Look up parent comment by extracting parent ARTIGO
   - Join all comment lines with `\n`
   - Create item with all data

## Testing Scenarios

### Scenario 1: Basic Item with Parent Comment
```
| ARTIGO | DESCRIÇÃO         | UN | QT |
|--------|-------------------|----|----|
| 1.2    | Parent comment    |    |    |
| 1.2.1  | Child item        | m2 | 50 |
```
**Result:** Item "1.2.1" has `item_comments = "Parent comment"`

### Scenario 2: Multi-line Parent Comment
```
| ARTIGO | DESCRIÇÃO         | UN | QT |
|--------|-------------------|----|----|
| 1.2    | Parent line 1     |    |    |
|        | Parent line 2     |    |    |
| 1.2.1  | Child item        | m2 | 50 |
```
**Result:** Item "1.2.1" has `item_comments = "Parent line 1\nParent line 2"`

### Scenario 3: Chapter Comments Before First Item
```
| ARTIGO | DESCRIÇÃO         | UN | QT |
|--------|-------------------|----|----|
| 1      | Chapter           |    |    |
|        | Chapter comment   |    |    |
| 1.1    | First item        | m2 | 50 |
|        | Not chapter comm  |    |    |
```
**Result:** Chapter has `chapter_comments = "Chapter comment"`, last row is ignored

### Scenario 4: Item Inheriting ARTIGO
```
| ARTIGO | DESCRIÇÃO         | UN | QT |
|--------|-------------------|----|----|
| 1.2    | Parent comment    |    |    |
|        | Item 1            | m2 | 50 |
```
**Result:** Item has `artigo = "1.2"` (inherited from parent)

### Scenario 5: Item Requires Both UN and QT
```
| ARTIGO | DESCRIÇÃO         | UN | QT |
|--------|-------------------|----|----|
| 1.1    | Has only UN       | m2 |    |
| 1.2    | Has only QT       |    | 50 |
| 1.3    | Has both          | m2 | 50 |
```
**Result:** Only row 1.3 is created as an item

## Migration Notes

### Breaking Changes
⚠️ **IMPORTANT:** This update changes the fundamental definition of an item. Any existing Excel files that rely on rows with only UN or only QT being treated as items will now behave differently.

### What to Check
1. Verify that all items in your Excel files have both UN and QT values
2. Check that chapter comments only appear before the first item in each chapter
3. Ensure multi-line parent comments are properly formatted (no ARTIGO, UN, QT on continuation lines)

## Benefits

1. **More Accurate Item Detection:** Only rows with complete data (both unit and quantity) are treated as items
2. **Better Comment Organization:** Chapter comments are limited to their proper scope
3. **Multi-line Support:** Comments can span multiple rows for better readability
4. **Flexible ARTIGO Assignment:** Items can inherit ARTIGO values when not explicitly provided

## Code Location

All changes are in `/src/pages/MapaQuantidades.tsx`, specifically in the Excel analysis section around lines 493-665.
