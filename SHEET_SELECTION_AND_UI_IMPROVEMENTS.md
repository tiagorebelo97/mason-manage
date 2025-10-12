# Sheet Selection and UI Improvements for Article-Based View

## Overview

This document describes the new features added to the Article-Based View in the MapaQuantidades component.

## Features Implemented

### 1. Sheet Selection Dialog

**When**: Triggered when clicking "Analyze" button with "Article-based view" toggle enabled.

**Purpose**: Allows users to select which sheets from the Excel file should be analyzed, instead of automatically analyzing all sheets.

**Behavior**:
- When "Analyze" is clicked with article-based view enabled, the system:
  1. Reads the Excel file to extract available sheet names
  2. Opens a dialog showing all available sheets
  3. All sheets are selected by default
  4. User can select/deselect individual sheets or use "Select All" checkbox
  5. Shows a count of selected sheets on the analyze button
  6. Only the selected sheets will be processed during analysis

**UI Components**:
- Modal dialog with sheet list
- Checkboxes for each sheet
- "Select All" checkbox for convenience
- Sheet counter badge showing "X sheets selected"
- Cancel and Analyze buttons

**Code Location**: `src/pages/MapaQuantidades.tsx`
- State variables: `sheetSelectionOpen`, `availableSheets`, `selectedSheets`
- Functions: `handleAnalyze` (modified), `handleConfirmAnalysis` (new)
- Dialog rendering: Lines ~2061-2110

### 2. Collapsible Sheet Separators

**When**: Displayed in article-based view when multiple sheets are analyzed.

**Purpose**: Organize content by sheet and allow users to collapse/expand each sheet section to focus on specific content.

**Behavior**:
- Sheet separators are now collapsible sections
- **Default state**: COLLAPSED (minimized) - all sheets start collapsed
- Click anywhere on the sheet separator to toggle expand/collapse
- Chevron icon rotates to indicate state (right = collapsed, down = expanded)
- Shows badge with chapter count for each sheet
- Smooth transition animation when expanding/collapsing

**Visual Design**:
- Blue gradient background (consistent with existing theme)
- Left border accent in blue
- Sheet icon (📄) and sheet name prominently displayed
- Badge showing number of chapters in that sheet
- Hover effect for better interactivity

**Code Location**: `src/pages/MapaQuantidades.tsx`
- State variable: `collapsedSheetSeparators` (Set of sheet names)
- Rendering: Lines ~2700-2740
- Uses `Collapsible` component from shadcn/ui

### 3. Enhanced Table UI/UX for Articles with UN and QT

**When**: Tables displaying articles that have UN (unit) and QT (quantity) values.

**Purpose**: Improve the visual appearance and readability of data tables in article-based view.

**Improvements**:
1. **Rounded corners** with border shadow for modern look
2. **Gradient header** with blue color scheme matching the theme
3. **Alternating row colors** for better readability (white/gray-50)
4. **Hover effects** on rows (changes to light blue on hover)
5. **Badge styling** for unit column with outline variant
6. **Font weight variations**:
   - Article numbers: medium weight
   - Quantities: semibold for emphasis
   - Observações: muted for de-emphasis
7. **Better spacing** and padding throughout
8. **Shadow effects** for depth perception

**Before**: Plain table with minimal styling
**After**: Modern, visually appealing table with clear hierarchy and interactive feedback

**Code Location**: `src/pages/MapaQuantidades.tsx`, Lines ~2881-2920

## Technical Implementation

### State Management

New state variables added:
```typescript
const [sheetSelectionOpen, setSheetSelectionOpen] = useState(false);
const [availableSheets, setAvailableSheets] = useState<string[]>([]);
const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
const [collapsedSheetSeparators, setCollapsedSheetSeparators] = useState<Set<string>>(new Set());
```

### Analysis Flow

1. User enables "Article-based view" toggle
2. User clicks "Analyze" button
3. System reads Excel file to get sheet names
4. Sheet selection dialog appears
5. User selects sheets to analyze
6. User clicks "Analyze Selected Sheets (X)"
7. System processes only selected sheets
8. Sheet separators are initialized as collapsed
9. Results displayed with collapsible sheet sections

### Filtering Logic

The analysis mutation now accepts `selectedSheets` parameter:
```typescript
const sheetsToProcess = (articleBasedView && selectedSheets.length > 0) 
  ? workbook.SheetNames.filter(name => selectedSheets.includes(name))
  : workbook.SheetNames;
```

This ensures only selected sheets are processed during analysis.

## User Benefits

1. **Better Control**: Users can choose which sheets to analyze, reducing noise from irrelevant sheets
2. **Organized View**: Collapsible sheet sections help focus on specific content
3. **Improved Readability**: Enhanced table design makes data easier to scan and understand
4. **Visual Hierarchy**: Clear distinction between sheets, chapters, and articles
5. **Performance**: Analyzing only selected sheets can improve performance for large files
6. **Default Collapsed**: Starting with collapsed sheets gives users a high-level overview first

## UI/UX Design Decisions

### Why Default Collapsed?
The requirement specified "by default are all minimized", so sheet separators start collapsed to:
- Give users an overview of all sheets first
- Reduce initial information overload
- Allow users to expand only the sheets they're interested in
- Improve initial page load visual performance

### Why Checkboxes Instead of Multi-Select?
- More intuitive for sheet selection
- Visual confirmation of selected state
- Easier to scan through a long list
- Consistent with common UI patterns

### Why Blue Theme for Tables?
- Maintains consistency with existing sheet separator design
- Blue is associated with trust and professionalism
- Provides good contrast without being overwhelming
- Works well in both light and dark modes

## Testing Recommendations

1. **Single Sheet File**:
   - Upload Excel with 1 sheet
   - Enable article-based view
   - Verify sheet selection dialog appears
   - Verify single sheet is pre-selected

2. **Multi-Sheet File**:
   - Upload Excel with 3+ sheets
   - Enable article-based view
   - Verify all sheets listed in dialog
   - Test selecting/deselecting individual sheets
   - Test "Select All" checkbox
   - Verify sheet separators appear
   - Test collapsing/expanding sheet separators

3. **Table Rendering**:
   - Find articles with UN and QT values
   - Verify enhanced table styling appears
   - Test hover effects on rows
   - Verify alternating row colors
   - Check responsive behavior

4. **Edge Cases**:
   - Select no sheets (button should be disabled)
   - Select only 1 sheet from multi-sheet file
   - Cancel dialog (should return to analyze button)
   - Large files with many sheets (test scroll in dialog)

## Future Enhancements

Potential improvements for future iterations:
1. Remember last selected sheets per file
2. Add search/filter for sheets in dialog
3. Save collapsed/expanded state in session storage
4. Add keyboard shortcuts for expand/collapse
5. Export only selected sheets
6. Bulk actions on articles within a sheet
