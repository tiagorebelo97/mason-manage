# Visual Example: Before and After Fix

## Before Fix (BROKEN ❌)

### Scenario: Two sheets, both with chapter "1"

```
Excel File: "Construction.xlsx"
├── Sheet: Folha1
│   ├── Chapter 1: Foundation Work
│   │   └── Article 1.1: Excavation
│   │       └── Item 1.1.1: Manual excavation
│   └── Chapter 2: Concrete Work
│       └── Article 2.1: Formwork
│
└── Sheet: Folha2
    ├── Chapter 1: Electrical Work      ← DUPLICATE CHAPTER NUMBER!
    │   └── Article 1.1: Wiring         ← DUPLICATE ARTICLE NUMBER!
    │       └── Item 1.1.1: Cable       ← DUPLICATE ITEM NUMBER!
    └── Chapter 2: Plumbing             ← DUPLICATE CHAPTER NUMBER!
        └── Article 2.1: Pipes          ← DUPLICATE ARTICLE NUMBER!
```

### Analysis Flow (BROKEN)

```
1. User enables "Article-based view" ✓
2. System creates 3 tabs: Principal, Arquitetura, Instalações Especiais ✓

3. Map sheets to tabs:
   Folha1 → Principal (tab_id = "abc-123")
   Folha2 → Principal (tab_id = "abc-123")  ✓

4. Process Folha1 - Chapter "1":
   INSERT INTO orcamento_chapters VALUES (
     tab_id = "abc-123",
     chapter_number = "1",
     chapter_name = "Foundation Work"
   );
   ✓ Success! Inserted with ID "ch-001"

5. Process Folha2 - Chapter "1":
   INSERT INTO orcamento_chapters VALUES (
     tab_id = "abc-123",
     chapter_number = "1",          ← SAME AS FOLHA1!
     chapter_name = "Electrical Work"
   );
   ❌ ERROR: duplicate key value violates unique constraint 
      "orcamento_chapters_tab_id_chapter_number_key"
      DETAIL: Key (tab_id, chapter_number)=(abc-123, 1) already exists.

6. Analysis FAILS with "Failed to analyze file" ❌
```

### Database State (Before Fix)

```
orcamento_tabs:
┌──────────┬─────────────────────┬──────────────┐
│ id       │ name                │ orcamento_id │
├──────────┼─────────────────────┼──────────────┤
│ abc-123  │ Principal           │ orc-999      │
│ abc-456  │ Arquitetura         │ orc-999      │
│ abc-789  │ Instalações Especiais│ orc-999     │
└──────────┴─────────────────────┴──────────────┘

orcamento_chapters:
┌──────────┬───────────┬────────────────┬───────────────────┐
│ id       │ tab_id    │ chapter_number │ chapter_name      │
├──────────┼───────────┼────────────────┼───────────────────┤
│ ch-001   │ abc-123   │ 1              │ Foundation Work   │
│          │           │ ↑              │                   │
│          │           │ Trying to insert ANOTHER chapter with │
│          │           │ tab_id=abc-123 and chapter_number=1   │
│          │           │ → UNIQUE CONSTRAINT VIOLATION! ❌     │
└──────────┴───────────┴────────────────┴───────────────────┘
             Same!       Same!           ← This causes the error
```

---

## After Fix (WORKING ✓)

### Scenario: Same Excel file with duplicate chapter numbers

```
Excel File: "Construction.xlsx"
├── Sheet: Folha1
│   ├── Chapter 1: Foundation Work
│   │   └── Article 1.1: Excavation
│   │       └── Item 1.1.1: Manual excavation
│   └── Chapter 2: Concrete Work
│       └── Article 2.1: Formwork
│
└── Sheet: Folha2
    ├── Chapter 1: Electrical Work      ← Same number, but different content
    │   └── Article 1.1: Wiring         
    │       └── Item 1.1.1: Cable       
    └── Chapter 2: Plumbing             
        └── Article 2.1: Pipes          
```

### Analysis Flow (FIXED)

```
1. User enables "Article-based view" ✓
2. System creates 3 tabs: Principal, Arquitetura, Instalações Especiais ✓

3. Map sheets to tabs:
   Folha1 → Principal (tab_id = "abc-123")
   Folha2 → Principal (tab_id = "abc-123")  ✓

4. Process Folha1 - Chapter "1":
   Detect: articleBasedView=true AND workbook.SheetNames.length=2
   → Prefix chapter number: "Folha1_1"
   
   INSERT INTO orcamento_chapters VALUES (
     tab_id = "abc-123",
     chapter_number = "Folha1_1",        ← PREFIXED!
     chapter_name = "Foundation Work"
   );
   ✓ Success! Inserted with ID "ch-001"

5. Process Folha2 - Chapter "1":
   Detect: articleBasedView=true AND workbook.SheetNames.length=2
   → Prefix chapter number: "Folha2_1"
   
   INSERT INTO orcamento_chapters VALUES (
     tab_id = "abc-123",
     chapter_number = "Folha2_1",        ← DIFFERENT PREFIX!
     chapter_name = "Electrical Work"
   );
   ✓ Success! Inserted with ID "ch-002"  ✓ NO ERROR!

6. Build chapter map:
   Chapter "Folha1_1" → Extract "1" → Key "Folha1_1" → ID "ch-001"
   Chapter "Folha2_1" → Extract "1" → Key "Folha2_1" → ID "ch-002"

7. Process items from Folha1:
   Item 1.1.1 needs chapter "1" from Folha1
   → Look for key "Folha1_1" in chapterMap
   → ✓ Found! chapter_id = "ch-001"

8. Process items from Folha2:
   Item 1.1.1 needs chapter "1" from Folha2
   → Look for key "Folha2_1" in chapterMap
   → ✓ Found! chapter_id = "ch-002"

9. Analysis SUCCEEDS! ✓
```

