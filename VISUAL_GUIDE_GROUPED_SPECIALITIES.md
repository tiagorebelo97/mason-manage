# Visual Guide: Grouped Specialities Dropdown

## Overview

This guide shows the visual difference between the old flat list and the new grouped dropdown for speciality selection.

## Before: Flat List

When selecting specialities for a chapter or item, users saw a flat alphabetical list:

```
┌─────────────────────────────────────────────┐
│ Chapter Specialities                    ×   │
├─────────────────────────────────────────────┤
│ Select specialities for this chapter.      │
│ All items will inherit these by default.   │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ Select specialities...        ⌄         ││
│ └─────────────────────────────────────────┘│
│                                             │
│   Dropdown shows:                           │
│   ┌───────────────────────────────────┐    │
│   │ 🔍 Search...                      │    │
│   ├───────────────────────────────────┤    │
│   │ ☐ Air Conditioning                │    │
│   │ ☐ Carpentry                       │    │
│   │ ☐ Drainage                        │    │
│   │ ☐ Electrical Installation         │    │
│   │ ☐ Heating                         │    │
│   │ ☐ Lighting Systems                │    │
│   │ ☐ Masonry                         │    │
│   │ ☐ Painting                        │    │
│   │ ☐ Plumbing Fixtures               │    │
│   │ ☐ Power Distribution              │    │
│   │ ☐ Ventilation                     │    │
│   │ ☐ Water Supply                    │    │
│   └───────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

**Issues:**
- Hard to find related specialities
- No visual organization
- Requires scrolling through entire list
- Difficult to see which specialities belong together

## After: Grouped by Main Specialty

Now, specialities are organized by their main specialty category:

```
┌─────────────────────────────────────────────┐
│ Chapter Specialities                    ×   │
├─────────────────────────────────────────────┤
│ Select specialities for this chapter.      │
│ All items will inherit these by default.   │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ Select specialities...        ⌄         ││
│ └─────────────────────────────────────────┘│
│                                             │
│   Dropdown shows:                           │
│   ┌───────────────────────────────────┐    │
│   │ 🔍 Search...                      │    │
│   ├───────────────────────────────────┤    │
│   │ ELECTRICAL                        │    │
│   │   ☐ Electrical Installation       │    │
│   │   ☐ Lighting Systems              │    │
│   │   ☐ Power Distribution            │    │
│   ├───────────────────────────────────┤    │
│   │ HVAC                              │    │
│   │   ☐ Air Conditioning              │    │
│   │   ☐ Heating                       │    │
│   │   ☐ Ventilation                   │    │
│   ├───────────────────────────────────┤    │
│   │ PLUMBING                          │    │
│   │   ☐ Drainage                      │    │
│   │   ☐ Plumbing Fixtures             │    │
│   │   ☐ Water Supply                  │    │
│   ├───────────────────────────────────┤    │
│   │ STRUCTURE                         │    │
│   │   ☐ Carpentry                     │    │
│   │   ☐ Masonry                       │    │
│   ├───────────────────────────────────┤    │
│   │ FINISHES                          │    │
│   │   ☐ Painting                      │    │
│   └───────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Easy to find related specialities
- ✅ Visual organization by category
- ✅ Clear grouping with headers
- ✅ Better understanding of specialty relationships
- ✅ Alphabetically sorted within groups

## Selecting Specialities

### Example: Selecting Multiple Specialities

