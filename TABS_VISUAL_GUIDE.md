# Visual Guide: Mapa Quantidades Changes

## Issue #1: File Analysis Fixed

### Before (Broken) 🔴
```
┌─────────────────────────────────────────────────────┐
│ 1. User uploads Excel file                          │
│    ├─> File saved to Supabase Storage ✅            │
│    └─> Metadata saved to database ✅                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. uploadedFile stored in React state               │
│    (local component memory)                          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. User clicks "Analyze"                            │
│    ├─> Tries to read from uploadedFile state ❌     │
│    └─> State is cleared/undefined ❌                │
└─────────────────────────────────────────────────────┘
                        ↓
              ❌ Analysis Fails Silently
```

### After (Fixed) ✅
```
┌─────────────────────────────────────────────────────┐
│ 1. User uploads Excel file                          │
│    ├─> File saved to Supabase Storage ✅            │
│    └─> Metadata + URL saved to database ✅          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. User clicks "Analyze"                            │
│    ├─> Gets file URL from database ✅               │
│    └─> Downloads file from storage ✅               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. Analyzes downloaded file                         │
│    ├─> Creates tabs in database ✅                  │
│    └─> Creates chapters in database ✅              │
└─────────────────────────────────────────────────────┘
                        ↓
              ✅ Success - Results Displayed!
```

## Issue #2: Title/Subtitle Fixed

### Before 🔴
```
┌─────────────────────────────────────────────────────┐
│                                                       │
│  ← Back to Orçamentos                                │
│                                                       │
│  📊 Mapa de Quantidades                 ← TITLE      │
│     Project Alpha                       ← Subtitle   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### After ✅
```
┌─────────────────────────────────────────────────────┐
│                                                       │
│  ← Back to Orçamentos                                │
│                                                       │
│  📋 Project Alpha                       ← TITLE      │
│     Mapa de Quantidades                 ← Subtitle   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Issue #3: Tabs in Database

### Before (Ephemeral) 🔴
```
Database:
┌────────────────┐
│  orcamentos    │
│  id, name      │
└────────────────┘

UI Only (Not Saved):
┌─────────────────────────────────────────┐
│ [Sheet1] [Sheet2] [Sheet3]              │  ← Tabs generated
└─────────────────────────────────────────┘    from sheet names
                                                NOT in database
```

### After (Persistent) ✅
```
Database:
┌────────────────┐
│  orcamentos    │
│  id, name      │
└────────────────┘
        │
        │ 1:many
        ↓
┌──────────────────┐
│  orcamento_tabs  │  ← NEW TABLE!
│  id              │
│  orcamento_id    │
│  name            │  ← "Sheet1", "Sheet2", etc
│  display_order   │  ← 0, 1, 2, etc
└──────────────────┘

UI (Loaded from Database):
┌─────────────────────────────────────────┐
│ [Sheet1] [Sheet2] [Sheet3]              │  ← Tabs loaded
└─────────────────────────────────────────┘    from database
```

## Issue #4: Database Relationships

### Before (Incorrect) 🔴
```
orcamentos                  orcamento_chapters
┌────────────┐             ┌─────────────────┐
│ id         │────────────>│ orcamento_id    │
│ name       │   1:many    │ sheet_name      │
└────────────┘             │ chapter_number  │
                           │ chapter_name    │
                           └─────────────────┘

Problem: Chapters directly linked to orçamentos
         No separate tab entity
         sheet_name is just a text field
```

### After (Correct) ✅
```
orcamentos          orcamento_tabs           orcamento_chapters
┌──────────┐       ┌───────────────┐        ┌──────────────┐
│ id       │──────>│ id            │───────>│ id           │
│ name     │ 1:many│ orcamento_id  │ 1:many │ tab_id       │
└──────────┘       │ name          │        │ chapter_num  │
                   │ display_order │        │ chapter_name │
                   └───────────────┘        └──────────────┘

Correct: Proper hierarchy with tabs as separate entities
         Each orçamento has multiple tabs
         Each tab has multiple chapters
         Cascade deletes maintain data integrity
```

## Data Model Comparison

### Before 🔴
```
GET /orcamento/123/chapters
↓
[
  { id: 1, orcamento_id: 123, sheet_name: "Sheet1", chapter: "1" },
  { id: 2, orcamento_id: 123, sheet_name: "Sheet1", chapter: "2" },
  { id: 3, orcamento_id: 123, sheet_name: "Sheet2", chapter: "1" }
]
↓
Group by sheet_name in UI
```

