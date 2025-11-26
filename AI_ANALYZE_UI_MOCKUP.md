# AI Analysis Feature - Visual Mockup

## Screen 1: Before File Upload

```
┌────────────────────────────────────────────────────────────────────┐
│ ← Back to Budgets                                                  │
│                                                                     │
│ Budget Name                                                         │
│ Quantity Map                                                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ╔═════════════════════════════════════════════════════════════╗   │
│ ║  💡 Pro Tip                                                  ║   │
│ ║  ┌───────────────────────────────────────────────────────┐  ║   │
│ ║  │ 💡 After uploading your Excel file, use the 'AI      │  ║   │
│ ║  │    Analyze' button (✨) to get smart insights about  │  ║   │
│ ║  │    your budget, including quality scores, data       │  ║   │
│ ║  │    validation, and AI-powered suggestions for        │  ║   │
│ ║  │    improvement.                                       │  ║   │
│ ║  └───────────────────────────────────────────────────────┘  ║   │
│ ╚═════════════════════════════════════════════════════════════╝   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │                                                               │   │
│ │                       📤                                      │   │
│ │                                                               │   │
│ │               No file uploaded yet                            │   │
│ │           Upload your Excel file to begin                     │   │
│ │                                                               │   │
│ │                  [📤 Upload Excel File]                       │   │
│ │                                                               │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Screen 2: After File Upload (Before Analysis)

```
┌────────────────────────────────────────────────────────────────────┐
│ ← Back to Budgets                                                  │
│                                                                     │
│ Budget Name                                                         │
│ Quantity Map                                                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ ✨ Try the AI Analysis for intelligent insights! It will    │  │
│ │    check data quality, identify missing information, and    │  │
│ │    provide improvement suggestions. [Use AI Analyze →]      │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  📄 Budget_2025.xlsx                                          │   │
│ │  No file uploaded yet                                         │   │
│ │                                                               │   │
│ │  [Analyze] [✨ AI Analyze] [🗑️]                               │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Screen 3: During AI Analysis

```
┌────────────────────────────────────────────────────────────────────┐
│ ← Back to Budgets                                                  │
│                                                                     │
│ Budget Name                                                         │
│ Quantity Map                                                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  📄 Budget_2025.xlsx                                          │   │
│ │  No file uploaded yet                                         │   │
│ │                                                               │   │
│ │  [Analyze] [🔄 AI Analyzing...] [🗑️]                          │   │
│ │                 (disabled)  (loading)     (disabled)         │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Screen 4: AI Insights Displayed (Excellent Quality)

```
┌────────────────────────────────────────────────────────────────────┐
│ ← Back to Budgets                                                  │
│                                                                     │
│ Budget Name                                                         │
│ Quantity Map                                                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  📄 Budget_2025.xlsx                                          │   │
│ │  File analyzed successfully                                   │   │
│ │                                                               │   │
│ │                                                    [🗑️]        │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ╔═══════════════════════════════════════════════════════════════╗ │
│ ║  ✨ AI Analysis Insights                                      ║ │
│ ║  AI-powered analysis results and recommendations              ║ │
│ ╠═══════════════════════════════════════════════════════════════╣ │
│ ║                                                                ║ │
│ ║  📊 Quality Score                         🟢 Excellent        ║ │
│ ║  ┌──────────────────────────────────────────────────────┐    ║ │
│ ║  │  85/100                                               │    ║ │
│ ║  └──────────────────────────────────────────────────────┘    ║ │
│ ║  ████████████████████████████████░░░░░░░░░ 85%               ║ │
│ ║                                                                ║ │
│ ║  ────────────────────────────────────────────────────────     ║ │
│ ║                                                                ║ │
│ ║  ✅ Summary                                                   ║ │
│ ║  ┌──────────────────────────────────────────────────────┐    ║ │
│ ║  │ Your budget file shows excellent organization with   │    ║ │
│ ║  │ well-structured chapters. Most items have complete   │    ║ │
│ ║  │ data. Minor improvements suggested below.            │    ║ │
│ ║  └──────────────────────────────────────────────────────┘    ║ │
│ ║                                                                ║ │
│ ║  ────────────────────────────────────────────────────────     ║ │
│ ║                                                                ║ │
│ ║  💡 Suggestions                                               ║ │
│ ║  ┌──────────────────────────────────────────────────────┐    ║ │
│ ║  │ ⚠️  Review 2 items with missing units              │    ║ │
│ ║  │ ⚠️  Add prices to 1 item for complete budgeting    │    ║ │
│ ║  │ ⚠️  Consider adding more detailed descriptions      │    ║ │
│ ║  └──────────────────────────────────────────────────────┘    ║ │
│ ║                                                                ║ │
│ ║  ────────────────────────────────────────────────────────     ║ │
│ ║                                                                ║ │
│ ║  📋 Data Validation Metrics                                   ║ │
│ ║  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐                ║ │
│ ║  │Total  │  │Missing│  │Missing│  │Missing│                ║ │
│ ║  │Items  │  │Units  │  │Quant. │  │Prices │                ║ │
│ ║  │  50   │  │   2   │  │   0   │  │   1   │                ║ │
│ ║  └───────┘  └───────┘  └───────┘  └───────┘                ║ │
│ ║                                                                ║ │
│ ║  Completeness ████████████████████░░ 94%                     ║ │
│ ║                                                                ║ │
│ ╚═══════════════════════════════════════════════════════════════╝ │
│                                                                     │
│ [Data tables and content below...]                                 │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Screen 5: AI Insights Displayed (Needs Improvement)

