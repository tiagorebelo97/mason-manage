# Fix: Image Connection and Column Detection Issues

## Summary of Changes

This fix addresses three critical issues in the MapaQuantidades component:

### 1. Image Connection Fix ✅

**Problem**: Images extracted from Excel files were being downloaded correctly but weren't showing on item rows because they weren't properly connected to the correct items.

**Root Cause**: The image matching logic was only using sheet name and article number to match images to items, but wasn't considering the Excel row position where the image was located.

**Solution**: 
- Added `excel_row_index` tracking to the `itemsToInsert` array
- Modified `jsonData.forEach((row: unknown) => {` to `jsonData.forEach((row: unknown, rowIndex: number) => {` to capture row indices
- Enhanced image matching logic to use row distance calculation:
  - When an image has row information, the system now finds the item with the closest row index
  - Uses `Math.abs(itemData.excel_row_index - image.row)` to calculate distance
  - Selects the item with minimum distance as the target

**Code Changes**:
```typescript
// Track Excel row index in itemsToInsert
excel_row_index?: number; // Track the Excel row for image matching

// Capture row index during iteration
jsonData.forEach((row: unknown, rowIndex: number) => {

// Store row index when adding items
excel_row_index: rowIndex, // Store the Excel row index for image matching

// Enhanced matching logic
if (image.row !== undefined && image.row !== null) {
  // Find the item with the closest row index to the image row
  let minDistance = Infinity;
  for (const item of matchingItems) {
    const itemData = itemsToInsert.find(i => 
      i.artigo === item.artigo && 
      i.sheet_name === image.sheetName
    );
    if (itemData?.excel_row_index !== undefined) {
      const distance = Math.abs(itemData.excel_row_index - image.row);
      if (distance < minDistance) {
        minDistance = distance;
        targetItem = item;
      }
    }
  }
}
```

### 2. Column Priority Fix ✅

**Problem**: The system was looking for "QT" column first, but the user wanted "TOTAIS" column to be prioritized for quantity values.

**Solution**:
- Reordered column detection logic to check for TOTAIS columns first
- TOTAIS columns are now detected before QT columns
- QT columns are kept as backup if TOTAIS is not found

**Code Changes**:
```typescript
// Prioritize TOTAIS columns for quantity
if (cellValue === "TOTAIS" || cellValue.includes("TOTAIS") || cellValue === "TOTAL") {
  totaisColumnCandidates.push(j);
}
// Also track QT columns as backup
if (cellValue === "QT" || cellValue === "QUANTIDADE" || 
    (cellValue.includes("QUANT") && !cellValue.includes("MAPA"))) {
  qtColumnCandidates.push(j); // Track all QT column candidates
}

// Prioritize TOTAIS column over QT column
// If TOTAIS columns exist, use them first
if (totaisColumnCandidates.length > 0) {
  qtColumnIndex = totaisColumnCandidates[0];
} else if (qtColumnCandidates.length > 1 && headerRowIndex !== -1) {
  // If multiple QT columns were found, choose the one with the most non-empty values
  // ... existing logic for QT column selection
}
```

**Removed Logic**: The fallback logic that checked if QT column was empty before using TOTAIS has been removed since TOTAIS is now the primary choice.

### 3. Upload Button UI Improvement ✅

**Problem**: The user requested a more beautiful design for the image upload button.

**Solution**:
- Changed button variant from `outline` to `ghost` for a cleaner look
- Replaced `ImagePlus` icon with `ImageIcon` for better visual consistency
- Added better spacing and hover effects
- Improved text styling and layout

**Code Changes**:
```typescript
// Before:
<Button
  variant="outline"
  size="sm"
  onClick={() => handleImageUpload(item.id)}
  disabled={uploadImageMutation.isPending}
  className="mt-1"
>
  <ImagePlus className="h-4 w-4 mr-2" />
  {t('orcamento.uploadImage') || 'Upload Image'}
</Button>

// After:
<div className="inline-flex">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleImageUpload(item.id)}
    disabled={uploadImageMutation.isPending}
    className="h-auto py-2 px-3 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
  >
    <ImageIcon className="h-5 w-5" />
    <span className="text-sm">{t('orcamento.uploadImage') || 'Upload Image'}</span>
  </Button>
</div>
```

**Visual Improvements**:
- Ghost variant creates a subtle, modern appearance
- Larger icon size (5x5 instead of 4x4)
- Better color transitions on hover
- More refined spacing with `gap-2` instead of `mr-2`
- Text wrapped in `span` with explicit sizing for better control

## Testing Recommendations

### Test Case 1: Image Extraction and Connection
1. Create an Excel file with items and embedded images
2. Ensure images are placed in the OBSERVAÇÕES column cells
3. Upload and analyze the Excel file
4. Verify that images appear on the correct item rows
5. Check that each image is associated with the nearest item by row position

### Test Case 2: TOTAIS Column Priority
1. Create an Excel file with both QT and TOTAIS columns
2. Put different values in QT vs TOTAIS columns
3. Upload and analyze the Excel file
4. Verify that quantity values are taken from TOTAIS column
5. Test with Excel file that only has TOTAIS (no QT) to ensure it works
6. Test with Excel file that only has QT (no TOTAIS) to ensure fallback works

### Test Case 3: Upload Button UI
1. Navigate to budget details page
2. View an item without an image
3. Check that the upload button has:
   - Ghost appearance (no border)
   - ImageIcon with proper size
   - Smooth hover transition
   - Proper spacing and alignment

## Benefits

1. **Accurate Image Placement**: Images now correctly associate with their intended items based on Excel row position
2. **Correct Quantity Values**: System uses TOTAIS column as the primary source for quantities, matching user expectations
3. **Improved User Experience**: Cleaner, more modern upload button design that's easier to interact with
4. **Maintainability**: Better code organization with clear priority order for column detection

## Files Modified

- `src/pages/MapaQuantidades.tsx`: All three fixes implemented in this file

## Breaking Changes

None - These are bug fixes and UI improvements that don't change the API or data structure.

## Migration Notes

No migration needed - changes are backward compatible.
