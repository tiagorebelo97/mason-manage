# Article-Based View Now Default

## Summary
The article-based view is now the only view available and is always enabled by default. All other views have been removed.

## Changes Made

### 1. Removed Toggle Controls
- **Before**: Two toggle switches were visible before analysis:
  - "Treat as single sheet"
  - "Article-based view"
- **After**: Only the "Analyze" button is visible. Article-based view is always enabled.

### 2. Simplified State Management
- Removed `treatAsSingleSheet` state variable
- Removed `articleBasedView` state variable
- Article-based view is now hardcoded to `true` in the `analyzeMutation`

### 3. Removed Standard View Rendering
- Deleted multi-tab standard view section (~279 lines)
- Deleted single-sheet standard view section (~270 lines)
- Only article-based view rendering remains

### 4. Code Cleanup
- Removed unused imports: `Switch` and `Label` components
- Simplified `analyzeMutation` parameters (no longer needs view flags)
- Simplified `handleAnalyze` function (no longer passes view flags)
- Updated comments to reflect that article-based view is always enabled

## Impact

### User Interface
**Before:**
```
┌─────────────────────────────────────────────────────┐
│ Excel File: example.xlsx                            │
│ [ ] Treat as single sheet    [ ] Article-based view│
│ [Analyze]                                           │
└─────────────────────────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────────────────────────┐
│ Excel File: example.xlsx                            │
│ [Analyze]                                           │
└─────────────────────────────────────────────────────┘
```

### Analysis Behavior
- **Before**: Users could choose between standard view and article-based view
- **After**: Article-based view is always used automatically

### Data Structure
- Always creates 3 default tabs: Principal, Arquitetura, Instalações Especiais
- Always processes articles (ARTIGO with exactly one dot, e.g., "1.1", "2.3")
- Always captures text and item content within articles
- Always displays articles as inline content (not clickable cards)

## Statistics
- **Lines Changed**: 590 total (582 removed, 8 added)
- **Files Modified**: 1 (src/pages/MapaQuantidades.tsx)
- **Build Status**: ✅ Success
- **Lint Status**: ✅ No new errors

## Testing Notes
To test the changes:
1. Upload an Excel file with the expected structure
2. Click "Analyze" (no toggles to configure)
3. Verify that the article-based view appears automatically
4. Verify that articles are displayed inline with their content
5. Verify that the 3 default tabs are created

## Benefits
1. **Simplified User Experience**: No confusing toggle options
2. **Consistent Behavior**: All files are analyzed the same way
3. **Cleaner Code**: Removed 574 lines of dead code
4. **Better Maintenance**: One view to maintain instead of three

## Breaking Changes
- Users can no longer toggle between standard view and article-based view
- The "Treat as single sheet" option is no longer available
- All files will be processed with article-based view logic