```
┌────────────────────────────────────────────────────────────────────┐
│ ← Back to Budgets                                                  │
│                                                                     │
│ Budget Name                                                         │
│ Quantity Map                                                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ╔═══════════════════════════════════════════════════════════════╗ │
│ ║  ✨ AI Analysis Insights                                      ║ │
│ ║  AI-powered analysis results and recommendations              ║ │
│ ╠═══════════════════════════════════════════════════════════════╣ │
│ ║                                                                ║ │
│ ║  📊 Quality Score                    🔴 Needs Improvement     ║ │
│ ║  ┌──────────────────────────────────────────────────────┐    ║ │
│ ║  │  45/100                                               │    ║ │
│ ║  └──────────────────────────────────────────────────────┘    ║ │
│ ║  ██████████████░░░░░░░░░░░░░░░░░░░░░░ 45%                    ║ │
│ ║                                                                ║ │
│ ║  ────────────────────────────────────────────────────────     ║ │
│ ║                                                                ║ │
│ ║  ✅ Summary                                                   ║ │
│ ║  ┌──────────────────────────────────────────────────────┐    ║ │
│ ║  │ Your budget file has structural issues. Many items   │    ║ │
│ ║  │ are missing critical data like units, quantities, or │    ║ │
│ ║  │ prices. Significant improvements needed for accuracy.│    ║ │
│ ║  └──────────────────────────────────────────────────────┘    ║ │
│ ║                                                                ║ │
│ ║  ────────────────────────────────────────────────────────     ║ │
│ ║                                                                ║ │
│ ║  💡 Suggestions                                               ║ │
│ ║  ┌──────────────────────────────────────────────────────┐    ║ │
│ ║  │ ⚠️  Review 15 items with missing units             │    ║ │
│ ║  │ ⚠️  Add quantities to 8 items                       │    ║ │
│ ║  │ ⚠️  Add prices to 12 items for complete budgeting  │    ║ │
│ ║  │ ⚠️  Improve chapter organization                    │    ║ │
│ ║  │ ⚠️  Add more detailed item descriptions             │    ║ │
│ ║  │ ⚠️  Verify unit consistency across items            │    ║ │
│ ║  └──────────────────────────────────────────────────────┘    ║ │
│ ║                                                                ║ │
│ ║  ────────────────────────────────────────────────────────     ║ │
│ ║                                                                ║ │
│ ║  📋 Data Validation Metrics                                   ║ │
│ ║  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐                ║ │
│ ║  │Total  │  │Missing│  │Missing│  │Missing│                ║ │
│ ║  │Items  │  │Units  │  │Quant. │  │Prices │                ║ │
│ ║  │  50   │  │  15   │  │   8   │  │  12   │                ║ │
│ ║  └───────┘  └───────┘  └───────┘  └───────┘                ║ │
│ ║                                                                ║ │
│ ║  Completeness ████████░░░░░░░░░░░░ 30%                       ║ │
│ ║                                                                ║ │
│ ╚═══════════════════════════════════════════════════════════════╝ │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Color Legend

### Quality Score Colors
- **🟢 Green Progress Bar**: Score 80-100 (Excellent)
  - RGB: #10B981
  - Background: Light green
  
- **🟡 Yellow Progress Bar**: Score 60-79 (Good)
  - RGB: #F59E0B
  - Background: Light yellow
  
- **🔴 Red Progress Bar**: Score 0-59 (Needs Improvement)
  - RGB: #EF4444
  - Background: Light red

### Validation Metrics Colors
- **Total Items Box**: Gray background (#F3F4F6)
- **Missing Units Box**: Red background (#FEE2E2)
- **Missing Quantities Box**: Orange background (#FED7AA)
- **Missing Prices Box**: Yellow background (#FEF3C7)

### AI Elements
- **Sparkles Icon**: ✨ (Purple gradient)
- **Card Border**: 2px solid with primary color
- **Card Background**: Gradient from-primary/5 to-accent/5

## Component Breakdown

### AI Analyze Button States

**Normal State:**
```
┌──────────────────┐
│ ✨ AI Analyze   │
└──────────────────┘
```

**Hover State:**
```
┌──────────────────┐
│ ✨ AI Analyze   │  (with subtle glow)
└──────────────────┘
```

**Loading State:**
```
┌────────────────────┐
│ 🔄 AI Analyzing... │
└────────────────────┘
```

**Disabled State:**
```
┌──────────────────┐
│ ✨ AI Analyze   │  (grayed out)
└──────────────────┘
```

### Suggestion Card Variants

**Full Card (Before Upload):**
```
╔══════════════════════════════════════╗
║  💡 Pro Tip                          ║
║  ┌────────────────────────────────┐ ║
║  │ 💡 [Description text here]     │ ║
║  │                                 │ ║
║  │    [Optional Action Button]    │ ║
║  └────────────────────────────────┘ ║
╚══════════════════════════════════════╝
```

**Compact Card (After Upload):**
```
┌──────────────────────────────────────┐
│ ✨ [Brief description] [Action →]   │
└──────────────────────────────────────┘
```

## Responsive Breakpoints

### Desktop (≥1024px)
- Full width insights card
- 4-column grid for metrics
- Side-by-side buttons
- Expanded suggestion cards

### Tablet (768-1023px)
- Full width insights card
- 4-column grid for metrics
- Stacked buttons possible
- Slightly compressed cards

### Mobile (<768px)
- Full width insights card
- 2-column grid for metrics
- Stacked buttons
- Compact card layouts
- Smaller text sizes

## Animation Sequence

1. **Button Click**: User clicks "AI Analyze"
2. **Button State**: Changes to "AI Analyzing..." with spinner
3. **Processing**: Backend AI analysis runs (2-5 seconds)
4. **Card Appears**: AI Insights card fades in (0.3s)
5. **Progress Bar**: Fills from 0 to final score (0.5s)
6. **Suggestions**: Stagger in one by one (0.1s delay each)
7. **Metrics**: Fade in as a group (0.3s)

## Accessibility Features

- All buttons have ARIA labels
- Progress bars have aria-valuenow/min/max
- Keyboard navigation: Tab through all elements
- Enter/Space to activate buttons
- Screen reader announces quality score
- High contrast mode supported
- Focus indicators on all interactive elements
