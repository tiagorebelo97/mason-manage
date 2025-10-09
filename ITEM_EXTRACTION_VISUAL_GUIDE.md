# Visual Guide: Item Extraction Feature

## Before and After Comparison

### BEFORE: Only Chapters Displayed

```
┌─────────────────────────────────────────────────┐
│ Sheet1  │  Sheet2  │  Sheet3                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. Trabalhos Preliminares                      │
│  ┌──────┬─────────┬──────────┬───────┬────────┐│
│  │ Item │ Descr.  │ Quantity │ Price │ Total  ││
│  ├──────┼─────────┼──────────┼───────┼────────┤│
│  │      │         │          │       │        ││
│  │      │ No items yet                        ││
│  │      │         │          │       │        ││
│  └──────┴─────────┴──────────┴───────┴────────┘│
│                                                  │
│  2. Fundações                                   │
│  ┌──────┬─────────┬──────────┬───────┬────────┐│
│  │ Item │ Descr.  │ Quantity │ Price │ Total  ││
│  ├──────┼─────────┼──────────┼───────┼────────┤│
│  │      │         │          │       │        ││
│  │      │ No items yet                        ││
│  │      │         │          │       │        ││
│  └──────┴─────────┴──────────┴───────┴────────┘│
└─────────────────────────────────────────────────┘
```

**Problem**: Items from Excel were not extracted or displayed

---

### AFTER: Items Automatically Extracted and Displayed

```
┌─────────────────────────────────────────────────┐
│ Sheet1  │  Sheet2  │  Sheet3                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. Trabalhos Preliminares                      │
│  ┌────────┬─────────────────────┬─────┬───────┐│
│  │ Artigo │ Descrição           │ UN  │  QT   ││
│  ├────────┼─────────────────────┼─────┼───────┤│
│  │ 1.1    │ Limpeza do terreno  │ m2  │ 100   ││
│  │ 1.2    │ Demolições          │ un  │  50   ││
│  │ 1.3    │ Vedação do local    │ m   │ 200   ││
│  └────────┴─────────────────────┴─────┴───────┘│
│                                                  │
│  2. Fundações                                   │
│  ┌────────┬─────────────────────┬─────┬───────┐│
│  │ Artigo │ Descrição           │ UN  │  QT   ││
│  ├────────┼─────────────────────┼─────┼───────┤│
│  │ 2.1    │ Escavações          │ m3  │ 200   ││
│  │ 2.2    │ Betão               │ m3  │ 150   ││
│  │ 2.3    │ Armaduras           │ kg  │ 5000  ││
│  └────────┴─────────────────────┴─────┴───────┘│
└─────────────────────────────────────────────────┘
```

**Solution**: Items automatically extracted and displayed with proper data

---

## Excel File Processing Flow

### Input: Excel File

```
Sheet: "Obra Civil"
┌────────┬────────────────────────┬─────┬────────┐
│ ARTIGO │ DESCRIÇÃO              │ UN  │   QT   │
├────────┼────────────────────────┼─────┼────────┤
│   1    │ Trabalhos Preliminares │     │        │  <- CHAPTER
├────────┼────────────────────────┼─────┼────────┤
│  1.1   │ Limpeza do terreno     │ m2  │  100   │  <- ITEM (chapter 1)
│  1.2   │ Demolições             │ un  │   50   │  <- ITEM (chapter 1)
│  1.3   │ Vedação do local       │ m   │  200   │  <- ITEM (chapter 1)
├────────┼────────────────────────┼─────┼────────┤
│   2    │ Fundações              │     │        │  <- CHAPTER
├────────┼────────────────────────┼─────┼────────┤
│  2.1   │ Escavações             │ m3  │  200   │  <- ITEM (chapter 2)
│  2.2   │ Betão                  │ m3  │  150   │  <- ITEM (chapter 2)
│  2.3   │ Armaduras              │ kg  │ 5000   │  <- ITEM (chapter 2)
└────────┴────────────────────────┴─────┴────────┘
```

### Processing Steps

