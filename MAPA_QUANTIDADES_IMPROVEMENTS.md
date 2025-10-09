# Mapa Quantidades Feature Improvements

## Overview
This document describes the improvements made to the Mapa Quantidades (Quantity Map) feature to address the following requirements:

1. File analysis now reads from the database/storage instead of local file
2. Page title and subtitle have been swapped
3. Tab names are now stored in the database
4. Database relationships have been fixed to properly represent the hierarchy

## Changes Summary

### 1. File Analysis from Database
**Problem**: When clicking "Analyze", the file was being read from a local file object that may no longer exist, causing the analysis to fail silently.

**Solution**: 
- Modified `analyzeMutation` to accept a `fileId` instead of a `File` object
- The mutation now:
  1. Queries the database for file metadata
  2. Downloads the file from Supabase storage using the stored URL
  3. Reads and analyzes the downloaded file
  4. Creates tabs and chapters in the database

**Code Changes**:
```tsx
// Before
const analyzeMutation = useMutation({
  mutationFn: async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    // ... analyze file
  }
});

// After
const analyzeMutation = useMutation({
  mutationFn: async (fileId: string) => {
    // Get file from database
    const { data: fileData } = await supabase
      .from("orcamento_files")
      .select("*")
      .eq("id", fileId)
      .single();
    
    // Download from storage
    const { data: fileBlob } = await supabase.storage
      .from('orcamento-files')
      .download(filePath);
    
    // Analyze downloaded file
    const arrayBuffer = await fileBlob.arrayBuffer();
    // ... analyze file
  }
});
```

### 2. Page Title and Subtitle Swapped
**Problem**: The title was "Mapa de Quantidades" and subtitle was the orçamento name.

**Solution**: Swapped them so the title is the orçamento name and subtitle is "Mapa de Quantidades".

**Code Changes**:
```tsx
// Before
<h1 className="text-4xl font-bold text-foreground mb-2">
  {t('orcamento.mapaQuantidades')}
</h1>
<p className="text-muted-foreground">{orcamento?.name}</p>

// After
<h1 className="text-4xl font-bold text-foreground mb-2">
  {orcamento?.name}
</h1>
<p className="text-muted-foreground">{t('orcamento.mapaQuantidades')}</p>
```

### 3. Tabs Stored in Database
**Problem**: Tabs were created dynamically from sheet names but not stored in the database, making them ephemeral and not queryable.

**Solution**: 
- Created a new `orcamento_tabs` table
- Modified the analysis process to create tab records for each sheet
- Tabs now have proper database persistence and relationships

**New Database Table**:
```sql
CREATE TABLE orcamento_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(orcamento_id, name)
);
```

### 4. Fixed Database Relationships
**Problem**: The schema had chapters directly linked to orçamentos with a `sheet_name` field, but the requirement is:
- Each orçamento can have multiple tabs
- Each tab belongs to one orçamento  
- Each chapter belongs to one tab
- Each tab can have multiple chapters

**Solution**:
- Updated `orcamento_chapters` table to reference `tab_id` instead of having `sheet_name`
- Removed direct relationship between chapters and orçamentos
- Added proper foreign key from chapters to tabs

**Schema Changes**:
```sql
-- Add tab reference to chapters
ALTER TABLE orcamento_chapters ADD COLUMN tab_id UUID REFERENCES orcamento_tabs(id) ON DELETE CASCADE;

-- Remove old sheet_name column (after data migration)
ALTER TABLE orcamento_chapters DROP COLUMN sheet_name;
ALTER TABLE orcamento_chapters DROP COLUMN orcamento_id;

-- Make tab_id required
ALTER TABLE orcamento_chapters ALTER COLUMN tab_id SET NOT NULL;

-- Add new unique constraint
ALTER TABLE orcamento_chapters ADD CONSTRAINT orcamento_chapters_tab_id_chapter_number_key UNIQUE(tab_id, chapter_number);
```

## TypeScript Type Changes

### New Types Added
```tsx
type OrcamentoTab = {
  id: string;
  orcamento_id: string;
  name: string;
  display_order: number;
};
```

### Updated Types
```tsx
// Before
type OrcamentoChapter = {
  id: string;
  orcamento_id: string;
  sheet_name: string;
  chapter_number: string;
  chapter_name: string;
};

// After
type OrcamentoChapter = {
  id: string;
  tab_id: string;
  chapter_number: string;
  chapter_name: string;
};
```

## Component Changes

### New Queries
- Added `tabs` query to fetch all tabs for an orçamento
- Modified `chapters` query to work without orçamento_id filter

### Updated Mutations
1. **uploadMutation**: Removed uploadedFile state management
2. **analyzeMutation**: 
   - Changed to accept fileId instead of File
   - Downloads file from storage
   - Creates tabs before creating chapters
   - Maps chapters to their respective tabs
3. **deleteMutation**: Updated to delete tabs instead of chapters (cascades to chapters)

### Render Logic
- Changed from grouping chapters by `sheet_name` to grouping by `tab_id`
- Updated tabs rendering to use database tab records
- Tab names come from database instead of being derived

## Migration Path

For existing installations with data, follow the migration steps in `DATABASE_TABS_MIGRATION.md`:

1. Create the `orcamento_tabs` table
2. Add `tab_id` column to `orcamento_chapters`
3. Migrate existing data (create tabs from sheet_name, link chapters to tabs)
4. Remove old `sheet_name` column
5. Add RLS policies for the new table

## Benefits

1. **Reliability**: File analysis works consistently because files are read from storage
2. **Data Integrity**: Tabs are now proper database entities with relationships
3. **Flexibility**: Tab names can be renamed independently of sheet names
4. **Query Performance**: Can query tabs and chapters separately
5. **User Experience**: Title shows orçamento name prominently

## Testing

- ✅ Build successful (no TypeScript errors)
- ✅ Linting passes (no errors in MapaQuantidades.tsx)
- ✅ Code follows existing patterns in the repository
- ✅ Minimal changes approach - only modified what was necessary

## Files Modified

1. `src/pages/MapaQuantidades.tsx` - Main component with all the logic changes
2. `DATABASE_TABS_MIGRATION.md` - Migration guide for database changes

## Notes

- The storage bucket `orcamento-files` must be properly configured in Supabase
- Files are stored with path structure: `{orcamento_id}/{timestamp}.{extension}`
- Cascade deletes ensure data consistency when orçamentos or tabs are deleted
- RLS policies need to be applied to the new `orcamento_tabs` table
