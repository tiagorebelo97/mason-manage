# Sheet Separator Fix - Always Show in Article-Based View

## Problem Statement

When using article-based view to analyze Excel files, sheet separators were only displayed when there were multiple sheets within a single tab (`chaptersBySheet.size > 1`). This made it unclear which sheet the chapters and articles came from when only one sheet was present in a tab.

## User Example

The user provided this example scenario:

**Sheet1:**
- Chapter 1
  - Article 1.1 - "Foundation Work"
  - Article 1.2 - "Concrete Work"

**Sheet2:**
- Chapter 1
  - Article 1.1 - "Steel Structure"
  - Article 1.2 - "Roofing"

The user needed to see separators for both Sheet1 and Sheet2, with the chapters and articles from each sheet grouped under their respective separator.

## Solution

Modified `src/pages/MapaQuantidades.tsx` to **always** display sheet separators in article-based view, regardless of the number of sheets in a tab.

### Code Change

**Before:**
```tsx
{/* Sheet separator - only show if there are multiple sheets */}
{chaptersBySheet.size > 1 && (
  <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
      📄 {sheetName}
    </h2>
  </div>
)}
```

**After:**
```tsx
{/* Sheet separator - always show to indicate which sheet chapters came from */}
<div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
  <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
    📄 {sheetName}
  </h2>
</div>
```

### Key Changes
1. **Removed conditional check**: The `chaptersBySheet.size > 1 &&` condition was removed
2. **Updated comment**: Changed from "only show if there are multiple sheets" to "always show to indicate which sheet chapters came from"
3. **Always render**: Sheet separators now display for every sheet, providing clear organization

## Benefits

1. **Clarity**: Users can always see which sheet their chapters/articles came from
2. **Consistency**: Sheet separators are always present, making the UI more predictable
3. **Organization**: Clear visual separation between different sheets' content
4. **Better UX**: No confusion about data sources, even with single-sheet files

## Visual Result

Now when viewing article-based analysis, users will see:

```
┌─────────────────────────────────┐
│ 📄 Sheet1                       │
└─────────────────────────────────┘
  Chapter 1
    Article 1.1 - "Foundation Work"
    Article 1.2 - "Concrete Work"

┌─────────────────────────────────┐
│ 📄 Sheet2                       │
└─────────────────────────────────┘
  Chapter 1
    Article 1.1 - "Steel Structure"
    Article 1.2 - "Roofing"
```

This applies even when there's only one sheet:

```
┌─────────────────────────────────┐
│ 📄 Sheet1                       │
└─────────────────────────────────┘
  Chapter 1
    Article 1.1 - "Foundation Work"
    Article 1.2 - "Concrete Work"
```

## Testing

### Build & Lint
- ✅ **Build**: Successful compilation with no errors
- ✅ **Linting**: No new linting errors introduced
- ✅ **Logic**: Sheet separators now appear for all sheets

### Manual Testing Scenarios

1. **Single Sheet File**
   - Upload Excel file with 1 sheet
   - Enable "Article-based view"
   - Click "Analyze"
   - **Verify**: Sheet separator appears with the sheet name

2. **Multi-Sheet File**
   - Upload Excel file with 2+ sheets
   - Enable "Article-based view"
   - Click "Analyze"
   - **Verify**: Sheet separators appear for each sheet with clear separation

3. **Single Tab with Multiple Sheets**
   - Upload multi-sheet file that maps to single "Principal" tab
   - Enable "Article-based view"
   - Click "Analyze"
   - **Verify**: Multiple sheet separators appear within the Principal tab

## Files Modified

- `src/pages/MapaQuantidades.tsx` (lines 2503-2513)

## Impact

- **Breaking Changes**: None
- **Backward Compatibility**: Fully compatible
- **UI Changes**: Sheet separators now always visible (improvement)
- **Performance**: No impact (same rendering, just without conditional)
