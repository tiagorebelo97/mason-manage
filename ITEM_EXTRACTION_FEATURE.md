# Item Extraction Feature - Excel Analysis Enhancement

## Overview

The Excel analysis feature has been enhanced to extract individual items from Excel sheets in addition to chapters. Items are rows where the ARTIGO column contains a number with a decimal point (e.g., "1.1", "2.3").

## How It Works

### 1. Dynamic Column Detection

When analyzing an Excel file, the system now searches for four key columns:
- **ARTIGO**: Item/chapter identifier (e.g., "1", "1.1", "2.3")
- **DESCRIÇÃO/DESCRICAO**: Item description/name
- **UN**: Unit of measurement (e.g., "m2", "un", "kg")
- **QT**: Quantity

### 2. Item Identification

A row is identified as an item when:
- The **ARTIGO** column contains a number with a decimal point (e.g., "1.1", "2.3", "3.15")
- The regex pattern `/^\d+\.\d+/` matches the value
- The **DESCRIÇÃO** column contains the item description

### 3. Chapter-Item Relationship

Items are automatically linked to their parent chapter:
- The chapter number is extracted from the item's ARTIGO value
- Example: Item "1.1" belongs to Chapter "1"
- Example: Item "2.15" belongs to Chapter "2"

## Examples

### Example 1: Standard Budget Format
```
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
|--------|------------------------|-----|------|
| 1      | Trabalhos Preliminares |     |      | <- CHAPTER
| 1.1    | Limpeza do terreno     | m2  | 100  | <- ITEM
| 1.2    | Demolições             | un  | 50   | <- ITEM
| 2      | Fundações              |     |      | <- CHAPTER
| 2.1    | Escavações             | m3  | 200  | <- ITEM
| 2.2    | Betão                  | m3  | 150  | <- ITEM
```

**Result**: 
- 2 chapters detected (1, 2)
- 4 items detected (1.1, 1.2, 2.1, 2.2)
- Items automatically linked to their chapters

### Example 2: Different Column Order
```
| Item | ARTIGO | Nome | DESCRIÇÃO              | UN  | QT  |
|------|--------|------|------------------------|-----|-----|
| A    | 1      |      | Instalações Elétricas  |     |     | <- CHAPTER
| B    | 1.1    |      | Quadro elétrico        | un  | 2   | <- ITEM
| C    | 1.2    |      | Cablagem               | m   | 500 | <- ITEM
| D    | 2      |      | Instalações Sanitárias |     |     | <- CHAPTER
| E    | 2.1    |      | Tubagem                | m   | 100 | <- ITEM
```

**Result**: 
- 2 chapters detected (1, 2)
- 3 items detected (1.1, 1.2, 2.1)
- All items properly linked to chapters

## Technical Details

### Code Location
- File: `src/pages/MapaQuantidades.tsx`
- Function: `analyzeMutation.mutationFn`
- Lines: ~230-305

### Algorithm Steps

1. **For each sheet in the workbook:**
   - Create a tab entry for the sheet
   
2. **Find header columns:**
   ```typescript
   for each row in sheet:
     for each cell in row:
       if cell contains "ARTIGO":
         save column index
       if cell contains "DESCRIÇÃO" or "DESCRICAO":
         save column index
       if cell contains "UN":
         save column index
       if cell contains "QT":
         save column index
     if ARTIGO and DESCRIÇÃO columns found:
       break
   ```

3. **Extract chapters and items:**
   ```typescript
   if required columns were found:
     for each row in sheet:
       artigoValue = row[artigoColumnIndex]
       
       // Chapter detection
       if artigoValue matches /^\d+$/ (pure number):
         if row[descricaoColumnIndex] has value:
           create chapter
       
       // Item detection
       else if artigoValue matches /^\d+\.\d+/ (number with dot):
         if row[descricaoColumnIndex] has value:
           chapterNumber = extract number before dot
           unValue = row[unColumnIndex] or null
           qtValue = row[qtColumnIndex] or null
           create item with chapter_number reference
   ```

