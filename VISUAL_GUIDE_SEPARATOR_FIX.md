# Visual Guide: Sheet/Separator Context Fix

## The Problem in Pictures

### Scenario: Excel file with 2 sheets, both have Chapter "1"

```
┌─────────────────────────────────────────────────────────────┐
│ Excel File: Budget.xlsx                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Sheet1: "Exterior Work"                                     │
│ ┌─────────┬────────────────────────┬──────┬──────┐        │
│ │ ARTIGO  │ DESCRIÇÃO              │ UN   │ QT   │        │
│ ├─────────┼────────────────────────┼──────┼──────┤        │
│ │ 1       │ Preliminary Work       │      │      │        │
│ │ 1.1     │ Site cleaning          │ m2   │ 100  │        │
│ │ 1.2     │ Signage                │ un   │ 5    │        │
│ └─────────┴────────────────────────┴──────┴──────┘        │
│                                                             │
│ Sheet2: "Foundation Work"                                   │
│ ┌─────────┬────────────────────────┬──────┬──────┐        │
│ │ ARTIGO  │ DESCRIÇÃO              │ UN   │ QT   │        │
│ ├─────────┼────────────────────────┼──────┼──────┤        │
│ │ 1       │ Foundation             │      │      │        │
│ │ 1.1     │ Excavation             │ m3   │ 50   │        │
│ │ 1.2     │ Concrete               │ m3   │ 30   │        │
│ └─────────┴────────────────────────┴──────┴──────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## BEFORE FIX ❌

### Step 1: Tab Creation
```
Article-based view enabled + Multiple sheets
↓
hasMultipleSheets = FALSE (forced by articleBasedView flag)
↓
Create only 3 default tabs:
┌─────────────┬──────────────┬─────────────────────────┐
│ Principal   │ Arquitetura  │ Instalações Especiais   │
└─────────────┴──────────────┴─────────────────────────┘
```

### Step 2: Sheet Mapping
```
All sheets → "Principal" tab
Sheet1 ────┐
           ├──→ Principal Tab
Sheet2 ────┘
```

### Step 3: Chapter Processing
```
Sheet1: Chapter "1" = "Preliminary Work"  ──→ Insert to DB
Sheet2: Chapter "1" = "Foundation"        ──→ DEDUPLICATE!
                                               (considered duplicate)
                                               ↓
                                          Discarded, comments merged
```

### Step 4: Item Mapping
```
chapterMap:
  "Sheet1_1" → Chapter ID #1 (Preliminary Work)
  "Sheet2_1" → Chapter ID #1 (SAME as Sheet1!)
                            ↑
                    This is the BUG!

Items from Sheet1:
  1.1 (Cleaning)  ──→ Chapter #1 ✓
  1.2 (Signage)   ──→ Chapter #1 ✓

Items from Sheet2:
  1.1 (Excavation) ──→ Chapter #1 ✗ WRONG! Should be separate chapter
  1.2 (Concrete)   ──→ Chapter #1 ✗ WRONG! Should be separate chapter
```

### Result in Database ❌
```
orcamento_tabs:
┌────┬─────────────┐
│ ID │ Name        │
├────┼─────────────┤
│ 1  │ Principal   │
└────┴─────────────┘

orcamento_chapters:
┌────┬────────┬────────┬─────────────────────┐
│ ID │ tab_id │ number │ name                │
├────┼────────┼────────┼─────────────────────┤
│ 1  │ 1      │ 1      │ Preliminary Work    │ ← Only ONE chapter!
└────┴────────┴────────┴─────────────────────┘

orcamento_items:
┌────┬────────────┬────────┬──────────────┐
│ ID │ chapter_id │ artigo │ descricao    │
├────┼────────────┼────────┼──────────────┤
│ 1  │ 1          │ 1.1    │ Cleaning     │ ✓ Correct
│ 2  │ 1          │ 1.2    │ Signage      │ ✓ Correct
│ 3  │ 1          │ 1.1    │ Excavation   │ ✗ Wrong chapter!
│ 4  │ 1          │ 1.2    │ Concrete     │ ✗ Wrong chapter!
└────┴────────────┴────────┴──────────────┘
        ↑
   All items in same chapter - MIXED!
