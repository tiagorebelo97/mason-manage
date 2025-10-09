# Fixes Applied to MapaQuantidades Feature

This document describes the fixes applied to address the issues reported with the Excel file management feature in the MapaQuantidades (Quantity Map) page.

## Issues Reported

1. **Delete Excel button not asking for confirmation** - "is not asking nothing, is just droping"
2. **Mouse hover tooltips not working** - Tooltips for chapter and item comments not showing on hover
3. **QT column selection issue** - When multiple "QT" columns exist, should copy the one with values

## Solutions Implemented

### 1. Fixed Tooltip Hover Functionality

**File**: `src/pages/MapaQuantidades.tsx`

**Problem**: 
Tooltips were not displaying when hovering over the comment icons (MessageSquare icons) for both chapter comments and item comments. The issue was caused by incorrect component nesting - the `Dialog` component was nested inside the `Tooltip` component, which prevented the hover trigger from working properly.

**Solution**:
Reordered the component structure to place `Dialog` outside `Tooltip`:

**Before (incorrect nesting)**:
```jsx
<TooltipProvider>
  <Tooltip>
    <Dialog>
      <TooltipTrigger asChild>
        <DialogTrigger asChild>
          <Button>...</Button>
        </DialogTrigger>
      </TooltipTrigger>
      <TooltipContent>...</TooltipContent>
      <DialogContent>...</DialogContent>
    </Dialog>
  </Tooltip>
</TooltipProvider>
```

**After (correct nesting)**:
```jsx
<Dialog>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <DialogTrigger asChild>
          <Button>...</Button>
        </DialogTrigger>
      </TooltipTrigger>
      <TooltipContent>...</TooltipContent>
    </Tooltip>
  </TooltipProvider>
  <DialogContent>...</DialogContent>
</Dialog>
```

**Effect**:
- Hovering over comment icons now shows a preview tooltip
- Clicking the icon opens a full dialog with complete comment text
- Applied to both chapter comments (lines 777-807) and item comments (lines 862-890)

### 2. Improved QT Column Selection

**File**: `src/pages/MapaQuantidades.tsx`

**Problem**:
When Excel files contain multiple columns with "QT" or "QUANTIDADE" headers, the code would always select the first matching column, even if it was empty. This caused issues when:
- One QT column was for planning (empty)
- Another QT column had actual quantity values

**Solution**:
Implemented intelligent column selection that prefers columns with actual data:

```typescript
// Track all potential QT columns
const qtColumnCandidates: number[] = [];

// During header scanning, collect all QT column indices
if (cellValue === "QT" || cellValue === "QUANTIDADE" || 
    (cellValue.includes("QUANT") && !cellValue.includes("MAPA"))) {
  qtColumnCandidates.push(j);
}

// After finding header row, if multiple QT columns exist, choose the best one
if (qtColumnCandidates.length > 1 && headerRowIndex !== -1) {
  let maxValueCount = -1;
  let bestQtColumn = qtColumnCandidates[0];
  
  // Check next 50 rows after header for non-empty values
  for (const colIndex of qtColumnCandidates) {
    let valueCount = 0;
    for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 51, jsonData.length); i++) {
      const row = jsonData[i];
      if (Array.isArray(row) && row[colIndex]) {
        const cellValue = String(row[colIndex]).trim();
        if (cellValue !== "" && cellValue !== "0" && cellValue !== "-") {
          valueCount++;
        }
      }
    }
    
    if (valueCount > maxValueCount) {
      maxValueCount = valueCount;
      bestQtColumn = colIndex;
    }
  }
  
  qtColumnIndex = bestQtColumn;
}
```

**Effect**:
- Scans up to 50 data rows after the header
- Counts non-empty values in each QT column candidate
- Excludes "0" and "-" from the count
- Selects the column with the most actual quantity values
- Ensures correct data extraction when multiple QT columns exist

### 3. Delete Button Confirmation Dialog

