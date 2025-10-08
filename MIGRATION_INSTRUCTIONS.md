# Database Migration Instructions

## Overview
This update changes the `middle_name` column in the `people` table to `last_name` to better reflect the data structure.

## Required Migration

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Rename middle_name to last_name in people table
ALTER TABLE people RENAME COLUMN middle_name TO last_name;
```

## How to Execute

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor (in the left sidebar)
3. Click "New Query"
4. Paste the SQL above
5. Click "Run" to execute the migration

## Verification

After running the migration, you can verify the change by running:

```sql
-- Check the people table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'people' 
ORDER BY ordinal_position;
```

You should see `last_name` instead of `middle_name` in the results.

## Rollback (if needed)

If you need to revert this change:

```sql
-- Rename last_name back to middle_name
ALTER TABLE people RENAME COLUMN last_name TO middle_name;
```

## Notes

- This is a non-destructive change - all existing data will be preserved
- The column is simply being renamed from `middle_name` to `last_name`
- No data migration or transformation is needed
- The application code has been updated to use `last_name` everywhere
