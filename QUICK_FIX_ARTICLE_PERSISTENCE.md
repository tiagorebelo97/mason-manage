# Quick Fix Guide: Article Data Persistence

## What Was Fixed?
Articles now persist in the database instead of browser sessionStorage.

## How to Apply the Fix

### 1. Run the Database Migration
```sql
-- Copy and paste migration_orcamento_articles.sql into Supabase SQL Editor
-- Then click "Run"
```

### 2. Deploy the Code Changes
```bash
# The code changes are in src/pages/MapaQuantidades.tsx
# Deploy to your environment (Vercel, etc.)
git pull origin copilot/fix-quantity-map-table-data
npm install
npm run build
```

### 3. Test
1. Upload an Excel file with articles (ARTIGO like "1.1", "2.3")
2. Click "Analisar"
3. Verify articles appear
4. Close browser and reopen
5. Articles should still be visible ✓

## What Changed?

**Before**: 
- Articles stored in sessionStorage ❌
- Lost when browser closes ❌

**After**:
- Articles stored in database ✅
- Persist across sessions ✅

## Files Modified
- `src/pages/MapaQuantidades.tsx` (article persistence logic)
- `migration_orcamento_articles.sql` (new database table)

## No Re-upload Needed for Existing Files
Existing analyzed files will need to be re-analyzed to populate the database with articles.
