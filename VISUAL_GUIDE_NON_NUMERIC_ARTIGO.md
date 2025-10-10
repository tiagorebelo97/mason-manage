# Visual Guide: Non-Numeric ARTIGO Comments

## Before vs After

### Scenario 1: Text in ARTIGO Before First Item

#### BEFORE (Ignored)
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Trabalhos           |    |    | ✓ Chapter created
| Note   | Important info      |    |    | ✗ IGNORED (not handled)
| 1.1    | First item          | m2 | 50 | ✓ Item created
```

**Result:** 
- Chapter "1" has `chapter_comments = NULL` ❌
- "Important info" was lost!

#### AFTER (Handled as Chapter Comment)
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Trabalhos           |    |    | ✓ Chapter created
| Note   | Important info      |    |    | ✓ Added to chapter comments
| 1.1    | First item          | m2 | 50 | ✓ Item created
```

**Result:**
- Chapter "1" has `chapter_comments = "Important info"` ✅

---

### Scenario 2: Text in ARTIGO After Item

#### BEFORE (Ignored)
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Trabalhos           |    |    | ✓ Chapter created
| 1.1    | First item          | m2 | 50 | ✓ Item created
| Note   | Item note           |    |    | ✗ IGNORED (not handled)
| 1.2    | Second item         | m2 | 30 | ✓ Item created
```

**Result:**
- Item "1.1" has `item_comments = NULL` ❌
- "Item note" was lost!

#### AFTER (Handled as Post-Item Comment)
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Trabalhos           |    |    | ✓ Chapter created
| 1.1    | First item          | m2 | 50 | ✓ Item created
| Note   | Item note           |    |    | ✓ Added to item 1.1 comments
| 1.2    | Second item         | m2 | 30 | ✓ Item created
```

**Result:**
- Item "1.1" has `item_comments = "Item note"` ✅

---

## Pattern Recognition

### What Counts as "Non-Numeric ARTIGO"?

```
✓ MATCHES (Non-Numeric):
"Note"        → Not a number
"A"           → Letter
"Special"     → Text
"TODO"        → Text
"Info"        → Text
"X"           → Letter
"123ABC"      → Starts with number but not pure number

✗ DOES NOT MATCH (Handled by other cases):
"1"           → Pure number (Chapter)
"2"           → Pure number (Chapter)
"1.1"         → Number.Number (Item comment or Item)
"1.2.3"       → Number.Number.Number (Item)
""            → Empty (Multi-line or Chapter comment)
```

### Condition Breakdown

```typescript
artigoCell                        // Has ARTIGO value (not empty)
  && !/^\d+$/.test(artigoCell)    // NOT a pure number like "1"
  && !/^\d+\./.test(artigoCell)   // NOT a number pattern like "1.2"
  && !hasUN                        // Does NOT have UN
  && !hasQT                        // Does NOT have QT
  && descricaoCell                 // Has DESCRIÇÃO
```

---

## Code Flow Diagram

```
Row with ARTIGO = "Note", no UN/QT, has DESCRIÇÃO
              ↓
    Check: Is it a chapter?
    (pure number "1", "2"...)
              NO
              ↓
    Check: Is it an item comment?
    (pattern "1.2", "1.2.1"...)
              NO
              ↓
    Check: Is it a multi-line comment?
    (empty ARTIGO after comment)
              NO
              ↓
    ✓ Check: Is it non-numeric ARTIGO? ← NEW CASE
              YES
              ↓
    ┌─────────────────────────────────┐
    │ Is firstItemFoundInChapter?     │
    └─────────┬───────────────────┬───┘
              NO                  YES
              ↓                    ↓
    Add to chapter comments    Add to last item's comments
    (Case 4a)                  (Case 4b)
```

---

## Real-World Examples

### Example 1: Construction Notes

```
| ARTIGO | DESCRIÇÃO                      | UN | QT |
|--------|--------------------------------|----|----| 
| 1      | Demolições                     |    |    |
| AVISO  | Requer licença especial        |    |    | ← Added to chapter comments
| 1.1    | Demolição de paredes           | m2 | 50 |
```

### Example 2: Item-Specific Notes

```
| ARTIGO | DESCRIÇÃO                      | UN | QT |
|--------|--------------------------------|----|----| 
| 1      | Trabalhos                      |    |    |
| 1.1    | Escavação                      | m3 | 100|
| NOTA   | Verificar nivel freático       |    |    | ← Added to item 1.1
| 1.2    | Fundações                      | m3 | 50 |
```

### Example 3: Multiple Text Markers

```
| ARTIGO | DESCRIÇÃO                      | UN | QT |
|--------|--------------------------------|----|----| 
| 1      | Trabalhos                      |    |    |
| A      | Primeira fase                  |    |    | ← Chapter comment
| B      | Requer inspeção                |    |    | ← Chapter comment
| 1.1    | Item 1                         | m2 | 50 |
| C      | Item finalizado                |    |    | ← Item 1.1 comment
| D      | Aguardar aprovação             |    |    | ← Item 1.1 comment
| 1.2    | Item 2                         | m2 | 30 |
```

**Result:**
- Chapter "1" comments: "Primeira fase\nRequer inspeção"
- Item "1.1" comments: "Item finalizado\nAguardar aprovação"

---

## Edge Cases

### Case 1: Non-Numeric ARTIGO with UN and QT

```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| Note   | Special item        | m2 | 50 |
```

**Behavior:** Treated as an ITEM (not a comment) because it has both UN and QT
**Result:** Item created with `artigo = "Note"`

### Case 2: Mix with Parent Comments

```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1.2    | Parent comment      |    |    | ← Parent comment (normal behavior)
| Note   | Additional note     |    |    | ← Non-numeric (but no lastCommentArtigo)
| 1.2.1  | Item                | m2 | 50 |
```

**Behavior:** 
- "Parent comment" stored in parentCommentsMap for "1.2"
- "Note" adds to last item's comments (but no item yet) → might be added to chapter comments if before first item
- Item "1.2.1" gets "Parent comment" from parentCommentsMap

### Case 3: Empty Chapter

```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| Note   | Orphan note         |    |    | ← No chapter yet!
```

**Behavior:** Ignored because `currentChapterNumber` is null (no chapter to attach to)

---

## Testing Checklist

- [ ] Test non-numeric ARTIGO before first item (chapter comment)
- [ ] Test non-numeric ARTIGO after item (post-item comment)
- [ ] Test multiple non-numeric ARTIGO values in sequence
- [ ] Test mix of empty and non-numeric ARTIGO
- [ ] Test non-numeric ARTIGO with UN/QT (should create item)
- [ ] Test non-numeric ARTIGO in combination with parent comments
- [ ] Verify existing behavior still works (pure numbers, number patterns, empty ARTIGO)
