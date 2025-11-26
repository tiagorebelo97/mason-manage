# Manual Testing Guide for CRUD Operations

## Prerequisites
1. Ensure database migrations have been run:
   - `migration_separator_specialities.sql`
   - `migration_article_specialities.sql`
2. Have an orcamento with an analyzed Excel file
3. Have some specialities configured in the system

## Test Scenarios

### Scenario 1: Separator Management

#### Test 1.1: Create Separator
1. Navigate to Mapa Quantidades for an orcamento
2. Click "New Separator" button (top right)
3. Enter name: "Test Separator"
4. Click "Create"
5. **Expected**: New separator tab appears, toast notification shows success

#### Test 1.2: Edit Separator
1. Look at the separator actions bar
2. Click the pencil (Edit) icon
3. Change name to "Updated Separator"
4. Click "Update"
5. **Expected**: Separator name updates, toast notification shows success

#### Test 1.3: Delete Separator (with confirmation)
1. Click the trash (Delete) icon
2. Confirm deletion in the alert dialog
3. **Expected**: Separator disappears, all chapters/articles/items deleted, toast notification shows success

#### Test 1.4: Manage Separator Specialities
1. Click the tag icon (🏷️) in separator actions
2. Select 2-3 specialities from the multi-select dropdown
3. Click "Apply"
4. **Expected**: Specialities saved, toast notification shows success
5. **Verify**: Check that items in this separator inherit these specialities

### Scenario 2: Chapter Management

#### Test 2.1: Create Chapter
1. Navigate to a separator tab
2. Click "New Chapter" button in separator actions
3. Enter:
   - Number: "99"
   - Name: "Test Chapter"
   - Comments: "This is a test"
4. Click "Create"
5. **Expected**: New chapter appears in the list, toast notification shows success

#### Test 2.2: Edit Chapter
1. Find the chapter created above
2. Click the pencil (Edit) icon in chapter header
3. Change name to "Updated Chapter"
4. Update comments
5. Click "Update"
6. **Expected**: Chapter name and comments update, toast notification shows success

#### Test 2.3: Delete Chapter
1. Click the trash (Delete) icon in chapter header
2. Confirm deletion
3. **Expected**: Chapter disappears with all its articles/items, toast notification shows success

#### Test 2.4: Manage Chapter Specialities
1. Click the tag icon (🏷️) in chapter header
2. Select different specialities than the separator
3. Click "Apply"
4. **Expected**: Specialities saved, items in this chapter should now have these specialities instead of separator's

#### Test 2.5: Move Chapter Between Separators
1. Click "Move to tab" in chapter header
2. Select a different separator from the side panel
3. **Expected**: Chapter moves to the new separator with all its content

### Scenario 3: Article Management

#### Test 3.1: Create Article
1. Expand a chapter
2. Click "New Article" button in chapter header
3. Enter:
   - Article Number: "99.1"
   - Title: "Test Article"
4. Click "Create"
5. **Expected**: New article appears in the chapter, toast notification shows success

#### Test 3.2: Edit Article
1. Find the article created above
2. Click the pencil (Edit) icon in article header
3. Change title to "Updated Article"
4. Click "Update"
5. **Expected**: Article title updates, toast notification shows success

#### Test 3.3: Delete Article
1. Click the trash (Delete) icon in article header
2. Confirm deletion
3. **Expected**: Article disappears, toast notification shows success

#### Test 3.4: Manage Article Specialities
1. Click the tag icon (🏷️) in article header
2. Select specialities different from chapter and separator
3. Click "Apply"
4. **Expected**: Specialities saved, items in this article should have these specialities

#### Test 3.5: Collapse/Expand Article
1. Click on the article header (or chevron icon)
2. **Expected**: Article content collapses/expands with smooth transition

### Scenario 4: Item Management

#### Test 4.1: Create Item
1. Expand a chapter
2. Scroll to the bottom
3. Click "Add Item to Chapter"
4. Fill in:
   - Article Number: "99.1.1"
   - Description: "Test Item Description"
   - Unit: "m²"
   - Quantity: "100.50"
   - Unit Price: "25.00"
   - Comments: "Test comments"
