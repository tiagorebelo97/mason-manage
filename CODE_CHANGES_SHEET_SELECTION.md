# Code Changes Detail - Sheet Selection Feature

## Files Modified

### src/pages/MapaQuantidades.tsx

**Total Changes**: +223 lines, -41 lines

## 1. New Imports

```typescript
import { Checkbox } from "@/components/ui/checkbox";
```

## 2. New State Variables

```typescript
// Sheet selection dialog state
const [sheetSelectionOpen, setSheetSelectionOpen] = useState(false);
const [availableSheets, setAvailableSheets] = useState<string[]>([]);
const [selectedSheets, setSelectedSheets] = useState<string[]>([]);

// Collapsible sheet separators state
const [collapsedSheetSeparators, setCollapsedSheetSeparators] = useState<Set<string>>(new Set());
```

## 3. Modified analyzeMutation Signature

**Before**:
```typescript
mutationFn: async ({ fileId, treatAsSingleSheet, articleBasedView }: { 
  fileId: string; 
  treatAsSingleSheet: boolean; 
  articleBasedView: boolean 
}) => {
```

**After**:
```typescript
mutationFn: async ({ fileId, treatAsSingleSheet, articleBasedView, selectedSheets }: { 
  fileId: string; 
  treatAsSingleSheet: boolean; 
  articleBasedView: boolean; 
  selectedSheets: string[] 
}) => {
```

## 4. Sheet Filtering Logic

**Before**:
```typescript
workbook.SheetNames.forEach((sheetName, index) => {
  // Process all sheets
});
```

**After**:
```typescript
// Filter sheets to process based on selectedSheets (only for article-based view)
const sheetsToProcess = (articleBasedView && selectedSheets.length > 0) 
  ? workbook.SheetNames.filter(name => selectedSheets.includes(name))
  : workbook.SheetNames;

sheetsToProcess.forEach((sheetName, index) => {
  // Process only selected sheets
});
```

## 5. Enhanced handleAnalyze Function

**Before**:
```typescript
const handleAnalyze = () => {
  if (currentFile) {
    console.log("Starting analysis for file:", currentFile.id, currentFile.file_name);
    console.log("File URL:", currentFile.file_url);
    console.log("Settings - treatAsSingleSheet:", treatAsSingleSheet, "articleBasedView:", articleBasedView);
    setIsAnalyzing(true);
    analyzeMutation.mutate({ fileId: currentFile.id, treatAsSingleSheet, articleBasedView });
  } else {
    console.error("handleAnalyze called but currentFile is null");
    toast.error("No file selected for analysis");
  }
};
```

**After**:
```typescript
const handleAnalyze = async () => {
  if (currentFile) {
    console.log("Starting analysis for file:", currentFile.id, currentFile.file_name);
    console.log("File URL:", currentFile.file_url);
    console.log("Settings - treatAsSingleSheet:", treatAsSingleSheet, "articleBasedView:", articleBasedView);
    
    // If article-based view is enabled, show sheet selection dialog first
    if (articleBasedView) {
      try {
        // Read the file to get available sheets
        const { data: fileData, error: fileQueryError } = await supabase
          .from("orcamento_files")
          .select("*")
          .eq("id", currentFile.id)
          .single();
        
        if (fileQueryError || !fileData || !fileData.file_url) {
          toast.error("Failed to load file information");
          return;
        }
        
        // Extract file path and download
        let filePath: string;
        // ... (file path extraction logic)
        
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from('orcamento-files')
          .download(filePath);
        
        if (downloadError || !fileBlob) {
          toast.error("Failed to download file");
          return;
        }
        
        const arrayBuffer = await fileBlob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Set available sheets and select all by default
        setAvailableSheets(workbook.SheetNames);
        setSelectedSheets(workbook.SheetNames);
        setSheetSelectionOpen(true);
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Failed to read file");
      }
    } else {
      // Normal analysis without sheet selection
      setIsAnalyzing(true);
      analyzeMutation.mutate({ fileId: currentFile.id, treatAsSingleSheet, articleBasedView, selectedSheets: [] });
    }
  } else {
    console.error("handleAnalyze called but currentFile is null");
    toast.error("No file selected for analysis");
  }
};
```

