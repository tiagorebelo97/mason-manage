# Visual Example: Article-Based View Multi-Sheet Fix

## Before Fix (BROKEN ❌)

### Excel File Structure
```
📁 MyProject.xlsx
├── 📄 Sheet1
│   ├── 1 | Chapter One
│   ├── 1.1 | Article 1.1 | m2 | 100
│   └── 1.1.1 | Item 1 | un | 5
│
└── 📄 Sheet2
    ├── 2 | Chapter Two
    ├── 2.1 | Article 2.1 | kg | 50
    └── 2.1.1 | Item 2 | m | 10
```

### Analysis Flow (BROKEN)
```
1. articleBasedView = true
2. hasMultipleSheets = false ✓
3. Create 3 tabs: Principal, Arquitetura, Instalações Especiais ✓

4. Map sheets to tabs:
   Sheet1 → Principal ✓
   Sheet2 → ??? ❌ (NOT MAPPED!)

5. Create chapters:
   Chapter 1: sheet_name="Sheet1", tab_id=Principal ✓
   Chapter 2: sheet_name="Sheet2", tab_id=null ❌ (NO TAB ID!)

6. Insert chapters to database:
   ❌ FAILS! Chapter 2 has null tab_id (foreign key constraint violation)
   OR: Chapter 2 is inserted but tab_id is null

7. Map chapters for items:
   Key "Sheet1_1" → Chapter 1 ID ✓
   Key "Sheet1_2" → NOT FOUND ❌ (only first sheet mapped!)

8. Items from Sheet2:
   Item 2.1.1 looks for key "Sheet2_2" → NOT FOUND ❌
   Item has no chapter_id, filtered out, LOST! ❌

Result: ❌ "Failed to analyze file" OR data loss from Sheet2
```

## After Fix (WORKING ✓)

### Same Excel File Structure
```
📁 MyProject.xlsx
├── 📄 Sheet1
│   ├── 1 | Chapter One
│   ├── 1.1 | Article 1.1 | m2 | 100
│   └── 1.1.1 | Item 1 | un | 5
│
└── 📄 Sheet2
    ├── 2 | Chapter Two
    ├── 2.1 | Article 2.1 | kg | 50
    └── 2.1.1 | Item 2 | m | 10
```

### Analysis Flow (FIXED)
```
1. articleBasedView = true
2. hasMultipleSheets = false ✓
3. Create 3 tabs: Principal, Arquitetura, Instalações Especiais ✓

4. Map sheets to tabs (FIXED):
   workbook.SheetNames.forEach(sheetName => {
     sheetNameToTabId.set(sheetName, principalTab.id);
   });
   
   Sheet1 → Principal ✓
   Sheet2 → Principal ✓ (NOW MAPPED!)

5. Create chapters:
   Chapter 1: sheet_name="Sheet1", tab_id=Principal ✓
   Chapter 2: sheet_name="Sheet2", tab_id=Principal ✓ (NOW HAS TAB ID!)

6. Insert chapters to database:
   ✓ SUCCESS! Both chapters have valid tab_id

7. Map chapters for items (FIXED):
   insertedChapters.forEach((chapter, index) => {
     const originalChapter = chaptersToInsert[index];
     const key = `${originalChapter.sheet_name}_${chapter.chapter_number}`;
     chapterMap.set(key, chapter.id);
   });
   
   Key "Sheet1_1" → Chapter 1 ID ✓
   Key "Sheet2_2" → Chapter 2 ID ✓ (NOW FOUND!)

8. Items from Sheet2:
   Item 2.1.1 looks for key "Sheet2_2" → FOUND ✓
   Item has chapter_id, included in database ✓

Result: ✓ Analysis succeeds, all data from all sheets preserved!
```

## Article UN/QT Capture (NEW FEATURE ✓)

### Before Fix (MISSING ❌)
```
Excel Row: | 1.1 | Article with values | m2 | 100 |

Detected as Article:
  artigo: "1.1"
  title: "Article with values"
  contents: [] ❌ (UN and QT ignored!)
```

### After Fix (CAPTURED ✓)
```
Excel Row: | 1.1 | Article with values | m2 | 100 |

Detected as Article:
  artigo: "1.1"
  title: "Article with values"
  contents: [
    {
      type: 'item', ✓
      data: {
        artigo: "1.1",
        descricao: "Article with values",
        un: "m2", ✓
        qt: 100  ✓
      }
    }
  ]
```

### UI Display
```
Before Fix:
┌─────────────────────────────────┐
│ 1.1 - Article with values      │
├─────────────────────────────────┤
│ (no table shown) ❌             │
└─────────────────────────────────┘

After Fix:
┌─────────────────────────────────────────────────────┐
│ 1.1 - Article with values                          │
├─────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐ │
│ │ ARTIGO │ DESCRIÇÃO            │ UN │ QT       │ │
│ ├────────┼──────────────────────┼────┼──────────┤ │
│ │ 1.1    │ Article with values  │ m2 │ 100      │ │
│ └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Complete Example with Both Features

### Excel File
```
| ARTIGO | DESCRIÇÃO              | UN  | QT   |
|--------|------------------------|-----|------|
| 1      | Chapter One            |     |      |
| 1.1    | Article with values    | m2  | 100  | <- Article has UN and QT
| 1.1.1  | Item under article     | un  | 5    |
| 1.2    | Article without values |     |      | <- Article has no UN and QT
| 1.2.1  | Item under article     | kg  | 10   |
```

### UI Display After Fix
```
┌─────────────────────────────────────────────────────────────┐
│ Principal Tab                                               │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. Chapter One                                          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ 1.1 - Article with values                               │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ ARTIGO │ DESCRIÇÃO           │ UN │ QT              │ │ │
│ │ ├────────┼─────────────────────┼────┼─────────────────┤ │ │
│ │ │ 1.1    │ Article with values │ m2 │ 100             │ │ │ <- Article's own UN/QT
│ │ │ 1.1.1  │ Item under article  │ un │ 5               │ │ │ <- Item
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ 1.2 - Article without values                            │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ ARTIGO │ DESCRIÇÃO           │ UN │ QT              │ │ │
│ │ ├────────┼─────────────────────┼────┼─────────────────┤ │ │
│ │ │ 1.2.1  │ Item under article  │ kg │ 10              │ │ │ <- Only item (no article row)
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Takeaways

1. ✓ Multi-sheet Excel files now work with article-based view
2. ✓ All sheets are combined into the Principal tab
3. ✓ Articles with UN and QT values now show those values
4. ✓ No data loss from any sheet
5. ✓ Consistent behavior across all sheet counts
