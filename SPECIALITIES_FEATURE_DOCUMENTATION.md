# Specialities Feature for Chapters and Items

## Overview

This feature allows users to assign specialities to both chapters and individual items in orçamentos (budget/quantity maps). This is useful for categorizing construction work by trade or specialty (e.g., electrical, plumbing, masonry, etc.).

## Key Features

### 1. **Chapter-Level Specialities**
- Assign multiple specialities to a chapter
- All items in that chapter automatically inherit these specialities
- Easy bulk assignment for organizing work by specialty

### 2. **Item-Level Specialities**
- Override chapter specialities for individual items
- Assign specific specialities that differ from the chapter
- Items can have their own unique set of specialities

### 3. **Inheritance System**
- Items inherit specialities from their parent chapter by default
- The UI clearly indicates when specialities are inherited vs. custom
- Deleting item-specific specialities reverts to chapter inheritance

## User Interface

### Chapter Specialities

Each chapter header now includes a **Tag icon** button (🏷️) next to the comments button:

```
┌─────────────────────────────────────────────────────────┐
│  ▼  Chapter 1. Trabalhos Preliminares  💬  🏷️          │
└─────────────────────────────────────────────────────────┘
```

**To manage chapter specialities:**
1. Click the Tag icon button in the chapter header
2. A dialog opens showing a multi-select dropdown
3. Select one or more specialities from the list
4. Changes are saved automatically
5. All items in the chapter inherit these specialities

### Item Specialities

Each item now has a "Specialities" column with a button showing the current state:

```
┌────────┬─────────────┬────┬────┬─────────────────┬────────────┐
│ Artigo │ Descrição   │ UN │ QT │ Specialities    │ Observações│
├────────┼─────────────┼────┼────┼─────────────────┼────────────┤
│ 1.1    │ Item desc   │ m² │ 10 │ 🏷️ 2 (inherited)│ ...        │
│ 1.2    │ Another     │ m  │ 5  │ 🏷️ 1            │ ...        │
│ 1.3    │ Third item  │ un │ 2  │ 🏷️ None         │ ...        │
└────────┴─────────────┴────┴────┴─────────────────┴────────────┘
```

**Button indicators:**
- `None` - No specialities assigned
- `1 (inherited)` - One speciality inherited from chapter
- `2 (inherited)` - Two specialities inherited from chapter
- `1` - One custom speciality assigned to this item
- `3` - Three custom specialities assigned to this item

**To manage item specialities:**
1. Click the speciality button in the item row
2. A dialog opens with a multi-select dropdown
3. Select specialities (leave empty to inherit from chapter)
4. Changes are saved automatically

## Database Schema

### New Tables

#### `chapter_specialities`
Junction table linking chapters to specialities.

```sql
CREATE TABLE chapter_specialities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES orcamento_chapters(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id, speciality_id)
);
```

#### `item_specialities`
Junction table linking items to specialities.

```sql
CREATE TABLE item_specialities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES orcamento_items(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, speciality_id)
);
```

### Relationships

```
orcamento_chapters (1) ──→ (*) chapter_specialities (*) ──→ (1) specialities
orcamento_items (1) ──→ (*) item_specialities (*) ──→ (1) specialities
```

## Technical Implementation

### Key Components

1. **MultiSelect Component** (`@/components/ui/multi-select`)
   - Provides the multi-select dropdown interface
   - Shows selected specialities as badges
   - Supports search and filtering

2. **Queries**
   - `specialities` - Fetches all available specialities with main specialties
   - `chapter_specialities` - Fetches chapter-speciality mappings
   - `item_specialities` - Fetches item-speciality mappings

3. **Mutations**
   - `updateChapterSpecialitiesMutation` - Updates chapter specialities
   - `updateItemSpecialitiesMutation` - Updates item specialities

### Helper Functions

```typescript
// Get specialities for a chapter
getChapterSpecialityIds(chapterId: string): string[]

// Get specialities for an item (with inheritance)
getItemSpecialityIds(itemId: string, chapterId?: string): string[]
```

## Usage Examples

### Example 1: Setting Chapter Specialities

