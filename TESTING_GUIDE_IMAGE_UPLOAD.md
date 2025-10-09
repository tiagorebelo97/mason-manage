# Testing Guide - Image Upload & QT/TOTAIS Features

## Overview
This guide provides step-by-step testing instructions for all features implemented in this PR.

## Prerequisites
- Access to mason-manage application
- Supabase authentication
- Test Excel files with various scenarios
- Sample images for manual upload testing

---

## Test Suite 1: Automatic Image Extraction

### Test 1.1: Excel with Embedded Images
**Objective**: Verify automatic extraction of images during Excel analysis

**Steps**:
1. Create an Excel file with:
   - ARTIGO, DESCRIÇÃO, UN, QT columns
   - OBSERVAÇÕES EMPREITEIRO column
   - Embed images in OBSERVAÇÕES cells
2. Navigate to a budget (Orçamento)
3. Upload the Excel file
4. Click "Analyze" button
5. Wait for analysis to complete

**Expected Results**:
- ✅ Success toast: "File analyzed successfully"
- ✅ Images appear automatically in OBSERVAÇÕES column
- ✅ Image thumbnails are visible (max 100x100px)
- ✅ Click thumbnail opens full-size dialog
- ✅ Images persist after page reload

**Test Data**:
```
Sample Excel Structure:
├── Sheet1
│   ├── ARTIGO: 1.1, 1.2, 1.3
│   ├── DESCRIÇÃO: Item descriptions
│   ├── QT: 10, 20, 30
│   └── OBSERVAÇÕES: [Image1], [Image2], [Image3]
```

### Test 1.2: Multiple Images in Different Sheets
**Objective**: Verify extraction works across multiple sheets

**Steps**:
1. Create Excel with multiple sheets, each with images
2. Upload and analyze
3. Navigate through all tabs

**Expected Results**:
- ✅ Each tab displays correctly
- ✅ Images in each sheet are extracted
- ✅ No cross-contamination between sheets

### Test 1.3: Mixed Content (Text + Images)
**Objective**: Verify handling of cells with both text and images

**Steps**:
1. Create Excel with OBSERVAÇÕES cells containing:
   - Only text
   - Only images
   - Both text and images
   - Empty cells
2. Upload and analyze

**Expected Results**:
- ✅ Text observations display correctly
- ✅ Images display below text
- ✅ Empty cells show upload button
- ✅ Both text and image visible when both present

---

## Test Suite 2: Manual Image Upload

### Test 2.1: Upload to Empty Cell
**Objective**: Verify manual upload to cell without image

**Steps**:
1. Navigate to analyzed Excel data
2. Find item with no image in OBSERVAÇÕES
3. Click "Upload Image" button
4. Select a PNG image (< 5MB)
5. Confirm selection