5. Click "Create"
6. **Expected**: Item appears in database, toast notification shows success
7. **Note**: Item will appear in the article view on next data refresh

#### Test 4.2: Edit Item
1. Find an existing item (may need to query database directly or add UI)
2. Click edit from wherever you access items
3. Modify any fields
4. Click "Update"
5. **Expected**: Item updates, toast notification shows success

#### Test 4.3: Delete Item
1. Find an item
2. Confirm deletion
3. **Expected**: Item disappears, toast notification shows success

### Scenario 5: Speciality Inheritance Hierarchy

#### Test 5.1: Verify Separator-Level Inheritance
1. Set specialities on a separator (e.g., "Civil Engineering")
2. Create a chapter without specialities
3. Create an article without specialities
4. Create an item in that article
5. **Expected**: Item should inherit "Civil Engineering" from separator

#### Test 5.2: Verify Chapter-Level Override
1. In same separator from Test 5.1
2. Create another chapter with specialities (e.g., "Electrical")
3. Create an article without specialities
4. Create an item in that article
5. **Expected**: Item should have "Electrical" (chapter overrides separator)

#### Test 5.3: Verify Article-Level Override
1. In chapter from Test 5.2
2. Create an article with specialities (e.g., "Plumbing")
3. Create an item in that article
4. **Expected**: Item should have "Plumbing" (article overrides chapter)

#### Test 5.4: Verify Explicit Item Specialities
1. Edit an item directly and set specialities (e.g., "HVAC")
2. **Expected**: Item should have "HVAC" (explicit overrides all inheritance)

### Scenario 6: Separator Collapsed State

#### Test 6.1: Default Collapsed State
1. Navigate to Mapa Quantidades with multiple sheets
2. **Expected**: All separators should be collapsed by default
3. Click a separator header to expand
4. **Expected**: Separator expands to show chapters

#### Test 6.2: Collapsed State Persistence
1. Collapse/expand some separators
2. Refresh the page
3. **Expected**: Separator states should be preserved in localStorage

### Scenario 7: Data Validation

#### Test 7.1: Required Fields
1. Try to create separator without name
2. **Expected**: Error toast "Separator name is required"

#### Test 7.2: Chapter Number Format
1. Try to create chapter with invalid number (e.g., letters)
2. **Expected**: Should accept any string (as per current implementation)

#### Test 7.3: Numeric Fields
1. Try to create item with non-numeric quantity
2. **Expected**: Input should only accept numbers

### Scenario 8: Error Handling

#### Test 8.1: Network Error
1. Disconnect network
2. Try any CRUD operation
3. **Expected**: Error toast appears with appropriate message

#### Test 8.2: Permission Error
1. (If applicable) Test with restricted user permissions
2. Try any CRUD operation
3. **Expected**: Error toast with permission denied message

### Scenario 9: Cascading Deletes

#### Test 9.1: Delete Separator with Content
1. Create a separator with chapters, articles, and items
2. Delete the separator
3. **Expected**: All chapters, articles, and items should be deleted from database

#### Test 9.2: Delete Chapter with Content
1. Create a chapter with articles and items
2. Delete the chapter
3. **Expected**: All articles and items should be deleted from database

## Checklist for Complete Testing

- [ ] All separator CRUD operations work
- [ ] All chapter CRUD operations work
- [ ] All article CRUD operations work
- [ ] All item CRUD operations work
- [ ] Separator speciality attribution works
- [ ] Chapter speciality attribution works
- [ ] Article speciality attribution works
- [ ] Speciality inheritance hierarchy works correctly
- [ ] Separators are collapsed by default
- [ ] Collapsed state persists across page refreshes
- [ ] All validation messages appear correctly
- [ ] All error messages appear correctly
- [ ] Cascading deletes work properly
- [ ] Toast notifications appear for all operations
- [ ] UI is responsive and performs well
- [ ] No console errors during operations

## Notes

- Test in both development and production builds
- Test with different browsers (Chrome, Firefox, Safari)
- Test with different screen sizes (desktop, tablet, mobile)
- Monitor browser console for any errors
- Check database directly to verify data integrity
- Test with large datasets to check performance

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and version
5. Screenshot or video if applicable
6. Console errors if any
7. Database state if relevant
