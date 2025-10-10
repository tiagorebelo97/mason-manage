# Visual Changes: Before and After

## Change 1: Item Definition

### BEFORE
```typescript
// Items could have EITHER UN OR QT
if (hasQT || hasUN) {
  // This is an item
}
```

**Example:**
```
| ARTIGO | DESCRIÇÃO    | UN | QT |
|--------|--------------|----|----|
| 1.1    | Item A       | m2 |    | ✓ Item (has UN)
| 1.2    | Item B       |    | 50 | ✓ Item (has QT)
| 1.3    | Item C       | m2 | 50 | ✓ Item (has both)
```
Result: 3 items created

### AFTER
```typescript
// Items MUST have BOTH UN AND QT
if (hasQT && hasUN) {
  // This is an item
}
```

**Example:**
```
| ARTIGO | DESCRIÇÃO    | UN | QT |
|--------|--------------|----|----|
| 1.1    | Item A       | m2 |    | ✗ NOT an item (missing QT)
| 1.2    | Item B       |    | 50 | ✗ NOT an item (missing UN)
| 1.3    | Item C       | m2 | 50 | ✓ Item (has both)
```
Result: 1 item created

---

## Change 2: Chapter Comments Scope

### BEFORE
```typescript
// All rows without ARTIGO after chapter = comments
else if (!artigoCell && descricaoCell && currentChapterNumber) {
  chapterComments.push(descricaoCell);
}
```

**Example:**
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----|
| 1      | Chapter             |    |    |
|        | Comment 1           |    |    | ✓ Chapter comment
|        | Comment 2           |    |    | ✓ Chapter comment
| 1.1    | First item          | m2 | 50 |
|        | Comment 3           |    |    | ✓ Chapter comment (WRONG!)
```
Result: "Comment 1\nComment 2\nComment 3"

### AFTER
```typescript
// Only rows BEFORE first item = chapter comments
else if (!artigoCell && !hasUN && !hasQT && descricaoCell && 
         currentChapterNumber && !firstItemFoundInChapter) {
  chapterComments.push(descricaoCell);
}
```

**Example:**
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----|
| 1      | Chapter             |    |    |
|        | Comment 1           |    |    | ✓ Chapter comment
|        | Comment 2           |    |    | ✓ Chapter comment
| 1.1    | First item          | m2 | 50 | [firstItemFoundInChapter = true]
|        | Comment 3           |    |    | ✗ NOT chapter comment (after item)
```
Result: "Comment 1\nComment 2"

---

## Change 3: Multi-line Parent Comments

### BEFORE
```typescript
// Parent comments stored as single strings
const parentCommentsMap = new Map<string, string>();
parentCommentsMap.set(artigoCell, descricaoCell);
```

**Example:**
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----|
| 1.2    | Parent comment      |    |    | -> stored: "Parent comment"
|        | Extra info          |    |    | ✗ Ignored
| 1.2.1  | Child item          | m2 | 50 |
```
Result: item_comments = "Parent comment"

### AFTER
```typescript
// Parent comments stored as arrays
const parentCommentsMap = new Map<string, string[]>();

// Initial comment
if (!parentCommentsMap.has(artigoCell)) {
  parentCommentsMap.set(artigoCell, []);
}
parentCommentsMap.get(artigoCell)!.push(descricaoCell);

// Continuation lines
else if (!artigoCell && !hasUN && !hasQT && descricaoCell && lastCommentArtigo) {
  parentCommentsMap.get(lastCommentArtigo)!.push(descricaoCell);
}
```

**Example:**
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----|
| 1.2    | Parent comment      |    |    | -> array[0]: "Parent comment"
|        | Extra info          |    |    | -> array[1]: "Extra info"
|        | More details        |    |    | -> array[2]: "More details"
| 1.2.1  | Child item          | m2 | 50 |
```
Result: item_comments = "Parent comment\nExtra info\nMore details"

---

## Change 4: ARTIGO Inheritance

### BEFORE
```typescript
// Items must have explicit ARTIGO
if (/^\d+\./.test(artigoCell) && descricaoCell) {
  // Process item with artigoCell
}
```

**Example:**
```
| ARTIGO | DESCRIÇÃO      | UN | QT |
|--------|----------------|----|----|
| 1.2    | Parent         |    |    |
|        | Item without   | m2 | 50 | ✗ Ignored (no ARTIGO)
```
Result: No item created

### AFTER
```typescript
// Items can inherit ARTIGO from parent comment
let itemArtigo = artigoCell;
if (!artigoCell && lastCommentArtigo) {
  itemArtigo = lastCommentArtigo;
}
```

**Example:**
```
| ARTIGO | DESCRIÇÃO      | UN | QT |
|--------|----------------|----|----|
| 1.2    | Parent         |    |    | [lastCommentArtigo = "1.2"]
|        | Item without   | m2 | 50 | ✓ Item (inherits ARTIGO = "1.2")
```
Result: Item created with artigo = "1.2"

---

## Change 5: Parent Comment Lookup

### BEFORE
```typescript
const parts = artigoCell.split('.');
if (parts.length > 2) {  // Only for 3+ parts
  const parentArtigo = parts.slice(0, -1).join('.');
  itemComment = parentCommentsMap.get(parentArtigo) || null;
}
```

**Example:**
```
| ARTIGO | DESCRIÇÃO      | UN | QT | Comment Lookup |
|--------|----------------|----|----|----------------|
| 1.2    | Parent         |    |    | N/A            |
| 1.2.1  | Child          | m2 | 50 | ✗ No lookup (parts.length = 3, but condition is > 2)
```
Result: item_comments = null

### AFTER
```typescript
if (itemArtigo) {
  const parts = itemArtigo.split('.');
  if (parts.length > 1) {  // For 2+ parts
    const parentArtigo = parts.slice(0, -1).join('.');
    const parentComments = parentCommentsMap.get(parentArtigo);
    if (parentComments && parentComments.length > 0) {
      itemComment = parentComments.join('\n');
    }
  }
}
```

**Example:**
```
| ARTIGO | DESCRIÇÃO      | UN | QT | Comment Lookup  |
|--------|----------------|----|----|-----------------|
| 1.2    | Parent         |    |    | N/A             |
| 1.2.1  | Child          | m2 | 50 | ✓ Looks up "1.2"|
```
Result: item_comments = "Parent"

---

## Summary of Changes

| Feature | Before | After |
|---------|--------|-------|
| Item requires | UN **OR** QT | UN **AND** QT |
| Chapter comments | All rows after chapter | Only before first item |
| Parent comments | Single line | Multi-line support |
| ARTIGO for items | Must be explicit | Can inherit from parent |
| Comment lookup | 3+ part ARTIGOs only | 2+ part ARTIGOs |

## Impact

### ✅ More Accurate
- Items are only created when they have complete data (both unit and quantity)
- Chapter comments don't leak into the items section

### ✅ More Flexible
- Multi-line comments provide better context
- Items can inherit ARTIGO when appropriate

### ✅ More Correct
- Comment hierarchy works for all nesting levels
- Better alignment with Excel structure conventions
