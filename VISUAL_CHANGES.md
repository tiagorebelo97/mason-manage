# Visual Changes Guide

This document describes what the visual changes look like to the end user.

## 1. Contacts Table - Type Badges

### What You'll See:
In the Contacts table, the Name column now shows a badge before each contact name:

```
┌─────────────────────────────────────────────────────────────┐
│ Name                 │ Company    │ Email         │ Actions │
├─────────────────────────────────────────────────────────────┤
│ [👤 Person] John Doe │ Acme Corp  │ john@...     │ 👁 ✏️ 🗑 │
│ [🏢 Company] ABC Ltd │ —          │ info@...     │ 👁 ✏️ 🗑 │
│ [👤 Person] Jane Doe │ XYZ Inc    │ jane@...     │ 👁 ✏️ 🗑 │
└─────────────────────────────────────────────────────────────┘
```

**Color Scheme:**
- Person badges: Blue/Secondary variant with user icon
- Company badges: Gray/Outline variant with building icon

## 2. Sidebar Navigation

### Before:
```
📊 Dashboard
🏢 Companies
📋 Specialities
🎯 Main Specialties
📦 Brands
📍 Locations      ← REMOVED
📞 nav.contacts   ← Was translated
```

### After:
```
📊 Dashboard
🏢 Companies
📋 Specialities
🎯 Main Specialties
📦 Brands
📞 Contacts       ← Hardcoded text
```

## 3. Companies Table

### Before:
```
┌────────────────────────────────────────────────────────────────┐
│ Name    │ Comments  │ Speciality │ Brands │ Locations │ Actions│
├────────────────────────────────────────────────────────────────┤
│ ABC Ltd │ Good work │ Plumbing   │ BrandX │ Lisbon    │ ✏️ 🗑  │
└────────────────────────────────────────────────────────────────┘
```

### After:
```
┌──────────────────────────────────────────────────────────┐
│ Name    │ Speciality │ Brands │ Locations │ Actions    │
├──────────────────────────────────────────────────────────┤
│ ABC Ltd │ Plumbing   │ BrandX │ Lisbon    │ ✏️ 🗑       │
└──────────────────────────────────────────────────────────┘
```

Note: Comments column has been completely removed.

## 4. Contact Dialog - Compact Design

### Before (max-width: 672px):
```
┌──────────────────────────────────────────────────┐
│                  Edit Contact                     │
│                                                   │
│  Contact belongs to: ○ Person  ○ Company         │
│                                                   │
│  Email: [________________]  Code: [____]         │
│                                                   │
│  Website: [____________________]                 │
│                                                   │
│  Mobile: [__________]  Fax: [__________]         │
│                                                   │
│  Address: [___________________]                  │
│                                                   │
│                        [Cancel] [Save]           │
└──────────────────────────────────────────────────┘
```

### After (max-width: 576px, tighter spacing):
```
┌─────────────────────────────────────────────┐
│              Edit Contact                    │
│                                              │
│  Contact belongs to: ○ Person  ○ Company    │
│                                              │
│  Email: [_____________________]             │
│                                              │
│  Mobile: [________________] Code: [____]    │
│                                              │
│  Website: [_____________________]           │
│                                              │
│  Fax: [_____________________]               │
│                                              │
│  Address: [_____________________]           │
│                                              │
│                   [Cancel] [Save]           │
└─────────────────────────────────────────────┘
```

**Key Differences:**
- Narrower width (576px vs 672px)
- Tighter vertical spacing (0.75rem vs 1rem)
- Mobile and country code on same row with better proportions
- Email gets full width
- Scrollable on small screens (max-h-90vh)

## 5. Edit Contact - Company Selection for Person

### Before:
When editing a person contact, you could only view their information but not change which company they work for.

### After:
```
┌─────────────────────────────────────────────┐
│           Edit Contact - Person              │
│                                              │
│  Contact belongs to: ⦿ Person  ○ Company    │
│  (disabled when editing)                     │
│                                              │
│  Person: [John Doe ▼] (disabled)            │
│                                              │
│  Company: [Acme Corp        ▼] ← NEW!       │
│  (can now be changed)                        │
│                                              │
│  Email: [john@example.com]                  │
│  ...                                         │
│                                              │
│                   [Cancel] [Save]           │
└─────────────────────────────────────────────┘
```

**Dropdown options:**
- No company
- ABC Company
- XYZ Corporation
- ... (all available companies)

## Expected User Experience

### Contacts Table
1. Open contacts page
2. Immediately see visual distinction between person and company contacts via badges
3. Person contacts have blue badge with user icon
4. Company contacts have gray badge with building icon

### Sidebar
1. Look at left sidebar
2. See "Contacts" menu item (not translated)
3. Locations menu item is gone

### Companies Table
1. Open companies page
2. See cleaner table without comments column
3. More space for other columns
4. Easier to scan information

### Contact Dialogs
1. Click edit on any contact
2. See more compact, focused dialog
3. If editing a person contact, see company dropdown is now editable
4. Can change which company the person works for
5. Dialog fits better on screen, with scrolling if needed

### Company Selection Flow
1. Edit a person contact (e.g., "John Doe")
2. See current company (e.g., "Acme Corp")
3. Click company dropdown
4. Select different company or "No company"
5. Click Save
6. Person's company association is updated

## Browser Compatibility
All changes use standard CSS and React components that work in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Accessibility
- ✅ Badges have proper semantic HTML
- ✅ Icons have descriptive text
- ✅ Form labels are properly associated
- ✅ Keyboard navigation works correctly
- ✅ Screen readers can announce badge types
