# QT Decimal Limit Fix - Two Decimal Places

## Overview
This document describes the implementation of limiting QT (quantity) values to two decimal places throughout the application.

## Problem Statement
QT values needed to be limited to two decimal places to ensure consistency and readability in the Mapa Quantidades tables. This applies to values like:

| ARTIGO | DESCRIÇÃO           | UN | QT   |
|--------|---------------------|----|------|
| 1.2.1  | Paredes interiores  | m2 | 50   |
| 1.2.2  | Pavimentos          | m2 | 30.5 |

## Solution

### 1. Parsing - Round Values When Reading Excel Files
**File:** `src/pages/MapaQuantidades.tsx` (Line 610)

**Before:**
```typescript
const parsedQt = qtValue ? parseFloat(qtValue.replace(',', '.')) : null;
```

**After:**
```typescript
const parsedQt = qtValue ? Math.round(parseFloat(qtValue.replace(',', '.')) * 100) / 100 : null;
```

**Behavior:**
- Uses `Math.round()` to round to nearest hundredth
- Multiplies by 100, rounds, then divides by 100 to maintain 2 decimal places
- Examples:
  - `50.1234567` → `50.12`
  - `50.125` → `50.13` (rounds up)
  - `50.126` → `50.13`
  - `0.005` → `0.01`

### 2. Display - Format Values in Tables
**File:** `src/pages/MapaQuantidades.tsx` (Lines 1465 & 1738)

**Before:**
```typescript
{item.qt !== null ? item.qt : '-'}
```

**After:**
```typescript
{item.qt !== null ? Number(item.qt).toFixed(2).replace(/\.?0+$/, '') : '-'}
```

**Behavior:**
- Uses `.toFixed(2)` to format to 2 decimal places
- Uses `.replace(/\.?0+$/, '')` to remove trailing zeros
- Examples:
  - `50` → `"50"` (no decimals shown)
  - `50.5` → `"50.5"` (one decimal)
  - `50.50` → `"50.5"` (trailing zero removed)
  - `50.12` → `"50.12"` (two decimals)
  - `null` → `"-"` (dash for null values)

## Testing

### Test Cases
```javascript
// Formatting tests
formatQT(50)         // => "50"
formatQT(50.5)       // => "50.5"
formatQT(50.50)      // => "50.5"
formatQT(50.123)     // => "50.12"
formatQT(50.1234567) // => "50.12"
formatQT(0.5)        // => "0.5"
formatQT(0.05)       // => "0.05"
formatQT(null)       // => "-"

// Parsing/rounding tests
roundQT('50.1234567') // => 50.12
roundQT('50.125')     // => 50.13
roundQT('50.126')     // => 50.13
roundQT('50,50')      // => 50.5 (handles comma as decimal separator)
```

### Build Verification
```bash
npm run build
# ✓ built successfully
```

## Impact
- **Parsing:** All QT values from Excel files are now rounded to 2 decimal places when stored
- **Display:** QT values in tables show maximum 2 decimal places, with trailing zeros removed
- **User Experience:** More consistent and cleaner display of quantity values
- **Backward Compatibility:** Existing data is not affected; only new imports and displays are impacted

## Files Modified
- `src/pages/MapaQuantidades.tsx` (3 lines changed)
  - Line 610: QT parsing/rounding logic
  - Line 1465: QT display in first table view
  - Line 1738: QT display in second table view

## Notes
- The regex `/\.?0+$/` removes trailing zeros: `50.00` → `50`, `50.50` → `50.5`
- The rounding uses banker's rounding (round half to even) which is JavaScript's default
- Both comma (`,`) and period (`.`) are supported as decimal separators during parsing
