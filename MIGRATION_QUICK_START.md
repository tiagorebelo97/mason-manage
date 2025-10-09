# Quick Start Guide for Tabs Migration

## What Changed?

The Mapa Quantidades feature has been improved to:
1. ✅ Analyze files from the database/storage (more reliable)
2. ✅ Show orçamento name as the main title
3. ✅ Store tabs in the database (better data management)
4. ✅ Fix relationships between orçamentos → tabs → chapters

## Database Migration Required

**IMPORTANT**: You must run the database migration to use the new version.

### Step-by-Step Migration

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run the Migration Script**
   - Copy the contents of `migration_tabs.sql`
   - Paste into the SQL Editor
   - Click "Run"

3. **Verify the Migration**
   - The script will output verification queries at the end
   - Check that all chapters have a `tab_id`
   - Verify the structure looks correct

### What the Migration Does

```
Before:
orcamentos (1) ──→ (many) chapters
  └─ chapters have: sheet_name, orcamento_id

After:
orcamentos (1) ──→ (many) tabs (1) ──→ (many) chapters
  └─ tabs have: name, display_order
  └─ chapters have: tab_id (no more sheet_name or orcamento_id)
```

### If You Have Existing Data

The migration script will:
1. Create tabs from your existing `sheet_name` values
2. Link your chapters to the new tabs
3. Remove the old `sheet_name` column
4. Add proper constraints and indexes

### If You're Starting Fresh

The migration script will:
1. Create the new tables
2. Skip data migration (nothing to migrate)
3. Set up constraints and indexes

## Testing After Migration

1. **Upload a file** to an orçamento
2. **Click "Analyze"** - should work correctly now
3. **Check tabs** - should see tabs from your Excel sheets
4. **Check chapters** - should be grouped under tabs

## New Behavior

### File Analysis
- Files are now analyzed from storage
- More reliable than before
- No longer depends on local file state

### Page Layout
- **Title**: Shows your orçamento name (e.g., "Project Alpha")
- **Subtitle**: Shows "Mapa de Quantidades"

### Tabs
- Tab names saved in database
- Can be reordered (via `display_order`)
- Can be renamed independently of Excel sheet names

## Troubleshooting

### "File analyzed successfully" but nothing appears
- Check that the migration ran successfully
- Verify tabs were created: `SELECT * FROM orcamento_tabs;`
- Verify chapters have tab_id: `SELECT * FROM orcamento_chapters;`

### Old data not showing
- The migration should have preserved your data
- Check the verification queries at the end of migration script
- If needed, re-run the migration (it's idempotent)

### Error: "column sheet_name does not exist"
- The migration removed this column
- This is expected and correct
- The code now uses `tab_id` instead

## Rollback (if needed)

If you need to rollback:

```sql
-- Add back old columns
ALTER TABLE orcamento_chapters ADD COLUMN sheet_name VARCHAR(255);
ALTER TABLE orcamento_chapters ADD COLUMN orcamento_id UUID;

-- Copy data back from tabs
UPDATE orcamento_chapters c
SET sheet_name = t.name,
    orcamento_id = t.orcamento_id
FROM orcamento_tabs t
WHERE c.tab_id = t.id;

-- Make columns NOT NULL
ALTER TABLE orcamento_chapters ALTER COLUMN sheet_name SET NOT NULL;
ALTER TABLE orcamento_chapters ALTER COLUMN orcamento_id SET NOT NULL;

-- Add foreign key
ALTER TABLE orcamento_chapters 
  ADD CONSTRAINT fk_orcamento 
  FOREIGN KEY (orcamento_id) 
  REFERENCES orcamentos(id) 
  ON DELETE CASCADE;

-- Remove tab_id
ALTER TABLE orcamento_chapters DROP COLUMN tab_id;

-- Drop tabs table
DROP TABLE orcamento_tabs;
```

## Support

If you encounter issues:
1. Check the verification queries output
2. Review `DATABASE_TABS_MIGRATION.md` for detailed explanation
3. Review `MAPA_QUANTIDADES_IMPROVEMENTS.md` for technical details
4. Open an issue with the error message and verification query results
