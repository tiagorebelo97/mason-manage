# Article-Based View Tab Fix

## Problem Statement

In article-based view, when an Excel file had multiple sheets, the content was being split into separate tabs (one tab per sheet). This violated the expected behavior where all content should be in the Principal tab with sheet separators.

## Expected Behavior

According to the documentation (ARTICLE_BASED_VIEW_MULTISHEET_FIX.md and ARTICLE_VIEW_ENHANCEMENTS.md):
- Article-based view should ALWAYS create 3 tabs: **Principal**, **Arquitetura**, and **Instalações Especiais**
- ALL content from ALL sheets should be displayed under the **Principal** tab
- Sheet separators should be shown within the Principal tab to distinguish content from different sheets

## Root Causes

### Issue 1: Incorrect hasMultipleSheets Logic
**Location**: `src/pages/MapaQuantidades.tsx`, line 581

**Before**:
```typescript
const hasMultipleSheets = treatAsSingleSheet ? false : (articleBasedView || workbook.SheetNames.length > 1);
```

**Problem**: The `articleBasedView` variable was included in the condition that determined if the file had multiple sheets. When `articleBasedView` was true, it caused `hasMultipleSheets` to be true, which triggered per-sheet tab creation instead of the 3 default tabs.

**After**:
```typescript
const hasMultipleSheets = (treatAsSingleSheet || articleBasedView) ? false : workbook.SheetNames.length > 1;
```

**Solution**: Changed the condition so that when `articleBasedView` is true, `hasMultipleSheets` is set to false, which causes the system to create 3 default tabs and map all sheets to the Principal tab.

### Issue 2: Sheet Separators Hidden in Article-Based View
**Location**: `src/pages/MapaQuantidades.tsx`, line 2507

**Before**:
```typescript
{chaptersBySheet.size > 1 && !isArticleBasedViewActive && (
```

**Problem**: The condition `!isArticleBasedViewActive` prevented sheet separators from being displayed in article-based view, even when multiple sheets were present.

**After**:
```typescript
{chaptersBySheet.size > 1 && (
```

**Solution**: Removed the `!isArticleBasedViewActive` condition so that sheet separators are shown in article-based view when there are multiple sheets.

## Changes Made

### Code Changes

1. **src/pages/MapaQuantidades.tsx** (line 581)
   - Changed `hasMultipleSheets` logic to treat article-based view as single-sheet mode

2. **src/pages/MapaQuantidades.tsx** (line 1155)
   - Updated comment to clarify that article-based view maps ALL sheets to Principal tab

3. **src/pages/MapaQuantidades.tsx** (line 2507)
   - Removed `!isArticleBasedViewActive` condition from sheet separator logic

### Documentation Changes

4. **ARTICLE_BASED_VIEW_FEATURE.md**
   - Updated point #1 to state that article-based view "Always creates 3 tabs" instead of "Creates one tab per Excel sheet"

## Testing

The changes were verified with:
1. Successful build with no new lint errors
2. No new TypeScript compilation errors

## Expected User Impact

After this fix:
- When analyzing a multi-sheet Excel file with article-based view enabled, users will see 3 tabs (Principal, Arquitetura, Instalações Especiais)
- All articles from all sheets will be displayed under the Principal tab
- Sheet separators (blue banners with sheet names) will be shown to distinguish content from different sheets
- No longer will content be incorrectly split into separate tabs per sheet
