# Specialities Management Feature - Implementation Guide

## Overview
This feature allows users to assign multiple specialities to chapters and items in budget documents (Orçamentos). Specialities can be assigned at the chapter level and cascaded to all items, or individually assigned to specific items.

## Database Schema

### New Tables

#### 1. chapter_specialities
Junction table linking chapters to specialities (many-to-many relationship)

```sql
CREATE TABLE chapter_specialities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES orcamento_chapters(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id, speciality_id)
);
```

**Indexes:**
- `idx_chapter_specialities_chapter_id` on `chapter_id`
- `idx_chapter_specialities_speciality_id` on `speciality_id`

#### 2. item_specialities
Junction table linking items to specialities (many-to-many relationship)

```sql
CREATE TABLE item_specialities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES orcamento_items(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, speciality_id)
);
```

**Indexes:**
- `idx_item_specialities_item_id` on `item_id`
- `idx_item_specialities_speciality_id` on `speciality_id`

### Row Level Security (RLS)
Both tables have RLS enabled with policies allowing authenticated users to:
- SELECT (read)
- INSERT (create)
- UPDATE (modify)
- DELETE (remove)

## Features

### 1. Chapter Specialities Assignment
- **Location**: Chapter header row (next to chapter comments icon)
- **Icon**: Tag icon
- **Functionality**:
  - Click the Tag icon to open the specialities dialog
  - Select multiple specialities from the dropdown
  - Option to cascade: "Apply to all items in this chapter"
  - If cascade is enabled, all items inherit the chapter's specialities
  
### 2. Individual Item Specialities Assignment
- **Location**: Item row in the table (new column)
- **Icon**: Tag icon
- **Functionality**:
  - Click the Tag icon to open the specialities dialog
  - Select multiple specialities for the specific item
  - Overrides any cascaded specialities from the chapter
  
### 3. Visual Feedback
- **Tooltips**: Hover over Tag icons to see currently assigned specialities
- **Display**: Shows comma-separated list of speciality names
- **Language Support**: Displays specialities in Portuguese (pt) or English (en) based on user preference

## User Workflow

### Scenario 1: Assign Specialities to Chapter with Cascade

1. Navigate to a budget's "Mapa de Quantidades" page
2. Ensure the Excel file is uploaded and analyzed
3. Find the chapter you want to assign specialities to
4. Click the **Tag icon** next to the chapter name
5. In the dialog:
   - Select one or more specialities from the multi-select dropdown
   - Check the "Apply to all items in this chapter" checkbox
   - Click **Save**
6. All items in that chapter now have the same specialities

### Scenario 2: Override Item Specialities

1. After assigning specialities to a chapter (with or without cascade)
2. Find the specific item you want to customize
3. Click the **Tag icon** in the item's row
4. In the dialog:
   - Select different specialities for this item
   - Click **Save**
5. This item now has its own specialities, independent of the chapter

### Scenario 3: View Assigned Specialities

1. Hover over any **Tag icon** (chapter or item)
2. A tooltip appears showing:
   - "Specialities" label
   - Comma-separated list of assigned specialities
   - "No specialities assigned" if none are set

## Implementation Details

### Data Queries

#### Specialities
```typescript
const { data: specialities } = useQuery({
  queryKey: ["specialities"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("specialities")
      .select("*");
    return data;
  },
});
```

#### Chapter Specialities
```typescript
const { data: chapterSpecialities } = useQuery({
  queryKey: ["chapter_specialities", id],
  queryFn: async () => {
    const chapterIds = chapters.map(c => c.id);
    const { data, error } = await supabase
      .from("chapter_specialities")
      .select("*")
      .in("chapter_id", chapterIds);
    return data;
  },
  enabled: !!chapters && chapters.length > 0,
});
```

#### Item Specialities
```typescript
const { data: itemSpecialities } = useQuery({
  queryKey: ["item_specialities", id],
  queryFn: async () => {
    const itemIds = items.map(i => i.id);
    const { data, error } = await supabase
      .from("item_specialities")
      .select("*")
      .in("item_id", itemIds);
    return data;
  },
  enabled: !!items && items.length > 0,
});
```

### Mutations