### After ✅
```
GET /orcamento/123/tabs
↓
[
  { id: "tab-1", orcamento_id: 123, name: "Sheet1", order: 0 },
  { id: "tab-2", orcamento_id: 123, name: "Sheet2", order: 1 }
]

GET /chapters (where tab_id in tabs)
↓
[
  { id: 1, tab_id: "tab-1", chapter: "1" },
  { id: 2, tab_id: "tab-1", chapter: "2" },
  { id: 3, tab_id: "tab-2", chapter: "1" }
]
↓
Group by tab_id, match with tabs
```

## Component State Changes

### Before 🔴
```typescript
// State
const [uploadedFile, setUploadedFile] = useState<File | null>(null);

// On upload
onSuccess: (result) => {
  setUploadedFile(result.file);  // Store in component
}

// On analyze
const handleAnalyze = () => {
  analyzeMutation.mutate(uploadedFile);  // ❌ Might be null
}
```

### After ✅
```typescript
// No uploadedFile state needed!

// On upload - just invalidate queries
onSuccess: () => {
  queryClient.invalidateQueries(["orcamento_files"]);
}

// On analyze - use file ID from database
const handleAnalyze = () => {
  analyzeMutation.mutate(currentFile.id);  // ✅ Always available
}
```

## Query Changes

### Before 🔴
```typescript
// One query for chapters
const { data: chapters } = useQuery({
  queryFn: () => supabase
    .from("orcamento_chapters")
    .select("*")
    .eq("orcamento_id", id)  // Direct relationship
});

// Group by sheet_name in render
```

### After ✅
```typescript
// Two queries - tabs and chapters
const { data: tabs } = useQuery({
  queryFn: () => supabase
    .from("orcamento_tabs")
    .select("*")
    .eq("orcamento_id", id)
    .order("display_order")
});

const { data: chapters } = useQuery({
  queryFn: () => supabase
    .from("orcamento_chapters")
    .select("*")
    // No orcamento_id filter needed!
    // Chapters filtered by tab_id when rendering
});

// Group by tab_id, match with tabs
```

## File Stored vs File Analyzed

### Concept
```
┌──────────────────────────────────────────────────┐
│  Supabase Storage Bucket: "orcamento-files"     │
│                                                  │
│  ├─ orcamento-123/                              │
│  │   ├─ 1638360000000.xlsx  ← Actual File      │
│  │   └─ 1638360100000.xlsx                      │
│  │                                              │
│  └─ orcamento-456/                              │
│      └─ 1638360200000.xlsx                      │
└──────────────────────────────────────────────────┘
                      ↕ download/upload
┌──────────────────────────────────────────────────┐
│  Database Table: "orcamento_files"               │
│                                                  │
│  id | orcamento_id | file_name | file_url       │
│  ---|--------------|-----------|---------------- │
│  1  | 123          | test.xlsx | https://...    │
│  2  | 123          | new.xlsx  | https://...    │
│  3  | 456          | data.xlsx | https://...    │
└──────────────────────────────────────────────────┘
```

The file_url in the database points to the actual file in storage.
When analyzing, we download from storage using this URL.

## Migration Impact

### What Happens During Migration
```
BEFORE Migration:
┌────────────────────────────────────────┐
│ orcamento_chapters                     │
│ ─────────────────────────────────────  │
│ id | orcamento_id | sheet_name | ...   │
│ 1  | 123         | Sheet1     | ...    │
│ 2  | 123         | Sheet1     | ...    │
│ 3  | 123         | Sheet2     | ...    │
└────────────────────────────────────────┘

          ⬇ RUN MIGRATION ⬇

AFTER Migration:
┌───────────────────────────┐    ┌────────────────────────┐
│ orcamento_tabs            │    │ orcamento_chapters     │
│ ────────────────────────  │    │ ─────────────────────  │
│ id  | orcamento_id | name │    │ id | tab_id | ...      │
│ T1  | 123         | Sh1   │←──┤ 1  | T1     | ...       │
│ T2  | 123         | Sh2   │   │ 2  | T1     | ...       │
└───────────────────────────┘   │ 3  | T2     | ...       │
                                 └────────────────────────┘
```

Data is automatically migrated and relationships preserved!

## Summary

✅ **File Analysis**: Now reads from storage → Reliable
✅ **Title/Subtitle**: Swapped → Better UX  
✅ **Tabs**: Stored in database → Queryable & Persistent
✅ **Relationships**: Correct hierarchy → Data Integrity

All issues from the problem statement are fixed! 🎉
