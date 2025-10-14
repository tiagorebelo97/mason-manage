# Visual Guide: Article-Based View Tab Mapping Fix

## Before the Fix

### Problem: Creating Tabs from Sheet Names
When using article-based view with a multi-sheet Excel file:

**Excel File:**
```
📊 MyBudget.xlsx
├── Sheet1 (Principal data)
├── Sheet2 (Arquitetura data)  
└── Sheet3 (Instalações data)
```

**Result (INCORRECT):**
```
Tabs Created:
┌─────────┬─────────┬─────────┐
│ Sheet1  │ Sheet2  │ Sheet3  │
└─────────┴─────────┴─────────┘

All chapters appeared in all tabs (duplicated)
```

---

## After the Fix

### Solution: Use 3 Default Tabs with Intelligent Mapping

**Excel File:**
```
📊 MyBudget.xlsx
├── Sheet1 (Principal data)
├── Arquitetura (Architecture data)  
└── Instalações Especiais (Special installations data)
```

**Result (CORRECT):**
```
Tabs Created:
┌──────────────┬──────────────┬───────────────────────┐
│  Principal   │ Arquitetura  │ Instalações Especiais │
└──────────────┴──────────────┴───────────────────────┘

Sheet Mapping:
• "Sheet1" → Principal tab
• "Arquitetura" → Arquitetura tab
• "Instalações Especiais" → Instalações Especiais tab

Chapters appear only in their corresponding tab (no duplication)
```

---

## Mapping Rules

### Sheet Name → Tab Mapping

```
Sheet Name Contains:           Maps To:
─────────────────────────────────────────────────────
"arquitetura"              →   Arquitetura
"instalacoes"              →   Instalações Especiais
"instalações"              →   Instalações Especiais
"especiais"                →   Instalações Especiais
Anything else              →   Principal (default)
```

### Examples

| Excel Sheet Name          | Mapped to Tab          |
|--------------------------|------------------------|
| Sheet1                   | Principal              |
| Sheet2                   | Principal              |
| Principal                | Principal              |
| Arquitetura              | Arquitetura            |
| ARQUITETURA              | Arquitetura            |
| arquitetura              | Arquitetura            |
| Instalações Especiais    | Instalações Especiais  |
| Instalacoes Especiais    | Instalações Especiais  |
| INSTALAÇÕES ESPECIAIS    | Instalações Especiais  |
| Especiais                | Instalações Especiais  |

---

## Visual Comparison

### Scenario: Excel with 3 sheets named "Principal", "Arquitetura", "Instalações"

#### BEFORE (Tabs created from sheet names):
```
┌────────────┬──────────────┬──────────────┐
│ Principal  │ Arquitetura  │ Instalações  │
└────────────┴──────────────┴──────────────┘
     │              │              │
     │              │              │
  All chapters repeated in all tabs ❌
```

#### AFTER (3 default tabs with intelligent mapping):
```
┌────────────┬──────────────┬───────────────────────┐
│ Principal  │ Arquitetura  │ Instalações Especiais │
└────────────┴──────────────┴───────────────────────┘
     │              │                    │
     │              │                    │
  Chapters    Chapters            Chapters
  from        from                from
  "Principal" "Arquitetura"       "Instalações"
  sheet       sheet               sheet
     ✅              ✅                  ✅
```

---

## Code Changes Summary

### Change 1: Tab Creation Logic

```typescript
// BEFORE
const shouldCreateTabsFromSheets = articleBasedView || (!treatAsSingleSheet && workbook.SheetNames.length > 1);
// This created tabs from sheet names when articleBasedView = true ❌

// AFTER
const shouldCreateTabsFromSheets = !articleBasedView && (!treatAsSingleSheet && workbook.SheetNames.length > 1);
// This creates 3 default tabs when articleBasedView = true ✅
```

### Change 2: Sheet-to-Tab Mapping

```typescript
// BEFORE
if (articleBasedView || hasMultipleSheets) {
  insertedTabs.forEach(tab => {
    sheetNameToTabId.set(tab.name, tab.id);
  });
}
// This mapped sheet names to tab names directly, causing confusion ❌

// AFTER
if (articleBasedView) {
  // Intelligent mapping based on sheet name content
  workbook.SheetNames.forEach(sheetName => {
    const sheetNameLower = sheetName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    if (sheetNameLower.includes('arquitetura') && arquiteturaTab) {
      sheetNameToTabId.set(sheetName, arquiteturaTab.id);
    } else if (sheetNameLower.includes('instalacoes') || 
               sheetNameLower.includes('instalações') || 
               sheetNameLower.includes('especiais')) {
      sheetNameToTabId.set(sheetName, instalacoesTab.id);
    } else {
      sheetNameToTabId.set(sheetName, principalTab.id);
    }
  });
}
// This maps sheets intelligently to the 3 default tabs ✅
```

---

## Benefits

✅ **No More Duplication**: Chapters appear only in their corresponding tab  
✅ **Predictable Behavior**: Always creates 3 default tabs in article-based view  
✅ **Flexible Organization**: Users can organize Excel sheets by naming them appropriately  
✅ **Handles Accents**: Works with "instalações" and "instalacoes"  
✅ **Case Insensitive**: Works with any capitalization  
✅ **Backward Compatible**: Non-article-based view behavior unchanged  

---

## Testing Checklist

- [ ] Upload Excel with sheets "Principal", "Arquitetura", "Instalações Especiais"
- [ ] Enable article-based view
- [ ] Verify 3 tabs created (not one per sheet)
- [ ] Verify chapters from "Principal" sheet appear only in Principal tab
- [ ] Verify chapters from "Arquitetura" sheet appear only in Arquitetura tab
- [ ] Verify chapters from "Instalações Especiais" sheet appear only in Instalações Especiais tab
- [ ] No duplication of chapters across tabs
