# Visual Guide: Sheet Selection and UI Improvements

## Feature 1: Sheet Selection Dialog

### Flow Diagram
```
┌──────────────────────────────────────────────────────┐
│  User clicks "Analyze" with Article-based view ON    │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│  System reads Excel file to get sheet names          │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│           Sheet Selection Dialog Appears             │
│  ┌────────────────────────────────────────────────┐  │
│  │  Select Sheets to Analyze                      │  │
│  │                                                 │  │
│  │  ☑ Select All                                  │  │
│  │                                                 │  │
│  │  ☑ 📄 Sheet 1                                  │  │
│  │  ☑ 📄 Sheet 2                                  │  │
│  │  ☑ 📄 Sheet 3                                  │  │
│  │                                                 │  │
│  │  [Cancel]  [Analyze Selected Sheets (3)]       │  │
│  └────────────────────────────────────────────────┘  │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│  Analysis processes only selected sheets             │
└──────────────────────────────────────────────────────┘
```

### Dialog UI Elements

```
╔═══════════════════════════════════════════════════════╗
║  Select Sheets to Analyze                        [×]  ║
╟───────────────────────────────────────────────────────╢
║  Choose which sheets from the Excel file should be    ║
║  analyzed. All sheets are selected by default.        ║
║                                                        ║
║  ┌──────────────────────────────────────────────┐    ║
║  │  ☑ Select All                                │    ║
║  └──────────────────────────────────────────────┘    ║
║                                                        ║
║  ┌──────────────────────────────────────────────┐    ║
║  │ ☑  📄 Principal                              │ ◄── Hover effect
║  │ ☑  📄 Arquitetura                            │
║  │ ☐  📄 Instalações Especiais                  │ ◄── Unchecked
║  │ ☑  📄 Medições                               │
║  │ ☑  📄 Trabalhos Adicionais                   │
║  └──────────────────────────────────────────────┘    ║
║       ▲ Scrollable if many sheets                    ║
║                                                        ║
║                    [Cancel]  [Analyze Selected (4)]   ║
║                               ▲                       ║
║                               │                       ║
║                          Button disabled if           ║
║                          no sheets selected           ║
╚═══════════════════════════════════════════════════════╝
```

## Feature 2: Collapsible Sheet Separators

### Collapsed State (Default)

```
┌─────────────────────────────────────────────────────────────┐
│ ▶ 📄 Principal                                [3 chapters]  │ ◄── Click to expand
└─────────────────────────────────────────────────────────────┘
    ▲ Blue gradient background with left border accent
    ▲ Chevron points RIGHT when collapsed

┌─────────────────────────────────────────────────────────────┐
│ ▶ 📄 Arquitetura                              [5 chapters]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ▶ 📄 Instalações Especiais                    [2 chapters]  │
└─────────────────────────────────────────────────────────────┘
```

### Expanded State

```
┌─────────────────────────────────────────────────────────────┐
│ ▼ 📄 Principal                                [3 chapters]  │ ◄── Click to collapse
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌───────────────────────────────────────────────────┐    │
│   │ ▼ 1. Trabalhos Preparatórios  [Move to tab]      │    │
│   ├───────────────────────────────────────────────────┤    │
│   │   1.1 - Limpeza do Terreno                        │    │
│   │   1.2 - Remoção de Entulhos                       │    │
│   └───────────────────────────────────────────────────┘    │
│                                                              │
│   ┌───────────────────────────────────────────────────┐    │
│   │ ▼ 2. Fundações                [Move to tab]      │    │
│   ├───────────────────────────────────────────────────┤    │
│   │   2.1 - Escavação                                  │    │
│   │   2.2 - Betonagem                                  │    │
│   └───────────────────────────────────────────────────┘    │
│                                                              │
│   ┌───────────────────────────────────────────────────┐    │
│   │ ▼ 3. Estrutura                [Move to tab]      │    │
│   ├───────────────────────────────────────────────────┤    │
│   │   3.1 - Pilares                                    │    │
│   │   3.2 - Vigas                                      │    │
│   └───────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
    ▲ Chevron points DOWN when expanded
    ▲ Content area visible with chapters
```

### Interaction States

**Hover Effect**:
```
┌─────────────────────────────────────────────────────────────┐
│ ▶ 📄 Principal                                [3 chapters]  │
└─────────────────────────────────────────────────────────────┘
        │
        └─► Hover changes background to lighter blue
```

**Transition**:
```
Collapsed: ▶  (chevron rotation: 0deg)
           │
           │  User clicks
           │
           ▼
Expanding: ▷  (chevron rotation: 45deg)  ◄── Smooth CSS transition
           │
           ▼
Expanded:  ▼  (chevron rotation: 90deg)
```

## Feature 3: Enhanced Table UI/UX

### Before (Old Design)

```
┌────────────────────────────────────────────────────────────┐
│ ARTIGO │ DESCRIÇÃO          │ UN │ QT    │ OBSERVAÇÕES     │
├────────┼────────────────────┼────┼───────┼─────────────────┤
│ 1.1    │ Item description   │ m2 │ 10.00 │ -               │
│ 1.1.1  │ Sub-item           │ un │ 5.00  │ Some notes      │
│ 1.1.2  │ Another sub-item   │ kg │ 20.00 │ -               │
└────────────────────────────────────────────────────────────┘
```
- Plain borders
- No visual hierarchy
- Minimal styling
- No hover effects
- Hard to scan

