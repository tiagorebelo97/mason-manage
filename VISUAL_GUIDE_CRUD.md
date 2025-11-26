# Visual Guide: CRUD Operations and Speciality Attribution

This document provides a visual overview of the new UI elements and their locations.

## Main Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Mapa Quantidades - [Orcamento Name]                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Principal] [Arquitetura] [Instalações Especiais]  [+New Sep] │  ← Tabs with New Separator button
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Separator: Principal    [🏷️] [✏️] [🗑️] [+ New Chapter]       │  ← Separator Actions
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📄 Sheet1                                           [Move →]   │  ← Sheet Separator (collapsible)
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ▼ 1. Chapter Name         [🏷️] [✏️] [🗑️] [Move →] [+ New A] │  ← Chapter Header with Actions
│  │ ┌─────────────────────────────────────────────────────────┐│
│  │ │ ▼ 1.1 - Article Title                [🏷️] [✏️] [🗑️]     ││  ← Article Header with Actions
│  │ │ ┌─────────────────────────────────────────────────────┐ ││
│  │ │ │ [Table with Items]                                  │ ││  ← Items Table (read-only)
│  │ │ └─────────────────────────────────────────────────────┘ ││
│  │ │                                                          ││
│  │ │ ▼ 1.2 - Another Article           [🏷️] [✏️] [🗑️]       ││
│  │ │ [Content...]                                            ││
│  │ │                                                          ││
│  │ │              [+ Add Item to Chapter]                    ││  ← Add Item Button
│  │ └─────────────────────────────────────────────────────────┘│
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Button Legend

- **🏷️** - Manage Specialities (Tag icon)
- **✏️** - Edit (Pencil icon)
- **🗑️** - Delete (Trash icon)
- **▼** - Expand/Collapse toggle (ChevronDown icon)
- **→** - Move to another tab (Arrow icon)
- **+** - Create new entity (Plus icon)

## Dialog Flows

### 1. Create Separator Dialog
```
┌────────────────────────────────────┐
│  Create Separator                  │
├────────────────────────────────────┤
│  Create a new separator (tab) for  │
│  organizing chapters.               │
│                                    │
│  Name:                             │
│  [___________________________]     │
│                                    │
│         [Cancel]  [Create]         │
└────────────────────────────────────┘
```

### 2. Create Chapter Dialog
```
┌────────────────────────────────────┐
│  Create Chapter                    │
├────────────────────────────────────┤
│  Create a new chapter in this      │
│  separator.                        │
│                                    │
│  Number:                           │
│  [_____]                          │
│                                    │
│  Name:                             │
│  [___________________________]     │
│                                    │
│  Comments (Optional):              │
│  [___________________________]     │
│  [___________________________]     │
│  [___________________________]     │
│                                    │
│         [Cancel]  [Create]         │
└────────────────────────────────────┘
```

### 3. Create Article Dialog
```
┌────────────────────────────────────┐
│  Create Article                    │
├────────────────────────────────────┤
│  Create a new article in this      │
│  chapter.                          │
│                                    │
│  Article Number:                   │
│  [_____]                          │
│                                    │
│  Title:                            │
│  [___________________________]     │
│                                    │
│         [Cancel]  [Create]         │
└────────────────────────────────────┘
```

### 4. Create Item Dialog
```
┌──────────────────────────────────────────────┐
│  Create Item                                  │
├──────────────────────────────────────────────┤
│  Create a new item in this chapter.          │
│                                              │
│  Article Number:        Unit:                │
│  [_____________]        [_____________]      │
│                                              │
│  Description:                                │
│  [____________________________________]      │
│  [____________________________________]      │
│  [____________________________________]      │
│                                              │
│  Quantity:              Unit Price:          │
│  [_____________]        [_____________]      │
│                                              │
│  Comments (Optional):                        │
│  [____________________________________]      │
│  [____________________________________]      │
│                                              │
│              [Cancel]  [Create]              │
└──────────────────────────────────────────────┘
```