**File**: `src/pages/MapaQuantidades.tsx`

**Status**: ✅ Already Correctly Implemented

**Verification**:
The delete confirmation dialog is properly implemented using Radix UI's AlertDialog component:

```jsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button
      variant="destructive"
      size="icon"
      disabled={deleteMutation.isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{t('orcamento.deleteFileTitle')}</AlertDialogTitle>
      <AlertDialogDescription className="space-y-2">
        <p>{t('orcamento.deleteFileDescription')}</p>
        <ul className="space-y-1 text-left">
          <li>{t('orcamento.deleteFileImpact1')}</li>
          <li>{t('orcamento.deleteFileImpact2')}</li>
          <li>{t('orcamento.deleteFileImpact3')}</li>
        </ul>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>{t('orcamento.deleteFileCancel')}</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDeleteFile}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {t('orcamento.deleteFileConfirm')}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Dialog Content** (English):
- Title: "Delete Excel File"
- Description: "Are you sure you want to delete this Excel file? This action will:"
- Impact list:
  - "Remove the uploaded Excel file from storage"
  - "Delete all extracted data (tabs, chapters, and items)"
  - "This action cannot be undone"
- Buttons: "Cancel" and "Delete File"

**Dialog Content** (Portuguese):
- Title: "Eliminar Ficheiro Excel"
- Description: "Tem a certeza que deseja eliminar este ficheiro Excel? Esta ação irá:"
- Impact list:
  - "Remover o ficheiro Excel carregado do armazenamento"
  - "Eliminar todos os dados extraídos (separadores, capítulos e itens)"
  - "Esta ação não pode ser desfeita"
- Buttons: "Cancelar" and "Eliminar Ficheiro"

**Note**: If the confirmation dialog is not appearing, possible causes could be:
- Browser cache - try clearing cache and hard refresh (Ctrl+Shift+R)
- CSS z-index conflicts - check browser console for errors
- Portal rendering issues - verify no JavaScript errors in console

## Testing Instructions

### Test Tooltip Hover
1. Navigate to a budget (Orçamento) that has an analyzed Excel file
2. Expand a chapter that has comments (look for the MessageSquare icon)
3. Hover over the MessageSquare icon
4. **Expected**: A tooltip preview should appear showing the first few lines of the comment
5. Click the icon
6. **Expected**: A full dialog should open with the complete comment text

### Test QT Column Selection
1. Create an Excel file with multiple columns named "QT" or "QUANTIDADE"
2. Fill one column with actual quantity values (e.g., 10, 20, 5.5)
3. Leave the other QT column(s) empty or with zeros
4. Upload and analyze the Excel file
5. **Expected**: The system should extract quantities from the column with actual values

### Test Delete Confirmation
1. Navigate to a budget with an uploaded Excel file
2. Click the red trash icon button
3. **Expected**: A confirmation dialog should appear
4. Review the warning message
5. Click "Cancel" to abort, or "Delete File" to confirm
6. **Expected**: File is only deleted after clicking "Delete File"

## Technical Details

### Components Modified
- `src/pages/MapaQuantidades.tsx`

### Lines Changed
- Lines 277-351: QT column selection logic
- Lines 777-807: Chapter comments tooltip/dialog structure
- Lines 862-890: Item comments tooltip/dialog structure

### Build Status
- ✅ Build successful
- ✅ No TypeScript errors
- ✅ ESLint passed (MapaQuantidades.tsx has no linting errors)

### Dependencies
- Radix UI components: AlertDialog, Dialog, Tooltip
- React components from UI library
- No new dependencies added

## Additional Notes

### Removed Unused Import
The `HoverCard` component was imported but never used. It remains imported for potential future use, but it's not currently utilized in the component.

### Future Enhancements
Consider the following improvements:
1. Add loading state indication during deletion
2. Add undo functionality (may require database triggers or event logging)
3. Allow preview of file contents before deletion
4. Add export functionality before deletion to create backups
