# Quick Reference - Image Upload Feature

## For Developers

### Component Location
File: `src/pages/MapaQuantidades.tsx`

### Key Functions

#### 1. Image Upload Handler
```typescript
const handleImageUpload = (itemId: string) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      uploadImageMutation.mutate({ itemId, imageFile: file });
    }
  };
  input.click();
};
```

#### 2. Upload Mutation
```typescript
const uploadImageMutation = useMutation({
  mutationFn: async ({ itemId, imageFile }) => {
    // Upload to Supabase storage
    const fileName = `${id}/${Date.now()}_${imageFile.name}`;
    await supabase.storage
      .from('orcamento-observacoes')
      .upload(fileName, imageFile);
    
    // Get public URL and update item
    const { data: { publicUrl } } = supabase.storage
      .from('orcamento-observacoes')
      .getPublicUrl(fileName);
    
    await supabase
      .from('orcamento_items')
      .update({ observacoes_image_url: publicUrl })
      .eq('id', itemId);
  }
});
```

#### 3. QT/TOTAIS Detection
```typescript
// Track both QT and TOTAIS columns
const qtColumnCandidates: number[] = [];
const totaisColumnCandidates: number[] = [];

// Detect columns
if (cellValue === "QT" || cellValue === "QUANTIDADE") {
  qtColumnCandidates.push(j);
}
if (cellValue === "TOTAIS" || cellValue === "TOTAL") {
  totaisColumnCandidates.push(j);
}

// Fallback logic
if (qtColumnIndex === -1 && totaisColumnCandidates.length > 0) {
  qtColumnIndex = totaisColumnCandidates[0];
}
```

#### 4. Automatic Image Extraction
```typescript
// Load with ExcelJS
const excelJSWorkbook = new ExcelJS.Workbook();
await excelJSWorkbook.xlsx.load(arrayBuffer);

// Extract images
excelJSWorkbook.eachSheet((worksheet) => {
  const images = worksheet.getImages();
  images.forEach((image) => {
    const img = excelJSWorkbook.getImage(image.imageId);
    extractedImages.push({
      sheetName: worksheet.name,
      imageId: image.imageId,
      extension: img.extension,
      buffer: img.buffer,
      row: image.range?.tl?.nativeRow,
      col: image.range?.tl?.nativeCol,
    });
  });
});
```

### UI Components

#### Upload Button
```tsx
{!item.observacoes_image_url && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => handleImageUpload(item.id)}
    disabled={uploadImageMutation.isPending}
  >
    <ImagePlus className="h-4 w-4 mr-2" />
    {t('orcamento.uploadImage')}
  </Button>
)}
```

#### Image Display
```tsx
{item.observacoes_image_url && (
  <Dialog>
    <DialogTrigger asChild>
      <img 
        src={item.observacoes_image_url} 
        alt="Observação"
        className="max-w-[100px] max-h-[100px] object-contain cursor-pointer hover:opacity-80 transition-opacity rounded border"
      />
    </DialogTrigger>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Observação - Imagem</DialogTitle>
      </DialogHeader>
      <div className="flex justify-center">
        <img 
          src={item.observacoes_image_url} 
          alt="Observação"
          className="max-w-full max-h-[70vh] object-contain"
        />
      </div>
    </DialogContent>
  </Dialog>
)}
```

### Database Schema
```sql
-- Already exists from Phase 1
ALTER TABLE orcamento_items 
ADD COLUMN observacoes_image_url TEXT;
```

### Storage Configuration
```sql
-- Bucket: orcamento-observacoes
-- Path: {orcamento_id}/{timestamp}_{filename}
-- Access: Public read, Authenticated write/delete
```

### Translation Keys
```typescript
// English
'orcamento.uploadImage': 'Upload Image'
'orcamento.imageUploadSuccess': 'Image uploaded successfully'
'orcamento.imageUploadError': 'Failed to upload image'

// Portuguese
'orcamento.uploadImage': 'Carregar Imagem'
'orcamento.imageUploadSuccess': 'Imagem carregada com sucesso'
'orcamento.imageUploadError': 'Falha ao carregar imagem'
```

