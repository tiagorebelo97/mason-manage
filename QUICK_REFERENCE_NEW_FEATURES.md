# Quick Reference Card - New Features

## 🏷️ Specialities Feature

### Quick Actions

| Action | Steps |
|--------|-------|
| **Add specialities to chapter** | 1. Click 🏷️ on chapter header<br>2. Select specialities<br>3. Dialog closes automatically |
| **Add specialities to item** | 1. Click speciality button on item row<br>2. Select specialities<br>3. Dialog closes automatically |
| **Reset item to inherit from chapter** | 1. Click speciality button on item<br>2. Remove all selections<br>3. Item now shows "(inherited)" |

### Button States Quick Reference

```
🏷️ None           = No specialities
🏷️ 1 (inherited)  = 1 speciality from chapter
🏷️ 3 (inherited)  = 3 specialities from chapter
🏷️ 1              = 1 custom speciality
🏷️ 5              = 5 custom specialities
```

### Tips

- ✨ Items inherit chapter specialities by default
- 🎯 Override individual items as needed
- 🔄 Remove all item specialities to revert to inheritance
- 🔍 Use search in dropdown for quick finding

---

## 🗑️ Image Deletion Fix

### What Changed

When you delete an Excel file, all associated images are now automatically deleted from storage.

**Before:** Images remained in storage (orphaned)  
**After:** Images are cleaned up automatically ✅

### No Action Required

This fix works automatically when you:
1. Click 🗑️ (trash) button on an Excel file
2. Confirm deletion
3. Images are deleted along with the data

---

## 📊 TOTAIS Column (Confirmed Working)

The system correctly uses the "TOTAIS" column for quantity values.

**Priority:**
1. TOTAIS column (primary)
2. QT column (fallback)

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between buttons |
| `Enter` | Open dialog |
| `Esc` | Close dialog |
| `↑` `↓` | Navigate in dropdown |
| `Space` | Select/deselect item |

---

## Need Help?

📚 **Full Documentation:**
- `SPECIALITIES_FEATURE_DOCUMENTATION.md` - Complete guide
- `VISUAL_GUIDE_SPECIALITIES.md` - Visual examples
- `IMPLEMENTATION_SUMMARY_SPECIALITIES.md` - Technical details

🐛 **Troubleshooting:**
- Specialities not showing? Check that they exist in the Specialities page
- Changes not saving? Check browser console for errors
- Items not inheriting? Ensure item has no custom specialities set

---

## Database Migration Required

⚠️ **Before using this feature, run the database migration:**

```sql
-- Execute in Supabase SQL Editor
-- File: migration_specialities_orcamento.sql
```

This creates the necessary tables for storing speciality assignments.

---

## Summary of All Changes

✅ **Specialities Feature** - Organize work by construction specialty  
✅ **Image Deletion Fix** - Automatic cleanup of orphaned images  
✅ **TOTAIS Column** - Correctly prioritized (already working)

---

## Support

If you encounter any issues:
1. Check the documentation files
2. Verify database migration was run
3. Check browser console for errors
4. Contact the development team

---

*Last Updated: [Current Date]*  
*Version: 1.0.0*
