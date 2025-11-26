# AI Uncertain Rows Feature

## Overview

This feature allows the AI to identify rows in Excel files that it's uncertain about during analysis. These uncertain rows are presented to the user with clear visual distinction and action buttons to accept or reject them.

## How It Works

### 1. AI Analysis Phase

When analyzing Excel files with AI enabled (`AI Analyze` button), the system:
- Analyzes the Excel structure and content
- Identifies rows that are:
  - Missing critical data
  - Have unclear descriptions
  - Don't fit expected patterns
  - Are ambiguous in classification
- For each uncertain row, the AI provides:
  - Reason for uncertainty
  - Suggested action (include, exclude, or modify)
  - Suggested data corrections (if applicable)

### 2. User Review Phase

Uncertain rows are displayed in a dedicated panel with:
- **Amber/yellow background** - Makes uncertain rows visually distinct
- Detailed information about each row:
  - Sheet name and row index
  - Artigo number (if available)
  - Description
  - Reason for uncertainty
  - AI's suggested action
- Action buttons for each row:
  - **Accept** - Include the row in the analysis
  - **Reject** - Exclude the row from the analysis
  - **Modify** - Edit the row data before accepting (when AI suggests modifications)

### 3. Visual Tracking Phase

After accepting uncertain rows, they are visually tracked:
- **Blue background** - Accepted AI-suggested rows have light blue background
- **"AI" badge** - Small badge appears next to the artigo number
- Distinct hover state for better UX

## Visual States

### Uncertain Row (Before Action)
```
┌─────────────────────────────────────────────┐
│  Amber/Yellow Panel                          │
│  ⚠️  AI Uncertain Rows                       │
│                                              │
│  Row shows:                                  │
│  - Sheet name, row number                    │
│  - Description                               │
│  - Reason for uncertainty                    │
│  - Suggested action badge                    │
│  - [Modify] [Accept] [Reject] buttons        │
└─────────────────────────────────────────────┘
```

### Accepted Row (In Table)
```
┌─────────────────────────────────────────────┐
│  Light Blue Row                              │
│  1.2.3 [AI] | Description | UN | QT | ...   │
└─────────────────────────────────────────────┘
```

### Normal Row (In Table)
```
┌─────────────────────────────────────────────┐
│  White/Default Row                           │
│  1.2.4 | Description | UN | QT | ...         │
└─────────────────────────────────────────────┘
```

## User Workflow

1. **Upload Excel File** - Upload budget Excel file
2. **Click "AI Analyze"** - Start AI-powered analysis
3. **Review AI Insights** - View quality score, summary, and suggestions
4. **Review Uncertain Rows** - If any, they appear in amber panel
5. **Take Action**:
   - Accept rows you want to include
   - Reject rows you want to exclude
   - Modify rows before accepting (if AI suggests changes)
6. **View Results** - Accepted rows appear with blue background and AI badge

## Benefits

- **Transparency** - AI clearly indicates what it's uncertain about
- **User Control** - Users make final decisions on uncertain data
- **Visual Clarity** - Color coding makes it easy to identify AI suggestions
- **Audit Trail** - AI-accepted rows are clearly marked for future reference
- **Data Quality** - Helps identify and address data quality issues

## Technical Details

### Files Modified

1. **`src/services/aiAnalysisService.ts`**
   - Added `UncertainRow` interface
   - Updated AI prompt to identify uncertain rows
   - Modified response handling to include uncertain rows

2. **`src/components/analysis/UncertainRowsPanel.tsx`** (NEW)
   - Component for displaying uncertain rows
   - Handles accept/reject/modify actions
   - Bilingual support (EN/PT)

3. **`src/pages/MapaQuantidades.tsx`**
   - Integrated uncertain rows panel
   - Added state management for tracking accepted/rejected rows
   - Added visual highlighting for accepted rows

### State Management

- `uncertainRows`: Array of uncertain rows from AI
- `acceptedRows`: Set of accepted row keys
- `rejectedRows`: Set of rejected row keys
- `aiAcceptedItems`: Set of artigo numbers for visual highlighting

## Future Enhancements

Potential improvements:
- Persist accepted/rejected decisions to database
- Automatically insert accepted rows into analysis
- Bulk accept/reject actions
- Undo functionality
- Export uncertain rows report
- Machine learning to improve uncertainty detection over time
