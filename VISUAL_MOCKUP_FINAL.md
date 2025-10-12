# Visual Mockup: Article-Based View Features

## Feature Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                     MAPA DE QUANTIDADES                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📄 file.xlsx                                    Uploaded           │
│                                                                     │
│  ☐ Treat as single sheet  ☑ Article-based view  [Analyze]         │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
                                │
                                │ User clicks Analyze
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                   Select Sheets to Analyze                    [×]  │
├────────────────────────────────────────────────────────────────────┤
│  Choose which sheets from the Excel file should be analyzed.       │
│  All sheets are selected by default.                               │
│                                                                     │
│  ☑ Select All                                                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ☑  📄 Principal                                              │ │
│  │ ☑  📄 Arquitetura                                            │ │
│  │ ☑  📄 Instalações Especiais                                  │ │
│  │ ☐  📄 Medições Extras                                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│                          [Cancel]  [Analyze Selected Sheets (3)]   │
└────────────────────────────────────────────────────────────────────┘
                                │
                                │ User clicks Analyze
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                     RESULTS VIEW                                    │
├────────────────────────────────────────────────────────────────────┤
│  [Principal] [Arquitetura] [Instalações Especiais]                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ▶ 📄 Principal                              [3 chapters] ⯈  │ │ ◄ COLLAPSED
│  └──────────────────────────────────────────────────────────────┘ │   (default)
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ▶ 📄 Arquitetura                            [5 chapters] ⯈  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ▶ 📄 Instalações Especiais                  [2 chapters] ⯈  │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                                │
                                │ User clicks on Principal separator
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ▼ 📄 Principal                              [3 chapters] ⯆  │ │ ◄ EXPANDED
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐│ │
│  │  │ ▼ 1. Trabalhos Preparatórios        [Move to tab]      ││ │
│  │  ├─────────────────────────────────────────────────────────┤│ │
│  │  │                                                          ││ │
│  │  │  ┌──────────────────────────────────────────────────┐  ││ │
│  │  │  │ ▼ 1.1 - Limpeza do Terreno                       │  ││ │
│  │  │  ├──────────────────────────────────────────────────┤  ││ │
│  │  │  │ Text content here...                             │  ││ │
│  │  │  │                                                   │  ││ │
│  │  │  │ ╔═══════════════════════════════════════════════╗│  ││ │
│  │  │  │ ║ ARTIGO │ DESCRIÇÃO │  UN  │  QT  │ OBS       ║│  ││ │ ◄ Enhanced
│  │  │  │ ╠═══════════════════════════════════════════════╣│  ││ │   Table
│  │  │  │ ║ 1.1.1  │ Item 1    │┌───┐│ 10.00│ Notes     ║│  ││ │
│  │  │  │ ║        │           ││m2 ││      │           ║│  ││ │
│  │  │  │ ╠═══════════════════════════════════════════════╣│  ││ │
│  │  │  │ ║ 1.1.2  │ Item 2    │┌───┐│  5.00│ -         ║│  ││ │
│  │  │  │ ║        │           ││un ││      │           ║│  ││ │
│  │  │  │ ╚═══════════════════════════════════════════════╝│  ││ │
│  │  │  └──────────────────────────────────────────────────┘  ││ │
│  │  │                                                          ││ │
│  │  │  ┌──────────────────────────────────────────────────┐  ││ │
│  │  │  │ ▼ 1.2 - Remoção de Entulhos                      │  ││ │
│  │  │  ├──────────────────────────────────────────────────┤  ││ │
│  │  │  │ ...                                               │  ││ │
│  │  │  └──────────────────────────────────────────────────┘  ││ │
│  │  └─────────────────────────────────────────────────────────┘│ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐│ │
│  │  │ ▶ 2. Fundações                          [Move to tab]   ││ │
│  │  └─────────────────────────────────────────────────────────┘│ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐│ │
│  │  │ ▶ 3. Estrutura                          [Move to tab]   ││ │
│  │  └─────────────────────────────────────────────────────────┘│ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ▶ 📄 Arquitetura                            [5 chapters] ⯈  │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## Detailed Table Enhancement

