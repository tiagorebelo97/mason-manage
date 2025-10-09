# Quick Setup Guide

## What Was Fixed

✅ **Company table rows disappearing** - Fixed! The table now shows cached data during background updates.

✅ **Contact person's company not showing** - Fixed! The read-only contact view now displays the person's company.

✅ **File deletion button** - Added! You can now delete uploaded files with a trash button.

✅ **Actual file upload** - Implemented! Files are now uploaded to Supabase storage instead of using placeholder URLs.

## Setup Required

### Supabase Storage Bucket

Before using the file upload feature, you need to create a storage bucket in Supabase:

#### Option 1: Using Supabase Dashboard (Easiest)

1. Log in to your Supabase dashboard at https://supabase.com
2. Select your project
3. Go to **Storage** in the left sidebar
4. Click **New bucket**
5. Set the following:
   - **Name**: `orcamento-files`
   - **Public bucket**: ✅ (checked)
   - **File size limit**: `50 MB` (or as needed)
   - **Allowed MIME types**: Leave default or add:
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
     - `application/vnd.ms-excel`
6. Click **Create bucket**
7. Go to **Policies** tab for the bucket
8. Add policies (see option 2 below for SQL) or use the UI to add:
   - SELECT for authenticated users
   - INSERT for authenticated users
   - DELETE for authenticated users
   - SELECT for public (optional, for public file access)

#### Option 2: Using SQL Editor (Advanced)

1. Log in to your Supabase dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste the contents of `storage_bucket_setup.sql` from this repository
5. Click **Run**

### Verification

After setup, verify the storage bucket is working:

1. Go to **Storage** in Supabase dashboard
2. You should see the `orcamento-files` bucket
3. Try uploading a file through the application
4. Check the bucket - you should see your file organized in folders by orcamento ID

## Files Changed

- `src/components/companies/CompaniesTable.tsx` - Fixed table rows disappearing
- `src/components/companies/ContactDialog.tsx` - Added company display in read-only mode
- `src/pages/MapaQuantidades.tsx` - Added file upload/delete functionality

## New Features

### File Management (MapaQuantidades)

- **Upload**: Click "Upload File" to select and upload an Excel file
- **Delete**: Click the trash icon next to the file name to delete the file and all its data
- **Analyze**: Click "Analyze" to process the file and extract chapters (existing feature, now works with real uploads)

### Contact Details

- When viewing a contact for a person, you'll now see their associated company (if any)

## Troubleshooting

### File Upload Fails

**Error**: "Failed to upload file"

**Solution**: 
- Ensure the `orcamento-files` bucket exists in Supabase Storage
- Check that storage policies allow authenticated users to upload
- Verify file size is under the limit (default 50MB)

### Files Not Deleting

**Error**: "Failed to delete file"

**Solution**:
- Check storage policies allow authenticated users to delete
- Verify the file exists in storage
- Note: The file record will still be deleted from the database even if storage deletion fails

### Table Still Disappearing

**Issue**: Company table rows still disappear when opening dialogs

**Solution**:
- Clear your browser cache
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors
- Ensure you're using the latest code from this PR

## Next Steps

1. Set up the Supabase storage bucket (see above)
2. Test the fixes in your development environment
3. Deploy to production once verified
4. Monitor for any issues

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Supabase storage bucket setup
3. Review the `FIXES_SUMMARY.md` file for detailed technical information
4. Check Supabase storage policies are correctly configured
