# CRUD Operations and Speciality Attribution Implementation

## Overview
This implementation adds full CRUD (Create, Read, Update, Delete) operations for separators, chapters, articles, and items, as well as the ability to attribute specialities at the separator, chapter, and article levels.

## Features Implemented

### 1. Separators (Tabs) Management
- **Create**: Add new separators using the "New Separator" button at the top of the tabs section
- **Edit**: Edit separator name using the Edit button in the separator actions bar
- **Delete**: Delete a separator (cascades to all chapters, articles, and items within)
- **Specialities**: Attribute specialities at the separator level that apply to all items

### 2. Chapters Management
- **Create**: Add new chapters using the "New Chapter" button in the separator actions bar
- **Edit**: Edit chapter name and comments using the Edit button in chapter header
- **Delete**: Delete a chapter (cascades to all articles and items within)
- **Specialities**: Attribute specialities at the chapter level that apply to all items in the chapter
- **Move**: Move chapters between separators using the "Move to tab" button

### 3. Articles Management
- **Create**: Add new articles using the "New Article" button in the chapter header
- **Edit**: Edit article title using the Edit button in article header
- **Delete**: Delete an article
- **Specialities**: Attribute specialities at the article level that apply to all items in the article
- **Collapsed by Default**: Articles are collapsed by default for better organization

### 4. Items Management
- **Create**: Add new items using the "Add Item to Chapter" button at the end of the chapter
- **Edit**: Edit item details (article number, description, unit, quantity, price, comments)
- **Delete**: Delete individual items
- **Specialities**: Items inherit specialities from separator, chapter, or article level, or can have their own

### 5. Separators Collapsed by Default
- All separators (sheets) are now collapsed by default when the page loads
- Users can expand them by clicking on the separator header
- The collapsed state is saved to localStorage for persistence

## Database Migrations

### New Tables Created

1. **`tab_specialities`** - Links specialities to tabs/separators
   - `id` (UUID, primary key)
   - `tab_id` (UUID, foreign key to `orcamento_tabs`)
   - `speciality_id` (UUID, foreign key to `specialities`)
   
2. **`article_specialities`** - Links specialities to articles
   - `id` (UUID, primary key)
   - `article_id` (UUID, foreign key to `orcamento_articles`)
   - `speciality_id` (UUID, foreign key to `specialities`)

### Migration Files
- `migration_separator_specialities.sql` - Creates tab_specialities table
- `migration_article_specialities.sql` - Creates article_specialities table

## UI Components

### Dialog Components
- **SeparatorDialogComponent**: Create/edit separator dialog
- **ChapterDialogComponent**: Create/edit chapter dialog with support for number, name, and comments
- **ArticleDialogComponent**: Create/edit article dialog with article number and title
- **ItemDialogComponent**: Create/edit item dialog with full item details

### Action Buttons
- **Separator Actions**: Edit, Delete, Manage Specialities, Add Chapter
- **Chapter Actions**: Edit, Delete, Manage Specialities, Move to Tab, Add Article
- **Article Actions**: Edit, Delete, Manage Specialities
- **Item Actions**: Add Item to Chapter button

### Speciality Management
- Multi-select dropdown grouped by main specialities
- Visual indication of inherited vs. explicit specialities
- Apply specialities at separator, chapter, or article level to cascade to items

## Speciality Attribution Hierarchy

Items can inherit specialities from three levels:
1. **Separator Level**: Apply to all items in all chapters of that separator
2. **Chapter Level**: Apply to all items in that chapter
3. **Article Level**: Apply to all items in that article
4. **Item Level**: Explicitly set specialities on individual items (overrides inheritance)

The hierarchy works as follows:
- If an item has explicit specialities, those are used
- Otherwise, if the article has specialities, those are used for items in that article
- Otherwise, if the chapter has specialities, those are used for items in that chapter
- Otherwise, if the separator has specialities, those are used for items in that separator

## Usage Instructions

### To Create a New Separator
1. Click the "New Separator" button at the top right of the tabs section
2. Enter the separator name
3. Click "Create"

### To Create a New Chapter
1. Navigate to the desired separator tab
2. Click the "New Chapter" button in the separator actions bar
3. Enter chapter number, name, and optional comments
4. Click "Create"

### To Create a New Article
1. Open the chapter by clicking on it
2. Click the "New Article" button in the chapter header
3. Enter article number and title
4. Click "Create"

### To Create a New Item
1. Open the chapter containing the item
2. Scroll to the bottom and click "Add Item to Chapter"
3. Fill in all item details (article number, description, unit, quantity, price, comments)
4. Click "Create"

### To Manage Specialities
1. Click the Tag icon button next to the entity (separator, chapter, or article)
2. Select specialities from the multi-select dropdown
3. Click "Apply" to save

### To Edit/Delete
1. Click the Edit or Trash icon button next to the entity
2. Make changes or confirm deletion

## Technical Details

### State Management
- React Query for server state management
- Local state for dialog visibility and form data
- LocalStorage for collapsed state persistence

### Mutations
- All CRUD operations use React Query mutations
- Automatic cache invalidation after successful operations
- Toast notifications for success/error feedback

### Type Safety
- Full TypeScript type definitions for all entities
- Type-safe database operations using Supabase

## Known Limitations

1. Items displayed in article view are read-only for display purposes
2. To edit items, use the "Add Item to Chapter" button and then edit from the chapter level
3. Moving separators between orcamentos is not supported (only moving chapters between separators)

## Testing

### To Test CRUD Operations
1. Upload an Excel file and analyze it
2. Test creating new separators, chapters, articles, and items
3. Test editing each entity type
4. Test deleting entities (note: deletions cascade)
5. Verify that deletions properly remove child entities

### To Test Speciality Attribution
1. Create specialities at separator level and verify they apply to all items
2. Create specialities at chapter level and verify they apply to chapter items
3. Create specialities at article level and verify they apply to article items
4. Verify that explicit item specialities override inherited ones

## Future Enhancements

Possible future improvements:
- Bulk operations (e.g., delete multiple items at once)
- Drag-and-drop reordering
- Duplicate/copy operations
- Export modified data back to Excel
- Undo/redo functionality
- More granular permissions
