# Quick Reference: Fixing "Failed to Analyze File" Error

## Problem
Error message: **"Falha ao analisar ficheiro"** (Failed to analyze file)  
Cause: Item descriptions longer than 1000 characters

## Solution (3 Steps)

### Step 1: Apply Database Migration

Open your **Supabase SQL Editor** and run:

```sql
ALTER TABLE orcamento_items ALTER COLUMN descricao TYPE TEXT;
```

### Step 2: Verify the Change

Run this query to confirm:

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'orcamento_items' AND column_name = 'descricao';
```

**Expected result:**
- `data_type`: `text`
- `character_maximum_length`: `NULL` (unlimited)

### Step 3: Test

1. Upload an Excel file with a long description (> 1000 characters)
2. Click "Analisar" (Analyze)
3. File should analyze successfully ✅

## What Changed?

**Before:** `descricao VARCHAR(1000)` - Max 1000 characters  
**After:** `descricao TEXT` - Unlimited characters

## Files in This Fix

- `migration_descricao_text.sql` - SQL migration script
- `DESCRICAO_SIZE_FIX.md` - Detailed documentation
- `QUICK_REFERENCE_DESCRICAO_FIX.md` - This quick reference guide

## Benefits

✅ No more "Failed to analyze" errors for long descriptions  
✅ Complete data import - nothing gets truncated  
✅ Backward compatible - existing data works fine  
✅ No application code changes needed

## Need Help?

See `DESCRICAO_SIZE_FIX.md` for detailed explanation and troubleshooting.
