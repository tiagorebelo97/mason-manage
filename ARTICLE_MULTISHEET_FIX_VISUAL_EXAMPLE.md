# Visual Example: Article-Based View Multi-Sheet Duplicate Chapter Fix

## Before Fix (BROKEN ❌)

### Excel File Structure
```
Sheet1:
  | ARTIGO | DESCRIÇÃO        | UN  | QT  |
  |--------|------------------|-----|-----|
  | 1      | Foundation Work  |     |     |  ← Chapter 1
  | 1.1    | Excavation       |     |     |  ← Article 1.1
  | 1.1.1  | Manual excavate  | m3  | 10  |  ← Item

Sheet2:
  | ARTIGO | DESCRIÇÃO        | UN  | QT   |
  |--------|------------------|-----|------|
  | 1      | Electrical Work  |     |      |  ← Chapter 1
  | 1.1    | Wiring           |     |      |  ← Article 1.1
  | 1.1.1  | Install cables   | m   | 100  |  ← Item
```

### What Happened (BROKEN)

**Step 1: Analysis**
```
Chapters created in database:
  ✓ Chapter ID: ch-111, chapter_number: "1", chapter_name: "Foundation Work", tab_id: principal
  ✓ Chapter ID: ch-222, chapter_number: "1", chapter_name: "Electrical Work", tab_id: principal

Articles saved to sessionStorage:
  ✓ Article { sheet_name: "Sheet1", chapter_number: "1", artigo: "1.1", title: "Excavation" }
  ✓ Article { sheet_name: "Sheet2", chapter_number: "1", artigo: "1.1", title: "Wiring" }
```

**Step 2: Loading (BROKEN)**
```javascript
// OLD CODE: Group by chapter_number only
articlesData.forEach(article => {
  const key = article.chapter_number;  // ❌ "1" for both articles!
  groupedByChapter.set(key, [...]);
});

// Result: Both articles grouped under key "1"
groupedByChapter.get("1") = [
  { sheet_name: "Sheet1", artigo: "1.1", title: "Excavation" },
  { sheet_name: "Sheet2", artigo: "1.1", title: "Wiring" }      // ❌ MIXED!
]
```

**Step 3: Matching to Chapters (BROKEN)**
```javascript
// OLD CODE: Match by chapter_number
chapters.forEach(chapter => {
  const articlesForChapter = groupedByChapter.get(chapter.chapter_number);
  // ...
});

// For chapter ch-111 (Foundation Work):
//   Lookup: groupedByChapter.get("1")
//   Result: Gets BOTH articles ❌
//   Display: Shows "Excavation" AND "Wiring" under Foundation Work ❌

// For chapter ch-222 (Electrical Work):
//   Lookup: groupedByChapter.get("1")
//   Result: Gets BOTH articles ❌ (same as above!)
//   Display: Shows "Excavation" AND "Wiring" under Electrical Work ❌
```

### UI Display (BROKEN)
```
Principal Tab:
  
  Chapter 1: Foundation Work
    └─ Article 1.1: Excavation        ✓ Correct
    └─ Article 1.1: Wiring            ❌ WRONG! Should be in Electrical Work
  
  Chapter 1: Electrical Work
    └─ Article 1.1: Excavation        ❌ WRONG! Should be in Foundation Work
    └─ Article 1.1: Wiring            ✓ Correct
```

---

## After Fix (WORKING ✓)

### Same Excel File Structure
```
Sheet1:
  | ARTIGO | DESCRIÇÃO        | UN  | QT  |
  |--------|------------------|-----|-----|
  | 1      | Foundation Work  |     |     |  ← Chapter 1
  | 1.1    | Excavation       |     |     |  ← Article 1.1
  | 1.1.1  | Manual excavate  | m3  | 10  |  ← Item

Sheet2:
  | ARTIGO | DESCRIÇÃO        | UN  | QT   |
  |--------|------------------|-----|------|
  | 1      | Electrical Work  |     |      |  ← Chapter 1
  | 1.1    | Wiring           |     |      |  ← Article 1.1
  | 1.1.1  | Install cables   | m   | 100  |  ← Item
```

### What Happens (FIXED)

