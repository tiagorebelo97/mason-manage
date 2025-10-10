# Specialities Feature for Items

## Overview

This feature allows users to assign specialities to individual items in orçamentos (budget/quantity maps). This is useful for categorizing construction work by trade or specialty (e.g., electrical, plumbing, masonry, etc.).

**Specialities are now grouped by main specialties** in the dropdown, making it easier to find and select related specialities.

## Key Features

### 1. **Item-Level Specialities**
- Assign specific specialities to individual items
- Items can have their own unique set of specialities
- Specialities organized by main specialty in dropdown

### 2. **Grouped Selection**
- Specialities are organized by main specialty categories
- Easy navigation through related specialities
- Alphabetically sorted groups and specialities
- "Other" category for uncategorized specialities

## User Interface

### Item Specialities

Each item now has a "Specialities" column with a button showing the current state:

```
┌────────┬─────────────┬────┬────┬─────────────────┬────────────┐
│ Artigo │ Descrição   │ UN │ QT │ Specialities    │ Observações│
├────────┼─────────────┼────┼────┼─────────────────┼────────────┤
│ 1.1    │ Item desc   │ m² │ 10 │ 🏷️ 2            │ ...        │
│ 1.2    │ Another     │ m  │ 5  │ 🏷️ 1            │ ...        │
│ 1.3    │ Third item  │ un │ 2  │ 🏷️ None         │ ...        │
└────────┴─────────────┴────┴────┴─────────────────┴────────────┘
```

**Button indicators:**
- `None` - No specialities assigned
- `1` - One speciality assigned to this item
- `2` - Two specialities assigned to this item
- `3` - Three specialities assigned to this item

**To manage item specialities:**
1. Click the speciality button in the item row
2. A dialog opens with a **grouped multi-select dropdown** organized by main specialties
3. Select specialities for the item
4. Changes are saved automatically

**Grouping in dropdown:**
The specialities dropdown is organized hierarchically:
```
▾ Electrical
  ├─ Electrical Installation
  ├─ Lighting Systems
  └─ Power Distribution

▾ HVAC
  ├─ Air Conditioning
  ├─ Ventilation
  └─ Heating

▾ Plumbing
  ├─ Water Supply
  ├─ Drainage
  └─ Sanitary Fixtures

▾ Other
  └─ (Specialities without main specialty)
```

## Database Schema

### Tables

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
orcamento_items (1) ──→ (*) item_specialities (*) ──→ (1) specialities
```

## Technical Implementation

### Key Components

1. **MultiSelect Component** (`@/components/ui/multi-select`)
   - Provides the multi-select dropdown interface
   - Shows selected specialities as badges
   - Supports search and filtering
   - **NEW:** Supports grouped options organized by main specialties
   - Can accept either `options` (flat list) or `groupedOptions` (organized by groups)

2. **Queries**
   - `specialities` - Fetches all available specialities with main specialties
   - `item_specialities` - Fetches item-speciality mappings

3. **Mutations**
   - `updateItemSpecialitiesMutation` - Updates item specialities

### Helper Functions

```typescript
// Get specialities for an item
getItemSpecialityIds(itemId: string, chapterId?: string): string[]

// Group specialities by main specialty
groupedSpecialityOptions: Record<string, MultiSelectOption[]>
```

## Usage Examples

### Example 1: Assigning Item Speciality

**Scenario:** Item 2.5 requires "Electrical" and "HVAC" specialities.

**Steps:**
1. Navigate to Chapter 2
2. Find Item 2.5 in the table
3. Click the speciality button (shows "None" if no specialities assigned)
4. In the dialog, select both "Electrical" and "HVAC" from the grouped dropdown
5. Click outside to close
6. Item 2.5 now shows "2" in its Specialities column

### Example 2: Modifying Item Specialities

**Scenario:** You want to change Item 2.5's speciality from "Electrical" to "Plumbing".

**Steps:**
1. Click the speciality button for Item 2.5
2. Remove the "Electrical" speciality (click the X on the badge)
3. Select "Plumbing" from the dropdown
4. Click outside to close
5. Item 2.5 now shows "1" in its Specialities column

### Example 3: Removing All Specialities

**Scenario:** You want to remove all specialities from Item 2.5.

**Steps:**
1. Click the speciality button for Item 2.5
2. Remove all selected specialities (click the X on each badge)
3. Click outside to close
4. Item 2.5 now shows "None" in its Specialities column

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
- `src/pages/MapaQuantidades.tsx` - Main implementation with grouped options
- `src/components/ui/multi-select.tsx` - Enhanced to support grouping

**Key Implementation Changes:**

1. **MultiSelect Component Enhancement:**
   - Added `groupedOptions` prop to accept grouped data
   - Maintains backward compatibility with `options` prop
   - Renders `CommandGroup` for each main specialty
   - Alphabetically sorts groups and items within groups

2. **Grouped Options Generation:**
   ```typescript
   const groupedSpecialityOptions = React.useMemo(() => {
     // Groups specialities by main_specialties
     // Sorts groups alphabetically (with "Other" at end)
     // Sorts specialities within each group
   }, [specialities, language]);
   ```

No additional configuration is required.

### Step 3: Test the Feature

1. Navigate to an existing orçamento with analyzed data
2. Test assigning specialities to individual items
3. Test modifying item specialities
4. Test removing item specialities

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

// Get item specialities
const { data: itemSpecialities } = useQuery({
  queryKey: ["item_specialities", orcamentoId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("item_specialities")
      .select("*");
    return data;
  },
});
```

### Mutations

```typescript
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
