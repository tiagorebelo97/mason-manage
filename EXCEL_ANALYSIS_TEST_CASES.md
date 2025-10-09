# Test Cases for Excel Analysis Enhancements

## Test Case 1: Basic Chapter with Items

### Input Excel:
```
| ARTIGO | DESCRIÇÃO              | UN  | QT   | PREÇO UNITÁRIO | OBSERVAÇÕES EMPREITEIRO |
|--------|------------------------|-----|------|----------------|-------------------------|
| 1      | Trabalhos Preliminares | -   | -    | -              | -                       |
| 1.1    | Limpeza do terreno     | m2  | 100  | 5.50          | Verificar acesso        |
| 1.2    | Remoção de entulho     | m3  | 20   | 8.00          |                         |
```

### Expected Result:
**Chapter:**
- Number: "1"
- Name: "Trabalhos Preliminares"
- Comments: NULL

**Items:**
1. Artigo: "1.1", Descrição: "Limpeza do terreno", UN: "m2", QT: 100, Unit Price: 5.50, Comments: NULL, Observações: "Verificar acesso"
2. Artigo: "1.2", Descrição: "Remoção de entulho", UN: "m3", QT: 20, Unit Price: 8.00, Comments: NULL, Observações: NULL

---

## Test Case 2: Chapter with Comments

### Input Excel:
```
| ARTIGO | DESCRIÇÃO                    | UN  | QT   |
|--------|------------------------------|-----|------|
| 1      | Trabalhos Preliminares       | -   | -    |
|        | Inclui limpeza completa      | -   | -    |
|        | e preparação do terreno      | -   | -    |
| 1.1    | Limpeza do terreno           | m2  | 100  |
```

### Expected Result:
**Chapter:**
- Number: "1"
- Name: "Trabalhos Preliminares"
- Comments: "Inclui limpeza completa\ne preparação do terreno"

**Items:**
1. Artigo: "1.1", Descrição: "Limpeza do terreno", UN: "m2", QT: 100, Comments: NULL

---

## Test Case 3: Item with Parent Comment

### Input Excel:
```
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
|--------|------------------------|-----|------|
| 1      | Trabalhos Preliminares | -   | -    |
| 1.2    | Demolições             | -   | -    |
| 1.2.1  | Paredes interiores     | m2  | 50   |
| 1.2.2  | Pavimentos             | m2  | 30   |
```

### Expected Result:
**Chapter:**
- Number: "1"
- Name: "Trabalhos Preliminares"
- Comments: NULL

**Items:**
1. Artigo: "1.2.1", Descrição: "Paredes interiores", UN: "m2", QT: 50, Comments: "Demolições"
2. Artigo: "1.2.2", Descrição: "Pavimentos", UN: "m2", QT: 30, Comments: "Demolições"

---

## Test Case 4: Multiple Levels of Item Comments

### Input Excel:
```
| ARTIGO  | DESCRIÇÃO                  | UN  | QT   |
|---------|----------------------------|-----|------|
| 1       | Estrutura                  | -   | -    |
| 1.2     | Betão Armado              | -   | -    |
| 1.2.3   | Pilares                   | -   | -    |
| 1.2.3.1 | Pilares 30x30 cm          | un  | 8    |
| 1.2.3.2 | Pilares 40x40 cm          | un  | 4    |
```

### Expected Result:
**Chapter:**
- Number: "1"
- Name: "Estrutura"
- Comments: NULL

**Items:**
1. Artigo: "1.2.3.1", Descrição: "Pilares 30x30 cm", UN: "un", QT: 8, Comments: "Pilares"
2. Artigo: "1.2.3.2", Descrição: "Pilares 40x40 cm", UN: "un", QT: 4, Comments: "Pilares"

**Note:** "1.2" (Betão Armado) is NOT stored as a comment because "1.2.3.1" looks for parent "1.2.3", not "1.2"

---

## Test Case 5: Mixed Chapter and Item Comments

### Input Excel:
```
| ARTIGO | DESCRIÇÃO                    | UN  | QT   | OBSERVAÇÕES EMPREITEIRO    |
|--------|------------------------------|-----|------|----------------------------|
| 2      | Fundações                    | -   | -    | -                          |
|        | Executar após aprovação      | -   | -    | -                          |
| 2.1    | Escavações                   | -   | -    | -                          |
| 2.1.1  | Escavação manual             | m3  | 50   | Cuidado com tubagens       |
| 2.1.2  | Escavação mecânica           | m3  | 150  |                            |
```

### Expected Result:
**Chapter:**
- Number: "2"
- Name: "Fundações"
- Comments: "Executar após aprovação"

**Items:**
1. Artigo: "2.1.1", Descrição: "Escavação manual", UN: "m3", QT: 50, Comments: "Escavações", Observações: "Cuidado com tubagens"
2. Artigo: "2.1.2", Descrição: "Escavação mecânica", UN: "m3", QT: 150, Comments: "Escavações", Observações: NULL

---

## Test Case 6: Missing UN and QT Values

### Input Excel:
```
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
|--------|------------------------|-----|------|
| 1      | Diversos               | -   | -    |
| 1.1    | Item sem quantidade    | m2  |      |
| 1.2    | Item sem unidade       |     | 10   |
| 1.3    | Item completo          | un  | 5    |
```

