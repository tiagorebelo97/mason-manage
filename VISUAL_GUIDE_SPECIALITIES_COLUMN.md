# Visual Guide: Specialities Column Feature

## Overview
This guide shows the visual changes made to the MapaQuantidades page to display specialities for each item.

## Location
**Orçamentos → [Select an Orçamento] → Mapa Quantidades → Article View**

---

## Before: Items Table (Previous Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Chapter: 1. Foundation Work                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1.1 - Excavation Work                                                     │
│   ┌────────────────────────────────────────────────────────────────────┐   │
│   │ Artigo │ Descrição        │ UN │ QT    │ Observações Empreiteiro  │   │
│   ├────────┼──────────────────┼────┼───────┼──────────────────────────┤   │
│   │ 1.1.1  │ Excavate terrain │ m³ │ 25.50 │ Need equipment access    │   │
│   │ 1.1.2  │ Remove debris    │ un │  1.00 │ -                        │   │
│   │ 1.1.3  │ Level ground     │ m² │ 45.00 │ Check level specs        │   │
│   └────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Issues
❌ **No visibility of specialities** - Users couldn't see which specialities were attributed to each item
❌ **Hard to track requirements** - No way to know what specialists are needed for each item
❌ **Manual cross-referencing** - Had to open separate dialogs to check specialities

---

## After: Items Table (New Layout)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ Chapter: 1. Foundation Work                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   1.1 - Excavation Work                                                                     │
│   ┌──────────────────────────────────────────────────────────────────────────────────────┐ │
│   │ Artigo │ Descrição        │ UN │ QT    │ Observ. Empreit. │ Specialities        │    │
│   ├────────┼──────────────────┼────┼───────┼──────────────────┼─────────────────────┤    │
│   │ 1.1.1  │ Excavate terrain │ m³ │ 25.50 │ Need equip acc   │ [Civil] [Earthwork] │    │
│   │ 1.1.2  │ Remove debris    │ un │  1.00 │ -                │ [Civil]             │    │
│   │ 1.1.3  │ Level ground     │ m² │ 45.00 │ Check specs      │ [Civil] [Surveying] │    │
│   └──────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Improvements
✅ **Immediate visibility** - Specialities shown right in the table
✅ **Visual badges** - Color-coded badges for easy scanning
✅ **Smart inheritance** - Shows inherited specialities when not explicitly set
✅ **Language support** - Displays in Portuguese or English based on user preference

---

## Speciality Badge Examples

### Single Speciality
```
┌──────────┐
│ [Civil]  │  ← Grey badge with white text
└──────────┘
```

### Multiple Specialities
```
┌──────────┬──────────────┬──────────────┐
│ [Civil]  │ [Electrical] │ [Plumbing]   │  ← Badges wrap to new line if needed
└──────────┴──────────────┴──────────────┘
```

### No Specialities
```
┌───┐
│ - │  ← Muted text showing no specialities
└───┘
```

---

## Inheritance Visualization

```
Tab: "Principal"
  └─ Specialities: [Management], [General]
      │
      └─ Chapter: "1. Foundation Work"
           └─ Specialities: [Civil], [Structural]  (overrides tab)
               │
               └─ Article: "1.1 - Excavation Work"
                    └─ Specialities: [Earthwork]  (overrides chapter)
                        │
                        ├─ Item: "1.1.1"  
                        │   └─ Own: [Heavy Equipment]  ← Shows: [Heavy Equipment]
                        │
                        ├─ Item: "1.1.2"  
                        │   └─ No own specialities  ← Shows: [Earthwork] (from article)
                        │
                        └─ Item: "1.1.3"
                            └─ No own specialities  ← Shows: [Earthwork] (from article)
```

---

## Real-World Example

### Construction Project with Multiple Trades

**Article: 2.3 - Electrical Installation**
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Artigo │ Descrição                │ UN │ QT    │ Obs.    │ Specialities          │
├────────┼──────────────────────────┼────┼───────┼─────────┼───────────────────────┤
│ 2.3.1  │ Install main panel       │ un │  1.00 │ -       │ [Electrical]          │
│ 2.3.2  │ Run conduit to rooms     │ m  │ 45.00 │ -       │ [Electrical]          │
│ 2.3.3  │ Install outlets          │ un │ 12.00 │ -       │ [Electrical]          │
│ 2.3.4  │ Connect to grid          │ un │  1.00 │ Special │ [Electrical] [Grid]   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Article: 2.4 - HVAC Installation**
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Artigo │ Descrição                │ UN │ QT    │ Obs.    │ Specialities          │
├────────┼──────────────────────────┼────┼───────┼─────────┼───────────────────────┤
│ 2.4.1  │ Install AC units         │ un │  3.00 │ -       │ [HVAC] [Electrical]   │
│ 2.4.2  │ Run ductwork             │ m  │ 28.00 │ -       │ [HVAC]                │
│ 2.4.3  │ Install vents            │ un │  8.00 │ -       │ [HVAC]                │
│ 2.4.4  │ Test system              │ un │  1.00 │ -       │ [HVAC]                │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Benefits

### 1. Resource Planning
Quickly see all specialities needed → Plan resource allocation

### 2. Cost Estimation
Identify specialist requirements → Accurate cost estimates

### 3. Scheduling
Know which trades are needed → Better schedule coordination

### 4. Quality Control
Clear speciality attribution → Ensure right specialists for each task

### 5. Communication
Share clear requirements → Better contractor communication

---

## Technical Notes

### Display Logic
- Badges are displayed using the `Badge` component from shadcn/ui
- Badge variant: `secondary` (grey background)
- Badge size: `text-xs` (extra small text)
- Layout: `flex flex-wrap gap-1` (wraps on multiple lines with 1rem gap)

### Color Scheme
- **Badge Background**: Grey (`bg-secondary`)
- **Badge Text**: White/Dark (theme-aware)
- **Empty State**: Muted grey (`text-muted-foreground`)

### Responsive Design
- Badges automatically wrap to new lines on smaller screens
- Column width adjusts based on content
- Touch-friendly spacing between badges

### Performance
- Specialities are fetched once and cached
- No additional API calls per item
- Efficient lookup using Map data structures
