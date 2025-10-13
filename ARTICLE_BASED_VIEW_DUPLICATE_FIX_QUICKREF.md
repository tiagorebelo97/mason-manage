# Quick Reference: Duplicate Chapter Fix

## When Does Chapter Prefixing Happen?

### ✅ Prefixing is ENABLED when:
- **(Article-Based View OR Treat as Single Sheet) AND Multiple Sheets**
  - Example: User enables article-based view + uploads 2-sheet Excel file
  - Example: User enables "Treat as single sheet" + uploads 3-sheet Excel file

### ❌ Prefixing is DISABLED when:
- **Single-sheet file** (regardless of other settings)
  - Example: 1-sheet file with article-based view → No prefixing
- **Standard multi-sheet view** (neither article-based nor single-sheet mode)
  - Example: 2-sheet file, both options OFF → Each sheet gets its own tab → No prefixing needed

## Quick Decision Tree

```
Is articleBasedView OR treatAsSingleSheet enabled?
├─ NO → Each sheet gets its own tab → No prefixing needed ✓
└─ YES → Are there multiple sheets (>1)?
    ├─ NO → Single sheet → No prefixing needed ✓
    └─ YES → ENABLE PREFIXING to avoid duplicate (tab_id, chapter_number) ✓
```

## What Gets Prefixed?

### In Database:
- Chapter numbers are prefixed: `"Folha1_1"`, `"Folha2_1"`
- This ensures UNIQUE constraint `(tab_id, chapter_number)` is satisfied

### In Code (Internal):
- `currentChapterNumber` stays original: `"1"`, `"2"` (for item lookup)
- `chapterMap` keys use original numbers: `"Folha1_1"`, `"Folha2_1"`

### In UI:
- **Users see original numbers**: `"1"`, `"2"` (not prefixed)
- Prefixing is completely transparent to the user!

## Example Scenarios

### Scenario 1: Article-Based View + Multi-Sheet + Duplicates
**Input:**
- 2 sheets: Folha1 and Folha2
- Both have chapter "1"
- Article-based view enabled

**What Happens:**
1. Detect: `articleBasedView=true` AND `sheetCount=2` → **ENABLE PREFIXING**
2. Store in DB: `"Folha1_1"` and `"Folha2_1"`
3. Items look for: `"Folha1_1"` and `"Folha2_1"` → ✓ Found!
4. Analysis: ✓ Success

### Scenario 2: Single Sheet + Article-Based View
**Input:**
- 1 sheet: Folha1
- Has chapter "1", "2"
- Article-based view enabled

**What Happens:**
1. Detect: `articleBasedView=true` BUT `sheetCount=1` → **NO PREFIXING**
2. Store in DB: `"1"` and `"2"` (no prefix)
3. Items look for: `"Folha1_1"` and `"Folha1_2"` → ✓ Found!
4. Analysis: ✓ Success

### Scenario 3: Standard Multi-Sheet (No Special Mode)
**Input:**
- 2 sheets: Folha1 and Folha2
- Both have chapter "1"
- NO article-based view
- NO treat as single sheet

**What Happens:**
1. Detect: `articleBasedView=false` AND `treatAsSingleSheet=false` → **NO PREFIXING**
2. Create tabs: "Folha1" tab and "Folha2" tab (different tab_ids!)
3. Store in DB: Both as `"1"` but with different tab_ids
4. No conflict because (tab_id, chapter_number) pairs are unique!
5. Analysis: ✓ Success

### Scenario 4: Treat as Single Sheet + Multi-Sheet + Duplicates
**Input:**
- 2 sheets: Folha1 and Folha2
- Both have chapter "1"
- Treat as single sheet enabled

**What Happens:**
1. Detect: `treatAsSingleSheet=true` AND `sheetCount=2` → **ENABLE PREFIXING**
2. Store in DB: `"Folha1_1"` and `"Folha2_1"`
3. Items look for: `"Folha1_1"` and `"Folha2_1"` → ✓ Found!
4. Analysis: ✓ Success

## Code Locations

| What | File | Lines |
|------|------|-------|
| Chapter prefixing logic | MapaQuantidades.tsx | ~831-836 |
| Chapter mapping (item lookup) | MapaQuantidades.tsx | ~1225-1243 |
| Chapter comment comparison 1 | MapaQuantidades.tsx | ~819-829 |
| Chapter comment comparison 2 | MapaQuantidades.tsx | ~1034-1049 |
| Chapter comment comparison 3 | MapaQuantidades.tsx | ~1167-1177 |

## Key Variables

```typescript
// User settings
articleBasedView: boolean       // User enables article-based view
treatAsSingleSheet: boolean     // User enables single-sheet treatment

// Sheet detection
workbook.SheetNames.length      // Actual number of sheets in Excel file
hasMultipleSheets: boolean      // false when articleBasedView OR treatAsSingleSheet

// Chapter tracking
currentChapterNumber: string    // Original chapter number (e.g., "1")
chapterNumberForDB: string      // Prefixed if needed (e.g., "Folha1_1")
```

## Testing Checklist

- [ ] Single-sheet + article-based view → No prefixing → Success
- [ ] Multi-sheet + article-based view + duplicates → Prefixing → Success
- [ ] Multi-sheet + standard view + duplicates → No prefixing (different tabs) → Success
- [ ] Multi-sheet + treatAsSingleSheet + duplicates → Prefixing → Success
- [ ] Single-sheet + treatAsSingleSheet → No prefixing → Success
- [ ] Items correctly linked to chapters in all scenarios
- [ ] Chapter comments saved correctly in all scenarios
- [ ] UI displays original chapter numbers (not prefixed)

## Common Issues & Solutions

### Issue: "Failed to analyze file" with multi-sheet Excel
**Cause:** Duplicate chapter numbers violating unique constraint
**Solution:** ✓ Fixed by this PR - chapters are now prefixed

### Issue: Items not linked to chapters
**Cause:** Chapter lookup key mismatch
**Solution:** ✓ Fixed - originalChapterNumber extracted for correct lookup

### Issue: Chapter comments not saved
**Cause:** Chapter number comparison using prefixed vs original
**Solution:** ✓ Fixed - extract original number before comparison

## Rollback Instructions

If this fix causes issues, revert these changes:
1. Remove prefixing logic in chapter insertion
2. Remove extraction logic in chapter mapping
3. Remove extraction logic in chapter comment comparisons

The code will work as before for single-sheet files, but multi-sheet files with duplicates will fail again.