```
1. DETECT COLUMNS
   ✓ Found "ARTIGO" in column 0
   ✓ Found "DESCRIÇÃO" in column 1
   ✓ Found "UN" in column 2
   ✓ Found "QT" in column 3

2. CREATE TAB
   ✓ Tab: "Obra Civil" (id: uuid-1)

3. EXTRACT CHAPTERS
   Row 1: "1" → CHAPTER ✓
   Chapter: { number: "1", name: "Trabalhos Preliminares" }
   
   Row 5: "2" → CHAPTER ✓
   Chapter: { number: "2", name: "Fundações" }

4. EXTRACT ITEMS
   Row 2: "1.1" → ITEM ✓
   Chapter Number: "1" (extracted from "1.1")
   Item: { artigo: "1.1", descricao: "Limpeza...", un: "m2", qt: 100 }
   
   Row 3: "1.2" → ITEM ✓
   Chapter Number: "1" (extracted from "1.2")
   Item: { artigo: "1.2", descricao: "Demolições", un: "un", qt: 50 }
   
   Row 4: "1.3" → ITEM ✓
   Chapter Number: "1" (extracted from "1.3")
   Item: { artigo: "1.3", descricao: "Vedação...", un: "m", qt: 200 }
   
   Row 6: "2.1" → ITEM ✓
   Chapter Number: "2" (extracted from "2.1")
   Item: { artigo: "2.1", descricao: "Escavações", un: "m3", qt: 200 }
   
   Row 7: "2.2" → ITEM ✓
   Chapter Number: "2" (extracted from "2.2")
   Item: { artigo: "2.2", descricao: "Betão", un: "m3", qt: 150 }
   
   Row 8: "2.3" → ITEM ✓
   Chapter Number: "2" (extracted from "2.3")
   Item: { artigo: "2.3", descricao: "Armaduras", un: "kg", qt: 5000 }

5. INSERT INTO DATABASE
   ✓ Insert tab (id: uuid-1)
   ✓ Insert 2 chapters
   ✓ Insert 6 items linked to chapters

6. DISPLAY IN UI
   ✓ Show tab "Obra Civil"
   ✓ Show chapter 1 with 3 items
   ✓ Show chapter 2 with 3 items
```

### Output: Database Structure

```
orcamento_tabs
├─ uuid-1: "Obra Civil"

orcamento_chapters
├─ uuid-2: { tab_id: uuid-1, number: "1", name: "Trabalhos Preliminares" }
└─ uuid-3: { tab_id: uuid-1, number: "2", name: "Fundações" }

orcamento_items
├─ uuid-4: { chapter_id: uuid-2, artigo: "1.1", descricao: "Limpeza...", un: "m2", qt: 100 }
├─ uuid-5: { chapter_id: uuid-2, artigo: "1.2", descricao: "Demolições", un: "un", qt: 50 }
├─ uuid-6: { chapter_id: uuid-2, artigo: "1.3", descricao: "Vedação...", un: "m", qt: 200 }
├─ uuid-7: { chapter_id: uuid-3, artigo: "2.1", descricao: "Escavações", un: "m3", qt: 200 }
├─ uuid-8: { chapter_id: uuid-3, artigo: "2.2", descricao: "Betão", un: "m3", qt: 150 }
└─ uuid-9: { chapter_id: uuid-3, artigo: "2.3", descricao: "Armaduras", un: "kg", qt: 5000 }
```

---

## Code Changes Visualization

### Type Definition (NEW)

```typescript
type OrcamentoItem = {
  id: string;
  chapter_id: string;  // Links to chapter
  artigo: string;      // "1.1", "2.3", etc.
  descricao: string;   // Item description
  un: string | null;   // Unit (nullable)
  qt: number | null;   // Quantity (nullable)
};
```

### Column Detection (ENHANCED)

```typescript
// BEFORE: Only 2 columns
let artigoColumnIndex = -1;
let descricaoColumnIndex = -1;

// AFTER: 4 columns
let artigoColumnIndex = -1;
let descricaoColumnIndex = -1;
let unColumnIndex = -1;      // NEW
let qtColumnIndex = -1;      // NEW
```

### Item Extraction (NEW)