#### Update Chapter Specialities
```typescript
const updateChapterSpecialitiesMutation = useMutation({
  mutationFn: async ({ 
    chapterId, 
    specialityIds, 
    cascadeToItems 
  }: { 
    chapterId: string; 
    specialityIds: string[]; 
    cascadeToItems: boolean 
  }) => {
    // 1. Delete existing chapter specialities
    await supabase
      .from("chapter_specialities")
      .delete()
      .eq("chapter_id", chapterId);

    // 2. Insert new chapter specialities
    if (specialityIds.length > 0) {
      const inserts = specialityIds.map(speciality_id => ({
        chapter_id: chapterId,
        speciality_id,
      }));
      await supabase
        .from("chapter_specialities")
        .insert(inserts);
    }

    // 3. If cascade enabled, update all items
    if (cascadeToItems) {
      const chapterItems = items?.filter(item => 
        item.chapter_id === chapterId
      ) || [];
      
      for (const item of chapterItems) {
        // Delete existing item specialities
        await supabase
          .from("item_specialities")
          .delete()
          .eq("item_id", item.id);

        // Insert new item specialities
        if (specialityIds.length > 0) {
          const itemInserts = specialityIds.map(speciality_id => ({
            item_id: item.id,
            speciality_id,
          }));
          await supabase
            .from("item_specialities")
            .insert(itemInserts);
        }
      }
    }
  },
});
```

#### Update Item Specialities
```typescript
const updateItemSpecialitiesMutation = useMutation({
  mutationFn: async ({ 
    itemId, 
    specialityIds 
  }: { 
    itemId: string; 
    specialityIds: string[] 
  }) => {
    // 1. Delete existing item specialities
    await supabase
      .from("item_specialities")
      .delete()
      .eq("item_id", itemId);

    // 2. Insert new item specialities
    if (specialityIds.length > 0) {
      const inserts = specialityIds.map(speciality_id => ({
        item_id: itemId,
        speciality_id,
      }));
      await supabase
        .from("item_specialities")
        .insert(inserts);
    }
  },
});
```

## UI Components

### Chapter Header
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => handleEditChapterSpecialities(
          chapter.id, 
          `${chapter.chapter_number}. ${cleanChapterName(chapter.chapter_name)}`
        )}
      >
        <Tag className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <div className="space-y-1">
        <p className="text-xs font-semibold">Specialities</p>
        <p className="text-xs">
          {getChapterSpecialitiesDisplay(chapter.id) || 'No specialities assigned'}
        </p>
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Item Row
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => handleEditItemSpecialities(
          item.id, 
          `${item.artigo} - ${item.descricao}`
        )}
      >
        <Tag className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <div className="space-y-1">
        <p className="text-xs font-semibold">Specialities</p>
        <p className="text-xs">
          {getItemSpecialitiesDisplay(item.id) || 'No specialities assigned'}
        </p>
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Chapter Specialities Dialog
```tsx
<Dialog open={!!editingChapterSpecialities} onOpenChange={...}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Edit Chapter Specialities</DialogTitle>
      <DialogDescription>{editingChapterSpecialities?.chapterName}</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>Specialities</Label>
        <MultiSelect
          options={specialities?.map(s => ({
            label: language === 'pt' ? s.name_pt : s.name_en,
            value: s.id,
          })) || []}
          selected={selectedSpecialities}
          onChange={setSelectedSpecialities}
          placeholder="Select specialities..."
          emptyText="No specialities found."
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="cascade" 
          checked={cascadeToItems}
          onCheckedChange={(checked) => setCascadeToItems(checked === true)}
        />
        <Label htmlFor="cascade">Apply to all items in this chapter</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSaveChapterSpecialities}>Save</Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### Item Specialities Dialog
```tsx
<Dialog open={!!editingItemSpecialities} onOpenChange={...}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Edit Item Specialities</DialogTitle>
      <DialogDescription>{editingItemSpecialities?.itemName}</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>Specialities</Label>
        <MultiSelect
          options={specialities?.map(s => ({
            label: language === 'pt' ? s.name_pt : s.name_en,
            value: s.id,
          })) || []}
          selected={selectedSpecialities}
          onChange={setSelectedSpecialities}
          placeholder="Select specialities..."
          emptyText="No specialities found."
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSaveItemSpecialities}>Save</Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

## Testing Guide

### Prerequisites
1. Run database migrations:
   ```sql
   -- Execute migration_chapter_specialities.sql
   -- Execute migration_item_specialities.sql
   ```
2. Ensure specialities exist in the database
3. Have a budget (orçamento) with uploaded and analyzed Excel file

### Test Cases

#### Test 1: Assign Specialities to Chapter Without Cascade
1. Open a budget's Mapa de Quantidades page
2. Click the Tag icon next to a chapter
3. Select 2-3 specialities
4. **Do NOT** check "Apply to all items in this chapter"
5. Click Save
6. **Expected**: 
   - Chapter should show assigned specialities in tooltip
   - Items should NOT have any specialities
7. **Verify**: Hover over chapter Tag icon to see specialities

#### Test 2: Assign Specialities to Chapter With Cascade
1. Click the Tag icon next to a chapter
2. Select 2-3 specialities
3. **Check** "Apply to all items in this chapter"
4. Click Save
5. **Expected**:
   - Chapter should show assigned specialities
   - All items in the chapter should inherit the same specialities
