# Article-Based View Tab Creation Fix

## Problem
When article-based view was enabled, chapters were not matching the tabs because:
1. The system was creating tabs from Excel sheet names (e.g., "Sheet1", "Sheet2") instead of the 3 default tabs
2. This caused mapping issues where chapters couldn't find their parent tabs

## Root Cause
The `shouldCreateTabsFromSheets` variable included `articleBasedView` in its condition:
```typescript
// BEFORE (WRONG):
const shouldCreateTabsFromSheets = articleBasedView || (!treatAsSingleSheet && workbook.SheetNames.length > 1);
```

This meant that when `articleBasedView = true`, it would create tabs from sheet names, which is incorrect behavior.

## Solution
Updated the logic to ensure article-based view always:
1. Creates 3 default tabs: Principal, Arquitetura, Instalações Especiais
2. Maps ALL sheets to the Principal tab

### Changes Made

#### File: `src/pages/MapaQuantidades.tsx`

**Line 580-582:** Updated tab creation logic
```typescript
// BEFORE:
// For article-based view, always create one tab per Excel sheet
const shouldCreateTabsFromSheets = articleBasedView || (!treatAsSingleSheet && workbook.SheetNames.length > 1);
const hasMultipleSheets = !treatAsSingleSheet && workbook.SheetNames.length > 1;

// AFTER:
// For article-based view, always create 3 default tabs and map all sheets to Principal
const shouldCreateTabsFromSheets = !articleBasedView && !treatAsSingleSheet && workbook.SheetNames.length > 1;
const hasMultipleSheets = !articleBasedView && !treatAsSingleSheet && workbook.SheetNames.length > 1;
```

**Line 585:** Updated comment
```typescript
// BEFORE:
// Create 3 default tabs for single-sheet files or when treating as single sheet (only in non-article-based view)

// AFTER:
// Create 3 default tabs for single-sheet files, when treating as single sheet, or for article-based view
```

**Line 1169-1172:** Updated sheet-to-tab mapping logic
```typescript
// BEFORE:
// For article-based view or multi-sheet files, map each sheet to its corresponding tab
// For single-sheet files, map the single sheet to "Principal" tab
if (articleBasedView || hasMultipleSheets) {

// AFTER:
// For multi-sheet files (non-article-based view), map each sheet to its corresponding tab
// For single-sheet files and article-based view, map all sheets to "Principal" tab
if (hasMultipleSheets) {
```

## Verification

### Test Scenarios

#### Scenario 1: Single-sheet file, non-article-based view
- ✓ Creates 3 default tabs
- ✓ Maps single sheet to Principal tab

#### Scenario 2: Multi-sheet file, non-article-based view
- ✓ Creates tabs from sheet names
- ✓ Maps each sheet to its corresponding tab

#### Scenario 3: Single-sheet file, article-based view
- ✓ Creates 3 default tabs
- ✓ Maps single sheet to Principal tab

#### Scenario 4: Multi-sheet file, article-based view (MAIN FIX)
- ✓ Creates 3 default tabs
- ✓ Maps ALL sheets to Principal tab
- ✓ All chapters have valid tab_id
- ✓ Items can find their parent chapters

## Impact
- **Minimal code changes:** Only 3 lines changed
- **No breaking changes:** Maintains backward compatibility for non-article-based view
- **Fixes the issue:** Chapters now correctly match tabs in article-based view
- **All sheets processed:** Multi-sheet files in article-based view now work correctly

## Build Status
✅ Build successful
✅ No lint errors introduced
✅ Logic verified with test scenarios