**Step 1: Analysis**
```
Chapters created in database:
  ✓ Chapter ID: ch-111, chapter_number: "1", chapter_name: "Foundation Work", tab_id: principal
  ✓ Chapter ID: ch-222, chapter_number: "1", chapter_name: "Electrical Work", tab_id: principal

Mapping created and stored:
  ✓ chapterIdToSheetNameMap.set("ch-111", "Sheet1")
  ✓ chapterIdToSheetNameMap.set("ch-222", "Sheet2")
  ✓ Saved to sessionStorage as chapterMapping_{id}

Articles saved to sessionStorage:
  ✓ Article { sheet_name: "Sheet1", chapter_number: "1", artigo: "1.1", title: "Excavation" }
  ✓ Article { sheet_name: "Sheet2", chapter_number: "1", artigo: "1.1", title: "Wiring" }
```

**Step 2: Loading (FIXED)**
```javascript
// NEW CODE: Group by composite key (sheet_name + chapter_number)
articlesData.forEach(article => {
  const key = `${article.sheet_name}_${article.chapter_number}`;  // ✓ Unique keys!
  groupedByChapter.set(key, [...]);
});

// Result: Articles separated by composite key
groupedByChapter.get("Sheet1_1") = [
  { sheet_name: "Sheet1", artigo: "1.1", title: "Excavation" }  // ✓ Only Sheet1 articles
]

groupedByChapter.get("Sheet2_1") = [
  { sheet_name: "Sheet2", artigo: "1.1", title: "Wiring" }      // ✓ Only Sheet2 articles
]
```

**Step 3: Matching to Chapters (FIXED)**
```javascript
// NEW CODE: Use mapping to get sheet_name, then match by composite key
const chapterIdToSheetName = loadedMappingFromSessionStorage();

chapters.forEach(chapter => {
  const sheetName = chapterIdToSheetName.get(chapter.id);  // ✓ Get original sheet
  const key = `${sheetName}_${chapter.chapter_number}`;     // ✓ Composite key
  const articlesForChapter = groupedByChapter.get(key);
  // ...
});

// For chapter ch-111 (Foundation Work):
//   sheetName: "Sheet1" (from mapping)
//   key: "Sheet1_1"
//   Lookup: groupedByChapter.get("Sheet1_1")
//   Result: Gets only "Excavation" ✓
//   Display: Shows only "Excavation" under Foundation Work ✓

// For chapter ch-222 (Electrical Work):
//   sheetName: "Sheet2" (from mapping)
//   key: "Sheet2_1"
//   Lookup: groupedByChapter.get("Sheet2_1")
//   Result: Gets only "Wiring" ✓
//   Display: Shows only "Wiring" under Electrical Work ✓
```

### UI Display (FIXED)
```
Principal Tab:
  
  Chapter 1: Foundation Work
    └─ Article 1.1: Excavation        ✓ Correct
  
  Chapter 1: Electrical Work
    └─ Article 1.1: Wiring            ✓ Correct
```

---

## Key Differences

### Old Approach ❌
- **Grouping Key**: `chapter_number` (e.g., "1")
- **Problem**: Same key for chapters from different sheets
- **Result**: Articles mixed together

### New Approach ✓
- **Grouping Key**: `sheet_name + "_" + chapter_number` (e.g., "Sheet1_1", "Sheet2_1")
- **Benefit**: Unique key for each sheet's chapter
- **Result**: Articles properly separated

### Additional Fix ✓
- **Mapping Stored**: chapter.id → sheet_name
- **Stored In**: sessionStorage as `chapterMapping_{orcamento_id}`
- **Purpose**: Reconstruct sheet_name when loading (not in database)
- **Retrieval**: When loading, look up each chapter's sheet_name from mapping

---

## Summary

The fix ensures that:
1. ✅ Multiple sheets can have the same chapter numbers
2. ✅ Multiple sheets can have the same article numbers
3. ✅ Articles from different sheets don't get mixed
4. ✅ Each chapter displays only its own articles
5. ✅ Works for any number of sheets with any chapter/article numbers

The composite key approach (`sheet_name_chapter_number`) combined with the stored mapping (`chapter.id → sheet_name`) provides robust separation while maintaining compatibility with the existing database schema.
