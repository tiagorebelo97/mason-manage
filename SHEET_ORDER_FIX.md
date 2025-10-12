# Sheet Order Fix - Article-Based View

## Problem
When analyzing multi-sheet Excel files with article-based view enabled, the sheet separators were not displaying in the correct order. The code was using `Array.from(chaptersBySheet.entries())` which didn't preserve the original Excel sheet order.

## Root Cause
JavaScript Maps preserve insertion order, but when chapters from different sheets were grouped, they were inserted based on when they were encountered during processing, not based on the original sheet order from the Excel file.

## Solution
1. **Store Original Sheet Order**: During Excel analysis, capture and store the original sheet order from `workbook.SheetNames`
2. **Persist in SessionStorage**: Save the sheet order alongside article data in `sessionStorage` as `sheetOrder_${id}`
3. **Load on Display**: When loading articles, also load the sheet order
4. **Use for Rendering**: Filter the stored sheet order to only include sheets present in the current tab, then map over this ordered list

## Changes Made

### 1. State Management
```typescript
const [sheetOrder, setSheetOrder] = useState<string[]>([]);
```

### 2. Analysis Return Value
```typescript
// Before:
return { articlesData, articleBasedView };

// After:
return { articlesData, articleBasedView, sheetNames: workbook.SheetNames };
```

### 3. Store Sheet Order
```typescript
// In onSuccess handler:
if (data.sheetNames) {
  sessionStorage.setItem(`sheetOrder_${id}`, JSON.stringify(data.sheetNames));
}
```

### 4. Load Sheet Order
```typescript
// In useEffect:
const storedSheetOrder = sessionStorage.getItem(`sheetOrder_${id}`);
if (storedSheetOrder) {
  try {
    const order = JSON.parse(storedSheetOrder);
    setSheetOrder(order);
  } catch (error) {
    console.error('Error loading sheet order:', error);
  }
}
```

### 5. Render in Correct Order
```typescript
// Before:
return Array.from(chaptersBySheet.entries()).map(([sheetName, chaptersInSheet]) => (
  // render content
));

// After:
const orderedSheets = sheetOrder.length > 0
  ? sheetOrder.filter(sheetName => chaptersBySheet.has(sheetName))
  : Array.from(chaptersBySheet.keys());

return orderedSheets.map((sheetName) => {
  const chaptersInSheet = chaptersBySheet.get(sheetName) || [];
  return (
    // render content
  );
});
```

## Impact
- ✅ Sheet separators now appear in the correct order matching the Excel file
- ✅ Hierarchy is preserved: items → articles → chapters → sheet separators
- ✅ All content remains in the Principal tab as required
- ✅ Minimal changes to existing code
- ✅ No breaking changes to existing functionality

## Testing
To test this fix:
1. Create an Excel file with multiple sheets (e.g., "Sheet1", "Sheet2", "Sheet3")
2. Enable "Article-based view" toggle
3. Click "Analyze"
4. Verify that sheet separators appear in the correct order (Sheet1, Sheet2, Sheet3)
5. Verify that chapters from each sheet are grouped under the correct separator
6. Verify that all content appears in the Principal tab

## Example
**Excel File Structure:**
- Sheet: "Budget"
- Sheet: "Materials"  
- Sheet: "Labor"

**Expected Display in Principal Tab:**
```
📄 Budget
  [Chapters from Budget sheet]

📄 Materials
  [Chapters from Materials sheet]

📄 Labor
  [Chapters from Labor sheet]
```