**Scenario:** You want all items in "Chapter 2. Electrical Work" to be tagged as "Electrical" specialty.

**Steps:**
1. Navigate to the orçamento
2. Find Chapter 2 in the tabs
3. Click the Tag icon (🏷️) in the chapter header
4. Select "Electrical" from the dropdown
5. Click outside the dialog to close
6. All items in Chapter 2 now show "1 (inherited)" in their Specialities column

### Example 2: Overriding Item Speciality

**Scenario:** Item 2.5 in the electrical chapter actually requires both "Electrical" and "HVAC" specialities.

**Steps:**
1. Navigate to Chapter 2
2. Find Item 2.5 in the table
3. Click the speciality button (currently showing "1 (inherited)")
4. In the dialog, select both "Electrical" and "HVAC"
5. Click outside to close
6. Item 2.5 now shows "2" (not inherited) in its Specialities column

### Example 3: Removing Custom Specialities

**Scenario:** You want Item 2.5 to go back to inheriting from the chapter.

**Steps:**
1. Click the speciality button for Item 2.5
2. Remove all selected specialities (click the X on each badge)
3. Click outside to close
4. Item 2.5 now shows "1 (inherited)" again

## Migration Instructions

### Step 1: Run Database Migration

Execute the migration script in your Supabase SQL Editor:

```bash
# File: migration_specialities_orcamento.sql
```

This creates:
- `chapter_specialities` table
- `item_specialities` table
- Necessary indexes
- Row Level Security policies

### Step 2: Deploy Code Changes

The code changes are in:
- `src/pages/MapaQuantidades.tsx` - Main implementation

No additional configuration is required.

### Step 3: Test the Feature

1. Navigate to an existing orçamento with analyzed data
2. Test assigning specialities to a chapter
3. Verify items inherit the specialities
4. Test overriding item specialities
5. Test removing item specialities to revert to inheritance

## Additional Features Included

### Image Deletion Fix

When an Excel file is deleted from an orçamento, all associated images from the `observacoes` column are now properly deleted from Supabase storage. This prevents orphaned images and reduces storage costs.

**Technical Details:**
- Queries all items associated with the orçamento through tabs and chapters
- Extracts image URLs from `observacoes_image_url` column
- Deletes each image from the `orcamento-observacoes` storage bucket
- Occurs before database records are deleted via cascade

## API Reference

### Queries

```typescript
// Get all specialities
const { data: specialities } = useQuery({
  queryKey: ["specialities"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("specialities")
      .select("*, main_specialties(*)");
    return data;
  },
});

// Get chapter specialities
const { data: chapterSpecialities } = useQuery({
  queryKey: ["chapter_specialities", orcamentoId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("chapter_specialities")
      .select("*");
    return data;
  },
});
```

### Mutations

```typescript
// Update chapter specialities
updateChapterSpecialitiesMutation.mutate({
  chapterId: "uuid",
  specialityIds: ["uuid1", "uuid2"]
});

// Update item specialities
updateItemSpecialitiesMutation.mutate({
  itemId: "uuid",
  specialityIds: ["uuid1", "uuid2"]
});
```

## Troubleshooting

### Issue: Specialities not showing up

**Solution:** Ensure specialities exist in the `specialities` table and are linked to main specialties. Check the Specialities page to add them if needed.

### Issue: Changes not saving

**Solution:** Check browser console for errors. Verify database tables were created correctly and RLS policies are in place.

### Issue: Items not inheriting from chapter

**Solution:** Verify the item doesn't have custom specialities set. Delete all item specialities to enable inheritance.

## Future Enhancements

Potential improvements for this feature:

1. **Bulk Edit** - Select multiple items and assign specialities at once
2. **Filter by Speciality** - Filter items/chapters by speciality
3. **Export** - Include specialities in Excel exports
4. **Statistics** - Show speciality distribution across orçamento
5. **Templates** - Save common speciality patterns for reuse

## Related Documentation

- `DATABASE_MIGRATIONS_NEEDED.md` - General database schema information
- `migration_specialities_orcamento.sql` - Database migration script
- `FIXES_QUICK_REFERENCE.md` - Other recent fixes and features