```typescript
// Check if it's a number with a dot (item identifier)
else if (/^\d+\.\d+/.test(artigoCell) && descricaoCell) {
  // Extract chapter number (the number before the dot)
  const chapterNumber = artigoCell.split('.')[0];
  
  // Get UN and QT values
  const unValue = unColumnIndex !== -1 ? row[unColumnIndex] : null;
  const qtValue = qtColumnIndex !== -1 ? row[qtColumnIndex] : null;
  
  itemsToInsert.push({
    sheet_name: sheetName,
    chapter_number: chapterNumber,  // Used to link to chapter
    artigo: artigoCell,
    descricao: descricaoCell,
    un: unValue,
    qt: qtValue,
  });
}
```

### Database Insert (ENHANCED)

```typescript
// Insert chapters first
const { data: insertedChapters } = await supabase
  .from("orcamento_chapters")
  .insert(chaptersWithTabIds)
  .select();

// Create mapping of (sheet_name + chapter_number) → chapter_id
const chapterMap = new Map<string, string>();
insertedChapters.forEach(chapter => {
  const tab = insertedTabs.find(t => t.id === chapter.tab_id);
  if (tab) {
    const key = `${tab.name}_${chapter.chapter_number}`;
    chapterMap.set(key, chapter.id);
  }
});

// Map items to chapters and insert
const itemsWithChapterIds = itemsToInsert.map(item => {
  const key = `${item.sheet_name}_${item.chapter_number}`;
  const chapterId = chapterMap.get(key);
  return {
    chapter_id: chapterId,  // Linked!
    artigo: item.artigo,
    descricao: item.descricao,
    un: item.un,
    qt: item.qt,
  };
}).filter(item => item.chapter_id);

await supabase.from("orcamento_items").insert(itemsWithChapterIds);
```

### UI Display (UPDATED)

```typescript
// Group items by chapter
const itemsByChapter = items?.reduce((acc, item) => {
  if (!acc[item.chapter_id]) {
    acc[item.chapter_id] = [];
  }
  acc[item.chapter_id].push(item);
  return acc;
}, {} as Record<string, OrcamentoItem[]>) || {};

// Display in table
<TableBody>
  {itemsByChapter[chapter.id]?.map((item) => (
    <TableRow key={item.id}>
      <TableCell>{item.artigo}</TableCell>
      <TableCell>{item.descricao}</TableCell>
      <TableCell>{item.un || '-'}</TableCell>
      <TableCell className="text-right">
        {item.qt !== null ? item.qt : '-'}
      </TableCell>
    </TableRow>
  ))}
</TableBody>
```

---

## Pattern Matching Examples

### Chapter Detection (Pure Numbers)
```
"1"     → ✓ CHAPTER
"2"     → ✓ CHAPTER
"10"    → ✓ CHAPTER
"100"   → ✓ CHAPTER

"1.1"   → ✗ NOT A CHAPTER (has dot)
"2.3"   → ✗ NOT A CHAPTER (has dot)
"A"     → ✗ NOT A CHAPTER (not numeric)
```

### Item Detection (Numbers with Dots)
```
"1.1"    → ✓ ITEM (belongs to chapter "1")
"2.3"    → ✓ ITEM (belongs to chapter "2")
"10.5"   → ✓ ITEM (belongs to chapter "10")
"3.15"   → ✓ ITEM (belongs to chapter "3")

"1"      → ✗ NOT AN ITEM (no dot)
"1.1.1"  → ✗ NOT AN ITEM (too many dots)
"A.1"    → ✗ NOT AN ITEM (not numeric)
```

---

## Result Summary

### What Gets Extracted

✅ **Tabs**: One per Excel sheet  
✅ **Chapters**: Rows with pure numbers in ARTIGO (e.g., "1", "2")  
✅ **Items**: Rows with dotted numbers in ARTIGO (e.g., "1.1", "2.3")  
✅ **Item Data**: Artigo, Descrição, UN, QT  
✅ **Relationships**: Items automatically linked to chapters  

### What Gets Displayed

✅ Tabs at the top (sheet names)  
✅ Chapters as section headers with names  
✅ Items in tables under chapters  
✅ Four columns: Artigo, Descrição, UN, QT  
✅ Clean UI with proper formatting  
✅ "-" for missing/null values  

### Data Integrity

✅ Items only inserted if matching chapter exists  
✅ Cascade delete: deleting chapter deletes its items  
✅ Null handling for missing UN/QT values  
✅ Invalid QT values (NaN) converted to NULL  
✅ Proper foreign key constraints  
