# Quick Reference: Specialities Column Feature

## What Changed?
A new "Specialities" column was added to the items table in the article view of MapaQuantidades page.

## Where to Find It?
Navigate to: **Orçamentos → [Select an Orçamento] → Mapa Quantidades**

In the article view, each item table now shows:
```
Artigo | Descrição | UN | QT | Observações Empreiteiro | Specialities
```

## How It Works

### Speciality Inheritance
Specialities are displayed based on this priority:

1. **Item Specialities** (highest priority)
   - If explicitly set for the item → Shows these

2. **Article Specialities**
   - If item has no specialities → Inherits from article

3. **Chapter Specialities**
   - If article has no specialities → Inherits from chapter

4. **No Specialities**
   - Shows "-" if none are set at any level

### Visual Display
- Specialities appear as colored **badges**
- Badge text is in **Portuguese or English** (based on language setting)
- Multiple specialities **wrap** to new lines if needed
- Empty state shows **"-"**

## Example

### Item with Specialities
```
| 1.1.1 | Foundation work | m² | 25.5 | - | [Civil] [Structural] |
```

### Item without Specialities
```
| 1.1.2 | General work | un | 1.0 | - | - |
```

## Code Location
File: `src/pages/MapaQuantidades.tsx`

Key functions:
- `getArticleSpecialityIds()` - Gets article specialities
- `getItemSpecialitiesInArticle()` - Gets item specialities with inheritance
- Table rendering at lines ~3520-3580

## Database Tables Involved
- `item_specialities` - Item-specific specialities
- `article_specialities` - Article-specific specialities
- `chapter_specialities` - Chapter-specific specialities
- `specialities` - Master speciality definitions

## Notes
- This is a **display-only** feature
- Specialities are managed through the existing speciality dialogs
- The inheritance logic respects all override settings
- No migration or schema changes were needed