### After (New Design)

```
╔═══════════════════════════════════════════════════════════════╗
║ ┌───────────────────────────────────────────────────────────┐ ║
║ │ ARTIGO │ DESCRIÇÃO          │  UN  │   QT   │ OBSERVAÇÕES │ ║ ◄── Blue gradient
║ │────────┼────────────────────┼──────┼────────┼─────────────│ ║     header
║ │ 1.1    │ Item description   │┌───┐│ 10.00  │ -           │ ║ ◄── White row
║ │        │                    ││m2 ││        │             │ ║
║ │────────┼────────────────────┼└───┘┼────────┼─────────────│ ║
║ │ 1.1.1  │ Sub-item           │┌───┐│  5.00  │ Some notes  │ ║ ◄── Gray-50 row
║ │        │                    ││un ││        │             │ ║     (alternating)
║ │────────┼────────────────────┼└───┘┼────────┼─────────────│ ║
║ │ 1.1.2  │ Another sub-item   │┌───┐│ 20.00  │ -           │ ║ ◄── White row
║ │        │                    ││kg ││        │             │ ║
║ └───────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════╝
    ▲                              ▲       ▲
    │                              │       │
    Rounded corners           Badge   Bold quantity
    with shadow               for unit
```

### Hover State

```
╔═══════════════════════════════════════════════════════════════╗
║ │ 1.1.1  │ Sub-item           │┌───┐│  5.00  │ Some notes  │ ║
║ ╞════════╪════════════════════╪└───┘╪════════╪═════════════╡ ║ ◄── Light blue
║ │ 1.1.2  │ Another sub-item   │┌───┐│ 20.00  │ -           │ ║     background
║ ╞════════╪════════════════════╪└───┘╪════════╪═════════════╡ ║     on hover
║ │ 1.1.3  │ Third item         │┌───┐│ 15.00  │ Notes       │ ║
╚═══════════════════════════════════════════════════════════════╝
              ▲ Mouse cursor hovering over this row
```

### Column Styling Details

**ARTIGO Column**:
- Font: Medium weight
- Purpose: Clear identification

**DESCRIÇÃO Column**:
- Font: Regular weight
- Purpose: Readable descriptions

**UN Column**:
- Badge with outline variant
- Centered alignment
- Monospace font
- Purpose: Visual distinction

**QT Column**:
- Font: Semibold
- Right-aligned
- 2 decimal places
- Purpose: Emphasis on quantities

**OBSERVAÇÕES Column**:
- Font: Regular with muted color
- Shows "-" when empty
- Purpose: De-emphasized supplementary info

## Color Scheme

### Sheet Separator Colors
- **Background**: Blue-50 (light) / Blue-950 (dark)
- **Border**: Blue-500 (accent)
- **Text**: Blue-900 (light) / Blue-100 (dark)
- **Hover**: Blue-100 (light) / Blue-900 (dark)

### Table Colors
- **Header**: Blue gradient (50-100 in light, 950-900 in dark)
- **Header Text**: Blue-900 (light) / Blue-100 (dark)
- **Even Rows**: White / Gray-950
- **Odd Rows**: Gray-50 / Gray-900
- **Hover**: Blue-50 (light) / Blue-950 (dark)

## Responsive Behavior

### Dialog on Mobile
```
┌────────────────┐
│ Select Sheets  │
├────────────────┤
│ ☑ Select All   │
│                │
│ ☑ 📄 Sheet 1   │
│ ☑ 📄 Sheet 2   │
│ ☐ 📄 Sheet 3   │
│ ☑ 📄 Sheet 4   │
│                │
│ [Cancel]       │
│ [Analyze (3)]  │
└────────────────┘
   ▲ Full width
   ▲ Vertical layout
```

### Table on Mobile
```
┌─────────────────┐
│ ARTIGO │ DESC.. │
├────────┼────────┤
│ 1.1    │ Item   │
│ UN: m2 │ QT: 10 │
├────────┼────────┤
│ 1.1.1  │ Sub... │
│ UN: un │ QT: 5  │
└─────────────────┘
   ▲ Stacked layout
   ▲ Condensed view
```

## Animation Timings

- **Chevron rotation**: 200ms ease
- **Sheet expand/collapse**: Default Collapsible transition
- **Table row hover**: Transition-colors (instant)
- **Dialog fade**: Default Dialog animation

## Accessibility Features

1. **Keyboard Navigation**: 
   - Tab through checkboxes
   - Enter/Space to toggle
   - Escape to close dialog

2. **Screen Readers**:
   - Labels for all checkboxes
   - ARIA labels for icons
   - Semantic HTML structure

3. **Focus Indicators**:
   - Clear focus rings
   - Visible keyboard navigation

4. **Contrast Ratios**:
   - WCAG AA compliant
   - Works in light and dark modes
