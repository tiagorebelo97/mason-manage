# Testing Guide for Contact Management Updates

## Pre-Deployment Steps

### 1. Database Migration
**CRITICAL**: This must be done BEFORE deploying the code.

1. Log into your Supabase dashboard
2. Navigate to SQL Editor
3. Run the following SQL:
   ```sql
   ALTER TABLE people RENAME COLUMN middle_name TO last_name;
   ```
4. Verify the change:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'people' 
   ORDER BY ordinal_position;
   ```

### 2. Deploy Application
Once the database migration is complete, deploy the updated application code.

## Testing Checklist

### People Management

#### Test 1: View People Table
- [ ] Navigate to the People page (if still accessible via direct URL)
- [ ] Verify the table shows "Last Name" column (not "Middle Name")
- [ ] Verify existing people's last names display correctly
- [ ] Verify search functionality works

#### Test 2: Edit Existing Person
- [ ] Click edit on an existing person
- [ ] Verify the form shows "Last Name" field
- [ ] Change the last name
- [ ] Save and verify the change persists

### Contact Management

#### Test 3: View Contacts Table
- [ ] Navigate to Contacts page
- [ ] Verify the table has these columns: Name, Company, Email, Mobile, Website, Actions
- [ ] Verify the Eye icon appears in the Actions column
- [ ] Click a table row - verify it does NOT open the contact (no pointer cursor)
- [ ] Click the Eye icon - verify it opens read-only contact view

#### Test 4: Contact Filters
- [ ] Verify three filter buttons appear: "All", "Person", "Company"
- [ ] Click "All" - verify all contacts display
- [ ] Click "Person" - verify only person contacts display
- [ ] Click "Company" - verify only company contacts display
- [ ] Search while filters are active - verify both work together

#### Test 5: Create Contact with Existing Person
- [ ] Click "Add Contact" button
- [ ] Select "Person" radio button
- [ ] Click "Select Existing" button
- [ ] Select an existing person from dropdown
- [ ] Fill in contact details (email, mobile, etc.)
- [ ] Verify country code defaults to "+351"
- [ ] Save and verify contact is created

#### Test 6: Create Contact with New Person
- [ ] Click "Add Contact" button
- [ ] Select "Person" radio button
- [ ] Click "Create New" button
- [ ] Verify fields appear: First Name, Last Name, Company
- [ ] Enter first name (required)
- [ ] Enter last name (optional)
- [ ] Select a company (optional)
- [ ] Fill in contact details
- [ ] Verify country code defaults to "+351"
- [ ] Save and verify:
   - [ ] New person is created
   - [ ] New contact is created
   - [ ] Person appears in people list
   - [ ] Contact appears in contacts list with correct company

#### Test 7: Create Contact with Company
- [ ] Click "Add Contact" button
- [ ] Select "Company" radio button
- [ ] Select a company from dropdown
- [ ] Fill in contact details
- [ ] Verify country code defaults to "+351"
- [ ] Save and verify contact is created

#### Test 8: View Contact (Read-Only)
- [ ] Click the Eye icon on any contact
- [ ] Verify the dialog opens
- [ ] Verify all fields are disabled/read-only
- [ ] Verify "Close" button is shown (not "Save")
- [ ] Close the dialog

#### Test 9: Edit Contact
- [ ] Click the edit (pencil) icon on any contact
- [ ] Verify you CAN edit contact details
- [ ] Verify you CANNOT change the person/company selection
- [ ] Make changes
- [ ] Save and verify changes persist

#### Test 10: Excel Export
- [ ] Navigate to Contacts page
- [ ] Verify "Export Excel" button appears
- [ ] Click export without filters - verify all contacts are exported
- [ ] Apply "Person" filter
- [ ] Click export - verify only person contacts are exported
- [ ] Apply search filter
- [ ] Click export - verify only matching contacts are exported
- [ ] Open exported Excel file and verify:
   - [ ] Headers are bold and styled
   - [ ] Rows have alternating colors
   - [ ] Auto-filter is enabled
   - [ ] All data is correct
   - [ ] Columns: Name, Type, Company, Email, Mobile, Website

### Navigation

#### Test 11: Sidebar Navigation
- [ ] Open the sidebar
- [ ] Verify "People" menu item is NOT present
- [ ] Verify "Contacts" menu item IS present
- [ ] Verify all other menu items are still present

### Language Switching

#### Test 12: Portuguese Translations
- [ ] Switch language to Portuguese (PT)
- [ ] Navigate to Contacts page
- [ ] Verify all text is in Portuguese:
   - [ ] Filter buttons: "Todos", "Pessoa", "Empresa"
   - [ ] Table headers
   - [ ] "Exportar Excel" button
- [ ] Click "Add Contact"
- [ ] Verify form labels are in Portuguese
- [ ] Verify "Selecionar Existente" and "Criar Novo" buttons

#### Test 13: English Translations
- [ ] Switch language to English (EN)
- [ ] Navigate to Contacts page
- [ ] Verify all text is in English
- [ ] Test the same elements as Portuguese test

## Expected Results

### Success Criteria
- ✅ All tests pass
- ✅ No console errors
- ✅ Data saves correctly
- ✅ UI is responsive and intuitive
- ✅ Translations are accurate
- ✅ Export functionality works

### Known Limitations
- People page still exists but is not accessible from sidebar
- Direct URL access to `/people` will still work
- Existing contacts cannot change their person/company association

## Troubleshooting

### Issue: "middle_name" column not found
**Solution**: Run the database migration (see Pre-Deployment Steps)

### Issue: Country code not defaulting to +351
**Solution**: Clear browser cache and reload

### Issue: Excel export not working
**Solution**: Check browser console for errors, ensure data exists

### Issue: Person creation fails
**Solution**: Verify all required fields (First Name) are filled

## Reporting Issues

If you encounter any issues during testing:

1. Note the exact steps to reproduce
2. Capture browser console errors (F12 → Console)
3. Take screenshots if applicable
4. Check the browser's Network tab for failed API calls
5. Verify the database migration was completed

## Post-Testing

After successful testing:
- [ ] Document any issues found
- [ ] Verify all data is correct in database
- [ ] Notify users of the changes
- [ ] Update any user documentation
- [ ] Monitor for any errors in production
