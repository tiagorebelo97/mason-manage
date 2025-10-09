# Excel Analysis Feature - ARTIGO and DESCRIÇÃO Detection

## Overview

The Excel analysis feature in MapaQuantidades now dynamically detects chapter headers based on Portuguese budget document conventions, specifically looking for "ARTIGO" and "DESCRIÇÃO" columns.

## How It Works

### 1. Dynamic Column Detection

When analyzing an Excel file, the system:
- Searches through all rows to find the header row
- Looks for columns containing "ARTIGO" (or any cell that includes this word)
- Looks for columns containing "DESCRIÇÃO" or "DESCRICAO" (with or without accent)
- Records the column indices for both headers

### 2. Chapter Identification

A row is identified as a chapter when:
- The "ARTIGO" column contains a pure number (e.g., "1", "2", "3", etc.)
- The number does **not** contain a decimal point (e.g., "1.1", "2.3" are **not** chapters)
- The "DESCRIÇÃO" column contains the chapter name/title

### 3. Flexible Layout Support

The feature supports various Excel layouts:
- Headers can be in any row (system searches from top)
- "ARTIGO" and "DESCRIÇÃO" can be in any columns
- Multiple sheets are supported, each can have different column arrangements

## Examples

### Example 1: Standard Layout
```
| ARTIGO | DESCRIÇÃO              | Quantidade | Preço |
|--------|------------------------|------------|-------|
| 1      | Trabalhos Preliminares |            |       |
| 1.1    | Limpeza do terreno     | 100        | 5.00  |
| 1.2    | Demolições             | 50         | 10.00 |
| 2      | Fundações              |            |       |
| 2.1    | Escavações             | 200        | 8.00  |
```

**Result**: 2 chapters detected:
- Chapter 1: Trabalhos Preliminares
- Chapter 2: Fundações

### Example 2: Different Column Order
```
| Item | ARTIGO | Nome | DESCRIÇÃO              |
|------|--------|------|------------------------|
| A    | 1      |      | Instalações Elétricas  |
| B    | 1.1    |      | Quadro elétrico        |
| C    | 2      |      | Instalações Sanitárias |
| D    | 2.1    |      | Tubagem                |
```

**Result**: 2 chapters detected:
- Chapter 1: Instalações Elétricas
- Chapter 2: Instalações Sanitárias

## Technical Details

### Code Location
- File: `src/pages/MapaQuantidades.tsx`
- Function: `analyzeMutation.mutationFn`
- Lines: ~199-238

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
     if both columns found:
       break
   ```

3. **Find chapters:**
   ```typescript
   if both columns were found:
     for each row in sheet:
       artigoValue = row[artigoColumnIndex]
       if artigoValue matches /^\d+$/ (pure number):
         if row[descricaoColumnIndex] has value:
           create chapter with:
             number = artigoValue
             name = row[descricaoColumnIndex]
   ```

4. **Store in database:**
   - Insert tabs (one per sheet)
   - Insert chapters (linked to their tabs)

## Database Schema

### Tables Involved

**orcamento_tabs**
- `id` (UUID)
- `orcamento_id` (UUID)
- `name` (VARCHAR) - Sheet name
- `display_order` (INTEGER)

**orcamento_chapters**
- `id` (UUID)
- `tab_id` (UUID) - References orcamento_tabs
- `chapter_number` (VARCHAR) - e.g., "1", "2", "3"
- `chapter_name` (VARCHAR) - e.g., "Trabalhos Preliminares"

## User Interface

After analyzing an Excel file:

1. **Tabs** are displayed at the top (one per sheet)
2. **Within each tab**, chapters are displayed as separate tables
3. Each chapter shows:
   - Chapter number and name in a header (e.g., "1. Trabalhos Preliminares")
   - A table with columns: Item, Description, Quantity, Unit Price, Total

## Benefits

1. **Flexibility**: Works with various Excel layouts
2. **Robustness**: Handles accented and non-accented "DESCRIÇÃO"
3. **Accuracy**: Only identifies true chapters (numbers without dots)
4. **Multi-sheet**: Supports complex budgets with multiple sheets
5. **Automatic**: No manual configuration needed

## Testing

Test cases verified:
- ✅ ARTIGO in different column positions
- ✅ DESCRIÇÃO in different column positions
- ✅ Multiple sheets with different layouts
- ✅ Chapters with numbers only (1, 2, 3)
- ✅ Sub-items with dots ignored (1.1, 1.2, 2.1)
- ✅ Accented and non-accented DESCRIÇÃO/DESCRICAO

## Future Enhancements

Potential improvements:
- Extract item data under each chapter
- Support additional column names
- Custom column mapping interface
- Export analyzed data back to Excel
