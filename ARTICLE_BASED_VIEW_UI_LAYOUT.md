# Article-Based View UI Layout

## UI Changes Overview

### 1. New Toggle Control (Before Analysis)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Mapa de Quantidades                                          [Back] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ File: example.xlsx                                                  │
│                                                                      │
│ [Toggle] Treat as single sheet    [Toggle] Article-based view      │
│                                                                      │
│                                    [Analyze]  [Delete]              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Addition:**
- New toggle: "Article-based view" checkbox
- Appears alongside existing "Treat as single sheet" toggle
- Only visible before file is analyzed

### 2. Article-Based View Layout (After Analysis)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Mapa de Quantidades                                            [Back]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ [Sheet1] [Sheet2] [Sheet3]    ← Tabs (one per Excel sheet)                 │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 1. Trabalhos Preliminares                                               │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                          │ │
│ │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│ │  │    1.1      │  │    1.2      │  │    1.3      │  │    1.4      │  │ │
│ │  │             │  │             │  │             │  │             │  │ │
│ │  │ Limpeza do  │  │ Demolições  │  │ Terraplanag│  │ Drenagem    │  │ │
│ │  │ terreno     │  │             │  │ em         │  │             │  │ │
│ │  │             │  │             │  │             │  │             │  │ │
│ │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│ │     ↑ Article Pages (4 per row, clickable)                           │ │
│ │                                                                          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 2. Fundações                                                            │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                          │ │
│ │  ┌─────────────┐  ┌─────────────┐                                      │ │
│ │  │    2.1      │  │    2.2      │                                      │ │
│ │  │             │  │             │                                      │ │
│ │  │ Escavações  │  │ Fundações   │                                      │ │
│ │  │             │  │ diretas     │                                      │ │
│ │  │             │  │             │                                      │ │
│ │  └─────────────┘  └─────────────┘                                      │ │
│ │                                                                          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Tabs**: One tab per Excel sheet (tab names match sheet names)
- **Chapter Boxes**: Each chapter is a separate box with header
- **Article Page Grid**: Articles displayed as clickable boxes, 4 per row
- **Responsive**: Adjusts to 1-4 columns based on screen size

### 3. Article Detail Modal (When Article Page is Clicked)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1.1 - Limpeza do terreno                                            [X]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Limpeza geral do terreno incluindo remoção de vegetação e entulho.         │
│                                                                              │
│ O trabalho deverá ser executado conforme projeto anexo.                     │
│                                                                              │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ Artigo  │ Descrição              │ UN  │ QT     │ Obs. Empreiteiro  │  │
│ ├───────────────────────────────────────────────────────────────────────┤  │
│ │ 1.1.1   │ Remoção de entulho     │ m3  │ 50.00  │                   │  │
│ │ 1.1.2   │ Capina manual          │ m2  │ 100.00 │                   │  │
│ │ 1.1.3   │ Remoção de árvores     │ un  │ 5.00   │                   │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ Observações adicionais sobre os trabalhos de limpeza.                      │
│                                                                              │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ Artigo  │ Descrição              │ UN  │ QT     │ Obs. Empreiteiro  │  │
│ ├───────────────────────────────────────────────────────────────────────┤  │
│ │ 1.1.4   │ Transporte de entulho  │ m3  │ 50.00  │                   │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│                                                          [Scroll if needed ▼]│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Title Bar**: Shows article number and full title
- **Mixed Content**: 
  - Text rows displayed as paragraphs
  - Item rows displayed in formatted tables
- **Content Order**: Preserved exactly as in Excel
- **Scrollable**: Modal scrolls for long content
- **Close Options**: X button or click outside

### 4. Comparison: Standard View vs Article-Based View

