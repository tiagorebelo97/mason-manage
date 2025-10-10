# Nested ARTIGO Comment Fix

## Problem Statement

When analyzing Excel files with nested ARTIGO numbers (like `1.2.1`) appearing after a comment parent (like `1.2`), the nested ARTIGOs were being treated as new comment parents instead of being part of the parent's multi-line comment.

### Example Input

```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Chapter             |    |    |
| 1.2    | Demolições          |    |    | ← Item comment
| 1.2.1  | Incluir entulho     |    |    | ← Should be part of comment
|        | Incluir entulho     |    |    | ← Should be part of comment
|        | Transporte incluído |    |    | ← Should be part of comment
|        | Paredes interiores  | m2 | 50 | ← Gets last Artigo number and full comment
```

### Before Fix ❌

**Processing Flow:**
1. Row `1.2`: Creates comment parent with `lastCommentArtigo = "1.2"`, `parentCommentsMap["1.2"] = ["Demolições"]`
2. Row `1.2.1`: Creates NEW comment parent with `lastCommentArtigo = "1.2.1"`, `parentCommentsMap["1.2.1"] = ["Incluir entulho"]` (WRONG!)
3. Following rows: Added to `parentCommentsMap["1.2.1"]` instead of `"1.2"`
4. Final item: Inherits `"1.2.1"` and gets incomplete comments

**Result:** Item "Paredes interiores" gets comments:
```
Incluir entulho
Incluir entulho
Transporte incluído
```
Missing the first line "Demolições"!

### After Fix ✅

**Processing Flow:**
1. Row `1.2`: Creates comment parent with `lastCommentArtigo = "1.2"`, `parentCommentsMap["1.2"] = ["Demolições"]`
2. Row `1.2.1`: Detected as child of `"1.2"` (since `"1.2.1".startsWith("1.2.")`), added to parent's comments
   - `parentCommentsMap["1.2"] = ["Demolições", "Incluir entulho"]`
   - `lastCommentArtigo` remains `"1.2"` (not changed)
3. Following rows: Added to `parentCommentsMap["1.2"]`
4. Final item: Inherits `"1.2"` and gets all comments

**Result:** Item "Paredes interiores" gets complete comments:
```
Demolições
Incluir entulho
Incluir entulho
Transporte incluído
```

## Solution

Updated Case 2 in the Excel analysis logic to check if an ARTIGO with no UN/QT is a child of the current `lastCommentArtigo`. If it is, treat it as a multi-line comment continuation instead of creating a new comment parent.

### Code Change

**File:** `src/pages/MapaQuantidades.tsx` (lines ~548-568)

**Before:**
```typescript
// Case 2: Row with ARTIGO but no UN and QT (comment parent)
else if (artigoCell && /^\d+\./.test(artigoCell) && !hasUN && !hasQT && descricaoCell) {
  // This is a parent item comment - store it with DESCRIÇÃO
  if (!parentCommentsMap.has(artigoCell)) {
    parentCommentsMap.set(artigoCell, []);
  }
  parentCommentsMap.get(artigoCell)!.push(descricaoCell);
  lastCommentArtigo = artigoCell;
}
```

**After:**
```typescript
// Case 2: Row with ARTIGO but no UN and QT (comment parent)
else if (artigoCell && /^\d+\./.test(artigoCell) && !hasUN && !hasQT && descricaoCell) {
  // Check if this ARTIGO is a child of the current lastCommentArtigo
  // If so, treat it as a multi-line comment instead of a new parent
  const isChildOfLastComment = lastCommentArtigo && artigoCell.startsWith(lastCommentArtigo + '.');
  
  if (isChildOfLastComment) {
    // This is a continuation of the previous comment (child ARTIGO)
    if (!parentCommentsMap.has(lastCommentArtigo)) {
      parentCommentsMap.set(lastCommentArtigo, []);
    }
    parentCommentsMap.get(lastCommentArtigo)!.push(descricaoCell);
  } else {
    // This is a parent item comment - store it with DESCRIÇÃO
    if (!parentCommentsMap.has(artigoCell)) {
      parentCommentsMap.set(artigoCell, []);
    }
    parentCommentsMap.get(artigoCell)!.push(descricaoCell);
    lastCommentArtigo = artigoCell;
  }
}
```

## Edge Cases Handled

### Edge Case 1: Multiple Nested Levels
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1.2    | Parent comment      |    |    |
| 1.2.1  | Child comment       |    |    |
| 1.2.2  | Child comment 2     |    |    |
|        | Item                | m2 | 50 |
```
✅ Both `1.2.1` and `1.2.2` are added to `parentCommentsMap["1.2"]`

### Edge Case 2: Deeply Nested ARTIGO
```
| ARTIGO   | DESCRIÇÃO           | UN | QT |
|----------|---------------------|----|----| 
| 1.2      | Parent              |    |    |
| 1.2.1.1  | Deep child          |    |    |
|          | Item                | m2 | 50 |
```
✅ `"1.2.1.1".startsWith("1.2.")` returns `true`, so it's added to `parentCommentsMap["1.2"]`

### Edge Case 3: Different Parent After Comments
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1.2    | Parent 1            |    |    |
| 1.2.1  | Child of 1.2        |    |    |
| 1.3    | Parent 2            |    |    |
|        | Item                | m2 | 50 |
```
✅ `"1.3".startsWith("1.2.")` returns `false`, so `1.3` creates a new parent and item inherits `"1.3"`

### Edge Case 4: Explicit ARTIGO in Item
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1.2    | Parent              |    |    |
| 1.2.1  | Child               |    |    |
| 1.2.2  | Item explicit       | m2 | 50 |
```
✅ Row `1.2.2` has UN and QT, so it's treated as an item (Case 5), not a comment. It gets explicit ARTIGO `"1.2.2"` and looks up parent comments from `"1.2"`

### Edge Case 5: No lastCommentArtigo
```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Chapter             |    |    |
| 1.2.1  | Orphan child        |    |    |
```
✅ `isChildOfLastComment = null && "1.2.1".startsWith(null + ".")` evaluates to `false`, so `1.2.1` creates a new parent

## Benefits

✅ **Correct Comment Association**: Nested ARTIGOs now correctly contribute to their parent's comments

✅ **Maintains Inheritance**: Items without explicit ARTIGO still inherit from the correct parent with complete comments

✅ **Backward Compatible**: Non-nested ARTIGOs continue to work as before

✅ **Minimal Change**: Only added a single condition check to determine if an ARTIGO is a child

✅ **Handles Deep Nesting**: Works for any depth of nesting (e.g., `1.2.1.1.1`)

## Testing

To test this fix:

1. Create an Excel file with the structure from the problem statement
2. Upload it to a budget
3. Click "Analyze File"
4. Verify the item "Paredes interiores" has all four comment lines in the correct order

## Related Documentation

- `ITEM_DEFINITION_UPDATE.md` - Overall item definition and comment handling
- `ITEM_COMMENT_ORDER_FIX.md` - Related fix for comment ordering
- `INHERITED_ARTIGO_COMMENT_FIX.md` - Fix for inherited ARTIGO comment lookup
- `VERIFICATION_INHERITED_ARTIGO_WITH_MULTILINE_COMMENTS.md` - Verification of multi-line comment handling
