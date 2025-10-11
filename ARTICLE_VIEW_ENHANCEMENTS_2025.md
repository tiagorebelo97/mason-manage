# Article-Based View Enhancements - October 2025

## Overview
This document describes the enhancements made to the article-based view in the Mapa Quantidades feature to improve usability and data presentation.

## Changes Implemented

### 1. QT Always Shows 2 Decimal Places

**Problem:** QT values were removing trailing zeros (e.g., 50.00 → 50, 30.50 → 30.5), which made it inconsistent and harder to read in tables.

**Solution:** Removed the `.replace(/\.?0+$/, '')` regex that was stripping trailing zeros.

**Before:**
```
| ARTIGO | DESCRIÇÃO           | UN | QT    |
|--------|---------------------|----|-------|
| 1.2.1  | Paredes interiores  | m2 | 50    |  ← No decimals shown
| 1.2.2  | Pavimentos          | m2 | 30.5  |  ← One decimal
```

**After:**
```
| ARTIGO | DESCRIÇÃO           | UN | QT    |
|--------|---------------------|----|-------|
| 1.2.1  | Paredes interiores  | m2 | 50.00 |  ← Always 2 decimals
| 1.2.2  | Pavimentos          | m2 | 30.50 |  ← Always 2 decimals
```

**Code Changes:**
- Line 1970: Display in first table view
- Line 2242: Display in second table view  
- Line 2641: Display in article-based view

### 2. Hide Article Title When Article Has UN and QT

**Problem:** When an article row itself has UN and QT values, both the title header and the table were shown, creating redundancy.

**Solution:** Detect if the article has UN and QT (by checking if the first item has the same artigo as the article), and hide the title header in that case.

**Before:**
```
┌─────────────────────────────────────────────┐
│ ▼ 1.2 - Demolições                         │  ← Title shown
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ ARTIGO │ DESCRIÇÃO  │ UN │ QT          │ │
│ ├────────┼────────────┼────┼─────────────┤ │
│ │ 1.2    │ Demolições │ m2 │ 100.00      │ │  ← Redundant info
│ │ 1.2.1  │ Item       │ un │ 5.00        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ ARTIGO │ DESCRIÇÃO  │ UN │ QT          │ │
│ ├────────┼────────────┼────┼─────────────┤ │
│ │ 1.2    │ Demolições │ m2 │ 100.00      │ │  ← No redundancy
│ │ 1.2.1  │ Item       │ un │ 5.00        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Code Changes:**
- Lines 2546-2549: Added `hasArticleUnQt` detection logic
- Lines 2554: Conditionally render title header only when `!hasArticleUnQt`
- Line 2578: Always show content when `hasArticleUnQt` (bypassing collapse state)

### 3. Chapters Default to Collapsed

**Problem:** Chapters were expanded by default, making it harder to navigate large documents.

**Solution:** Changed the `defaultOpen` prop from `true` to `false`.

**Before:**
```
▼ Chapter 1          ← Expanded by default
  ▼ Article 1.1
    [content...]
  ▼ Article 1.2
    [content...]

▼ Chapter 2          ← Expanded by default
  ▼ Article 2.1
    [content...]