**Expected Results**:
- ✅ File picker opens
- ✅ Accepts image/* files only
- ✅ Success toast: "Image uploaded successfully" / "Imagem carregada com sucesso"
- ✅ Upload button disappears
- ✅ Image thumbnail appears
- ✅ Can click thumbnail to view full size

### Test 2.2: Upload Different Image Formats
**Objective**: Verify support for various image formats

**Test formats**:
- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)
- WebP (.webp)

**Steps**:
1. Upload each format to different items
2. Verify display

**Expected Results**:
- ✅ All common formats accepted
- ✅ Images display correctly
- ✅ Quality maintained

### Test 2.3: Upload Large Image
**Objective**: Verify handling of large images

**Steps**:
1. Attempt to upload very large image (> 10MB)
2. Upload medium image (2-5MB)
3. Upload small image (< 1MB)

**Expected Results**:
- ⚠️ Large images may take time to upload
- ✅ Progress indication (if implemented)
- ✅ All sizes handled gracefully
- ⚠️ Consider file size limits for production

### Test 2.4: Upload While Offline
**Objective**: Verify error handling

**Steps**:
1. Disconnect from internet
2. Click "Upload Image"
3. Select image

**Expected Results**:
- ✅ Error toast: "Failed to upload image"
- ✅ Upload button remains
- ✅ No partial state
- ✅ Can retry when online

### Test 2.5: Concurrent Uploads
**Objective**: Verify multiple simultaneous uploads

**Steps**:
1. Open multiple OBSERVAÇÕES cells
2. Upload images to several items quickly
3. Monitor progress

**Expected Results**:
- ✅ All uploads complete successfully
- ✅ No interference between uploads
- ✅ Correct image-to-item mapping

---

## Test Suite 3: QT/TOTAIS Fallback Logic

### Test 3.1: QT Column Populated
**Objective**: Verify QT column is used when populated

**Excel Structure**:
```
ARTIGO | DESCRIÇÃO | UN | QT | TOTAIS
  1.1  | Item A    | m² | 10 | 50
  1.2  | Item B    | m  | 5  | 25
```

**Steps**:
1. Upload and analyze
2. Check quantity values in UI

**Expected Results**:
- ✅ Displays QT values (10, 5)
- ✅ TOTAIS values ignored

### Test 3.2: QT Empty, TOTAIS Populated
**Objective**: Verify fallback to TOTAIS

**Excel Structure**:
```
ARTIGO | DESCRIÇÃO | UN | QT | TOTAIS
  1.1  | Item A    | m² |    | 50
  1.2  | Item B    | m  |    | 25
```

**Steps**:
1. Upload and analyze
2. Check quantity values in UI

**Expected Results**:
- ✅ Displays TOTAIS values (50, 25)
- ✅ No error messages

### Test 3.3: No QT Column
**Objective**: Verify TOTAIS used when QT doesn't exist

**Excel Structure**:
```
ARTIGO | DESCRIÇÃO | UN | TOTAIS
  1.1  | Item A    | m² | 50
  1.2  | Item B    | m  | 25
```

**Steps**:
1. Upload and analyze
2. Check quantity values

**Expected Results**:
- ✅ Displays TOTAIS values
- ✅ No warnings about missing QT

### Test 3.4: Multiple QT Columns
**Objective**: Verify selection of most populated QT column

**Excel Structure**:
```
ARTIGO | DESCRIÇÃO | QT1 | QT2 | QT3
  1.1  | Item A    | 10  |     |
  1.2  | Item B    | 5   | 20  | 30
  1.3  | Item C    | 2   | 15  | 25
  1.4  | Item D    |     | 10  | 20
```

**Steps**:
1. Upload and analyze
2. Check which QT column was used

**Expected Results**:
- ✅ Uses QT3 (most populated: 3 values)
- ✅ Correct values displayed

### Test 3.5: Mixed Empty/Populated QT
**Objective**: Verify handling of partially populated QT

**Excel Structure**:
```
ARTIGO | DESCRIÇÃO | QT | TOTAIS
  1.1  | Item A    | 10 | 50
  1.2  | Item B    |    | 25
  1.3  | Item C    | 5  | 30
```

**Steps**:
1. Upload and analyze
2. Check quantity values

**Expected Results**:
- ✅ Uses QT column (has some values)
- ✅ Item 1.2 shows null/empty (not fallback per item)

---

## Test Suite 4: Delete Confirmation Dialog

### Test 4.1: Delete Button Click
**Objective**: Verify confirmation dialog appears

**Steps**:
1. Navigate to budget with uploaded file
2. Click trash (🗑️) button

**Expected Results**:
- ✅ Confirmation dialog appears immediately
- ✅ Dialog shows warning message
- ✅ Dialog lists consequences:
  - Remove file from storage
  - Delete extracted data
  - Action cannot be undone
- ✅ Two buttons visible: "Cancel" and "Delete File"

### Test 4.2: Cancel Deletion
**Objective**: Verify cancel prevents deletion

**Steps**:
1. Click trash button
2. Dialog opens
3. Click "Cancel"

**Expected Results**:
- ✅ Dialog closes
- ✅ File NOT deleted
- ✅ Data remains intact
- ✅ Can continue working

### Test 4.3: Confirm Deletion
**Objective**: Verify actual deletion works

**Steps**:
1. Click trash button
2. Dialog opens
3. Click "Delete File"

**Expected Results**:
- ✅ Dialog closes
- ✅ File deleted from storage
- ✅ Tabs removed
- ✅ Chapters removed
- ✅ Items removed
- ✅ Success toast appears
- ✅ UI returns to "no file" state

### Test 4.4: Delete with Images
**Objective**: Verify images are cleaned up

**Steps**:
1. Upload Excel with extracted images
2. Manually upload additional images
3. Delete file
4. Check Supabase storage

**Expected Results**:
- ✅ File deleted
- ✅ Data removed
- ⚠️ Images may remain in storage (consider cleanup)

---

## Test Suite 5: Tooltip Functionality

### Test 5.1: Chapter Comment Tooltip
**Objective**: Verify tooltip shows on hover

**Steps**:
1. Navigate to chapter with comments
2. Locate comment icon (💬)
3. Hover mouse over icon (don't click)
4. Wait 200-500ms

**Expected Results**:
- ✅ Tooltip appears
- ✅ Shows "Chapter Comments" title
- ✅ Shows first 3 lines of comment
- ✅ Text is readable (small font)
- ✅ Tooltip positioned near icon

### Test 5.2: Item Comment Tooltip
**Objective**: Verify item-level tooltips

**Steps**:
1. Find item with comment (💬 in last column)
2. Hover over icon
3. Observe tooltip

**Expected Results**:
- ✅ Tooltip appears
- ✅ Shows "Item Comments" title
- ✅ Shows preview text
- ✅ Responsive positioning

### Test 5.3: Tooltip + Dialog Interaction
**Objective**: Verify tooltip doesn't block dialog

**Steps**:
1. Hover over comment icon (tooltip appears)
2. Click icon (dialog should open)
3. Dialog shows full comment

**Expected Results**:
- ✅ Tooltip disappears when clicked
- ✅ Dialog opens correctly
- ✅ Full comment visible in dialog
- ✅ No tooltip interference

### Test 5.4: Tooltip Dismissal
**Objective**: Verify tooltip disappears properly

**Steps**:
1. Hover over icon (tooltip appears)
2. Move mouse away

**Expected Results**:
- ✅ Tooltip disappears
- ✅ No delay or sticking
- ✅ Clean transition

---

## Test Suite 6: Language Support

### Test 6.1: English Translation
**Objective**: Verify English UI text

**Steps**:
1. Set language to English
2. Navigate to features

**Expected Results**:
- ✅ "Upload Image" button text
- ✅ "Image uploaded successfully" toast
- ✅ "Failed to upload image" error
- ✅ All other translations correct

### Test 6.2: Portuguese Translation
**Objective**: Verify Portuguese UI text

**Steps**:
1. Set language to Portuguese
2. Navigate to features

**Expected Results**:
- ✅ "Carregar Imagem" button text
- ✅ "Imagem carregada com sucesso" toast
- ✅ "Falha ao carregar imagem" error
- ✅ All other translations correct

### Test 6.3: Language Switching
**Objective**: Verify dynamic language change

**Steps**:
1. Start in English
2. Upload image (see English toast)
3. Switch to Portuguese
4. Upload another image (see Portuguese toast)

**Expected Results**:
- ✅ UI updates immediately
- ✅ No page reload needed
- ✅ Correct translations in current language

---

## Test Suite 7: Edge Cases

### Test 7.1: Excel Without OBSERVAÇÕES Column
**Objective**: Verify graceful handling

**Steps**:
1. Upload Excel without OBSERVAÇÕES column
2. Analyze

**Expected Results**:
- ✅ Analysis completes
- ✅ Other data extracted correctly
- ✅ No upload buttons shown (no column)

### Test 7.2: Duplicate Image Upload
**Objective**: Verify replacing existing image

**Steps**:
1. Upload image to item
2. Upload different image to same item

**Expected Results**:
- ⚠️ Current: shows upload button even with image
- ✅ Second upload should replace first
- ✅ Old image URL overwritten

### Test 7.3: Invalid Image File
**Objective**: Verify error handling

**Steps**:
1. Try to upload non-image file (PDF, TXT)
2. Observe behavior

**Expected Results**:
- ✅ File picker filters to images only
- ✅ If bypass: error message
- ✅ No partial upload

### Test 7.4: Network Interruption During Upload
**Objective**: Verify resilience

**Steps**:
1. Start image upload
2. Disconnect network mid-upload
3. Reconnect

**Expected Results**:
- ✅ Error message shown
- ✅ Upload button remains
- ✅ Can retry upload
- ✅ No corrupted state

---

## Test Suite 8: Performance

### Test 8.1: Large Excel File
**Objective**: Verify handling of large files

**Test file**: Excel with 1000+ items and 50+ images

**Steps**:
1. Upload large file
2. Click analyze
3. Monitor performance

**Expected Results**:
- ✅ Analysis completes (may take time)
- ✅ Progress indication
- ✅ No browser freeze
- ✅ All data extracted correctly

### Test 8.2: Rapid Uploads
**Objective**: Verify UI responsiveness

**Steps**:
1. Quickly upload images to 10 items
2. Monitor UI updates

**Expected Results**:
- ✅ No UI freezing
- ✅ Uploads process in order
- ✅ Feedback for each upload
- ✅ Correct image-to-item mapping

---

## Regression Testing

### Verify Existing Functionality Still Works

1. **Excel Analysis**:
   - ✅ Tabs extracted correctly
   - ✅ Chapters identified
   - ✅ Items parsed
   - ✅ QT values (when present)
   - ✅ Text observations

2. **UI Navigation**:
   - ✅ Tab switching
   - ✅ Chapter collapsing/expanding
   - ✅ Table scrolling
   - ✅ Responsive design

3. **Data Display**:
   - ✅ Artigo numbers
   - ✅ Descriptions
   - ✅ Units
   - ✅ Quantities
   - ✅ Comments

---

## Automated Testing Recommendations

While this implementation doesn't include automated tests, here are recommendations:

### Unit Tests
```typescript
// Test QT/TOTAIS detection
test('should use QT when populated', () => { ... });
test('should fallback to TOTAIS when QT empty', () => { ... });
test('should select QT with most values', () => { ... });

// Test image upload
test('should upload image to Supabase', () => { ... });
test('should update item with image URL', () => { ... });
test('should handle upload errors', () => { ... });
```

### Integration Tests
```typescript
// Test end-to-end flow
test('should extract images from Excel', () => { ... });
test('should display images in UI', () => { ... });
test('should allow manual upload', () => { ... });
```

### E2E Tests (Playwright/Cypress)
```typescript
// Test user interactions
test('user can upload image', () => { ... });
test('user can view full-size image', () => { ... });
test('user can delete file with confirmation', () => { ... });
```

---

## Test Results Template

Use this template to document test results:

```
Test Date: YYYY-MM-DD
Tester: [Name]
Environment: [Dev/Staging/Prod]
Browser: [Chrome/Firefox/Safari] [Version]

┌─────────────────────┬────────┬──────────────────┐
│ Test Suite          │ Status │ Notes            │
├─────────────────────┼────────┼──────────────────┤
│ 1. Auto Extraction  │ ✅ PASS │                  │
│ 2. Manual Upload    │ ✅ PASS │                  │
│ 3. QT/TOTAIS        │ ✅ PASS │                  │
│ 4. Delete Dialog    │ ✅ PASS │                  │
│ 5. Tooltips         │ ✅ PASS │                  │
│ 6. Translations     │ ✅ PASS │                  │
│ 7. Edge Cases       │ ⚠️ WARN │ See note 1       │
│ 8. Performance      │ ✅ PASS │                  │
└─────────────────────┴────────┴──────────────────┘

Notes:
1. [Any issues or observations]
```

---

## Known Issues / Future Improvements

1. **Image Deletion**: Currently no way to remove uploaded images
2. **Image Position Matching**: Could be more precise using row/column data
3. **Multiple Images**: Only one image per item supported
4. **Image Compression**: Consider compressing before upload
5. **Storage Cleanup**: Old images may accumulate in storage

---

## Support

If tests fail, check:
1. Supabase storage bucket configured (`orcamento-observacoes`)
2. Database schema includes `observacoes_image_url` column
3. ExcelJS library installed (`npm install exceljs`)
4. Network connectivity
5. Browser console for errors
6. Supabase logs for backend errors