```

---

## AFTER FIX ✅

### Step 1: Tab Creation
```
Article-based view enabled + Multiple sheets
↓
hasMultipleSheets = TRUE (respects actual sheet count)
↓
Create tab for each sheet:
┌──────────────────┬─────────────────────┐
│ Sheet1           │ Sheet2              │
└──────────────────┴─────────────────────┘
```

### Step 2: Sheet Mapping
```
Each sheet → Its own tab
Sheet1 ──→ Sheet1 Tab
Sheet2 ──→ Sheet2 Tab
```

### Step 3: Chapter Processing
```
Sheet1: Chapter "1" = "Preliminary Work"  ──→ Insert to DB (tab_id = Sheet1 Tab)
Sheet2: Chapter "1" = "Foundation"        ──→ Insert to DB (tab_id = Sheet2 Tab)
                                               ↑
                                     NO DEDUPLICATION!
                                     Different tabs = Different chapters
```

### Step 4: Item Mapping
```
chapterMap:
  "Sheet1_1" → Chapter ID #1 (Preliminary Work in Sheet1 Tab)
  "Sheet2_1" → Chapter ID #2 (Foundation in Sheet2 Tab)
                            ↑
                    Now SEPARATE!

Items from Sheet1:
  1.1 (Cleaning)  ──→ Chapter #1 ✓
  1.2 (Signage)   ──→ Chapter #1 ✓

Items from Sheet2:
  1.1 (Excavation) ──→ Chapter #2 ✓ CORRECT!
  1.2 (Concrete)   ──→ Chapter #2 ✓ CORRECT!
```

### Result in Database ✅
```
orcamento_tabs:
┌────┬──────────────────┐
│ ID │ Name             │
├────┼──────────────────┤
│ 1  │ Sheet1           │
│ 2  │ Sheet2           │
└────┴──────────────────┘

orcamento_chapters:
┌────┬────────┬────────┬─────────────────────┐
│ ID │ tab_id │ number │ name                │
├────┼────────┼────────┼─────────────────────┤
│ 1  │ 1      │ 1      │ Preliminary Work    │ ← Sheet1's Chapter 1
│ 2  │ 2      │ 1      │ Foundation          │ ← Sheet2's Chapter 1
└────┴────────┴────────┴─────────────────────┘
                                                    ↑
                                            TWO separate chapters!

orcamento_items:
┌────┬────────────┬────────┬──────────────┐
│ ID │ chapter_id │ artigo │ descricao    │
├────┼────────────┼────────┼──────────────┤
│ 1  │ 1          │ 1.1    │ Cleaning     │ ✓ Sheet1 items
│ 2  │ 1          │ 1.2    │ Signage      │ ✓
│ 3  │ 2          │ 1.1    │ Excavation   │ ✓ Sheet2 items
│ 4  │ 2          │ 1.2    │ Concrete     │ ✓
└────┴────────────┴────────┴──────────────┘
        ↑              ↑
  Different chapters - PROPERLY SEPARATED!
```

---

## Key Differences Summary

| Aspect | Before ❌ | After ✅ |
|--------|----------|---------|
| **Tabs** | 3 default tabs (Principal, etc.) | 1 tab per sheet |
| **Sheet mapping** | All sheets → Principal | Each sheet → Own tab |
| **Chapters** | Deduplicated across sheets | Kept separate per sheet |
| **Chapter count** | 1 (duplicate discarded) | 2 (both preserved) |
| **Item mapping** | All items → Chapter #1 | Items → Correct chapter in their sheet |
| **Separator context** | ❌ Ignored | ✅ Respected |

---

## The Fix in 3 Lines

```typescript
// Line 581: Let multi-sheet files create tabs per sheet
- const hasMultipleSheets = (articleBasedView || treatAsSingleSheet) ? false : ...
+ const hasMultipleSheets = treatAsSingleSheet ? false : ...

// Lines 1148-1150: Don't deduplicate chapters
- /* 37 lines of deduplication logic */
+ const uniqueChaptersWithTabIds = chaptersWithTabIds;

// Lines 1165-1176: Simple unified mapping
- /* Complex conditional logic for article-based view */
+ /* Simple consistent logic for all cases */
```

**Net result:** 49 fewer lines of code, proper separator context! 🎉