#### Standard View (When Article-Based View is OFF)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Sheet1] [Sheet2] [Sheet3]                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ▼ 1. Trabalhos Preliminares                                         │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Artigo  │ Descrição           │ UN  │ QT    │ Obs.            │  │
│ ├────────────────────────────────────────────────────────────────┤  │
│ │ 1.1     │ Limpeza do terreno  │     │       │                 │  │
│ │ 1.1.1   │ Remoção de entulho  │ m3  │ 50.00 │                 │  │
│ │ 1.1.2   │ Capina manual       │ m2  │ 100.00│                 │  │
│ │ 1.2     │ Demolições          │     │       │                 │  │
│ │ 1.2.1   │ Demolição de paredes│ m2  │ 25.00 │                 │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│ ▼ 2. Fundações                                                       │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Artigo  │ Descrição           │ UN  │ QT    │ Obs.            │  │
│ ├────────────────────────────────────────────────────────────────┤  │
│ │ 2.1     │ Escavações          │     │       │                 │  │
│ │ 2.1.1   │ Escavação manual    │ m3  │ 30.00 │                 │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Expandable chapter sections
- All items in a single table per chapter
- Text rows NOT captured
- Linear, table-based view

#### Article-Based View (When Article-Based View is ON)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Sheet1] [Sheet2] [Sheet3] ← One tab per Excel sheet                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ 1. Trabalhos Preliminares                                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │   1.1    │ │   1.2    │ │   1.3    │ │   1.4    │               │
│ │ Limpeza..│ │Demolições│ │ Terra... │ │ Drenagem │               │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                      │
│ 2. Fundações                                                         │
│ ┌──────────┐ ┌──────────┐                                          │
│ │   2.1    │ │   2.2    │                                          │
│ │Escavações│ │Fundações │                                          │
│ └──────────┘ └──────────┘                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Page-based interface with clickable boxes
- Articles are primary navigation units
- Text rows ARE captured and shown in modals
- Grid layout with 4 columns

## Responsive Behavior

### Desktop (lg: ≥1024px)
- 4 article pages per row
- Full-width modals (max-width: 4xl)

### Tablet (md: ≥768px)
- 3 article pages per row
- Slightly narrower modals

### Mobile (sm: ≥640px)
- 2 article pages per row
- Mobile-optimized modals

### Small Mobile (<640px)
- 1 article page per row
- Full-screen modals

## Toggle States

### Both Toggles OFF (Default)
```
[ ] Treat as single sheet    [ ] Article-based view
```
- Multi-sheet: Creates tabs from sheet names
- Single-sheet: Creates 3 default tabs
- View: Standard table view

### Single-Sheet Toggle ON, Article-Based OFF
```
[✓] Treat as single sheet    [ ] Article-based view
```
- Always creates 3 default tabs
- View: Standard table view

### Article-Based Toggle ON
```
[ ] Treat as single sheet    [✓] Article-based view
```
- Creates one tab per Excel sheet (using sheet names)
- View: Article-based page view
- Captures all content between articles

### Both Toggles ON
```
[✓] Treat as single sheet    [✓] Article-based view
```
- Creates one tab per Excel sheet (using sheet names)
- "Treat as single sheet" toggle doesn't affect behavior when article-based is on

## Color Scheme (Using Tailwind Classes)

- **Chapter Box Header**: `bg-muted` (light gray background)
- **Article Page Box**: 
  - Default: `border rounded-lg` (light border)
  - Hover: `hover:shadow-md hover:border-primary` (shadow and blue border)
- **Article Number**: `text-primary` (blue text)
- **Modal Overlay**: Semi-transparent dark background
- **Modal Content**: White background with scroll

## Icons Used

- **ChevronDown**: For collapsible sections (not used in article-based view)
- **MessageSquare**: For chapter comments (inherited from standard view)
- **X**: For closing modal

## Accessibility Features

- **Keyboard Navigation**: Tab through article pages, Enter to open
- **Screen Readers**: Article pages have descriptive labels
- **Focus Management**: Modal traps focus when open
- **Escape Key**: Closes modal
- **Click Outside**: Closes modal

## Implementation Notes

1. **Data Flow**:
   - Excel analysis → articlesData array
   - articlesData → sessionStorage
   - sessionStorage → React state (chaptersWithArticles)
   - React state → UI rendering

2. **Performance**:
   - Articles are rendered on-demand in modals
   - Grid layout uses CSS Grid for optimal performance
   - No virtualization needed for typical datasets (< 100 articles)

3. **Storage**:
   - Uses sessionStorage (temporary, per-tab)
   - Data persists during browser session
   - Cleared when tab/browser closes

4. **Browser Support**:
   - Modern browsers (Chrome, Firefox, Safari, Edge)
   - Requires ES6+ support
   - Uses CSS Grid and Flexbox
