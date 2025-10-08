# Contact Management Update - Quick Reference

## 🚀 Quick Start

### 1️⃣ Run Database Migration First
```sql
ALTER TABLE people RENAME COLUMN middle_name TO last_name;
```
👉 See [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md) for details

### 2️⃣ Deploy Code
Deploy the updated application after migration is complete.

### 3️⃣ Test
Follow [TESTING_GUIDE.md](TESTING_GUIDE.md) checklist.

---

## 📋 What Changed?

### Contacts Page
```
Before:                          After:
┌─────────────────┐             ┌─────────────────┐
│ Search          │             │ Search  [Export]│
│                 │             │ [All][Person][Co]│ ← Filter buttons
├─────────────────┤             ├─────────────────┤
│ Owner   Email   │             │ Name   Company  │ ← Company column
│ ↑               │             │ Email   Mobile  │
│ Click row       │             │ [👁] [✏] [🗑]  │ ← Eye icon
│ to view         │             │                 │
└─────────────────┘             └─────────────────┘
```

### Add Contact Form
```
Before:                          After:
┌─────────────────┐             ┌─────────────────┐
│ ○ Person        │             │ ○ Person        │
│ Select Person   │             │ [Select][Create]│ ← New toggle
│ ○ Company       │             │                 │
│                 │             │ When "Create":  │
│ Email           │             │ • First Name *  │ ← New fields
│ Country: +1     │             │ • Last Name     │
│ Mobile          │             │ • Company       │
│ Website         │             │                 │
│ Address         │             │ Email           │
└─────────────────┘             │ Country: +351   │ ← Default PT
                                │ Mobile          │
                                │ Website         │
                                │ Address         │
                                └─────────────────┘
```

### Sidebar
```
Before:              After:
• Dashboard          • Dashboard
• Companies          • Companies
• Specialities       • Specialities
• Main Specialties   • Main Specialties
• Brands             • Brands
• Locations          • Locations
• People       ←     ✗ Removed
• Contacts           • Contacts
```

---

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| **Filters** | All / Person / Company buttons |
| **Export** | Excel export with formatting |
| **Eye Icon** | View-only mode, no edit |
| **Create Person** | Add people directly in contact form |
| **Last Name** | Changed from Middle Name |
| **PT Default** | +351 country code |

---

## 📖 Full Documentation

- **[MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md)** - Database setup
- **[CONTACTS_UPDATE_SUMMARY.md](CONTACTS_UPDATE_SUMMARY.md)** - Detailed changes
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Complete test checklist

---

## ❓ Common Questions

**Q: Do I lose any data?**  
A: No, the migration only renames a column. All data is preserved.

**Q: Can I still access the People page?**  
A: Yes, via direct URL `/people`, but it's removed from the sidebar.

**Q: What if the migration fails?**  
A: See rollback instructions in [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md)

**Q: Does this work in Portuguese?**  
A: Yes, all text is fully translated to Portuguese.

**Q: Can I create companies through contacts?**  
A: No, only people. Companies must be created on the Companies page.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "middle_name not found" | Run database migration |
| Country code not +351 | Clear cache, reload page |
| Export fails | Check console for errors |
| Person creation fails | Ensure First Name is filled |

---

## ✅ Checklist for Go-Live

- [ ] Database migration executed and verified
- [ ] Code deployed to production
- [ ] Test contact creation (person + company)
- [ ] Test filters (All/Person/Company)
- [ ] Test Excel export
- [ ] Verify translations (EN + PT)
- [ ] Check sidebar (no People menu)
- [ ] Test on mobile devices

---

## 📞 Support

For issues or questions:
1. Check [TESTING_GUIDE.md](TESTING_GUIDE.md) troubleshooting section
2. Review browser console for errors
3. Verify database migration completed
4. Check Supabase logs

---

**Version**: 1.0.0  
**Last Updated**: {{ current_date }}  
**Status**: ✅ Ready for Production