### Before (Old Design)
```
┌─────────────────────────────────────────────────────────┐
│ ARTIGO │ DESCRIÇÃO      │ UN │ QT    │ OBSERVAÇÕES     │
├────────┼────────────────┼────┼───────┼─────────────────┤
│ 1.1.1  │ Item           │ m2 │ 10.00 │ Notes           │
│ 1.1.2  │ Another item   │ un │  5.00 │ -               │
│ 1.1.3  │ Third item     │ kg │ 20.00 │ More notes      │
└─────────────────────────────────────────────────────────┘
```
Problems:
- ❌ No visual hierarchy
- ❌ Hard to scan rows
- ❌ Plain, boring appearance
- ❌ Units not highlighted
- ❌ No interactive feedback

### After (New Design)
```
╔═════════════════════════════════════════════════════════════════╗
║ ┌─────────────────────────────────────────────────────────────┐ ║
║ │ ARTIGO │ DESCRIÇÃO        │  UN  │   QT   │ OBSERVAÇÕES    │ ║ ◄ Blue gradient
║ ╞════════╪══════════════════╪══════╪════════╪════════════════╡ ║   header
║ │ 1.1.1  │ Item             │┌────┐│ 10.00  │ Notes          │ ║ ◄ White row
║ │        │                  ││ m2 ││        │                │ ║
║ ╞════════╪══════════════════╪└────┘╪════════╪════════════════╡ ║
║ │ 1.1.2  │ Another item     │┌────┐│  5.00  │ -              │ ║ ◄ Gray row
║ │        │                  ││ un ││        │                │ ║   (alternating)
║ ╞════════╪══════════════════╪└────┘╪════════╪════════════════╡ ║
║ │ 1.1.3  │ Third item       │┌────┐│ 20.00  │ More notes     │ ║ ◄ White row
║ │        │                  ││ kg ││        │                │ ║
║ └─────────────────────────────────────────────────────────────┘ ║
╚═════════════════════════════════════════════════════════════════╝
    ▲                              ▲       ▲
    │                              │       │
    Rounded                     Badge   Bold
    shadow                      for UN   QT
```
Benefits:
- ✅ Clear visual hierarchy
- ✅ Easy to scan rows
- ✅ Modern, professional look
- ✅ Units highlighted with badges
- ✅ Hover effects on rows

## Interactive States

### Sheet Separator States

**1. Collapsed (Default)**
```
┌────────────────────────────────────────────────────────┐
│ ▶ 📄 Principal                          [3 chapters] ⯈ │
└────────────────────────────────────────────────────────┘
  ▲ Chevron points right
  ▲ No content visible
```

**2. Hover on Collapsed**
```
┌────────────────────────────────────────────────────────┐
│ ▶ 📄 Principal                          [3 chapters] ⯈ │ ◄ Lighter blue
└────────────────────────────────────────────────────────┘   background
  ▲ Cursor pointer
```

**3. Expanding (Animated)**
```
┌────────────────────────────────────────────────────────┐
│ ▷ 📄 Principal                          [3 chapters] ⯈ │ ◄ Chevron
└────────────────────────────────────────────────────────┘   rotating
  ▲ 45° rotation
  ▲ Content starting to appear
```

**4. Expanded**
```
┌────────────────────────────────────────────────────────┐
│ ▼ 📄 Principal                          [3 chapters] ⯆ │
├────────────────────────────────────────────────────────┤
│                                                         │
│  [Chapter content visible]                             │
│                                                         │
└────────────────────────────────────────────────────────┘
  ▲ Chevron points down
  ▲ All content visible
```

### Table Row States

**1. Normal Row (Even)**
```
║ 1.1.2  │ Another item     │┌────┐│  5.00  │ -              ║ ◄ White background
║        │                  ││ un ││        │                ║
```

