# Code Flow Diagram: Article-Based View

## Analysis Flow (Simplified)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER UPLOADS FILE                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              handleAnalyze() Function                       │
│                                                             │
│  Before:                                                    │
│  ├─ Check treatAsSingleSheet                                │
│  ├─ Check articleBasedView                                  │
│  └─ Pass both to analyzeMutation                            │
│                                                             │
│  After:                                                     │
│  └─ Call analyzeMutation (no parameters needed)             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│            analyzeMutation Function                         │
│                                                             │
│  Before:                                                    │
│  ├─ Receive treatAsSingleSheet parameter                    │
│  ├─ Receive articleBasedView parameter                      │
│  ├─ Conditional logic based on parameters                   │
│  └─ Different behavior for each combination                 │
│                                                             │
│  After:                                                     │
│  ├─ Set articleBasedView = true (hardcoded)                 │
│  └─ Single, consistent behavior                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               Sheet Detection Logic                         │
│                                                             │
│  Before:                                                    │
│  ├─ If articleBasedView OR treatAsSingleSheet:              │
│  │   └─ hasMultipleSheets = false                           │
│  └─ Else: hasMultipleSheets = (sheets > 1)                  │
│                                                             │
│  After:                                                     │
│  └─ hasMultipleSheets = false (always)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Tab Creation                                   │
│                                                             │
│  Always creates 3 default tabs:                             │
│  ├─ Principal                                               │
│  ├─ Arquitetura                                             │
│  └─ Instalações Especiais                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           Article & Content Processing                      │
│                                                             │
│  Always performs:                                           │
│  ├─ Detect chapters (ARTIGO = pure number)                  │
│  ├─ Detect articles (ARTIGO = number.number)                │
│  ├─ Capture text rows                                       │
│  ├─ Capture item rows                                       │
│  └─ Store in sessionStorage                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    DISPLAY                                  │
│                                                             │
│  Before: 3 Possible Views                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ IF (!isArticleBasedViewActive && multiTab)         │    │
│  │   → Standard Multi-Tab View (279 lines)            │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ IF (!isArticleBasedViewActive && singleTab)        │    │
│  │   → Standard Single-Sheet View (270 lines)         │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ IF (isArticleBasedViewActive)                      │    │
│  │   → Article-Based View                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  After: 1 View Only                                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ IF (isArticleBasedViewActive)                      │    │
│  │   → Article-Based View (always true)               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## State Management Comparison

### Before
```typescript
// State Variables
const [treatAsSingleSheet, setTreatAsSingleSheet] = useState(false);
const [articleBasedView, setArticleBasedView] = useState(false);

// UI Toggles
<Switch checked={treatAsSingleSheet} onCheckedChange={setTreatAsSingleSheet} />
<Switch checked={articleBasedView} onCheckedChange={setArticleBasedView} />

// Mutation Call
analyzeMutation.mutate({ 
  fileId: currentFile.id, 
  treatAsSingleSheet, 
  articleBasedView 
});
```

### After
```typescript
// No State Variables Needed

// No UI Toggles

// Mutation Call (Simplified)
analyzeMutation.mutate({ fileId: currentFile.id });

// Inside Mutation
const articleBasedView = true; // Hardcoded
```

## View Rendering Logic

### Before (Complex Conditional)
```
IF (isAnalyzed && tabs.length > 1 && !isArticleBasedViewActive)
  → Render Standard Multi-Tab View [279 lines]

ELSE IF (isAnalyzed && tabs.length <= 1 && !isArticleBasedViewActive)
  → Render Standard Single-Sheet View [270 lines]

ELSE IF (isAnalyzed && isArticleBasedViewActive)
  → Render Article-Based View
```

### After (Simple Conditional)
```
IF (isAnalyzed && isArticleBasedViewActive)
  → Render Article-Based View (only option)
```

## Data Flow

```
Excel File
    │
    ├─→ Parse Workbook
    │       │
    │       ├─→ Sheet 1 ──┐
    │       ├─→ Sheet 2 ──┼─→ Process ALL Sheets
    │       └─→ Sheet 3 ──┘
    │
    ├─→ Create 3 Tabs (always)
    │       │
    │       ├─→ Principal
    │       ├─→ Arquitetura
    │       └─→ Instalações Especiais
    │
    ├─→ Detect Chapters & Articles
    │       │
    │       ├─→ Chapter: "1"
    │       ├─→ Article: "1.1"
    │       ├─→ Article: "1.2"
    │       ├─→ Chapter: "2"
    │       └─→ Article: "2.1"
    │
    ├─→ Capture Content
    │       │
    │       ├─→ Text Rows → Article Content
    │       └─→ Item Rows → Article Content
    │
    ├─→ Store in sessionStorage
    │
    └─→ Display Article-Based View
            │
            ├─→ Tab Navigation
            ├─→ Chapter Headers
            ├─→ Articles (Inline)
            ├─→ Content (Visible)
            └─→ Sheet Separators (if multi-sheet)
```

## Component Hierarchy (After Changes)

```
MapaQuantidades
│
├─── File Upload Section
│    └─── [Analyze Button] (No toggles)
│
└─── Display Section
     └─── IF (isArticleBasedViewActive)
          └─── Article-Based View
               │
               ├─── Tabs Component
               │    ├─── Principal Tab
               │    ├─── Arquitetura Tab
               │    └─── Instalações Especiais Tab
               │
               └─── For Each Tab
                    └─── For Each Sheet
                         ├─── Sheet Separator (collapsible)
                         └─── For Each Chapter
                              ├─── Chapter Header
                              └─── For Each Article
                                   ├─── Article Header
                                   └─── Article Content (inline)
                                        ├─── Text Paragraphs
                                        └─── Item Tables
```

## Execution Path Summary

| Step | Before | After |
|------|--------|-------|
| 1. Upload | File uploaded | File uploaded |
| 2. UI | Show 2 toggles | Show analyze button only |
| 3. User Action | Set toggles → Click Analyze | Click Analyze |
| 4. Mutation | Receive 2 parameters | Receive 0 parameters |
| 5. Logic | Conditional (3 paths) | Single path |
| 6. Processing | Variable behavior | Consistent behavior |
| 7. Storage | Store data | Store data |
| 8. Rendering | Choose from 3 views | Render article view |
| 9. Display | Variable layout | Consistent layout |

**Result:** 9 steps remain, but complexity reduced from 3 paths to 1 path.