---

## For Users

### How to Upload Images Manually

1. **Navigate** to your budget (Orçamento)
2. **Upload** an Excel file
3. **Click** "Analyze" button
4. **Find** the item in the OBSERVAÇÕES column
5. **Click** the "Upload Image" button
6. **Select** your image file
7. **Done** - Image appears automatically

### How Images are Extracted Automatically

1. **Embed** images in Excel OBSERVAÇÕES cells
2. **Upload** the Excel file
3. **Click** "Analyze"
4. **Wait** for processing
5. **View** - Images appear automatically

### Viewing Images

- **Thumbnail**: Small preview in table
- **Click**: Opens full-size dialog
- **Close**: Click X or outside dialog

---

## For QA/Testers

### Quick Test Checklist

✅ Upload image manually → appears as thumbnail
✅ Click thumbnail → opens full dialog
✅ Upload Excel with images → auto-extracted
✅ QT empty, TOTAIS has values → uses TOTAIS
✅ Delete file → confirmation dialog appears
✅ Hover comment icon → tooltip appears
✅ Switch language → translations update

### Common Issues

**Issue**: Image doesn't appear after upload
- **Check**: Browser console for errors
- **Check**: Supabase storage bucket exists
- **Check**: Network tab for upload request

**Issue**: QT values missing
- **Check**: Excel has QT or TOTAIS column
- **Check**: Column header matches detection logic
- **Check**: Values in the column

**Issue**: Images not extracted from Excel
- **Check**: ExcelJS installed (`npm list exceljs`)
- **Check**: Images are embedded (not linked)
- **Check**: Browser console during analysis

---

## Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Storage Bucket Setup
Run: `storage_bucket_observacoes_setup.sql`

### Database Migration
Run: `migration_observacoes_images.sql`

---

## API Endpoints

### Upload Image
```typescript
POST /storage/v1/object/orcamento-observacoes/{path}
Content-Type: image/*
```

### Get Public URL
```typescript
GET /storage/v1/object/public/orcamento-observacoes/{path}
```

### Update Item
```typescript
PATCH /rest/v1/orcamento_items?id=eq.{itemId}
Content-Type: application/json
{ "observacoes_image_url": "https://..." }
```

---

## Dependencies

### Required
- `exceljs@^4.4.0` - Excel image extraction
- `lucide-react` - ImagePlus icon
- `@tanstack/react-query` - Mutations
- `@radix-ui/react-dialog` - Image dialog
- `supabase-js` - Storage & database

### Import Statements
```typescript
import ExcelJS from 'exceljs';
import { ImagePlus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
```

---

## Performance Considerations

- **Image Size**: Consider compression for large files
- **Multiple Images**: Upload sequentially to avoid overload
- **Excel Processing**: Large files may take 10-30 seconds
- **Storage Quota**: Monitor Supabase storage limits

---

## Security Notes

- Images stored in public bucket (readable by anyone with URL)
- Upload requires authentication
- File type restricted to image/* MIME types
- Path includes orcamento ID for isolation

---

## Future Enhancements

1. Image deletion button
2. Multiple images per cell
3. Image compression before upload
4. Drag & drop interface
5. Better image-to-cell position matching
6. Storage cleanup for deleted items

---

## Support Contacts

- **Technical Issues**: Check GitHub issues
- **Supabase Issues**: Check Supabase dashboard logs
- **Documentation**: See PHASE_2_3_IMPLEMENTATION.md

---

## Version History

- **v1.0** (2024-01-XX): Initial implementation
  - Manual image upload
  - Automatic image extraction
  - QT/TOTAIS fallback logic

---

## Related Files

- `PHASE_2_3_IMPLEMENTATION.md` - Technical details
- `VISUAL_CHANGES_IMAGE_UPLOAD.md` - UI changes
- `TESTING_GUIDE_IMAGE_UPLOAD.md` - Test procedures
- `IMAGE_EXTRACTION_GUIDE.md` - Original Phase 1 guide