## 6. New handleConfirmAnalysis Function

```typescript
const handleConfirmAnalysis = () => {
  if (currentFile) {
    setSheetSelectionOpen(false);
    setIsAnalyzing(true);
    analyzeMutation.mutate({ fileId: currentFile.id, treatAsSingleSheet, articleBasedView, selectedSheets });
    // Initialize all sheet separators as collapsed (minimized)
    setCollapsedSheetSeparators(new Set(selectedSheets));
  }
};
```

## 7. Sheet Selection Dialog UI

```typescript
{/* Sheet Selection Dialog for Article-Based View */}
<Dialog open={sheetSelectionOpen} onOpenChange={setSheetSelectionOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Select Sheets to Analyze</DialogTitle>
      <DialogDescription>
        Choose which sheets from the Excel file should be analyzed. All sheets are selected by default.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="select-all"
          checked={selectedSheets.length === availableSheets.length}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedSheets([...availableSheets]);
            } else {
              setSelectedSheets([]);
            }
          }}
        />
        <Label htmlFor="select-all" className="font-semibold cursor-pointer">
          Select All
        </Label>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {availableSheets.map((sheetName) => (
          <div key={sheetName} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
            <Checkbox
              id={`sheet-${sheetName}`}
              checked={selectedSheets.includes(sheetName)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedSheets([...selectedSheets, sheetName]);
                } else {
                  setSelectedSheets(selectedSheets.filter(s => s !== sheetName));
                }
              }}
            />
            <Label htmlFor={`sheet-${sheetName}`} className="flex-1 cursor-pointer">
              📄 {sheetName}
            </Label>
          </div>
        ))}
      </div>
    </div>
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => setSheetSelectionOpen(false)}>
        Cancel
      </Button>
      <Button 
        onClick={handleConfirmAnalysis}
        disabled={selectedSheets.length === 0}
      >
        Analyze Selected Sheets ({selectedSheets.length})
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

## 8. Collapsible Sheet Separators

**Before**:
```typescript
{/* Sheet separator - only show if there are multiple sheets */}
{chaptersBySheet.size > 1 && (
  <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
      📄 {sheetName}
    </h2>
  </div>
)}
```

**After**:
```typescript
return Array.from(chaptersBySheet.entries()).map(([sheetName, chaptersInSheet]) => {
  const isSheetCollapsed = collapsedSheetSeparators.has(sheetName);
  
  return (
    <div key={sheetName}>
      {/* Sheet separator - only show if there are multiple sheets */}
      {chaptersBySheet.size > 1 && (
        <Collapsible 
          open={!isSheetCollapsed}
          onOpenChange={(open) => {
            const newCollapsed = new Set(collapsedSheetSeparators);
            if (open) {
              newCollapsed.delete(sheetName);
            } else {
              newCollapsed.add(sheetName);
            }
            setCollapsedSheetSeparators(newCollapsed);
          }}
          className="mb-6"
        >
          <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 rounded-r-lg overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                <div className="flex items-center gap-2">
                  <ChevronRight 
                    className={`h-5 w-5 text-blue-700 dark:text-blue-300 transition-transform duration-200 ${!isSheetCollapsed ? 'rotate-90' : ''}`}
                  />
                  <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    📄 {sheetName}
                  </h2>
                </div>
                <Badge variant="secondary" className="bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100">
                  {chaptersInSheet.length} {chaptersInSheet.length === 1 ? 'chapter' : 'chapters'}
                </Badge>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="space-y-6 p-4 pt-0">
                {/* Chapters in this sheet */}
                {chaptersInSheet.map((chapterWithArticles) => (
                  // ... chapter rendering
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </div>
  );
});
```

## 9. Enhanced Table Styling

**Before**:
```typescript
<Table className="border">
  <TableHeader>
    <TableRow>
      <TableHead>{t('orcamento.artigo')}</TableHead>
      <TableHead>{t('orcamento.descricao')}</TableHead>
      <TableHead>{t('orcamento.unit')}</TableHead>
      <TableHead className="text-right">{t('orcamento.quantity')}</TableHead>
      <TableHead>{t('orcamento.observacoesEmpreiteiro')}</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {group.items.map((item, itemIndex) => (
      <TableRow key={itemIndex}>
        <TableCell>{item.artigo}</TableCell>
        <TableCell>{item.descricao}</TableCell>
        <TableCell>{item.un}</TableCell>
        <TableCell className="text-right">
          {Number(item.qt).toFixed(2)}
        </TableCell>
        <TableCell>
          {item.observacoes_empreiteiro || '-'}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**After**:
```typescript
<div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
  <Table>
    <TableHeader>
      <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900 dark:hover:to-blue-800">
        <TableHead className="font-semibold text-blue-900 dark:text-blue-100">{t('orcamento.artigo')}</TableHead>
        <TableHead className="font-semibold text-blue-900 dark:text-blue-100">{t('orcamento.descricao')}</TableHead>
        <TableHead className="font-semibold text-blue-900 dark:text-blue-100">{t('orcamento.unit')}</TableHead>
        <TableHead className="text-right font-semibold text-blue-900 dark:text-blue-100">{t('orcamento.quantity')}</TableHead>
        <TableHead className="font-semibold text-blue-900 dark:text-blue-100">{t('orcamento.observacoesEmpreiteiro')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {group.items.map((item, itemIndex) => (
        <TableRow 
          key={itemIndex}
          className={`${itemIndex % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900'} hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors`}
        >
          <TableCell className="font-medium">{item.artigo}</TableCell>
          <TableCell>{item.descricao}</TableCell>
          <TableCell className="text-center">
            <Badge variant="outline" className="font-mono">
              {item.un}
            </Badge>
          </TableCell>
          <TableCell className="text-right font-semibold">
            {Number(item.qt).toFixed(2)}
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">
            {item.observacoes_empreiteiro || '-'}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

## Key Improvements

### Sheet Selection Dialog
1. ✅ Shows all available sheets from Excel file
2. ✅ Allows user to select/deselect individual sheets
3. ✅ "Select All" checkbox for convenience
4. ✅ Shows count of selected sheets on button
5. ✅ Disabled button when no sheets selected
6. ✅ Filters analysis to only selected sheets

### Collapsible Sheet Separators
1. ✅ Sheet separators are now collapsible sections
2. ✅ Default state: COLLAPSED (minimized)
3. ✅ Chevron icon indicates state (right=collapsed, down=expanded)
4. ✅ Badge shows chapter count per sheet
5. ✅ Hover effects for better UX
6. ✅ Smooth CSS transitions

### Enhanced Table UI
1. ✅ Rounded corners with shadow
2. ✅ Blue gradient header
3. ✅ Alternating row colors (white/gray)
4. ✅ Hover effects on rows
5. ✅ Badge styling for units
6. ✅ Better typography hierarchy
7. ✅ Improved spacing and padding

## Testing Checklist

- [ ] Dialog appears when clicking Analyze with article-based view enabled
- [ ] All sheets are shown in dialog
- [ ] All sheets are selected by default
- [ ] Select All checkbox works correctly
- [ ] Individual checkboxes work correctly
- [ ] Button is disabled when no sheets selected
- [ ] Analysis processes only selected sheets
- [ ] Sheet separators are collapsed by default
- [ ] Clicking sheet separator expands/collapses it
- [ ] Chevron icon rotates correctly
- [ ] Badge shows correct chapter count
- [ ] Table styling is applied correctly
- [ ] Hover effects work on table rows
- [ ] Alternating row colors are visible
- [ ] Dark mode works correctly
