# Visual Example: Sheet Separators in Normal View

## Before This Change

### Scenario: Multi-sheet Excel file with "Treat as single sheet" enabled

```
┌─────────────────────────────────────────────────┐
│ Principal │ Arquitetura │ Instalações Especiais │
└─────────────────────────────────────────────────┘

[Principal Tab - No visual separation]

┌────────────────────────────────────────┐
│ ▼ 1. Trabalhos Preparatórios           │
└────────────────────────────────────────┘
  Items from Sheet 1...

┌────────────────────────────────────────┐
│ ▼ 2. Demolições                        │
└────────────────────────────────────────┘
  Items from Sheet 1...

┌────────────────────────────────────────┐
│ ▼ 1. Fundações                         │  ← Confusing! Same chapter number
└────────────────────────────────────────┘
  Items from Sheet 2...

┌────────────────────────────────────────┐
│ ▼ 2. Estruturas                        │  ← Which sheet is this from?
└────────────────────────────────────────┘
  Items from Sheet 2...
```

**Problem**: Users couldn't tell which chapters came from which Excel sheet.

---

## After This Change

### Same Scenario: Multi-sheet Excel file with "Treat as single sheet" enabled

```
┌─────────────────────────────────────────────────┐
│ Principal │ Arquitetura │ Instalações Especiais │
└─────────────────────────────────────────────────┘

[Principal Tab - WITH sheet separators]

┌────────────────────────────────────────────────┐
│ 📄 Sheet 1 - Trabalhos Preliminares           │ ← NEW: Sheet separator
└────────────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ▼ 1. Trabalhos Preparatórios           │
└────────────────────────────────────────┘
  Items from Sheet 1...

┌────────────────────────────────────────┐
│ ▼ 2. Demolições                        │
└────────────────────────────────────────┘
  Items from Sheet 1...

┌────────────────────────────────────────────────┐
│ 📄 Sheet 2 - Estruturas                       │ ← NEW: Sheet separator
└────────────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ▼ 1. Fundações                         │  ← Clear! This is from Sheet 2
└────────────────────────────────────────┘
  Items from Sheet 2...

┌────────────────────────────────────────┐
│ ▼ 2. Estruturas                        │  ← Easy to see this is Sheet 2
└────────────────────────────────────────┘
  Items from Sheet 2...
```

**Solution**: Blue-themed separators clearly indicate which content came from which sheet.

---

## Color Scheme (Light Mode)

```
┌─────────────────────────────────────────────────────┐
│ 📄 Sheet 1                                          │
│ Background: #EFF6FF (blue-50)                       │
│ Left Border: #3B82F6 (blue-500, 4px)               │
│ Text: #1E3A8A (blue-900)                           │
└─────────────────────────────────────────────────────┘
```

## Color Scheme (Dark Mode)

```
┌─────────────────────────────────────────────────────┐
│ 📄 Sheet 1                                          │
│ Background: #172554 (blue-950)                      │
│ Left Border: #3B82F6 (blue-500, 4px)               │
│ Text: #DBEAFE (blue-100)                           │
└─────────────────────────────────────────────────────┘
```

---

## Real-World Example

### Multi-sheet Construction Budget

**Excel File Structure:**
- Sheet 1: "Trabalhos Preliminares" (Preliminary Work)
- Sheet 2: "Estruturas" (Structures)
- Sheet 3: "Acabamentos" (Finishes)

### View with Separators:

```
┌─────────────────────────────────────────────────┐
│ Principal │ Arquitetura │ Instalações Especiais │
└─────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 📄 Trabalhos Preliminares                       ┃
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▼ 1. Implantação de Obra
  ├─ 1.1 | Placa de obra          | UN | 1.00
  ├─ 1.2 | Tapume                 | m  | 50.00
  └─ 1.3 | Barracão               | m² | 20.00

▼ 2. Demolições
  ├─ 2.1 | Demo alvenaria         | m² | 10.00
  └─ 2.2 | Demo piso              | m² | 15.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 📄 Estruturas                                   ┃
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▼ 1. Fundações
  ├─ 1.1 | Estacas                | m  | 100.00
  ├─ 1.2 | Blocos                 | m³ | 5.00
  └─ 1.3 | Vigas baldrame         | m  | 80.00

▼ 2. Superestrutura
  ├─ 2.1 | Pilares                | m³ | 10.00
  ├─ 2.2 | Vigas                  | m³ | 8.00
  └─ 2.3 | Lajes                  | m² | 200.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 📄 Acabamentos                                  ┃
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▼ 1. Revestimentos
  ├─ 1.1 | Reboco                 | m² | 500.00
  ├─ 1.2 | Pintura                | m² | 500.00
  └─ 1.3 | Azulejo                | m² | 80.00

▼ 2. Pisos
  ├─ 2.1 | Contrapiso             | m² | 200.00
  └─ 2.2 | Cerâmica               | m² | 200.00
```

---

## Comparison with Article-Based View

Both views now have consistent sheet separator behavior:

### Normal View (After This Change)
- ✅ Sheet separators when multiple sheets in same tab
- ✅ Blue theme, left border, icon
- ✅ Respects original Excel sheet order
- ✅ Only shows when `chaptersBySheet.size > 1`

### Article-Based View (Already Existed)
- ✅ Sheet separators when multiple sheets in Principal tab
- ✅ Blue theme, left border, icon
- ✅ Respects original Excel sheet order
- ✅ Only shows when `chaptersBySheet.size > 1`

---

## Responsive Design

### Desktop View
```
┌──────────────────────────────────────────────────────────────┐
│ 📄 Sheet 1 - Trabalhos Preliminares                         │
└──────────────────────────────────────────────────────────────┘
```

### Tablet View
```
┌─────────────────────────────────────────────────┐
│ 📄 Sheet 1 - Trabalhos Preliminares            │
└─────────────────────────────────────────────────┘
```

### Mobile View
```
┌────────────────────────────────────┐
│ 📄 Sheet 1 - Trabalhos...          │
└────────────────────────────────────┘
```

Text naturally wraps and truncates based on screen width.

---

## Edge Cases

### 1. Single Sheet in Tab
**Result**: No separator displayed (not needed)

### 2. No Sheet Name (Legacy Data)
**Result**: Grouped under "Unknown" sheet, separator shows if multiple "Unknown" groups

### 3. Empty Sheet
**Result**: No separator for sheets with no chapters

### 4. Special Characters in Sheet Name
```
┌────────────────────────────────────────────────┐
│ 📄 Orçamento 2024/2025 - Fase #1               │
└────────────────────────────────────────────────┘
```
**Result**: Renders correctly with special characters

---

## User Experience Benefits

✅ **Clear Organization**: Easy to identify content source
✅ **Visual Hierarchy**: Separators create logical sections
✅ **Consistency**: Same style as article-based view
✅ **Minimal**: Only appears when needed (multiple sheets)
✅ **Accessible**: High contrast colors for light/dark modes
✅ **Professional**: Clean, modern design

---

## Testing Checklist

- [ ] Upload multi-sheet Excel (2+ sheets)
- [ ] Enable "Treat as single sheet"
- [ ] Verify separators appear in Principal tab
- [ ] Verify separator count matches sheet count
- [ ] Verify sheet names are correct
- [ ] Verify chapter order within each sheet
- [ ] Test with single-sheet file (no separators expected)
- [ ] Test dark mode colors
- [ ] Test on mobile/tablet devices
- [ ] Test with legacy data (no sheet_name)