6. **Verify**: 
   - Hover over chapter Tag icon
   - Hover over each item's Tag icon
   - All should show the same specialities

#### Test 3: Override Item Specialities
1. After Test 2, click the Tag icon on a specific item
2. Select different specialities
3. Click Save
4. **Expected**:
   - Item should show new specialities
   - Other items should still show chapter's specialities
5. **Verify**: Hover over the modified item vs. other items

#### Test 4: Remove All Specialities
1. Click the Tag icon on a chapter or item
2. Clear all selections in the multi-select
3. Click Save
4. **Expected**: Tooltip should show "No specialities assigned"

#### Test 5: Language Toggle
1. Assign specialities with speciality names in both languages
2. Toggle language preference (EN ↔ PT)
3. **Expected**: Speciality names in tooltips should change language

#### Test 6: Database Validation
After assigning specialities:
```sql
-- Check chapter specialities
SELECT * FROM chapter_specialities WHERE chapter_id = '<chapter-id>';

-- Check item specialities
SELECT * FROM item_specialities WHERE item_id = '<item-id>';

-- View with speciality names
SELECT 
  cs.chapter_id,
  s.name_en,
  s.name_pt
FROM chapter_specialities cs
JOIN specialities s ON cs.speciality_id = s.id
WHERE cs.chapter_id = '<chapter-id>';
```

## Migration Instructions

### Step 1: Backup Database
```bash
# Create a backup before running migrations
pg_dump -h <host> -U <user> -d <database> > backup_before_specialities.sql
```

### Step 2: Run Migrations
In Supabase SQL Editor or via CLI:

```sql
-- Migration 1: Chapter Specialities
\i migration_chapter_specialities.sql

-- Migration 2: Item Specialities
\i migration_item_specialities.sql
```

### Step 3: Verify Migrations
```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('chapter_specialities', 'item_specialities');

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('chapter_specialities', 'item_specialities');

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('chapter_specialities', 'item_specialities');
```

### Step 4: Test Permissions
```sql
-- As authenticated user, test permissions
INSERT INTO chapter_specialities (chapter_id, speciality_id) 
VALUES ('<test-chapter-id>', '<test-speciality-id>');

SELECT * FROM chapter_specialities WHERE chapter_id = '<test-chapter-id>';

DELETE FROM chapter_specialities WHERE chapter_id = '<test-chapter-id>';
```

## Troubleshooting

### Issue 1: Tables Not Found
**Error**: `relation "chapter_specialities" does not exist`

**Solution**: Ensure migrations were run successfully:
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'chapter_specialities';
```

### Issue 2: Permission Denied
**Error**: `permission denied for table chapter_specialities`

**Solution**: Check RLS policies are in place:
```sql
SELECT * FROM pg_policies WHERE tablename = 'chapter_specialities';
```

If policies are missing, re-run the migration script.

### Issue 3: Cascade Not Working
**Symptom**: Checking "Apply to all items" doesn't update items

**Diagnosis**: Check browser console for errors

**Common causes**:
1. Items query not returning data
2. Chapter ID mismatch
3. Mutation error

**Solution**: Check mutation logs and verify `items` array is populated.

### Issue 4: Specialities Not Displaying
**Symptom**: Tooltips show "No specialities assigned" even after saving

**Diagnosis**: 
1. Check if data was saved: Query the database directly
2. Check if queries are invalidating: Look for `queryClient.invalidateQueries` calls
3. Check if query is enabled: Verify `enabled` condition in useQuery

**Solution**: 
- Ensure mutations call `invalidateQueries` on success
- Verify query keys match between queries and invalidations

## Future Enhancements

### 1. Bulk Operations
- Select multiple chapters/items and assign specialities to all at once
- Copy specialities from one chapter to another

### 2. Speciality Templates
- Save common speciality combinations as templates
- Quick apply templates to chapters/items

### 3. Export Enhancement
- Include specialities in Excel export
- Add specialities column to exported files

### 4. Filtering and Reporting
- Filter chapters/items by specialities
- Generate reports grouped by specialities

### 5. Validation Rules
- Warn if items have different specialities than their chapter
- Suggest specialities based on item description

## Related Files

- `src/pages/MapaQuantidades.tsx` - Main implementation
- `migration_chapter_specialities.sql` - Database migration for chapters
- `migration_item_specialities.sql` - Database migration for items
- `src/components/ui/multi-select.tsx` - Multi-select component

## Support

For issues or questions:
1. Check this documentation
2. Review the Troubleshooting section
3. Check GitHub issues for similar problems
4. Create a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser console errors
   - Database query results
