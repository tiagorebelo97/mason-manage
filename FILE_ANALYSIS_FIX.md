# File Analysis Feature Fix

## Problem Statement
The file analysis feature in the Mapa de Quantidades page had the following issues:
1. The "Analisar" (Analyze) button was not working - clicking it did nothing
2. No clear visual feedback during the analysis process
3. Users couldn't see when the file was being analyzed

## Root Cause
After a file was uploaded, the file input reference was cleared, so when the user clicked "Analyze", the `handleAnalyze` function couldn't access the file from `fileInputRef.current?.files?.[0]` (it was `undefined`).

## Solution Implemented

### 1. Store Uploaded File in State
- Added `uploadedFile` state variable to preserve the file after upload
- Modified `uploadMutation` to return both the database data and the file object
- Updated `onSuccess` callback to store the file in state

### 2. Fix Analyze Function
- Changed `handleAnalyze` to use the stored `uploadedFile` instead of the file input
- Moved `setIsAnalyzing(true)` from inside the mutation to `handleAnalyze` for better control
- Added check to only proceed if `uploadedFile` exists

### 3. Improve Visual Feedback
- Added `Loader2` icon from lucide-react
- Display animated spinner next to the button text during analysis
- Button shows "Analyzing..." text with spinning icon when processing
- Button is disabled during analysis to prevent multiple clicks

## Code Changes

### Changes in `MapaQuantidades.tsx`:

1. **Import Loader2 icon**
```tsx
import { ArrowLeft, Upload, FileSpreadsheet, Loader2 } from "lucide-react";
```

2. **Add uploadedFile state**
```tsx
const [uploadedFile, setUploadedFile] = useState<File | null>(null);
```

3. **Update uploadMutation to store file**
```tsx
return { data, file };  // Return both data and file
// ...
onSuccess: (result) => {
  setUploadedFile(result.file);  // Store file in state
  // ...
}
```

4. **Fix handleAnalyze to use stored file**
```tsx
const handleAnalyze = () => {
  if (uploadedFile) {
    setIsAnalyzing(true);
    analyzeMutation.mutate(uploadedFile);
  }
};
```

5. **Add loading spinner to button**
```tsx
<Button onClick={handleAnalyze} disabled={isAnalyzing}>
  {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isAnalyzing ? t('orcamento.analyzing') : t('orcamento.analyze')}
</Button>
```

## User Experience Improvements

### Before Fix:
- Click "Analisar" → Nothing happens
- No indication that anything went wrong
- File analysis never started

### After Fix:
- Click "Analisar" → Button shows spinner and "A analisar..." text
- Button is disabled to prevent multiple clicks
- Toast notification appears on success: "Ficheiro analisado com sucesso"
- Toast notification appears on error: "Falha ao analisar ficheiro"
- Results are displayed in tabs when analysis completes successfully

## Testing

The fix has been tested with:
- ✅ Build successful (no TypeScript errors)
- ✅ Linting passes (only pre-existing warnings remain)
- ✅ Code follows existing patterns in the repository
- ✅ Minimal changes approach - only modified what was necessary

## Technical Notes

- The solution maintains the existing architecture and patterns
- No breaking changes to the database schema or API
- All existing translations are used (no new translation keys needed)
- The fix is backwards compatible with existing uploaded files
- Toast notifications from `sonner` provide user feedback as before
