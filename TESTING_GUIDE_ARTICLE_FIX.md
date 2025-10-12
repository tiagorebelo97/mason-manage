# Testing Guide - Article Items Display Fix

## Quick Test Checklist

### Prerequisites
- [ ] Application is running
- [ ] User is logged in
- [ ] At least one Orçamento exists in the database

### Test Scenario 1: Article-Based View Toggle
1. Navigate to an Orçamento's "Mapa de Quantidades" page
2. Upload an Excel file (if not already uploaded)
3. **Before analyzing**, toggle "Article-based view" switch ON
4. ✅ Verify: Switch should be checked

### Test Scenario 2: File Analysis
1. With "Article-based view" enabled, click "Analyze" button
2. Wait for analysis to complete
3. ✅ Verify: Success message appears
4. ✅ Verify: Tabs are visible (Principal, Arquitetura, Instalações Especiais)

### Test Scenario 3: Chapter Display
1. Click on a tab to view chapters
2. ✅ Verify: Chapters are displayed with:
   - Chapter number and name in **large, bold text** (text-xl)
   - Article count badge (e.g., "[5 articles]")
   - Gradient background
   - Collapsible chevron icon
3. ✅ Verify: Chapter is collapsed by default
4. Click on chapter header to expand
5. ✅ Verify: Chapter expands smoothly

### Test Scenario 4: Article Display
1. Expand a chapter that contains articles
2. ✅ Verify: Articles are displayed with:
   - **Always-visible header** with:
     - Article number and title in **bold, primary color**
     - Item count badge (if items exist)
     - Note count badge (if text notes exist)
   - Gradient header background
   - Enhanced border with shadow
3. ✅ Verify: Articles are NOT collapsed by default (content is visible)

### Test Scenario 5: Items Display in Articles
**This is the key test for the fix!**

1. Find an article that contains items (look for item count badge)
2. ✅ Verify: Article content is **visible immediately** (not collapsed)
3. ✅ Verify: Items are displayed in a table with:
   - **ARTIGO column** showing item numbers in **bold, primary color**
   - DESCRIÇÃO column showing descriptions
   - UN column showing units (in badge)
   - QT column showing quantities in **large, bold font**
   - OBSERVAÇÕES column showing notes
4. ✅ Verify: Items with ARTIGOs like "1.1.1", "1.1.2" are visible
5. ✅ Verify: Table has:
   - Enhanced border (border-2, rounded-xl)
   - Gradient header
   - Alternating row colors
   - Hover effects on rows

### Test Scenario 6: Multiple Dot ARTIGOs
**Test support for ARTIGO numbers with multiple dots**

Look for items with ARTIGOs like:
- "1.1.1", "1.1.2", "1.1.3" (two dots)
- "1.2.3.4" (three dots, if exists)

✅ Verify: These items are:
1. Displayed in the article table
2. ARTIGO field is visible and correct
3. All other fields (DESCRIÇÃO, UN, QT, OBSERVAÇÕES) are visible
4. No errors or missing data

### Test Scenario 7: Text Notes Display
1. Find an article that contains text notes (look for note count badge)
2. ✅ Verify: Text notes are displayed:
   - In colored box with blue background
   - Left border accent (blue)
   - Between or around item tables
   - With proper spacing

### Test Scenario 8: Empty Articles
1. Find an article with no items or notes (or all badges show "0")
2. ✅ Verify: Empty state message is displayed:
   - "No content in this article"
   - "This article may be a placeholder or section header"
   - Centered with good spacing

### Test Scenario 9: Collapse/Expand Functionality
1. Click on an expanded article header
2. ✅ Verify: Article collapses smoothly
3. ✅ Verify: Chevron icon rotates
4. ✅ Verify: Content is hidden
5. Click on collapsed article header
6. ✅ Verify: Article expands smoothly
7. ✅ Verify: Content reappears
8. ✅ Verify: All items are visible again

### Test Scenario 10: Multiple Sheets
**If Excel file has multiple sheets**

1. ✅ Verify: Sheet separators are displayed with:
   - Sheet name in **very large, bold text** (text-2xl)
   - Chapter count badge
   - Primary gradient background
   - Enhanced border
2. Click on sheet separator to collapse
3. ✅ Verify: All chapters in that sheet collapse
4. Click again to expand
5. ✅ Verify: Chapters reappear

### Test Scenario 11: Visual Styling
✅ Verify overall styling:
1. **Consistent colors**: Primary color theme throughout
2. **Clear hierarchy**: Sheet > Chapter > Article > Items
3. **Good spacing**: Not too cramped
4. **Shadows and depth**: Cards have subtle shadows
5. **Hover effects**: Interactive elements respond to hover
6. **Smooth animations**: All transitions are smooth (300ms)
7. **Good contrast**: Text is readable in both light and dark modes

### Test Scenario 12: Responsiveness
1. Resize browser window
2. ✅ Verify: Layout adapts properly
3. ✅ Verify: Tables scroll horizontally if needed
4. ✅ Verify: No layout breaks

---

## Expected Results Summary

### ✅ PASS Criteria
- [x] Articles with items ARE showing up (not hidden)
- [x] Item ARTIGO field is visible in bold with primary color
- [x] Items with multiple dots (e.g., "1.1.1") are displayed
- [x] Article headers are always visible
- [x] Content badges show item/note counts
- [x] UI is significantly improved with better styling
- [x] Collapse/expand works smoothly
- [x] Empty states are clear
- [x] No console errors

### ❌ FAIL Indicators
- [ ] Articles appear empty when they have items
- [ ] Items with ARTIGO numbers are not visible
- [ ] Article headers are hidden
- [ ] Content doesn't show when expanded
- [ ] Console errors appear
- [ ] Styling is broken or inconsistent
- [ ] Animations are jerky or missing

---

## Common Issues and Solutions

### Issue: "Article appears empty but should have items"
**Solution:** 
1. Check browser console for errors
2. Verify Excel file structure (items need QT AND UN columns)
3. Check if "Article-based view" was enabled before analysis
4. Re-analyze the file

### Issue: "Items not showing ARTIGO numbers"
**Solution:**
1. This was fixed - items now show ARTIGO in bold with primary color
2. If still not visible, check if Excel file has ARTIGO column populated
3. Check browser console for errors

### Issue: "Articles are all collapsed"
**Solution:**
1. This was fixed - articles now start expanded by default
2. Click on article headers to expand them
3. If persists, clear sessionStorage and re-analyze

### Issue: "UI looks different than expected"
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Rebuild the application

---

## Performance Checks

✅ Verify:
1. Page loads in reasonable time (< 3 seconds)
2. Scrolling is smooth
3. Collapse/expand is instant
4. No lag when interacting with elements
5. Large files (many articles/items) handle well

---

## Compatibility Checks

✅ Test in:
1. Chrome (latest)
2. Firefox (latest)
3. Safari (latest)
4. Edge (latest)

✅ Test in:
1. Light mode
2. Dark mode

---

## Regression Testing

Ensure existing features still work:
- [ ] Non-article-based view (regular chapter/item view)
- [ ] File upload
- [ ] File re-analysis
- [ ] Tab switching
- [ ] Item editing
- [ ] Chapter moving between tabs
- [ ] Specialties management

---

## Sign-Off

After completing all tests:

- [ ] All critical tests passed
- [ ] No major issues found
- [ ] UI improvements are visible and working
- [ ] Items in articles are displaying correctly
- [ ] Ready for user acceptance testing

**Tester Name:** _______________
**Date:** _______________
**Build Version:** _______________
**Notes:** _______________________________________________
