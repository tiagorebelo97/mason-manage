# Visual Comparison: Before and After

## Article-Based View UI Changes

### BEFORE: Modal/Popup Approach

```
┌────────────────────────────────────────────────────────────────┐
│ Chapter 1. Trabalhos Preliminares                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   1.1    │  │   1.2    │  │   1.3    │  │   1.4    │      │
│  │ Article  │  │ Article  │  │ Article  │  │ Article  │      │
│  │  Title   │  │  Title   │  │  Title   │  │  Title   │      │
│  │ (click)  │  │ (click)  │  │ (click)  │  │ (click)  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

User clicks on an article box...

┌───────────────────────────────────────────────────────────────┐
│ [X] Close                                                      │
├───────────────────────────────────────────────────────────────┤
│ 1.1 - Article Title                                           │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│ Text content here...                                          │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ ARTIGO │ DESCRIÇÃO │ UN │ QT │ OBSERVAÇÕES             │  │
│ ├─────────────────────────────────────────────────────────┤  │
│ │ 1.1.1  │ Item desc │ m2 │ 100│ -                       │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ ARTIGO │ DESCRIÇÃO │ UN │ QT │ OBSERVAÇÕES             │  │
│ ├─────────────────────────────────────────────────────────┤  │
│ │ 1.1.2  │ Item desc │ un │ 5  │ -                       │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ ARTIGO │ DESCRIÇÃO │ UN │ QT │ OBSERVAÇÕES             │  │
│ ├─────────────────────────────────────────────────────────┤  │
│ │ 1.1.3  │ Item desc │ kg │ 50 │ -                       │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

**Issues with this approach:**
- ❌ Requires clicking to view content
- ❌ Each item creates a separate table
- ❌ Cannot see multiple articles at once
- ❌ Modal adds extra scrolling layer
- ❌ Not ideal for printing

---

### AFTER: Inline Display Approach

```
┌────────────────────────────────────────────────────────────────┐
│ Chapter 1. Trabalhos Preliminares                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1.1 - Article Title                                      │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                           │ │
│  │ Text content here...                                     │ │
│  │                                                           │ │
│  │ ┌───────────────────────────────────────────────────┐   │ │
│  │ │ ARTIGO │ DESCRIÇÃO │ UN │ QT │ OBSERVAÇÕES       │   │ │
│  │ ├───────────────────────────────────────────────────┤   │ │
│  │ │ 1.1.1  │ Item desc │ m2 │ 100│ -                 │   │ │
│  │ │ 1.1.2  │ Item desc │ un │ 5  │ -                 │   │ │
│  │ │ 1.1.3  │ Item desc │ kg │ 50 │ -                 │   │ │
│  │ └───────────────────────────────────────────────────┘   │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1.2 - Another Article Title                             │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                           │ │
│  │ Initial text...                                          │ │
│  │                                                           │ │
│  │ ┌───────────────────────────────────────────────────┐   │ │
│  │ │ ARTIGO │ DESCRIÇÃO │ UN │ QT │ OBSERVAÇÕES       │   │ │
│  │ ├───────────────────────────────────────────────────┤   │ │
│  │ │ 1.2.1  │ Item desc │ m3 │ 30 │ -                 │   │ │
│  │ └───────────────────────────────────────────────────┘   │ │
│  │                                                           │ │
│  │ Middle text...                                           │ │
│  │                                                           │ │
│  │ ┌───────────────────────────────────────────────────┐   │ │
│  │ │ ARTIGO │ DESCRIÇÃO │ UN │ QT │ OBSERVAÇÕES       │   │ │
│  │ ├───────────────────────────────────────────────────┤   │ │
│  │ │ 1.2.2  │ Item desc │ un │ 10 │ -                 │   │ │
│  │ │ 1.2.3  │ Item desc │ m2 │ 25 │ -                 │   │ │
│  │ └───────────────────────────────────────────────────┘   │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1.3 - Third Article Title                               │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ ...                                                       │ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Benefits of this approach:**
- ✅ All content immediately visible
- ✅ Consecutive items grouped in single tables
- ✅ See multiple articles at once
- ✅ Natural scrolling experience
- ✅ Better for printing

---

## Key Improvements

### 1. Item Grouping
**Before:** Each item = separate table
```
Table (1 row)  → Item 1.1.1
Table (1 row)  → Item 1.1.2
Table (1 row)  → Item 1.1.3
```

**After:** Consecutive items = one table
```
Table (3 rows) → Item 1.1.1
               → Item 1.1.2
               → Item 1.1.3
```

### 2. Content Flow
**Before:**
```
1. See chapter
2. See article boxes (4 per row)
3. Click a box
4. Modal opens
5. View content
6. Close modal
7. Repeat for next article
```

**After:**
```
1. See chapter
2. See all articles inline
3. Scroll down to view everything
```

### 3. Visual Hierarchy
**Before:**
```
Chapter
  → Grid of article boxes
    → Click → Modal
      → Content
```

**After:**
```
Chapter
  → Article 1
    → Content (text + tables)
  → Article 2
    → Content (text + tables)
  → Article 3
    → Content (text + tables)
```

---

## Example: Complex Article

### Before (Multiple Tables)
```
┌─────────────────────────┐
│ Modal: 1.1 - Title     │
├─────────────────────────┤
│ Description text        │
│                         │
│ Table (1 row) ↓         │
│ 1.1.1                   │
│                         │
│ Table (1 row) ↓         │
│ 1.1.2                   │
│                         │
│ More text               │
│                         │
│ Table (1 row) ↓         │
│ 1.1.3                   │
│                         │
│ Table (1 row) ↓         │
│ 1.1.4                   │
└─────────────────────────┘
```

### After (Grouped Tables)
```
┌─────────────────────────┐
│ 1.1 - Title            │
├─────────────────────────┤
│ Description text        │
│                         │
│ Table (2 rows) ↓        │
│ 1.1.1                   │
│ 1.1.2                   │
│                         │
│ More text               │
│                         │
│ Table (2 rows) ↓        │
│ 1.1.3                   │
│ 1.1.4                   │
└─────────────────────────┘
```

---

## Responsive Behavior

### Desktop (Large Screen)
- Full width articles
- Wide tables
- Optimal spacing

### Tablet (Medium Screen)
- Adjusted width
- Tables may scroll horizontally
- Maintained spacing

### Mobile (Small Screen)
- Full width articles
- Tables scroll horizontally
- Reduced spacing but still readable

---

## CSS Classes Used

### Article Container
- `border rounded-lg p-4 space-y-4`
- Creates bordered box with padding and spacing

### Article Header
- `border-b pb-3`
- `text-base font-semibold text-primary`
- Blue colored, bold header with bottom border

### Content Area
- `space-y-4`
- Consistent spacing between elements

### Tables
- `border`
- Standard table with border

---

## Accessibility

### Before
- Required mouse click
- Modal trap focus
- Keyboard navigation through tabs
- Screen readers announce modal opening

### After
- No interaction required
- Standard page flow
- Natural tab order
- Screen readers read sequentially

---

## Print Behavior

### Before
- Modal content might not print correctly
- Need to open each article individually
- Fragmented printing experience

### After
- All content prints naturally
- Single continuous document
- Chapter breaks preserved
- Professional appearance
