# PR: Fix Dialog Issues and File Upload

## Quick Summary

This PR fixes 4 reported issues:
1. ✅ Company table rows disappearing when opening dialog
2. ✅ Contact person's company not showing in view
3. ✅ Missing file delete button  
4. ✅ File upload storing only metadata (now uploads actual files)

## Files Changed
- `src/components/companies/CompaniesTable.tsx` - Fixed loading state
- `src/components/companies/ContactDialog.tsx` - Added company display
- `src/pages/MapaQuantidades.tsx` - Implemented file storage & delete

## ⚠️ Setup Required
Create Supabase storage bucket `orcamento-files` (see SETUP_GUIDE.md)

## Documentation
- **SETUP_GUIDE.md** - How to setup and test
- **FIXES_SUMMARY.md** - Technical details
- **VISUAL_CHANGES_GUIDE.md** - Visual explanations
- **storage_bucket_setup.sql** - Storage setup SQL

## Testing
See SETUP_GUIDE.md for complete testing checklist.
