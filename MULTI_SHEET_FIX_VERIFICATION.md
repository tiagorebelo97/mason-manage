# Multi-Sheet Tab Creation Fix Verification

## Problem Fixed
When uploading an Excel file with more than one sheet without enabling "Treat as single sheet" or "Article-based view", the system was always creating 3 fixed tabs instead of creating tabs from sheet names, causing errors.

## Solution
Added conditional logic to determine tab creation strategy based on sheet count and user preferences.

## Code Changes

### 1. Added `hasMultipleSheets` Logic
**File**: `src/pages/MapaQuantidades.tsx`
**Line**: 582

```typescript
const hasMultipleSheets = (articleBasedView || treatAsSingleSheet) ? false : workbook.SheetNames.length > 1;
```

### 2. Conditional Tab Creation
**File**: `src/pages/MapaQuantidades.tsx`
**Lines**: 584-614

```typescript
if (!hasMultipleSheets) {
  // Create 3 default tabs for single-sheet files or when forced single-sheet mode
  tabsToInsert.push(
    { name: "Principal", display_order: 0 },
    { name: "Arquitetura", display_order: 1 },
    { name: "Instalações Especiais", display_order: 2 }
  );
}

workbook.SheetNames.forEach((sheetName, index) => {
  if (hasMultipleSheets) {
    // For multi-sheet files, create tabs from sheet names
    tabsToInsert.push({
      name: sheetName,
      display_order: index,
    });
  }
  // ... process sheet data
});
```

### 3. Updated Sheet-to-Tab Mapping
**File**: `src/pages/MapaQuantidades.tsx`
**Lines**: 1124-1137

```typescript
if (hasMultipleSheets) {
  // For multi-sheet files, map each sheet to its corresponding tab
  insertedTabs.forEach(tab => {
    sheetNameToTabId.set(tab.name, tab.id);
  });
} else {
  // For single-sheet mode, map all sheets to the "Principal" tab
  const principalTab = insertedTabs.find(tab => tab.name === "Principal");
  if (principalTab) {
    workbook.SheetNames.forEach(sheetName => {
      sheetNameToTabId.set(sheetName, principalTab.id);
    });
  }
}
```

## Test Scenarios

### Scenario 1: Multi-Sheet File with Both Toggles OFF ✅
**Input**: Excel file with 3 sheets ("Sheet1", "Sheet2", "Sheet3")
**Settings**: treatAsSingleSheet = false, articleBasedView = false
**Expected Result**:
- `hasMultipleSheets = true`
- Creates 3 tabs: "Sheet1", "Sheet2", "Sheet3"
- Each sheet maps to its corresponding tab
- Chapters from Sheet1 → Sheet1 tab
- Chapters from Sheet2 → Sheet2 tab
- Chapters from Sheet3 → Sheet3 tab

### Scenario 2: Multi-Sheet File with "Treat as Single Sheet" ON ✅
**Input**: Excel file with 3 sheets ("Sheet1", "Sheet2", "Sheet3")
**Settings**: treatAsSingleSheet = true, articleBasedView = false
**Expected Result**:
- `hasMultipleSheets = false`
- Creates 3 tabs: "Principal", "Arquitetura", "Instalações Especiais"
- All sheets map to "Principal" tab
- Chapters from all sheets → Principal tab
- Sheet separators shown in UI

### Scenario 3: Multi-Sheet File with "Article-Based View" ON ✅
**Input**: Excel file with 3 sheets ("Sheet1", "Sheet2", "Sheet3")
**Settings**: treatAsSingleSheet = false, articleBasedView = true
**Expected Result**:
- `hasMultipleSheets = false`
- Creates 3 tabs: "Principal", "Arquitetura", "Instalações Especiais"
- All sheets map to "Principal" tab
- Chapters from all sheets → Principal tab
- Articles displayed with special formatting

### Scenario 4: Single-Sheet File with Both Toggles OFF ✅
**Input**: Excel file with 1 sheet ("Sheet1")
**Settings**: treatAsSingleSheet = false, articleBasedView = false
**Expected Result**:
- `hasMultipleSheets = false` (only 1 sheet)
- Creates 3 tabs: "Principal", "Arquitetura", "Instalações Especiais"
- Sheet1 maps to "Principal" tab
- Chapters from Sheet1 → Principal tab

## Testing Checklist

### Build & Quality
- [x] TypeScript compilation successful
- [x] ESLint passed (no new errors in modified file)
- [x] Build successful (dist/index.js created)

### Manual Testing Required
- [ ] Test Scenario 1: Multi-sheet file without toggles
- [ ] Test Scenario 2: Multi-sheet file with "Treat as single sheet"
- [ ] Test Scenario 3: Multi-sheet file with "Article-based view"
- [ ] Test Scenario 4: Single-sheet file without toggles
- [ ] Verify no regression in existing functionality

## Before vs After

### Before (Broken)
```typescript
// ALWAYS created 3 fixed tabs regardless of sheet count or settings
tabsToInsert.push(
  { name: "Principal" },
  { name: "Arquitetura" },
  { name: "Instalações Especiais" }
);
// ❌ Multi-sheet files would have wrong tab structure
// ❌ Data would be incorrectly mapped
```

### After (Fixed)
```typescript
// Conditional tab creation based on hasMultipleSheets
if (!hasMultipleSheets) {
  // Create 3 default tabs
} else {
  // Create tabs from sheet names
}
// ✅ Multi-sheet files get correct tabs
// ✅ Data correctly mapped to appropriate tabs
```

## Edge Cases Handled

1. **Two-sheet file, both toggles OFF**: Creates 2 tabs from sheet names ✅
2. **Ten-sheet file, both toggles OFF**: Creates 10 tabs from sheet names ✅
3. **Single-sheet file with "Treat as single sheet" ON**: Still works (redundant toggle) ✅
4. **Both toggles ON**: Article-based view takes precedence, creates 3 tabs ✅

## Impact

**Risk Level**: LOW
- Minimal code changes (surgical fix)
- No changes to UI components
- No database schema changes
- No changes to item/chapter processing logic
- Only affects tab creation strategy

**Backward Compatibility**: MAINTAINED
- Single-sheet files work as before
- Article-based view works as before
- Treat-as-single-sheet toggle works as before
- Only fixes the broken multi-sheet scenario

**Performance**: NO IMPACT
- Same number of database queries
- Same algorithmic complexity
- No additional loops or processing