**2. Alternating Row (Odd)**
```
║ 1.1.3  │ Third item       │┌────┐│ 20.00  │ More notes     ║ ◄ Gray-50 background
║        │                  ││ kg ││        │                ║
```

**3. Hover State**
```
╞════════╪══════════════════╪══════╪════════╪════════════════╡
║ 1.1.2  │ Another item     │┌────┐│  5.00  │ -              ║ ◄ Light blue
║        │                  ││ un ││        │                ║   background
╞════════╪══════════════════╪══════╪════════╪════════════════╡
  ▲ Mouse hovering over this row
```

## Color Legend

### Sheet Separators
```
[Collapsed]   Background: Blue-50 (light) / Blue-950 (dark)
              Border: Blue-500
              Text: Blue-900 (light) / Blue-100 (dark)

[Hover]       Background: Blue-100 (light) / Blue-900 (dark)

[Badge]       Background: Blue-200 (light) / Blue-800 (dark)
              Text: Blue-900 (light) / Blue-100 (dark)
```

### Tables
```
[Header]      Background: Blue-50→100 gradient (light)
                          Blue-950→900 gradient (dark)
              Text: Blue-900 (light) / Blue-100 (dark)

[Even Rows]   Background: White (light) / Gray-950 (dark)

[Odd Rows]    Background: Gray-50 (light) / Gray-900 (dark)

[Hover]       Background: Blue-50 (light) / Blue-950 (dark)

[Badge/UN]    Border: Gray-200 (light) / Gray-700 (dark)
              Background: Transparent
              Font: Monospace
```

## Responsive Behavior

### Mobile View (< 768px)

**Sheet Selection Dialog**
```
┌────────────────┐
│ Select Sheets  │
├────────────────┤
│ ☑ Select All   │
│                │
│ ☑ 📄 Sheet 1   │
│ ☑ 📄 Sheet 2   │
│ ☐ 📄 Sheet 3   │
│                │
│    [Cancel]    │
│  [Analyze (2)] │
└────────────────┘
  ▲ Full width
  ▲ Stacked
```

**Sheet Separators**
```
┌─────────────────────┐
│ ▶ 📄 Sheet 1    [3] │
└─────────────────────┘
  ▲ Condensed view
  ▲ Number only
```

**Tables**
```
┌──────────────────┐
│ ARTIGO │ DESC... │
├────────┼─────────┤
│ 1.1.1  │ Item    │
│ m2     │ 10.00   │
├────────┼─────────┤
│ 1.1.2  │ Item 2  │
│ un     │  5.00   │
└──────────────────┘
  ▲ Compact layout
  ▲ Stacked data
```

### Tablet View (768px - 1024px)

**Normal layout but narrower columns**
```
╔══════════════════════════════════════════════════╗
║ ARTIGO │ DESCRIÇÃO  │  UN  │  QT  │ OBS        ║
╠══════════════════════════════════════════════════╣
║ 1.1.1  │ Item       │ m2   │10.00 │ Notes      ║
╚══════════════════════════════════════════════════╝
```

## Keyboard Navigation

```
Tab         → Move to next checkbox/button
Shift+Tab   → Move to previous checkbox/button
Space       → Toggle checkbox
Enter       → Activate button
Escape      → Close dialog
```

## Accessibility

```
Screen Reader Announces:
- "Sheet selection dialog"
- "Select All checkbox, checked"
- "Principal sheet checkbox, checked"
- "Analyze Selected Sheets button, 3 sheets selected"
- "Principal sheet separator, collapsed, 3 chapters"
- "Table with 3 rows and 5 columns"
```

## Summary

This visual mockup demonstrates:
1. ✅ Sheet selection dialog flow
2. ✅ Collapsible sheet separators (default collapsed)
3. ✅ Enhanced table UI with gradients and badges
4. ✅ All interactive states
5. ✅ Responsive layouts
6. ✅ Accessibility features

All features work together to provide a professional, user-friendly experience for analyzing multi-sheet Excel files.
