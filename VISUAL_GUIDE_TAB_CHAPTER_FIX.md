# Visual Guide: Tab-Chapter Correspondence Fix

## The Problem (Before Fix)

### Scenario: Re-analyzing a multi-sheet Excel file in article-based view

```
┌─────────────────────────────────────────────────────────────┐
│ Excel File: "project.xlsx"                                   │
│ - Sheet1 (Chapter 1, 2, 3)                                  │
│ - Sheet2 (Chapter 1, 2)                                     │
│ - Sheet3 (Chapter 1)                                        │
└─────────────────────────────────────────────────────────────┘

First Analysis:
┌──────────────┬──────────────┬──────────────┐
│ Sheet1 Tab   │ Sheet2 Tab   │ Sheet3 Tab   │
├──────────────┼──────────────┼──────────────┤
│ Chapter 1    │ Chapter 1    │ Chapter 1    │
│ Chapter 2    │ Chapter 2    │              │
│ Chapter 3    │              │              │
└──────────────┴──────────────┴──────────────┘
           ✅ Works correctly

Re-Analysis (Without Fix):
┌──────────────────────────────────────────┐
│ ❌ ERROR: Cannot insert tabs             │
│    UNIQUE constraint violated            │
│    (orcamento_id, name) already exists   │
└──────────────────────────────────────────┘

Database State (Broken):
┌──────────────┬──────────────┬──────────────┐
│ OLD Sheet1   │ OLD Sheet2   │ OLD Sheet3   │  ← Old tabs remain
│ Tab (id:123) │ Tab (id:456) │ Tab (id:789) │
└──────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┬──────────────┐
│ OLD Chap 1   │ OLD Chap 1   │ OLD Chap 1   │  ← Old chapters with
│ (tab_id:123) │ (tab_id:456) │ (tab_id:789) │     wrong references
│ OLD Chap 2   │ OLD Chap 2   │              │
│ OLD Chap 3   │              │              │
└──────────────┴──────────────┴──────────────┘

Result: ❌ Chapters appear under wrong tabs or not at all
```

## The Solution (After Fix)

### Same Scenario with Fix Applied

```
┌─────────────────────────────────────────────────────────────┐
│ Excel File: "project.xlsx"                                   │
│ - Sheet1 (Chapter 1, 2, 3)                                  │
│ - Sheet2 (Chapter 1, 2)                                     │
│ - Sheet3 (Chapter 1)                                        │
└─────────────────────────────────────────────────────────────┘

First Analysis:
┌──────────────┬──────────────┬──────────────┐
│ Sheet1 Tab   │ Sheet2 Tab   │ Sheet3 Tab   │
├──────────────┼──────────────┼──────────────┤
│ Chapter 1    │ Chapter 1    │ Chapter 1    │
│ Chapter 2    │ Chapter 2    │              │
│ Chapter 3    │              │              │
└──────────────┴──────────────┴──────────────┘
           ✅ Works correctly

Re-Analysis (With Fix):

Step 1: Clean up old data
┌──────────────────────────────────────────┐
│ 🧹 DELETE FROM orcamento_tabs            │
│    WHERE orcamento_id = '...'            │
│                                          │
│ → CASCADE deletes chapters               │
│ → CASCADE deletes items                  │
│ → CASCADE deletes item_specialities      │
└──────────────────────────────────────────┘

Database State: ✨ EMPTY (clean slate)

Step 2: Insert new tabs
┌──────────────┬──────────────┬──────────────┐
│ NEW Sheet1   │ NEW Sheet2   │ NEW Sheet3   │
│ Tab (id:abc) │ Tab (id:def) │ Tab (id:ghi) │
└──────────────┴──────────────┴──────────────┘

Step 3: Insert new chapters with correct tab_id
┌──────────────┬──────────────┬──────────────┐
│ NEW Chap 1   │ NEW Chap 1   │ NEW Chap 1   │
│ (tab_id:abc) │ (tab_id:def) │ (tab_id:ghi) │ ← Correct!
│ NEW Chap 2   │ NEW Chap 2   │              │
│ NEW Chap 3   │              │              │
└──────────────┴──────────────┴──────────────┘

Result: ✅ Chapters correctly appear under their sheet's tab
```

## Code Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ User clicks "Analyze" button                                  │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ analyzeMutation.mutate()                                      │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ 1. Download Excel file from storage                           │
│    - Get file URL from database                              │
│    - Download blob from Supabase storage                     │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. Read Excel file with XLSX and ExcelJS                     │
│    - Extract sheet names                                     │
│    - Parse data from each sheet                              │
│    - Extract images                                          │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. Process each sheet                                         │
│    - Detect chapters (pure numbers like "1", "2")            │
│    - Detect articles (numbers with dot like "1.1", "2.3")    │
│    - Extract items (rows with UN and QT)                     │
│    - Build chaptersToInsert array                            │
│    - Build itemsToInsert array                               │
│    - Build articlesData array (for article-based view)       │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. 🧹 DELETE OLD TABS (NEW CODE!)                            │
│    ┌────────────────────────────────────────────────────┐   │
│    │ DELETE FROM orcamento_tabs                         │   │
│    │ WHERE orcamento_id = ?                             │   │
│    │                                                     │   │
│    │ CASCADE deletes:                                   │   │
│    │ - orcamento_chapters (via tab_id FK)              │   │
│    │ - orcamento_items (via chapter_id FK)             │   │
│    │ - orcamento_item_specialities (via item_id FK)    │   │
│    └────────────────────────────────────────────────────┘   │
│                                                              │
│ 🧹 sessionStorage.removeItem(`articles_${id}`)               │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. Insert new tabs                                            │
│    - For article-based view: one tab per sheet               │
│    - For normal view: 3 default tabs (or one per sheet)      │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. Map sheets to tabs                                         │
│    - sheetNameToTabId.set("Sheet1", tab1.id)                │
│    - sheetNameToTabId.set("Sheet2", tab2.id)                │
│    - sheetNameToTabId.set("Sheet3", tab3.id)                │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ 7. Insert chapters with correct tab_id                        │
│    - chapter.tab_id = sheetNameToTabId.get(chapter.sheet_name)│
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ 8. Insert items linked to chapters                            │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ 9. Mark file as analyzed                                      │
│    UPDATE orcamento_files SET analyzed = true                │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ ✅ Success! Chapters now correctly linked to tabs            │
└──────────────────────────────────────────────────────────────┘
```

## Key Insight

The fix happens **between data extraction and data insertion**:

```
Excel Data → Extract → [🧹 DELETE OLD] → Insert New → Success
                            ↑
                      THE FIX
```

This ensures:
- ✅ All extracted data is available
- ✅ Old data is cleaned up before new data
- ✅ No conflicts with UNIQUE constraints
- ✅ Fresh, correct mappings every time

## Database Cascade Effect

```
DELETE tabs
    ↓
    ├─→ chapters deleted (ON DELETE CASCADE)
    │       ↓
    │       └─→ items deleted (ON DELETE CASCADE)
    │               ↓
    │               └─→ item_specialities deleted (ON DELETE CASCADE)
    │                       ↓
    │                       └─→ 🧹 Everything cleaned up!
    └─→ All related data removed automatically
```

This leverages the database foreign key constraints to automatically clean up all related data in one operation.

## Summary

**Before**: 🔴 Re-analysis fails, data corrupted  
**After**: 🟢 Re-analysis works, data clean  

**Code Added**: 16 lines  
**Complexity**: Low  
**Risk**: Minimal  
**Benefit**: High  

✅ **Fix is complete and ready for testing!**
