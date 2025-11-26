# Specialities Column Feature

## Overview
Added a new "Specialities" column to the items table in each article view, displaying the specialities attributed to each item with full inheritance support.

## Problem Statement
"in each item in each article i want to have a collumn with the specialities atributed, per item"

## Solution
Added a "Specialities" column to the items table that displays speciality badges for each item, with proper inheritance from the speciality hierarchy.

## Implementation Details

### Files Modified
- `src/pages/MapaQuantidades.tsx`

### Changes Made

#### 1. New Helper Functions

**`getArticleSpecialityIds(articleId: string): string[]`**
- Gets the speciality IDs directly attributed to an article
- Returns an array of speciality IDs

**`getItemSpecialitiesInArticle(itemArtigo: string, chapterId: string, articleId?: string): Speciality[]`**
- Gets specialities for an item with full inheritance chain
- Inheritance order:
  1. **Item-specific specialities**: If the item has its own specialities set, returns those
  2. **Article specialities**: If not, inherits from the article (if article ID is provided)
  3. **Chapter specialities**: Falls back to chapter specialities if neither item nor article has specialities

#### 2. UI Changes

**Table Header**
- Added "Specialities" column header to the items table

**Table Body**
- Added a new table cell for each item row
- Displays speciality badges with:
  - Badge component for visual consistency
  - Language-aware display (PT/EN based on user's language setting)
  - Flex wrap layout for multiple badges
  - Displays "-" if no specialities are attributed

### Speciality Inheritance Hierarchy

```
Tab/Separator Specialities
    ↓
Chapter Specialities (inherits from tab if not set)
    ↓
Article Specialities (inherits from chapter if not set)
    ↓
Item Specialities (inherits from article if not set)
```

### Visual Example

**Before:**
```
| Artigo | Descrição | UN | QT | Observações Empreiteiro |
|--------|-----------|----|----|------------------------|
| 1.1.1  | Item desc | m² | 10 | Some observations      |
```

**After:**
```
| Artigo | Descrição | UN | QT | Observações Empreiteiro | Specialities |
|--------|-----------|----|----|------------------------|--------------|
| 1.1.1  | Item desc | m² | 10 | Some observations      | [Electrical] [HVAC] |
```

## Technical Details

### Data Flow
1. Items displayed in the article view are stored as part of the article's contents (JSON field)
2. When rendering, the code matches these items to the actual database records using `artigo` and `chapter_id`
3. Specialities are retrieved using the inheritance chain
4. Speciality objects are fetched and displayed as badges

### Edge Cases Handled
- **Item not found in database**: Falls back to article or chapter specialities
- **No specialities at any level**: Displays "-" placeholder
- **Multiple specialities**: Displays as a flex-wrapped list of badges
- **Language switching**: Badge text updates based on user's language preference

## Testing
The changes compile successfully and maintain TypeScript type safety. The feature integrates seamlessly with the existing speciality management system.

## Benefits
1. **Transparency**: Users can immediately see which specialities are attributed to each item
2. **Traceability**: Clear inheritance chain makes it easy to understand where specialities come from
3. **Consistency**: Uses the same Badge component used throughout the application
4. **Localization**: Supports both Portuguese and English based on user preference
5. **Flexibility**: Respects the existing speciality override system

## Future Enhancements
Potential future improvements could include:
- Indicator showing whether specialities are inherited or explicitly set
- Ability to edit item specialities directly from the table
- Color coding based on speciality type or main specialty
- Tooltip showing the source of inherited specialities
