# Testing the Item Extraction Feature

## Prerequisites

1. Run the database migration first:
   ```bash
   # In Supabase SQL Editor, execute:
   # See migration_items.sql for the full script
   ```

2. Make sure you have an Excel file ready with the following structure:

## Sample Excel File Format

Create an Excel file (e.g., `test_budget.xlsx`) with this structure:

### Sheet 1: "Obra Civil"
```
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
|--------|------------------------|-----|------|
| 1      | Trabalhos Preliminares |     |      |
| 1.1    | Limpeza do terreno     | m2  | 100  |
| 1.2    | Demolições             | un  | 50   |
| 1.3    | Vedação do local       | m   | 200  |
| 2      | Fundações              |     |      |
| 2.1    | Escavações             | m3  | 200  |
| 2.2    | Betão                  | m3  | 150  |
| 2.3    | Armaduras              | kg  | 5000 |
```

### Sheet 2: "Instalações"
```
| ARTIGO | DESCRIÇÃO              | UN  | QT  |
|--------|------------------------|-----|-----|
| 1      | Instalações Elétricas  |     |     |
| 1.1    | Quadro elétrico        | un  | 2   |
| 1.2    | Cablagem               | m   | 500 |
| 1.3    | Tomadas                | un  | 50  |
| 2      | Instalações Sanitárias |     |     |
| 2.1    | Tubagem PVC            | m   | 100 |
| 2.2    | Louças sanitárias      | un  | 10  |
```

## Testing Steps

### 1. Create an Orçamento
1. Navigate to the Orçamentos page
2. Click "New Orçamento"
3. Fill in the name (e.g., "Test Budget 2024")
4. Set dates if needed
5. Save the orçamento

### 2. Upload Excel File
1. Click on the newly created orçamento
2. Click "Upload File" or drag and drop your Excel file
3. Wait for the upload to complete
4. You should see a success message

### 3. Analyze the File
1. Click the "Analyze" button
2. Wait for the analysis to complete
3. You should see tabs appear at the top (one per sheet)

### 4. Verify Results

#### Check Tabs
- You should see 2 tabs: "Obra Civil" and "Instalações"
- Each tab should be clickable

#### Check Chapters
For "Obra Civil" tab:
- Chapter 1: Trabalhos Preliminares
- Chapter 2: Fundações

For "Instalações" tab:
- Chapter 1: Instalações Elétricas
- Chapter 2: Instalações Sanitárias

#### Check Items
For "Obra Civil" → Chapter 1:
- Item 1.1: Limpeza do terreno (m2, 100)
- Item 1.2: Demolições (un, 50)
- Item 1.3: Vedação do local (m, 200)

For "Obra Civil" → Chapter 2:
- Item 2.1: Escavações (m3, 200)
- Item 2.2: Betão (m3, 150)
- Item 2.3: Armaduras (kg, 5000)

For "Instalações" → Chapter 1:
- Item 1.1: Quadro elétrico (un, 2)
- Item 1.2: Cablagem (m, 500)
- Item 1.3: Tomadas (un, 50)

For "Instalações" → Chapter 2:
- Item 2.1: Tubagem PVC (m, 100)
- Item 2.2: Louças sanitárias (un, 10)

### 5. Test Edge Cases

#### Test with Missing UN/QT Values
Create a sheet with some rows missing UN or QT:
```
| ARTIGO | DESCRIÇÃO           | UN  | QT  |
|--------|---------------------|-----|-----|
| 1      | Test Chapter        |     |     |
| 1.1    | Item with UN only   | m2  |     |
| 1.2    | Item with QT only   |     | 100 |
| 1.3    | Item with neither   |     |     |
```

Expected result:
- All items should be displayed
- Missing values should show as "-"

#### Test with Different Column Orders
Create a sheet with columns in different order:
```
| Item | Nome | ARTIGO | UN  | DESCRIÇÃO         | QT  |
|------|------|--------|-----|-------------------|-----|
| A    | x    | 1      |     | Test Chapter      |     |
| B    | y    | 1.1    | m2  | First item        | 50  |
```

Expected result:
- System should correctly identify columns
- Items should be extracted properly

#### Test with Multiple Decimal Places
```
| ARTIGO | DESCRIÇÃO           | UN  | QT   |
|--------|---------------------|-----|------|
| 1      | Chapter             |     |      |
| 1.1    | Simple item         | un  | 10   |
| 1.1.1  | Sub-item (ignored)  | un  | 5    |
| 1.2    | Another item        | un  | 20   |
```

Expected result:
- Items 1.1 and 1.2 should be extracted
- Item 1.1.1 should be ignored (has more than one decimal point)

### 6. Test Database Integrity

After analysis, check the database:

```sql
-- Check tabs were created
SELECT * FROM orcamento_tabs WHERE orcamento_id = '<your-orcamento-id>';

-- Check chapters were created
SELECT * FROM orcamento_chapters;

-- Check items were created
SELECT i.*, c.chapter_number, c.chapter_name
FROM orcamento_items i
JOIN orcamento_chapters c ON i.chapter_id = c.id
ORDER BY c.chapter_number, i.artigo;

-- Check items are linked to correct chapters
SELECT 
  c.chapter_number as chapter,
  c.chapter_name,
  i.artigo,
  i.descricao,
  i.un,
  i.qt
FROM orcamento_items i
JOIN orcamento_chapters c ON i.chapter_id = c.id
ORDER BY c.chapter_number, i.artigo;
```

### 7. Test Deletion

1. Click the delete button on the file
2. Confirm deletion
3. Check that:
   - File is removed
   - Tabs are removed
   - Chapters are removed
   - Items are removed (cascade delete)

## Expected Behavior

### Success Indicators
- ✅ Excel file uploads successfully
- ✅ Analysis completes without errors
- ✅ Tabs appear for each sheet
- ✅ Chapters appear under each tab
- ✅ Items appear under each chapter
- ✅ UN and QT values display correctly
- ✅ Missing values show as "-"
- ✅ Items are grouped by chapter
- ✅ Delete removes all related data

### Common Issues

**Issue**: Items not showing
- **Solution**: Check that the database migration was run
- **Solution**: Verify the Excel has columns named "UN" and "QT"

**Issue**: Wrong chapter assignment
- **Solution**: Verify item numbers (e.g., "1.1") match chapter numbers (e.g., "1")

**Issue**: Analysis fails
- **Solution**: Check Excel format (must be .xlsx or .xls)
- **Solution**: Verify ARTIGO and DESCRIÇÃO columns exist

## Performance Testing

Test with large files:
- 10 chapters, 100 items per chapter = 1000 items
- Multiple sheets (5+)
- Verify analysis completes in reasonable time
- Check UI renders without lag

## Browser Testing

Test in different browsers:
- Chrome
- Firefox
- Safari
- Edge

## Cleanup

After testing, you can clean up test data:

```sql
-- Delete test orçamento (cascades to all related data)
DELETE FROM orcamentos WHERE name = 'Test Budget 2024';
```
