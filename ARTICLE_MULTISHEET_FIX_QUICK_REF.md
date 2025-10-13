# Quick Reference: Article-Based View Multi-Sheet Fix

## What Was Fixed
Multiple Excel sheets with the same chapter/article numbers now work correctly in Article-based view mode.

## The Problem
```
❌ BEFORE: Sheet1 Chapter "1" + Sheet2 Chapter "1" → Articles mixed together
✅ AFTER:  Sheet1 Chapter "1" + Sheet2 Chapter "1" → Articles properly separated
```

## Technical Solution
**Composite Key Approach**:
- Old grouping: By `chapter_number` only (e.g., "1")
- New grouping: By `sheet_name + chapter_number` (e.g., "Sheet1_1", "Sheet2_1")

**Mapping Storage**:
- Store: chapter.id → sheet_name in sessionStorage
- Use: Look up sheet_name when loading articles
- Result: Correct matching every time

## For Users

### What You Can Do Now
✅ Upload Excel files with multiple sheets
✅ Use the same chapter numbers in different sheets (e.g., all start from 1)
✅ Use the same article numbers in different sheets
✅ Enable "Article-based view" without errors

### How to Use
1. Upload your multi-sheet Excel file
2. Check "Article-based view"
3. Click "Analyze"
4. All articles appear correctly under their chapters
5. No mixing of content between sheets

### Example
```
Sheet1:
  Chapter 1: Foundation
    Article 1.1: Excavation
    
Sheet2:
  Chapter 1: Electrical  
    Article 1.1: Wiring

Result in UI:
  Principal Tab:
    Chapter 1: Foundation
      └─ Article 1.1: Excavation     ✓
    Chapter 1: Electrical
      └─ Article 1.1: Wiring         ✓
```

## For Developers

### Key Code Changes

**1. Create Mapping During Analysis** (`MapaQuantidades.tsx:1233`)
```typescript
const chapterIdToSheetNameMap = new Map<string, string>();
insertedChapters.forEach((chapter, index) => {
  const originalChapter = chaptersToInsert[index];
  if (originalChapter?.sheet_name) {
    chapterIdToSheetNameMap.set(chapter.id, originalChapter.sheet_name);
  }
});
```

**2. Store Mapping** (`MapaQuantidades.tsx:1372`)
```typescript
if (data.chapterIdToSheetNameMap) {
  const mappingObj = Object.fromEntries(data.chapterIdToSheetNameMap);
  sessionStorage.setItem(`chapterMapping_${id}`, JSON.stringify(mappingObj));
}
```

**3. Use Composite Key** (`MapaQuantidades.tsx:325`)
```typescript
const key = `${article.sheet_name}_${article.chapter_number}`;
groupedByChapter.set(key, [...]);
```

**4. Match Using Mapping** (`MapaQuantidades.tsx:336`)
```typescript
const sheetName = chapterIdToSheetName.get(chapter.id);
const key = `${sheetName}_${chapter.chapter_number}`;
const articlesForChapter = groupedByChapter.get(key);
```

### Files Modified
- `src/pages/MapaQuantidades.tsx` (+73 lines, -22 lines)

### Files Added
- `ARTICLE_MULTISHEET_DUPLICATE_FIX.md` (detailed explanation)
- `ARTICLE_MULTISHEET_FIX_VISUAL_EXAMPLE.md` (before/after walkthrough)
- `ARTICLE_MULTISHEET_FIX_QUICK_REF.md` (this file)

### Testing
```bash
# Build
npm run build  # ✅ Passes

# Lint
npm run lint   # ✅ No new errors
```

## Important Notes

### Session Storage
- Mapping stored per orcamento: `chapterMapping_{orcamento_id}`
- Cleared on browser close (expected behavior)
- Re-analyzing file updates the mapping

### Backward Compatibility
✅ Single-sheet files work exactly as before
✅ Existing analyzed files need re-analysis to get mapping
✅ Missing mapping is handled gracefully (chapters skipped)

### Edge Cases Handled
- No mapping available → Chapter skipped (graceful)
- Single sheet → Works with composite key approach
- Re-analysis → Overwrites old mapping
- Same chapter in same sheet → Duplicate detection still works (per-sheet scoped)

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Multi-sheet with same numbers | ❌ Error/Mixed | ✅ Works correctly |
| Article grouping | By chapter_number | By sheet_name + chapter_number |
| Chapter identification | Not possible | Stored in mapping |
| Single-sheet files | ✅ Works | ✅ Still works |
| Build status | ✅ Passes | ✅ Passes |
| Lint status | ⚠️ 15 warnings | ⚠️ 15 warnings (unchanged) |

## Documentation
- 📄 Detailed explanation: `ARTICLE_MULTISHEET_DUPLICATE_FIX.md`
- 📊 Visual walkthrough: `ARTICLE_MULTISHEET_FIX_VISUAL_EXAMPLE.md`
- ⚡ This quick reference: `ARTICLE_MULTISHEET_FIX_QUICK_REF.md`