```
┌─────────────────────────────────────────────┐
│ Chapter Specialities                    ×   │
├─────────────────────────────────────────────┤
│ Select specialities for this chapter.      │
│ All items will inherit these by default.   │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ ◼ Electrical Installation               ││
│ │ ◼ Lighting Systems                      ││
│ │ ◼ Water Supply          ⌄               ││
│ └─────────────────────────────────────────┘│
│                                             │
│   Dropdown shows selected items:            │
│   ┌───────────────────────────────────┐    │
│   │ 🔍 Search...                      │    │
│   ├───────────────────────────────────┤    │
│   │ ELECTRICAL                        │    │
│   │   ☑ Electrical Installation       │ ✓  │
│   │   ☑ Lighting Systems              │ ✓  │
│   │   ☐ Power Distribution            │    │
│   ├───────────────────────────────────┤    │
│   │ PLUMBING                          │    │
│   │   ☐ Drainage                      │    │
│   │   ☐ Plumbing Fixtures             │    │
│   │   ☑ Water Supply                  │ ✓  │
│   └───────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

The selected specialities appear as removable badges, and checkmarks show which items are selected in each group.

## Item Specialities Dialog

Items have the same grouped interface with inheritance indicators:

```
┌─────────────────────────────────────────────┐
│ Item Specialities                       ×   │
├─────────────────────────────────────────────┤
│ Select specialities for this item.         │
│ Leave empty to inherit from chapter.       │
├─────────────────────────────────────────────┤
│                                             │
│ Currently inheriting from chapter:          │
│ • Electrical Installation                   │
│ • Lighting Systems                          │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ Select specialities (or inherit)...  ⌄  ││
│ └─────────────────────────────────────────┘│
│                                             │
└─────────────────────────────────────────────┘
```

**Inheritance behavior:**
- Leave empty → Inherits from chapter
- Select items → Overrides chapter specialities
- Shows "(inherited)" in item button when using chapter specialities

## Real-World Example

### Scenario: Setting up an Electrical Chapter

1. **Chapter Setup**
   - User clicks 🏷️ icon on "Chapter 3. Electrical Work"
   - Selects from ELECTRICAL group:
     - Electrical Installation
     - Lighting Systems
     - Power Distribution

2. **Item Inheritance**
   - All items automatically show "3 (inherited)"
   - Items inherit all three electrical specialities

3. **Item Override**
   - Item 3.5 "Emergency Lighting" needs special handling
   - User clicks item's speciality button
   - Sees current "3 (inherited)"
   - Removes "Power Distribution"
   - Adds "Fire Safety" from SAFETY group
   - Item now shows "3" (custom)

## Language Support

The grouping works in both languages:

### English
```
ELECTRICAL
  ☐ Electrical Installation
  ☐ Lighting Systems

PLUMBING
  ☐ Water Supply
  ☐ Drainage
```

### Portuguese
```
ELÉTRICO
  ☐ Instalação Elétrica
  ☐ Sistemas de Iluminação

CANALIZAÇÕES
  ☐ Abastecimento de Água
  ☐ Drenagem
```

## Search Functionality

The search box works across all groups:

```
┌───────────────────────────────────┐
│ 🔍 water...                       │
├───────────────────────────────────┤
│ HVAC                              │
│   ☐ Water-based Heating           │
├───────────────────────────────────┤
│ PLUMBING                          │
│   ☐ Water Supply                  │
│   ☐ Wastewater Treatment          │
└───────────────────────────────────┘
```

Search results maintain group organization, showing only matching items within their respective groups.

## Mobile View

On smaller screens, the dialog adjusts:

```
┌─────────────────────────┐
│ Chapter Specialities × │
├─────────────────────────┤
│ Select specialities for │
│ this chapter.           │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Select...        ⌄  │ │
│ └─────────────────────┘ │
│                         │
│ Dropdown (scrollable):  │
│ ┌───────────────────┐   │
│ │ 🔍 Search...      │   │
│ ├───────────────────┤   │
│ │ ELECTRICAL        │   │
│ │   ☐ Elec. Inst.  │   │
│ │   ☐ Lighting      │   │
│ ├───────────────────┤   │
│ │ HVAC              │   │
│ │   ☐ Air Cond.    │   │
│ │   ☐ Ventilation  │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

## Technical Details

### Group Ordering
1. Alphabetically by main specialty name
2. "Other" group always at the end
3. Items within each group alphabetically sorted

### Performance
- Groups calculated once using `React.useMemo`
- Recalculates only when specialities or language changes
- No impact on scroll performance

### Accessibility
- Keyboard navigation works across groups
- Screen readers announce group headers
- ARIA labels maintained for all interactive elements

## Summary

The grouped specialities dropdown provides:
- **Better Organization** - Related items grouped together
- **Faster Selection** - Easy to find what you need
- **Visual Clarity** - Clear category headers
- **Consistent Experience** - Same grouping in chapter and item dialogs
- **Backward Compatible** - Existing functionality unchanged
