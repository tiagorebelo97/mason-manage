# Image Extraction from Excel OBSERVAÇÕES - Implementation Guide

## Problem
The `xlsx` library (SheetJS) doesn't support extracting embedded images from Excel files. Images in Excel are stored as drawing objects in the workbook's XML structure, not as cell values.

## Solution Approaches

### Approach 1: Using ExcelJS Library (Recommended)

ExcelJS is a comprehensive Excel library that supports image extraction.

#### Installation
```bash
npm install exceljs
```

#### Implementation
```typescript
import ExcelJS from 'exceljs';

async function extractImagesFromExcel(fileBlob: Blob) {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await fileBlob.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const images: Array<{
    sheetName: string;
    imageId: string;
    extension: string;
    buffer: Buffer;
    row?: number;
    col?: number;
  }> = [];

  workbook.eachSheet((worksheet) => {
    // Get images from the worksheet
    worksheet.getImages().forEach((image) => {
      const img = workbook.getImage(image.imageId);
      images.push({
        sheetName: worksheet.name,
        imageId: image.imageId,
        extension: img.extension,
        buffer: img.buffer,
        row: image.range?.tl.row,
        col: image.range?.tl.col,
      });
    });
  });

  return images;
}
```

### Approach 2: Manual XML Parsing (Advanced)

Excel `.xlsx` files are ZIP archives containing XML files. Images are stored in:
- `/xl/media/` folder (image files)
- `/xl/drawings/drawing*.xml` (positioning information)
- `/xl/worksheets/_rels/sheet*.xml.rels` (relationships)

This approach requires:
1. Unzipping the Excel file
2. Parsing XML files to find image references
3. Extracting image files from `/xl/media/`
4. Matching images to cell positions

### Approach 3: User Upload (Simple Alternative)

Instead of automatic extraction:
1. Allow users to upload images separately
2. Associate uploaded images with specific items via the UI
3. Store image URLs in `observacoes_image_url` column

## Recommended Implementation Plan

Given the complexity of image extraction, I recommend a **phased approach**:

### Phase 1: Database & Storage Setup (Current PR)
- ✅ Add `observacoes_image_url` column to database
- ✅ Create Supabase storage bucket for images
- ✅ Update TypeScript types
- ✅ Add UI to display images when URLs exist

### Phase 2: Manual Image Upload (Next PR)
- Add "Upload Image" button for each OBSERVAÇÕES cell
- Allow users to manually upload images
- Associate uploaded images with items

### Phase 3: Automatic Extraction (Future PR)
- Add ExcelJS library
- Implement automatic image extraction
- Match images to OBSERVAÇÕES cells by position

## Current Implementation

This PR focuses on **Phase 1**, providing the infrastructure for image support:

1. **Database Schema**: Added `observacoes_image_url` column
2. **Storage Bucket**: Created setup script for Supabase storage
3. **Type Definitions**: Updated TypeScript types
4. **UI Display**: Added image display component (when URLs exist)

## Testing the Feature

Since automatic extraction isn't implemented yet, you can test by:

1. Running the migration script
2. Manually inserting image URLs into the database:
   ```sql
   UPDATE orcamento_items 
   SET observacoes_image_url = 'https://example.com/image.jpg'
   WHERE id = 'some-item-id';
   ```
3. Viewing the item in the UI to see the image displayed

## Future Enhancements

To implement automatic image extraction in a future PR:

```typescript
// Add to package.json
"exceljs": "^4.4.0"

// Update analyzeMutation to extract images
import ExcelJS from 'exceljs';

// After processing cell data, extract images
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(arrayBuffer);

const images = await extractImagesFromWorkbook(workbook);

// Upload images to Supabase storage
for (const image of images) {
  const fileName = `${id}/${Date.now()}_${image.imageId}.${image.extension}`;
  const { data: uploadData } = await supabase.storage
    .from('orcamento-observacoes')
    .upload(fileName, image.buffer);
  
  // Get public URL and update item record
  const { data: { publicUrl } } = supabase.storage
    .from('orcamento-observacoes')
    .getPublicUrl(fileName);
    
  // Update the corresponding item with the image URL
  await supabase
    .from('orcamento_items')
    .update({ observacoes_image_url: publicUrl })
    .eq('id', correspondingItemId);
}
```

## Notes

- Excel images don't have cell addresses; they're positioned using drawing coordinates
- Matching images to OBSERVAÇÕES cells requires calculating which cell an image overlaps
- The `exceljs` library provides this functionality through `image.range`
- Consider user experience: automatic extraction might not always match correctly, so allowing manual override is important

## Documentation Updates Needed

When implementing full image support:
1. Update EXCEL_ANALYSIS_ENHANCEMENTS.md
2. Update VISUAL_SUMMARY.md
3. Add user guide for image upload/management
4. Document Supabase storage bucket configuration
