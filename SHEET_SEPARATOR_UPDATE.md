# Sheet Separator Update - Article-Based View

## Summary

Updated the article-based view to show sheet name separators for **all sheets** in the **Principal tab**, regardless of the number of sheets in the Excel file.

## Problem

Previously, sheet separators only appeared when there were **multiple sheets** (2 or more). This meant:
- Single-sheet Excel files showed no separators at all
- Users couldn't clearly see which sheet the content came from

## Solution

Changed the condition from:
```typescript
{chaptersBySheet.size > 1 && (
  <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
      📄 {sheetName}
    </h2>
  </div>
)}
```

To:
```typescript
{tab.name === "Principal" && (
  <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
      📄 {sheetName}
    </h2>
  </div>
)}
```

## Key Changes

1. **Removed** the condition checking for multiple sheets (`chaptersBySheet.size > 1`)
2. **Added** a condition to show separators only in the "Principal" tab (`tab.name === "Principal"`)
3. Sheet separators now appear for:
   - Single-sheet Excel files (1 separator)
   - Multi-sheet Excel files (1 separator per sheet)

## Behavior

### Article-Based View Enabled

When article-based view is enabled:
- Three fixed tabs are created: Principal, Arquitetura, Instalações Especiais
- All sheets from the Excel file are mapped to the **Principal** tab
- Each sheet gets a separator with its name in the Principal tab
- Other tabs (Arquitetura, Instalações Especiais) show no separators (no content by default)

### Example: Single-Sheet File

```
┌─────────────────────────────┐
│ Principal | Arquitetura | ... │ (tabs)
└─────────────────────────────┘

Principal Tab Content:
┌─────────────────────────────┐
│ 📄 Sheet1                    │ <- Separator always shown
└─────────────────────────────┘

▼ 1. Chapter Name
  └─ Articles and content...
```

### Example: Multi-Sheet File

```
┌─────────────────────────────┐
│ Principal | Arquitetura | ... │ (tabs)
└─────────────────────────────┘

Principal Tab Content:
┌─────────────────────────────┐
│ 📄 Sheet1                    │ <- First separator
└─────────────────────────────┘

▼ 1. Chapter Name (from Sheet1)
  └─ Articles and content...

┌─────────────────────────────┐
│ 📄 Sheet2                    │ <- Second separator
└─────────────────────────────┘

▼ 2. Chapter Name (from Sheet2)
  └─ Articles and content...
```

## Benefits

1. **Consistency**: Separators always appear, providing consistent visual organization
2. **Clarity**: Users can always see which sheet the content originated from
3. **Better UX**: No confusion about content source, even with single-sheet files
4. **Maintains Structure**: Three fixed tabs remain unchanged

## Files Modified

- `src/pages/MapaQuantidades.tsx` (line 2507)
- `ARTICLE_VIEW_ENHANCEMENTS.md` (documentation update)
- `ENHANCEMENTS_README.md` (documentation update)

## Testing

To test this change:

1. **Single-Sheet Test**:
   - Upload an Excel file with 1 sheet
   - Enable "Article-based view" toggle
   - Click "Analyze"
   - Verify: Sheet separator appears in Principal tab with the sheet name

2. **Multi-Sheet Test**:
   - Upload an Excel file with 2+ sheets
   - Enable "Article-based view" toggle
   - Click "Analyze"
   - Verify: Multiple sheet separators appear in Principal tab, one for each sheet

3. **Other Tabs Test**:
   - After analysis, switch to "Arquitetura" or "Instalações Especiais" tabs
   - Verify: No sheet separators appear (these tabs are empty by default)

## Visual Appearance

The separator maintains its existing blue-themed design:
- Light blue background in light mode (`bg-blue-50`)
- Dark blue background in dark mode (`bg-blue-950`)
- Blue left border (`border-l-4 border-blue-500`)
- Sheet icon (📄) and sheet name
- Rounded right corners for visual polish

## Backward Compatibility

This change is **fully backward compatible**:
- Non article-based views remain unchanged
- Regular multi-sheet handling (creating tabs per sheet) is unaffected
- Only the article-based view's Principal tab behavior changes
