# User Migration Guide - Cache Clear Fix

## What Changed?

We fixed an issue where Excel file data would disappear after clearing your browser cache. Now, all your analyzed data is safely stored in the database and won't be lost when you clear your cache.

## What You Need to Do

### Step 1: Apply Database Migration (Required)

**For Administrators/Developers:**

1. Open your Supabase project
2. Go to SQL Editor
3. Run the migration file `migration_articles.sql` (found in project root)
4. Wait for "Success" message

**What this does:**
- Creates a new table to store article data permanently
- No existing data is affected
- Takes only a few seconds

### Step 2: Re-Analyze Existing Files (Optional but Recommended)

**For all users who have already uploaded files:**

Your existing files still work, but to take advantage of the fix:

1. Go to each Orcamento
2. Delete the existing file (click the trash icon)
3. Re-upload the same Excel file
4. Click "Analyze" button
5. Wait for analysis to complete

**Why do this?**
- Moves your data from browser storage to database
- Makes your data persistent even after clearing cache
- One-time process per file

**Not urgent:**
- Old files continue to work normally
- You can do this whenever convenient
- Only affects what happens when you clear cache

### Step 3: Verify Everything Works

1. After re-analyzing a file, try this test:
   - Open browser Developer Tools (F12)
   - Go to Application tab
   - Click "Clear site data"
   - Reload the page
   - Your articles should still be there! ✅

2. If articles disappeared, you may need to re-analyze the file

## Frequently Asked Questions

### Q: Will I lose any data?
**A:** No. The migration is completely safe. Existing data remains unchanged.

### Q: Do I need to re-upload all my files immediately?
**A:** No. Your existing files continue to work. Re-upload when convenient.

### Q: What happens if I don't re-analyze my files?
**A:** They still work normally. However, if you clear your browser cache, you'll need to re-analyze those files to see the data again.

### Q: How do I know if a file has been migrated?
**A:** After clearing your browser cache:
- **Migrated files**: Articles still appear (data in database)
- **Old files**: Articles disappear (data was only in cache)

### Q: Can I clear my browser cache now?
**A:** Yes! After:
1. Database migration is applied
2. Files are re-analyzed

Your data will persist even after clearing cache.

### Q: Will this affect performance?
**A:** No negative impact. The application may even load faster since data is properly indexed in the database.

### Q: What if something goes wrong?
**A:** Contact your administrator. The old code can be restored if needed, and you can always re-analyze files.

## For Administrators

### Deployment Checklist

- [ ] Apply database migration in Supabase
- [ ] Deploy updated code to production
- [ ] Test with a sample file
- [ ] Clear cache and verify persistence
- [ ] Notify users about re-analyzing files
- [ ] Monitor for any issues

### Monitoring

Check these metrics after deployment:

1. **Database growth**
   ```sql
   SELECT COUNT(*) as total_articles,
          pg_size_pretty(pg_total_relation_size('orcamento_articles')) as table_size
   FROM orcamento_articles;
   ```

2. **Query performance**
   ```sql
   SELECT schemaname, tablename, indexname, idx_scan
   FROM pg_stat_user_indexes
   WHERE tablename = 'orcamento_articles';
   ```

3. **User adoption**
   - Track how many files get re-analyzed
   - Monitor support requests related to cache clearing

### Rollback Procedure

If issues arise:

1. **Database rollback:**
   ```sql
   DROP TABLE IF EXISTS orcamento_articles CASCADE;
   ```

2. **Code rollback:**
   ```bash
   git revert <commit-hash>
   git push
   ```

3. **User communication:**
   - Inform users the issue is resolved
   - Files will use old storage method (sessionStorage)
   - No data loss

## Benefits

After migration:
- ✅ No data loss when clearing cache
- ✅ Better data persistence
- ✅ Proper database storage
- ✅ Easier backups
- ✅ More reliable system

## Support

If you experience any issues:
1. Check this guide first
2. Try re-analyzing the affected file
3. Contact your administrator
4. Provide details: which file, what error, when it occurred

---

**Need Help?** Contact your system administrator or create an issue in the project repository.
