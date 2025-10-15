# Sheet Separator Features - Quick Test Guide

## Overview
This guide provides quick test scenarios to verify the new sheet separator collapse and move features.

## Prerequisites
- Multi-sheet Excel file (2+ sheets)
- Article-based view enabled
- File analyzed

## Test Scenarios

### Scenario 1: Collapse/Expand Sheet Separator

**Steps:**
1. Upload a multi-sheet Excel file
2. Enable "Article-based view" toggle
3. Click "Analyze" button
4. Wait for analysis to complete
5. Locate a sheet separator (blue box with 📄 icon)
6. Click the chevron (▼) or sheet name

**Expected Results:**
- ✅ Chevron rotates from ▼ to ▶
- ✅ All chapters under that sheet collapse/hide
- ✅ Smooth animation
- ✅ Sheet separator remains visible

**Verification:**
7. Click the chevron again

**Expected Results:**
- ✅ Chevron rotates from ▶ to ▼
- ✅ All chapters under that sheet expand/show
- ✅ Smooth animation

---

### Scenario 2: Move Sheet to Another Tab

**Setup:**
- Ensure you have a multi-sheet, multi-tab file
- Ensure there are at least 2 tabs

**Steps:**
1. Complete analysis with article-based view enabled
2. Locate a sheet separator
3. Click "Move to tab" button on the sheet separator
4. Side panel opens on the right
5. Note the target tabs shown (current tab should be excluded)
6. Click on a target tab name

**Expected Results:**
- ✅ Side panel closes automatically
- ✅ Toast notification: "Sheet moved successfully"
- ✅ View refreshes
- ✅ Navigate to the target tab
- ✅ Sheet separator now appears in the target tab
- ✅ All chapters from the sheet are in the target tab

**Verification:**
7. Go back to the original tab
8. Verify the sheet separator is no longer there

---

### Scenario 3: Independent States

**Purpose:** Verify sheet collapse is independent from chapter collapse

**Steps:**
1. Expand Sheet 1 (if collapsed)
2. Collapse Chapter 1 in Sheet 1
3. Collapse Sheet 2 entirely
4. Expand Sheet 2
5. Observe Chapter states in Sheet 2

**Expected Results:**
- ✅ Chapter 1 in Sheet 1 remains collapsed
- ✅ Chapters in Sheet 2 are in their original state (not affected by sheet collapse)
- ✅ Each chapter's collapsed state is independent

---

### Scenario 4: Single Sheet File (No Separator)

**Purpose:** Verify feature doesn't interfere with single-sheet files

**Steps:**
1. Upload a single-sheet Excel file
2. Enable "Article-based view"
3. Click "Analyze"

**Expected Results:**
- ✅ No sheet separator appears
- ✅ Chapters are displayed directly
- ✅ Chapter collapse/expand works normally
- ✅ Individual chapter move works (if multiple tabs exist)

---

### Scenario 5: Move Multiple Chapters at Once

**Purpose:** Verify moving a sheet moves all its chapters

**Setup:**
- Multi-sheet file with Sheet A containing Chapters 1, 2, 3
- At least 2 tabs

**Steps:**
1. Note the number of chapters in Sheet A
2. Click "Move to tab" on Sheet A separator
3. Select target tab
4. Navigate to target tab

**Expected Results:**
- ✅ Toast: "Sheet moved successfully"
- ✅ All chapters (1, 2, 3) appear in the target tab
- ✅ Sheet A separator appears in the target tab
- ✅ Sheet A and its chapters are removed from the original tab

---

### Scenario 6: Move Button Visibility

**Purpose:** Verify "Move to tab" button only shows when needed

**Test A - Multiple Tabs:**
1. Load file with 2+ tabs
2. Check sheet separator

**Expected Results:**
- ✅ "Move to tab" button is visible

**Test B - Single Tab:**
1. Create or load a file with only 1 tab
2. Check sheet separator

**Expected Results:**
- ✅ "Move to tab" button is NOT visible

---

### Scenario 7: Dark Mode Compatibility

**Steps:**
1. Toggle dark mode in your system or browser
2. View a multi-sheet file with article-based view
3. Observe sheet separator colors

**Expected Results in Dark Mode:**
- ✅ Blue background is darker (dark:bg-blue-950)
- ✅ Text is lighter (dark:text-blue-100)
- ✅ "Move to tab" button hover effect works
- ✅ Chevron is visible and clear

---

### Scenario 8: Stress Test - Many Chapters

**Purpose:** Verify performance with large sheets

**Setup:**
- Sheet with 10+ chapters

**Steps:**
1. Expand the sheet (if collapsed)
2. Observe load time
3. Collapse the sheet
4. Observe collapse animation
5. Move the sheet to another tab
6. Observe move operation time

**Expected Results:**
- ✅ Collapse/expand is smooth (no lag)
- ✅ Move operation completes successfully
- ✅ Toast notification appears
- ✅ All chapters are moved correctly

---

## Common Issues and Fixes

### Issue: Sheet separator not showing
**Cause:** Single-sheet file
**Fix:** This is expected behavior. Sheet separators only show for multi-sheet files.

### Issue: "Move to tab" button not showing
**Cause:** Only one tab exists
**Fix:** This is expected. The button only shows when there are 2+ tabs.

### Issue: Sheet won't collapse
**Cause:** Possible click target issue
**Fix:** 
1. Try clicking directly on the chevron icon
2. Try clicking on the sheet name text
3. Ensure the sheet separator actually has chapters beneath it

### Issue: Move doesn't work
**Cause:** May be a database connection issue
**Fix:**
1. Check browser console for errors
2. Verify Supabase connection
3. Check if other mutations (chapter move) work

### Issue: Chapters appear in wrong order after move
**Cause:** Should not happen - chapters maintain their order
**Fix:** Refresh the page. If issue persists, this is a bug.

---

## Regression Testing

Verify these existing features still work:

- [ ] Chapter collapse/expand
- [ ] Article collapse/expand
- [ ] Individual chapter move to tab
- [ ] Comments display
- [ ] Specialities editing
- [ ] Image upload to items
- [ ] Normal (non-article-based) view still works

---

## Success Criteria

All scenarios pass if:
1. ✅ Sheet separators can be collapsed/expanded smoothly
2. ✅ All chapters in a sheet are affected by collapse
3. ✅ Sheets can be moved to other tabs in bulk
4. ✅ All chapters move together when sheet is moved
5. ✅ Existing features are not broken
6. ✅ UI is responsive and provides clear feedback
7. ✅ Works in both light and dark modes
8. ✅ Single-sheet files work correctly (no separator)

---

## Automation Notes

These tests are currently manual. Future enhancements could include:
- E2E tests with Playwright/Cypress
- Unit tests for state management
- Integration tests for mutations
- Visual regression tests for UI components

---

## Reporting Bugs

If you find issues, please report with:
1. Which scenario failed
2. Expected vs actual behavior
3. Browser and OS information
4. Console errors (if any)
5. Screenshots or screen recording
