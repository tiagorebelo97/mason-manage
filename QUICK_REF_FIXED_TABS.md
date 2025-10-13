# Quick Reference: Fixed Tabs with Sheet Separators

## What Changed?

**Before:** Multi-sheet Excel files → One tab per sheet  
**After:** All Excel files → 3 fixed tabs (Principal, Arquitetura, Instalações Especiais)

## Key Changes

1. **Always 3 tabs** regardless of sheet count
2. **All sheets → Principal tab** with separators
3. **Sheet separators** show when multiple sheets exist
4. **Database:** Added `sheet_name` column to `orcamento_chapters`

## Visual Example

### Multi-Sheet File (e.g., 4 sheets)

#### Before:
```
[Sheet1] [Sheet2] [Sheet3] [Sheet4] ← Too many tabs!
```

#### After:
```
[Principal] [Arquitetura] [Instalações Especiais] ← 3 fixed tabs

Principal tab content:
┌─────────────────────────┐
│ 📄 Sheet1              │
└─────────────────────────┘
- Chapter 1.1
- Chapter 1.2

┌─────────────────────────┐
│ 📄 Sheet2              │
└─────────────────────────┘
- Chapter 2.1
- Chapter 2.2

┌─────────────────────────┐
│ 📄 Sheet3              │
└─────────────────────────┘
- Chapter 3.1
- Chapter 3.2
```

## Migration Required

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE orcamento_chapters 
ADD COLUMN IF NOT EXISTS sheet_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_orcamento_chapters_sheet_name 
ON orcamento_chapters(sheet_name);
```

## Files Changed

- `src/pages/MapaQuantidades.tsx` - Main logic changes
- `migration_add_sheet_name_to_chapters.sql` - New migration file
- `FIXED_TABS_WITH_SEPARATORS.md` - Documentation

## Testing

✅ Single-sheet file: No separators, all in Principal  
✅ Multi-sheet file: Separators shown, grouped by sheet  
✅ Article-based view: Works the same as normal view  

## Build Status

✅ Code compiles successfully  
✅ No TypeScript errors  
✅ Ready for deployment
