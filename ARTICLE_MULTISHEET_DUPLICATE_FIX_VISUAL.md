# Visual Guide: Multi-Sheet Duplicate Chapter/Article Fix

## Before Fix (BROKEN ❌)

### Excel File Structure
```
📄 Sheet1:
   Chapter 1 - "Foundation Work"
     Article 1.1 - "Excavation"
     Article 1.2 - "Concrete"
   
📄 Sheet2:
   Chapter 1 - "Steel Structure"
     Article 1.1 - "Steel Frame"
     Article 1.2 - "Connections"
```

### Database Insert Attempt
```
INSERT INTO orcamento_chapters:
1. {tab_id: "Principal", chapter_number: "1", chapter_name: "Foundation Work"} ✅
2. {tab_id: "Principal", chapter_number: "1", chapter_name: "Steel Structure"} ❌

❌ ERROR: UNIQUE constraint violation on (tab_id, chapter_number)
❌ Analysis fails with "Failed to analyze file"
```

---

## After Fix (WORKING ✓)

### Analysis Phase
```typescript
// Detect if we need sheet prefix
const needsSheetPrefix = articleBasedView && workbook.SheetNames.length > 1;
// Result: needsSheetPrefix = true
```

### Chapter Processing
```
Sheet1, Chapter 1:
  Original: chapter_number = "1"
  Stored:   chapter_number = "Sheet1_1" ✓

Sheet2, Chapter 1:
  Original: chapter_number = "1"
  Stored:   chapter_number = "Sheet2_1" ✓
```

### Article Processing
```
Sheet1, Article 1.1:
  Original: artigo = "1.1"
  Stored:   artigo = "Sheet1_1.1" ✓

Sheet2, Article 1.1:
  Original: artigo = "1.1"
  Stored:   artigo = "Sheet2_1.1" ✓
```

### Database Insert Success
```
INSERT INTO orcamento_chapters:
1. {tab_id: "Principal", chapter_number: "Sheet1_1", chapter_name: "Foundation Work"} ✅
2. {tab_id: "Principal", chapter_number: "Sheet2_1", chapter_name: "Steel Structure"} ✅

✅ No conflict! Both chapters inserted successfully.
```

### Article Grouping
```javascript
// Articles stored in sessionStorage with prefixed numbers
articlesData = [
  {
    sheet_name: "Sheet1",
    chapter_number: "Sheet1_1",  // ✓ Prefixed
    artigo: "Sheet1_1.1",         // ✓ Prefixed
    title: "Excavation",
    contents: [...]
  },
  {
    sheet_name: "Sheet2",
    chapter_number: "Sheet2_1",  // ✓ Prefixed
    artigo: "Sheet2_1.1",         // ✓ Prefixed
    title: "Steel Frame",
    contents: [...]
  }
]

// Grouping by chapter_number
groupedByChapter = {
  "Sheet1_1": [Article 1.1, Article 1.2],  // ✓ Correct grouping
  "Sheet2_1": [Article 1.1, Article 1.2]   // ✓ Correct grouping
}

// Matching to database chapters
chapters = [
  {id: "abc", chapter_number: "Sheet1_1"},
  {id: "def", chapter_number: "Sheet2_1"}
]

✅ Each article finds its correct chapter!
```

---

## UI Display (Clean Numbers)

### Display Helper Function
```typescript
const displayNumber = (fullNumber: string): string => {
  if (fullNumber.includes('_')) {
    const parts = fullNumber.split('_');
    return parts[parts.length - 1]; // Extract part after underscore
  }
  return fullNumber;
};

// Examples:
displayNumber("Sheet1_1")   → "1"     ✓
displayNumber("Sheet1_1.1") → "1.1"   ✓
displayNumber("Sheet2_1")   → "1"     ✓
displayNumber("1")          → "1"     ✓ (no prefix, returns as-is)
```

### UI Rendering
```
┌─────────────────────────────────┐
│ 📄 Sheet1                       │  ← Sheet separator
└─────────────────────────────────┘

  ▼ 1. Foundation Work             ← displayNumber("Sheet1_1") → "1"
    
    📋 1.1 - Excavation            ← displayNumber("Sheet1_1.1") → "1.1"
    ┌──────────────────────────────┐
    │ ARTIGO │ DESCRIÇÃO │ UN │ QT │
    ├──────────────────────────────┤
    │ 1.1.1  │ Item...   │ m3 │ 10 │ ← displayNumber("Sheet1_1.1.1") → "1.1.1"
    └──────────────────────────────┘
    
    📋 1.2 - Concrete              ← displayNumber("Sheet1_1.2") → "1.2"

┌─────────────────────────────────┐
│ 📄 Sheet2                       │  ← Sheet separator
└─────────────────────────────────┘

  ▼ 1. Steel Structure             ← displayNumber("Sheet2_1") → "1"
    
    📋 1.1 - Steel Frame           ← displayNumber("Sheet2_1.1") → "1.1"
    
    📋 1.2 - Connections           ← displayNumber("Sheet2_1.2") → "1.2"
```

✅ Users see clean numbers like "1", "1.1" instead of "Sheet1_1", "Sheet1_1.1"
✅ Sheet separators clearly show which sheet each chapter belongs to
✅ No confusion, perfect organization!

---

## Data Flow Summary

```
┌──────────────────────────────────────────────────────────────┐
│ Excel File (Multi-Sheet with Duplicate Numbers)             │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Analysis Phase                                               │
│ • Detect needsSheetPrefix = true                             │
│ • Prefix chapter_number: "1" → "Sheet1_1"                    │
│ • Prefix artigo: "1.1" → "Sheet1_1.1"                        │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Database Storage                                             │
│ • Chapters: {tab_id: "Principal", chapter_number: "Sheet1_1"}│
│ • Items: {chapter_id: "abc", artigo: "Sheet1_1.1"}          │
│ • ✅ No UNIQUE constraint violations                         │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ UI Rendering                                                 │
│ • displayNumber("Sheet1_1") → "1"                            │
│ • displayNumber("Sheet1_1.1") → "1.1"                        │
│ • ✅ Clean display for users                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Test Scenarios

### ✅ Scenario 1: Multi-Sheet Article-Based View
- 2 sheets, both with Chapter 1
- needsSheetPrefix = TRUE
- Chapters stored as "Sheet1_1", "Sheet2_1"
- Display shows "1", "1"
- Result: ✅ Works!

### ✅ Scenario 2: Single-Sheet Article-Based View
- 1 sheet with Chapter 1
- needsSheetPrefix = FALSE
- Chapter stored as "1"
- Display shows "1"
- Result: ✅ Works!

### ✅ Scenario 3: Multi-Sheet Normal View
- 2 sheets, both with Chapter 1
- Article-based view disabled
- needsSheetPrefix = FALSE
- Each sheet creates its own tab
- Chapters stored as "1" in different tabs
- Result: ✅ Works! (no conflict as different tab_id)

---

## Key Takeaways

1. **Problem**: Duplicate chapter numbers across sheets caused UNIQUE constraint violations
2. **Solution**: Prefix chapter/article numbers with sheet name in article-based multi-sheet mode
3. **Display**: Strip prefix in UI for clean presentation
4. **Organization**: Sheet separators maintain clear visual organization
5. **Compatibility**: Single-sheet and normal multi-sheet modes unaffected
