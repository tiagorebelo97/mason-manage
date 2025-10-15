# Sheet Separator Fix - Verification Guide

## Issue Fixed
When moving a sheet separator to another tab, the separator would disappear, leaving only the content (chapters) without the visual separator header.

## Root Cause
The code was checking `chaptersBySheet.size > 1` to determine if the separator should be shown. This condition checked if there were multiple sheets **in the current tab**, not in the entire file. When a sheet was the only one in a tab after moving, the separator would disappear.

## Solution
Changed the logic to calculate `totalUniqueSheets` across all chapters in the file. The separator now shows if there were originally multiple sheets in the uploaded Excel file, regardless of how the sheets are distributed across tabs.

## Test Scenarios

### Scenario 1: Move Sheet to Empty Tab (Main Issue)
**Setup:**
- Upload Excel file with 2+ sheets (e.g., Sheet1, Sheet2)
- Ensure analysis creates multiple tabs (Tab A, Tab B, Tab C)
- All sheets start in Tab A

**Steps:**
1. Navigate to Tab A
2. Verify Sheet1 separator is visible (✓ should show "📄 Sheet1")
3. Click "Move to tab" on Sheet1 separator
4. Select Tab B (which is currently empty)
5. Navigate to Tab B

**Expected Result:**
- ✅ Sheet1 separator IS visible in Tab B
- ✅ Separator shows: "📄 Sheet1" with move button
- ✅ All chapters from Sheet1 are displayed below the separator
- ✅ Separator can be collapsed/expanded

**Before Fix:**
- ❌ Sheet1 separator would NOT be visible in Tab B
- ❌ Only chapters would appear without the separator header

---

### Scenario 2: Move Sheet to Tab with Existing Sheets
**Setup:**
- Upload Excel file with 3 sheets (Sheet1, Sheet2, Sheet3)
- Sheet1 and Sheet2 are in Tab A
- Sheet3 is in Tab B

**Steps:**
1. Move Sheet1 from Tab A to Tab B
2. Navigate to Tab B

**Expected Result:**
- ✅ Both Sheet1 and Sheet3 separators are visible in Tab B
- ✅ Each separator maintains its collapse/expand functionality
- ✅ Moving functionality still works for both sheets

---

### Scenario 3: Single Sheet File (No Regression)
**Setup:**
- Upload Excel file with only 1 sheet

**Expected Result:**
- ✅ No sheet separator is shown (original behavior maintained)
- ✅ Chapters are displayed directly without separator
- ✅ `totalUniqueSheets === 1` so separator is correctly hidden

---

### Scenario 4: All Sheets in Different Tabs
**Setup:**
- Upload Excel file with 3 sheets
- Move Sheet1 to Tab A
- Move Sheet2 to Tab B  
- Move Sheet3 to Tab C

**Expected Result:**
- ✅ Each tab shows its sheet separator (even though only 1 sheet per tab)
- ✅ All separators maintain collapse/expand functionality
- ✅ Each separator shows the move button

---

## Code Changes Summary

### Change 1: Calculate Total Unique Sheets
```typescript
// Calculate total unique sheets across all chapters (not just current tab)
const totalUniqueSheets = new Set(
  chaptersWithArticles
    .filter(cwa => cwa.sheet_name)
    .map(cwa => cwa.sheet_name)
).size;
```

### Change 2: Update Separator Visibility Condition
```typescript
// Before:
{chaptersBySheet.size > 1 && (

// After:
{totalUniqueSheets > 1 && (
```

### Change 3: Update Chapter Visibility Condition
```typescript
// Before:
{(!isSheetCollapsed || chaptersBySheet.size === 1) && chaptersInSheet.map(

// After:
{(!isSheetCollapsed || totalUniqueSheets === 1) && chaptersInSheet.map(
```

## Technical Details

- **File Modified:** `src/pages/MapaQuantidades.tsx`
- **Lines Changed:** 2534-2539, 2564, 2628
- **Build Status:** ✅ Successful
- **Backward Compatibility:** ✅ Maintained (single-sheet files work as before)

## Verification Checklist

- [ ] Build passes without errors
- [ ] Multi-sheet file shows separators in all tabs after moving
- [ ] Single-sheet file shows no separators (unchanged behavior)
- [ ] Collapse/expand functionality still works
- [ ] Move sheet functionality still works
- [ ] No visual regressions in separator styling
- [ ] Performance: No noticeable lag when switching tabs

## Related Documentation
- `SHEET_SEPARATOR_ENHANCEMENTS.md` - Original feature documentation
- `SHEET_SEPARATOR_TEST_GUIDE.md` - Testing guide for separator features
- `CODE_CHANGES_SUMMARY.md` - Previous implementation details