```

**After:**
```
▶ Chapter 1          ← Collapsed by default
▶ Chapter 2          ← Collapsed by default
▶ Chapter 3          ← Collapsed by default
```

**Code Changes:**
- Line 2486: Changed `defaultOpen={true}` to `defaultOpen={false}`

### 4. Articles Open by Default (When They Have Title)

**Problem:** Not explicitly stated but clarified - articles should be open by default for easy access to content.

**Solution:** Articles are collapsible with chevron icon, but not collapsed by default. When an article has no title (because it has UN/QT), it's always shown and cannot be collapsed.

**Behavior:**
- Articles with titles: Collapsible, default open
- Articles with UN/QT (no title): Always visible, not collapsible

## Special Case: Inherited ARTIGO

### Excel Structure Example
```
| ARTIGO | DESCRIÇÃO           | UN | QT   |
|--------|---------------------|----|------|
| 1      | Chapter             |    |      |
| 1.2    | Demolições          |    |      | ← Article (parent comment)
| 1.2.1  | Incluir entulho     |    |      | ← Text (child comment)
|        | Paredes interiores  | m2 | 50   | ← Item inherits "1.2.1"
|        | Incluir entulho     |    |      | ← Text (child comment)
|        | Transporte incluído |    |      | ← Text (child comment)
```

### How It Works

The existing logic (lines 980-984) handles this correctly:

```typescript
let itemArtigo = artigoCell;
if (!artigoCell && lastCommentArtigo) {
  // Item without ARTIGO assumes the previous comment ARTIGO
  itemArtigo = lastCommentArtigo;
}
```

When a row has:
- No ARTIGO value (empty cell)
- UN and QT values (making it an item)

It inherits the `lastCommentArtigo`, which is set to "1.2.1" from the previous comment row.

The item also gets the full parent comment through lines 1031-1050:
```typescript
// Look for parent comments (e.g., for "1.2.1", look for "1.2")
let itemComment: string | null = null;
if (itemArtigo) {
  let parentComments = parentCommentsMap.get(itemArtigo);
  
  if (!parentComments || parentComments.length === 0) {
    const parts = itemArtigo.split('.');
    if (parts.length > 1) {
      const parentArtigo = parts.slice(0, -1).join('.');
      parentComments = parentCommentsMap.get(parentArtigo);
    }
  }
  
  if (parentComments && parentComments.length > 0) {
    itemComment = parentComments.join('\n');
  }
}
```

**Result:**
- Item ARTIGO: "1.2.1" (inherited from last comment)
- Item Description: "Paredes interiores"
- Item Comment: Includes all text from "1.2.1" and parent "1.2"

## Multi-Sheet Excel Files

The existing implementation (documented in ARTICLE_BASED_VIEW_MULTISHEET_FIX.md) already handles multi-sheet Excel files correctly:

- All sheets are processed and mapped to the Principal tab
- Sheet separators are displayed when multiple sheets exist
- Each sheet's chapters and articles are grouped together
- Users can see which content came from which sheet

No changes were needed for this functionality.

## Testing Recommendations

### Test Case 1: QT Decimal Places
1. Upload Excel with various QT values (50, 50.1, 50.12, 50.123)
2. Enable "Article-based view"
3. Click "Analyze"
4. **Expected:** All QT values show exactly 2 decimal places

### Test Case 2: Article with UN/QT
```
Excel Structure:
| ARTIGO | DESCRIÇÃO           | UN  | QT   |
| 1      | Chapter             |     |      |
| 1.1    | Article with values | m2  | 100  |
| 1.1.1  | Item                | un  | 5    |
```

1. Upload this Excel file
2. Enable "Article-based view"
3. Click "Analyze"
4. **Expected:** Article 1.1 shows only table (no title header)

### Test Case 3: Article without UN/QT
```
Excel Structure:
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
| 1      | Chapter                |     |      |
| 1.2    | Article without values |     |      |
| 1.2.1  | Item                   | kg  | 10   |
```

1. Upload this Excel file
2. Enable "Article-based view"
3. Click "Analyze"
4. **Expected:** Article 1.2 shows title header with chevron (collapsible)

### Test Case 4: Chapters Default State
1. Upload any Excel file with multiple chapters
2. Enable "Article-based view"
3. Click "Analyze"
4. **Expected:** All chapters are collapsed by default

### Test Case 5: Inherited ARTIGO
```
Excel Structure:
| ARTIGO | DESCRIÇÃO           | UN | QT   |
| 1      | Chapter             |    |      |
| 1.2    | Demolições          |    |      |
| 1.2.1  | Incluir entulho     |    |      |
|        | Paredes interiores  | m2 | 50   |
```

1. Upload this Excel file
2. Enable "Article-based view"
3. Click "Analyze"
4. **Expected:** Item gets ARTIGO "1.2.1" and comment from parent

## Files Modified

- `src/pages/MapaQuantidades.tsx`
  - Lines 1970, 2242, 2641: QT decimal formatting
  - Line 2486: Chapter default state
  - Lines 2546-2554: Article title hiding logic
  - Line 2578: Article content visibility logic

## Backward Compatibility

All changes are backward compatible:
- Existing Excel files work as before
- No database changes required
- No API changes
- User preferences not affected

## Impact Summary

✅ **Improved Readability:** QT values now consistently show 2 decimal places
✅ **Reduced Redundancy:** Articles with UN/QT no longer show redundant titles
✅ **Better Navigation:** Chapters collapsed by default make large documents easier to navigate
✅ **Cleaner UI:** Less visual clutter, more focused presentation
✅ **Existing Features:** All existing functionality preserved and working correctly