### 5. Manage Specialities Dialog
```
┌─────────────────────────────────────────────┐
│  Manage Specialities for [Entity]           │
├─────────────────────────────────────────────┤
│  Select specialities to apply to all items  │
│  in this [entity].                          │
│                                             │
│  [Multi-Select Dropdown]                    │
│  ┌─────────────────────────────────────┐   │
│  │ [x] Architecture - Walls             │   │
│  │ [ ] Architecture - Floors            │   │
│  │ [x] Electrical - Lighting            │   │
│  │ [ ] Plumbing - Water Supply          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│              [Cancel]  [Apply]              │
└─────────────────────────────────────────────┘
```

## Color Coding

### Separator (Sheet) Section
- **Background**: Blue-50 (light blue)
- **Border**: Blue-500 (left border)
- **Text**: Blue-900 (dark blue)

### Chapter Section
- **Background**: Muted (gray)
- **Collapsible**: Default collapsed state
- **Header**: Contains chapter number and name

### Article Section
- **Background**: Gray-50 (light gray)
- **Collapsible**: Can be expanded/collapsed
- **Header**: Contains article number and title

### Action Buttons
- **Primary Actions**: Default button style (blue)
- **Secondary Actions**: Outline button style (white with border)
- **Destructive Actions**: Red background (for delete)

## Speciality Hierarchy Visual

```
┌─────────────────────────────────────────────┐
│  Separator (Tab)                            │
│  🏷️ [Speciality A, B]                       │
│  └─> Applies to ALL items in this tab      │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ Chapter 1                             │ │
│  │ 🏷️ [Speciality C, D]                  │ │
│  │ └─> Overrides tab, applies to chapter│ │
│  │                                       │ │
│  │ ┌─────────────────────────────────┐  │ │
│  │ │ Article 1.1                     │  │ │
│  │ │ 🏷️ [Speciality E]                │  │ │
│  │ │ └─> Overrides chapter           │  │ │
│  │ │                                 │  │ │
│  │ │ Items inherit Speciality E      │  │ │
│  │ └─────────────────────────────────┘  │ │
│  │                                       │ │
│  │ ┌─────────────────────────────────┐  │ │
│  │ │ Article 1.2                     │  │ │
│  │ │ (no specialities)               │  │ │
│  │ │                                 │  │ │
│  │ │ Items inherit C, D (from chapter)│ │ │
│  │ └─────────────────────────────────┘  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ Chapter 2                             │ │
│  │ (no specialities)                     │ │
│  │                                       │ │
│  │ Items inherit A, B (from separator)   │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Interaction Flow Examples

### Example 1: Creating a Complete Structure
1. Click "New Separator" → Create "Foundation"
2. Navigate to "Foundation" tab
3. Click "New Chapter" → Create "1. Excavation"
4. Click on chapter to expand
5. Click "New Article" → Create "1.1. Site Preparation"
6. Click "Add Item to Chapter" → Create item "1.1.1. Clear vegetation"

### Example 2: Attributing Specialities
1. Click 🏷️ on Separator → Select "Civil Engineering"
   - All items in this separator inherit "Civil Engineering"
2. Click 🏷️ on Chapter → Select "Earthworks"
   - Items in this chapter now have both "Civil Engineering" and "Earthworks"
3. Click 🏷️ on Article → Select "Site Clearing"
   - Items in this article now have "Site Clearing" (overrides chapter specialities)

### Example 3: Moving Chapters Between Tabs
1. Click "Move to tab" button on chapter header
2. Select target tab from the side panel
3. Chapter and all its articles/items move to the new tab

## Responsive Behavior

- **Desktop**: All buttons and actions visible
- **Tablet**: Actions may wrap to multiple lines
- **Mobile**: Some actions may be hidden in overflow menus (future enhancement)

## Accessibility Features

- Tooltips on icon buttons for clarity
- Keyboard navigation support
- ARIA labels on interactive elements
- Confirmation dialogs for destructive actions

## Performance Considerations

- Lazy loading of collapsed sections
- Optimistic UI updates for better perceived performance
- React Query cache invalidation for data consistency
- LocalStorage for persistent UI state (collapsed sections)