### Expected Result:
**Chapter:**
- Number: "1"
- Name: "Diversos"

**Items:**
1. Artigo: "1.1", Descrição: "Item sem quantidade", UN: "m2", QT: NULL
2. Artigo: "1.2", Descrição: "Item sem unidade", UN: NULL, QT: 10
3. Artigo: "1.3", Descrição: "Item completo", UN: "un", QT: 5

**Note:** Items with either UN or QT are still considered valid items

---

## Test Case 7: Column Order Independence

### Input Excel (columns in different order):
```
| Item | ARTIGO | Description | DESCRIÇÃO              | QT   | UN  | PREÇO UNITÁRIO |
|------|--------|-------------|------------------------|------|-----|----------------|
| A    | 1      | -           | Trabalhos Preliminares | -    | -   | -              |
| B    | 1.1    | -           | Limpeza                | 100  | m2  | 5.00          |
```

### Expected Result:
Should work identically to having columns in standard order. The algorithm dynamically finds column positions.

---

## Test Case 8: Multiple Sheets (Tabs)

### Input Excel with 2 sheets:

**Sheet 1: "Obra Civil"**
```
| ARTIGO | DESCRIÇÃO    |
|--------|--------------|
| 1      | Fundações    |
| 1.1    | Escavações   |
```

**Sheet 2: "Elétrica"**
```
| ARTIGO | DESCRIÇÃO         |
|--------|-------------------|
| 1      | Instalações       |
| 1.1    | Quadro elétrico   |
```

### Expected Result:
- 2 tabs created: "Obra Civil" and "Elétrica"
- Each tab has its own chapter "1" with items
- Items are correctly linked to chapters within their respective tabs

---

## Test Case 9: Invalid/Empty Rows

### Input Excel:
```
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
|--------|------------------------|-----|------|
| 1      | Trabalhos              | -   | -    |
|        |                        |     |      |
| 1.1    | Item válido            | m2  | 10   |
|        |                        |     |      |
|        |                        |     |      |
| 2      | Outro capítulo         | -   | -    |
```

### Expected Result:
- Empty rows are skipped
- Only valid chapters and items are extracted
- No errors thrown for empty rows

---

## Test Case 10: Real-world Complex Example

### Input Excel:
```
| ARTIGO  | DESCRIÇÃO                          | UN  | QT    | PREÇO UNITÁRIO | OBSERVAÇÕES EMPREITEIRO           |
|---------|------------------------------------|-----|-------|----------------|-----------------------------------|
| 1       | TRABALHOS PRELIMINARES             |     |       |                |                                   |
|         | Incluir todas as licenças          |     |       |                |                                   |
| 1.1     | Instalação de estaleiro            | vg  | 1     | 2500.00       | Prazo: 30 dias                    |
| 1.2     | Vedações e proteções               |     |       |                |                                   |
| 1.2.1   | Vedação de obra                    | m   | 100   | 25.00         |                                   |
| 1.2.2   | Proteção de passeios               | m2  | 50    | 12.00         | Inclui sinalização                |
| 2       | MOVIMENTO DE TERRAS                |     |       |                |                                   |
|         | Verificar nível freático           |     |       |                |                                   |
|         | Escavação até cota -2.50m          |     |       |                |                                   |
| 2.1     | Escavações                         |     |       |                |                                   |
| 2.1.1   | Escavação geral                    | m3  | 350   | 8.50          | Com transporte até 5km            |
| 2.1.2   | Escavação de caboucos              | m3  | 120   | 12.00         |                                   |
| 2.2     | Aterros                            | m3  | 80    | 10.00         | Material selecionado               |
```

### Expected Result:
**Chapter 1:**
- Name: "TRABALHOS PRELIMINARES"
- Comments: "Incluir todas as licenças"
- 3 items total:
  - 1.1 (without parent comment)
  - 1.2.1 (with parent comment "Vedações e proteções")
  - 1.2.2 (with parent comment "Vedações e proteções")

**Chapter 2:**
- Name: "MOVIMENTO DE TERRAS"
- Comments: "Verificar nível freático\nEscavação até cota -2.50m"
- 3 items total:
  - 2.1.1 (with parent comment "Escavações")
  - 2.1.2 (with parent comment "Escavações")
  - 2.2 (without parent comment)

---

## How to Run Manual Tests

1. **Create test Excel file** with one of the test cases above
2. **Run the database migration**: Execute `migration_comments_and_columns.sql`
3. **Upload the file** through the MapaQuantidades page
4. **Click Analyze**
5. **Verify the results**:
   - Check that chapters appear with correct names
   - Verify chapter comments are displayed below chapter titles
   - Confirm items are listed with all columns
   - Check that item comments appear as separate rows above items
   - Ensure all data matches the expected results

## Automated Testing Notes

To create automated tests, you would need to:
1. Mock the Supabase client
2. Create test Excel files as ArrayBuffers
3. Call the analyzeMutation function with test data
4. Assert the correct data structures are created
5. Verify database insertions match expectations

This is beyond the scope of this PR but could be added in a future enhancement.