4. **Store in database:**
   - Insert tabs (one per sheet)
   - Insert chapters (linked to their tabs)
   - Insert items (linked to their chapters)

## Database Schema

### Tables Involved

**orcamento_items**
- `id` (UUID) - Primary key
- `chapter_id` (UUID) - References orcamento_chapters.id
- `artigo` (VARCHAR) - Item number, e.g., "1.1", "2.3"
- `descricao` (VARCHAR) - Item description
- `un` (VARCHAR, nullable) - Unit of measurement
- `qt` (DECIMAL, nullable) - Quantity
- `created_at` (TIMESTAMP)

### Relationships
```
orcamentos
    ↓
orcamento_files
    ↓
orcamento_tabs (Excel sheets)
    ↓
orcamento_chapters (Chapter 1, 2, 3...)
    ↓
orcamento_items (Items 1.1, 1.2, 2.1, 2.2...)
```

## User Interface

After analyzing an Excel file with items:

1. **Tabs** are displayed at the top (one per sheet)
2. **Within each tab**, chapters are displayed as separate sections
3. **Each chapter contains a table** with:
   - Column headers: Artigo, Descrição, UN, QT
   - All items belonging to that chapter
   - Empty state message if no items exist

### Example UI Display:
```
┌─────────────────────────────────────────────────┐
│ Sheet1  │  Sheet2  │  Sheet3                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. Trabalhos Preliminares                      │
│  ┌──────┬─────────────────────┬─────┬──────┐   │
│  │Artigo│ Descrição           │ UN  │  QT  │   │
│  ├──────┼─────────────────────┼─────┼──────┤   │
│  │ 1.1  │ Limpeza do terreno  │ m2  │ 100  │   │
│  │ 1.2  │ Demolições          │ un  │  50  │   │
│  └──────┴─────────────────────┴─────┴──────┘   │
│                                                  │
│  2. Fundações                                   │
│  ┌──────┬─────────────────────┬─────┬──────┐   │
│  │Artigo│ Descrição           │ UN  │  QT  │   │
│  ├──────┼─────────────────────┼─────┼──────┤   │
│  │ 2.1  │ Escavações          │ m3  │ 200  │   │
│  │ 2.2  │ Betão               │ m3  │ 150  │   │
│  └──────┴─────────────────────┴─────┴──────┘   │
└─────────────────────────────────────────────────┘
```

## Benefits

1. **Automatic Extraction**: No manual entry needed
2. **Flexible Layout**: Works with various Excel column arrangements
3. **Hierarchical Organization**: Items automatically linked to chapters
4. **Complete Data**: Captures all relevant fields (artigo, description, unit, quantity)
5. **Multi-sheet Support**: Processes all sheets in a workbook

## Testing

Test cases to verify:
- ✅ Items with different formats (1.1, 1.15, 2.3)
- ✅ UN and QT columns in different positions
- ✅ Items with and without UN/QT values
- ✅ Proper chapter-item relationships
- ✅ Multiple items per chapter
- ✅ Items across different sheets
- ✅ Empty/null UN and QT values

## Migration Required

Before using this feature, run the database migration:

```sql
-- See migration_items.sql for full migration script
CREATE TABLE orcamento_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES orcamento_chapters(id) ON DELETE CASCADE,
  artigo VARCHAR(50) NOT NULL,
  descricao VARCHAR(1000) NOT NULL,
  un VARCHAR(50),
  qt DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Run the migration in your Supabase SQL Editor, then regenerate TypeScript types:
```bash
supabase gen types typescript --project-id <your-project-id> > src/integrations/supabase/types.ts
```

## Future Enhancements

Potential improvements:
- Add unit price and total calculations
- Support for additional columns (notes, supplier, etc.)
- Edit items directly in the UI
- Export items back to Excel
- Bulk import/export functionality
- Item filtering and search
- Duplicate item detection
