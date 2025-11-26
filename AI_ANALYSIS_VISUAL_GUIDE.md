# AI Analysis Feature - Visual Guide

## Button Placement

The "AI Analyse" button appears next to the existing "Analyze" button when a file is uploaded but not yet analyzed.

### Before Analysis
```
┌─────────────────────────────────────────────────────────────┐
│  📊 filename.xlsx                                           │
│  No file uploaded yet                                       │
│                                                             │
│  [Analyze]  [✨ AI Analyse]  [🗑️]                          │
└─────────────────────────────────────────────────────────────┘
```

### Button States

1. **Normal State**
   - [Analyze] - Standard button
   - [✨ AI Analyse] - Secondary button with sparkles icon

2. **During Analysis**
   - [⟳ Analyzing...] - Disabled with spinner
   - [✨ AI Analyse] - Disabled

3. **During AI Analysis**
   - [Analyze] - Disabled
   - [⟳ AI Analyzing...] - Active with spinner

## AI Insights Display

After clicking "AI Analyse", a new section appears below the file information:

```
┌─────────────────────────────────────────────────────────────┐
│  ✨ AI Analysis Insights                                    │
│                                                              │
│  Quality Score                                               │
│  ████████████████░░░░  85/100                               │
│                                                              │
│  Summary                                                     │
│  This construction budget contains 12 chapters and 145       │
│  items. The budget is well-structured with clear chapter     │
│  organization. Most items have complete information.         │
│                                                              │
│  Suggestions                                                 │
│  • 3 items are missing unit information                     │
│  • 7 items are missing quantities                           │
│  • Chapter 4 has inconsistent numbering                     │
│                                                              │
│  Data Validation                                             │
│  ┌───────────────┬───────────────┬───────────────┐         │
│  │ Missing Units │ Missing Qty   │ Missing Prices│         │
│  │      3        │      7        │      2        │         │
│  └───────────────┴───────────────┴───────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Visual Characteristics

### Color Coding

1. **Quality Score Bar**
   - 🟢 Green (80-100): Excellent quality
   - 🟡 Yellow (60-79): Good quality with some issues
   - 🔴 Red (0-59): Poor quality, needs improvement

2. **Button Styling**
   - Primary button: "Analyze" (standard blue)
   - Secondary button: "AI Analyse" (gray background)
   - Sparkles icon (✨) indicates AI functionality

### Layout

1. **File Information Section**
   - File icon + filename
   - Status text
   - Action buttons (right-aligned)

2. **AI Insights Section** (appears after AI analysis)
   - Header with sparkles icon
   - Quality score with progress bar
   - Summary text
   - Bulleted suggestions list
   - Data validation metrics grid

## User Flow

```
┌──────────────┐
│ Upload File  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Choose Analysis  │
│ • Analyze        │
│ • AI Analyse     │
└──────┬───────────┘
       │
       ▼ (AI Analyse clicked)
┌──────────────────┐
│ Run Normal       │
│ Analysis First   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Send to OpenAI   │
│ for Analysis     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Display Insights │
│ + Show Data      │
└──────────────────┘
```

## Translation

### English
- Button: "AI Analyse"
- Loading: "AI Analyzing..."
- Success: "File analyzed with AI successfully"

### Portuguese
- Button: "Análise IA"
- Loading: "A analisar com IA..."
- Success: "Ficheiro analisado com IA com sucesso"

## Responsive Design

The insights section adapts to different screen sizes:

### Desktop (>768px)
- 3-column grid for data validation metrics
- Full-width insights section

### Mobile (<768px)
- Single column layout
- Stacked validation metrics
- Scrollable suggestions list

## Accessibility

- Buttons have proper ARIA labels
- Loading states are announced to screen readers
- Color coding is supplemented with text indicators
- Keyboard navigation fully supported
