# Quick Start Guide

This guide will help you get the new features up and running.

## Overview

This PR adds three major features to the mason-manage application:

1. **Main Specialties** - Categorize specialties into main groups
2. **Brands** - Manage construction brands and suppliers with specialties and company associations
3. **Enhanced Specialties** - Link specialties to main specialties

## Setup Instructions

### 1. Database Setup

Before using the new features, you need to run the database migrations in your Supabase project:

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the `DATABASE_MIGRATIONS_NEEDED.md` file in this repository
4. Copy and paste the SQL scripts in the following order:
   - Create `main_specialties` table
   - Create `brands` table
   - Create `brand_specialities` table
   - Create `brand_companies` table
   - Alter `specialities` table to add `main_specialty_id`
   - Apply Row Level Security policies (if needed)

### 2. Update TypeScript Types (Optional)

The TypeScript types have already been updated in this PR. However, if you make any changes to the database schema, regenerate the types:

```bash
supabase gen types typescript --project-id <your-project-id> > src/integrations/supabase/types.ts
```

### 3. Build and Run

```bash
# Install dependencies (if not already done)
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## Features Overview

### Main Specialties

**Access**: Click "Main Specialties" in the sidebar (Layers icon)

**Features**:
- Create main specialty categories with type and name
- Bilingual support (English/Portuguese) with auto-translation
- Search and sort capabilities
- Edit and delete operations

**Example Use Cases**:
- Type: "Construction", Main Specialty: "Structural Work"
- Type: "Electrical", Main Specialty: "Power Systems"
- Type: "Plumbing", Main Specialty: "Water Supply"

### Brands

**Access**: Click "Brands" in the sidebar (Package icon)

**Features**:
- Add brands with name, website, and official email
- Associate brands with multiple specialties
- Associate brands with multiple companies
- View, edit, and delete operations
- Search across all fields
- Sort by name, website, or email

**Example Use Cases**:
- Create a brand for "ACME Construction Supplies"
- Link it to relevant specialties (e.g., "Concrete", "Steel")
- Associate it with companies that use this brand

### Enhanced Specialties

**Access**: Click "Specialities" in the sidebar (List icon)

**New Feature**:
- When creating or editing a specialty, you can now select a main specialty from a dropdown
- This creates a hierarchical relationship (optional)

**Example**:
- Main Specialty: "Structural Work"
- Specialty: "Concrete Reinforcement"
- Specialty: "Steel Framing"

## Navigation Structure

```
Home (Companies)
├── Specialities
├── Main Specialties (NEW)
└── Brands (NEW)
```

## User Interface

### Common UI Patterns

All features follow consistent patterns:

1. **Table View**
   - Search bar at the top
   - Sortable columns (click headers)
   - Action buttons (View/Edit/Delete) on each row

2. **Dialogs/Forms**
   - Clear form validation
   - Required fields marked
   - Cancel and Save/Create buttons
   - Loading states during operations

3. **Multi-Select Dropdowns**
   - Searchable
   - Selected items shown as badges
   - Easy removal by clicking badge X

### Bilingual Support

The application automatically:
- Translates between English and Portuguese
- Detects your preferred language
- Shows content in your selected language

## Data Relationships

```
Main Specialties
    ↓ (one-to-many)
Specialties
    ↕ (many-to-many)
Companies

Brands
    ↕ (many-to-many)
Specialties

Brands
    ↕ (many-to-many)
Companies
```

## Tips and Best Practices

1. **Start with Main Specialties**: Create your main specialty categories first before adding specific specialties
2. **Link Specialties**: After creating main specialties, edit your existing specialties to link them
3. **Brands Setup**: Create brands and then associate them with relevant specialties and companies
4. **Use Search**: All tables have search functionality - use it to quickly find what you need
5. **Bulk Operations**: Use the multi-select dropdowns to efficiently associate multiple items

## Troubleshooting

### "No data appears in the tables"
- Ensure database migrations have been run
- Check that RLS policies are configured correctly
- Verify you're logged in with proper permissions

### "Cannot create new items"
- Check database connection
- Verify RLS policies allow INSERT operations
- Check browser console for error messages

### "Translation not working"
- Ensure you have internet connection (uses translation API)
- Check translation service configuration

## Support

For issues or questions:
1. Check the `IMPLEMENTATION_SUMMARY.md` for technical details
2. Review the `DATABASE_MIGRATIONS_NEEDED.md` for schema information
3. Check the browser console for error messages
4. Verify Supabase connection and permissions

## What's Next?

Now that these features are implemented, you can:
1. Populate your main specialties
2. Link existing specialties to main specialties
3. Add your brands and their associations
4. Explore the relationships between companies, brands, and specialties
