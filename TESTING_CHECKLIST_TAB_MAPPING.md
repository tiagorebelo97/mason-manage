# Testing Checklist for Article-Based View Tab Mapping Fix

## Quick Test (5 minutes)
- [ ] Upload a multi-sheet Excel file with sheets named "Sheet1", "Sheet2", "Sheet3"
- [ ] Enable "Article-based view" checkbox
- [ ] Click "Analyze"
- [ ] **Verify**: 3 tabs created: Principal, Arquitetura, Instalações Especiais
- [ ] **Verify**: All chapters appear in Principal tab (since no special sheet names)
- [ ] **Verify**: No chapter duplication across tabs

## Comprehensive Test (15 minutes)

### Test 1: Matching Tab Names
**Excel Setup:**
- Sheet 1: Named "Principal" with Chapter 1 and items
- Sheet 2: Named "Arquitetura" with Chapter 2 and items
- Sheet 3: Named "Instalações Especiais" with Chapter 3 and items

**Steps:**
1. [ ] Upload the Excel file
2. [ ] Enable "Article-based view"
3. [ ] Click "Analyze"
4. [ ] Navigate to Principal tab
5. [ ] **Verify**: Chapter 1 appears here
6. [ ] **Verify**: Chapters 2 and 3 do NOT appear here
7. [ ] Navigate to Arquitetura tab
8. [ ] **Verify**: Chapter 2 appears here
9. [ ] **Verify**: Chapters 1 and 3 do NOT appear here
10. [ ] Navigate to Instalações Especiais tab
11. [ ] **Verify**: Chapter 3 appears here
12. [ ] **Verify**: Chapters 1 and 2 do NOT appear here

### Test 2: Mixed Sheet Names
**Excel Setup:**
- Sheet 1: Named "Sheet1" with Chapter 1
- Sheet 2: Named "Arquitetura" with Chapter 2
- Sheet 3: Named "Especiais" with Chapter 3

**Steps:**
1. [ ] Upload the Excel file
2. [ ] Enable "Article-based view"
3. [ ] Click "Analyze"
4. [ ] Navigate to Principal tab
5. [ ] **Verify**: Chapter 1 appears here (from "Sheet1")
6. [ ] Navigate to Arquitetura tab
7. [ ] **Verify**: Chapter 2 appears here (from "Arquitetura")
8. [ ] Navigate to Instalações Especiais tab
9. [ ] **Verify**: Chapter 3 appears here (from "Especiais")

### Test 3: Case Variations and Accents
**Excel Setup:**
- Sheet 1: Named "ARQUITETURA" (uppercase)
- Sheet 2: Named "instalacoes" (lowercase, no accent)
- Sheet 3: Named "Sheet1"

**Steps:**
1. [ ] Upload the Excel file
2. [ ] Enable "Article-based view"
3. [ ] Click "Analyze"
4. [ ] Navigate to Arquitetura tab
5. [ ] **Verify**: Chapter from "ARQUITETURA" appears here
6. [ ] Navigate to Instalações Especiais tab
7. [ ] **Verify**: Chapter from "instalacoes" appears here
8. [ ] Navigate to Principal tab
9. [ ] **Verify**: Chapter from "Sheet1" appears here

### Test 4: Single Sheet (Unchanged Behavior)
**Excel Setup:**
- Single sheet named "Sheet1"

**Steps:**
1. [ ] Upload the Excel file
2. [ ] Enable "Article-based view"
3. [ ] Click "Analyze"
4. [ ] **Verify**: 3 tabs created: Principal, Arquitetura, Instalações Especiais
5. [ ] **Verify**: All chapters appear in Principal tab
6. [ ] **Verify**: Arquitetura and Instalações Especiais tabs are empty

### Test 5: Non-Article-Based View (Unchanged)
**Excel Setup:**
- Multi-sheet Excel with "Sheet1", "Sheet2", "Sheet3"

**Steps:**
1. [ ] Upload the Excel file
2. [ ] **Do NOT enable** "Article-based view"
3. [ ] Click "Analyze"
4. [ ] **Verify**: 3 tabs created from sheet names: Sheet1, Sheet2, Sheet3
5. [ ] **Verify**: Each tab shows chapters from its corresponding sheet
6. [ ] **Verify**: Behavior is same as before the fix

## Edge Cases to Test

### Edge Case 1: Sheet with "Especiais" Only
- [ ] Sheet named "Especiais" (without "Instalações")
- [ ] **Expected**: Maps to Instalações Especiais tab

### Edge Case 2: Sheet with Partial Match
- [ ] Sheet named "Arquitetura Principal"
- [ ] **Expected**: Maps to Arquitetura tab (because "arquitetura" is found first)

### Edge Case 3: Empty Tabs
- [ ] Upload Excel with only "Sheet1"
- [ ] **Expected**: Principal tab has chapters, other tabs are empty

## Regression Tests

### Regression Test 1: Regular Multi-Sheet (Non-Article-Based)
- [ ] Upload multi-sheet Excel
- [ ] Do NOT enable article-based view
- [ ] **Verify**: Creates one tab per sheet (old behavior preserved)

### Regression Test 2: Single Sheet (Non-Article-Based)
- [ ] Upload single-sheet Excel
- [ ] Do NOT enable article-based view
- [ ] **Verify**: Creates 3 default tabs with all chapters in Principal (old behavior preserved)

## Performance Test
- [ ] Upload Excel with 10+ sheets in article-based view
- [ ] **Verify**: Analysis completes without errors
- [ ] **Verify**: All chapters distributed correctly

## Final Checklist
- [ ] No chapters duplicated across tabs
- [ ] Each chapter appears in exactly one tab
- [ ] Tab mapping is predictable and documented
- [ ] Case insensitive matching works
- [ ] Accent handling works (instalações = instalacoes)
- [ ] Non-article-based view unchanged
- [ ] No console errors during analysis
- [ ] Build succeeds without warnings

## Success Criteria
✅ All tests pass  
✅ No chapter duplication  
✅ Predictable tab structure  
✅ Backward compatibility maintained  