### Database State (After Fix)

```
orcamento_tabs:
┌──────────┬─────────────────────┬──────────────┐
│ id       │ name                │ orcamento_id │
├──────────┼─────────────────────┼──────────────┤
│ abc-123  │ Principal           │ orc-999      │
│ abc-456  │ Arquitetura         │ orc-999      │
│ abc-789  │ Instalações Especiais│ orc-999     │
└──────────┴─────────────────────┴──────────────┘

orcamento_chapters:
┌──────────┬───────────┬────────────────┬───────────────────┐
│ id       │ tab_id    │ chapter_number │ chapter_name      │
├──────────┼───────────┼────────────────┼───────────────────┤
│ ch-001   │ abc-123   │ Folha1_1       │ Foundation Work   │✓
│ ch-002   │ abc-123   │ Folha2_1       │ Electrical Work   │✓
│          │           │      ↑   ↑                         │
│          │           │      │   └─ Original number        │
│          │           │      └───── Sheet prefix           │
│ ch-003   │ abc-123   │ Folha1_2       │ Concrete Work     │✓
│ ch-004   │ abc-123   │ Folha2_2       │ Plumbing          │✓
└──────────┴───────────┴────────────────┴───────────────────┘
             Same       DIFFERENT!       ← No conflict! ✓

UNIQUE constraint on (tab_id, chapter_number):
  ✓ (abc-123, Folha1_1) - OK
  ✓ (abc-123, Folha2_1) - OK (different chapter_number!)
  ✓ (abc-123, Folha1_2) - OK
  ✓ (abc-123, Folha2_2) - OK

orcamento_items:
┌──────────┬────────────┬────────┬────────────────────┐
│ id       │ chapter_id │ artigo │ descricao          │
├──────────┼────────────┼────────┼────────────────────┤
│ it-001   │ ch-001     │ 1.1.1  │ Manual excavation  │✓
│ it-002   │ ch-002     │ 1.1.1  │ Cable installation │✓
│          │     ↑                                     │
│          │     └── Different chapters, no conflict  │
│ it-003   │ ch-003     │ 2.1.1  │ Wood formwork      │✓
│ it-004   │ ch-004     │ 2.1.1  │ PVC pipes          │✓
└──────────┴────────────┴────────┴────────────────────┘
```

### Key Differences

| Aspect | Before Fix ❌ | After Fix ✓ |
|--------|--------------|-------------|
| **Chapter Numbers in DB** | "1", "1" (duplicate) | "Folha1_1", "Folha2_1" (unique) |
| **Unique Constraint** | Violated | Satisfied |
| **Item Lookup Key** | "Folha1_1", "Folha2_1" | "Folha1_1", "Folha2_1" (same) |
| **Chapter Mapping** | Failed (duplicate key) | Success (unique keys) |
| **Analysis Result** | ❌ ERROR | ✓ SUCCESS |

### What Users See

**Important:** Users don't see the prefixed chapter numbers in the UI!

**UI Display:**
```
Tab: Principal
├── Chapter 1: Foundation Work       ← Shows "1", not "Folha1_1"
│   └── Article 1.1: Excavation
│       └── 1.1.1 - Manual excavation
├── Chapter 2: Concrete Work         ← Shows "2", not "Folha1_2"
│   └── Article 2.1: Formwork
├── Chapter 1: Electrical Work       ← Shows "1", not "Folha2_1"
│   └── Article 1.1: Wiring
│       └── 1.1.1 - Cable installation
└── Chapter 2: Plumbing              ← Shows "2", not "Folha2_2"
    └── Article 2.1: Pipes
```

The prefixing is **internal only** - used in the database to ensure uniqueness, but the UI displays the original chapter numbers!

---

## Summary

**Problem:** Duplicate chapter numbers across sheets caused database constraint violations

**Solution:** Prefix chapter numbers with sheet name in the database when:
- Article-based view is enabled AND
- Multiple sheets exist

**Result:** 
- ✓ Duplicate chapter numbers no longer cause errors
- ✓ All items correctly linked to their parent chapters
- ✓ Users see original chapter numbers in UI
- ✓ No breaking changes to existing functionality
