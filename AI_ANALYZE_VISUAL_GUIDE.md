# AI Analysis Feature - Visual Guide

## UI Components Visualization

### 1. AI Analyze Button (Before Analysis)
```
┌─────────────────────────────────────────────────────────────┐
│  📄 File.xlsx                                                │
│  No file uploaded yet                                        │
│                                                               │
│  ┌──────────┐  ┌─────────────────┐  ┌──────┐                │
│  │ Analyze  │  │  ✨ AI Analyze  │  │  🗑️  │                │
│  └──────────┘  └─────────────────┘  └──────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 2. AI Insights Display Card

```
╔══════════════════════════════════════════════════════════════╗
║  ✨ AI Analysis Insights                                     ║
║  AI-powered analysis results and recommendations             ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  📊 Quality Score                           ⭐ Excellent     ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │  85/100                                              │    ║
║  └─────────────────────────────────────────────────────┘    ║
║  ████████████████████████████████░░░░░░░░░░░░░ 85%          ║
║                                                               ║
║  ───────────────────────────────────────────────────────────║
║                                                               ║
║  ✅ Summary                                                  ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │ Your budget file shows good organization with        │    ║
║  │ clear chapter structure. Most items have complete    │    ║
║  │ data, but some items are missing units or prices.    │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                                                               ║
║  ───────────────────────────────────────────────────────────║
║                                                               ║
║  💡 Suggestions                                              ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │ ⚠️  Review items with missing units (3 items)       │    ║
║  │ ⚠️  Add prices to 5 items for complete budgeting    │    ║
║  │ ⚠️  Consider grouping items by construction phase   │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                                                               ║
║  ───────────────────────────────────────────────────────────║
║                                                               ║
║  📋 Data Validation Metrics                                  ║
║  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       ║
║  │ Total   │  │ Missing │  │ Missing │  │ Missing │       ║
║  │ Items   │  │ Units   │  │ Quant.  │  │ Prices  │       ║
║  │   45    │  │    3    │  │    2    │  │    5    │       ║
║  └─────────┘  └─────────┘  └─────────┘  └─────────┘       ║
║                                                               ║
║  Completeness ████████████████████░░░░░ 78%                 ║
║                                                               ║
╚══════════════════════════════════════════════════════════════╝
```

### 3. AI Suggestion Card (Before Upload)

```
╔══════════════════════════════════════════════════════════════╗
║  💡 Pro Tip                                                  ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ 💡 After uploading your Excel file, use the 'AI     │   ║
║  │    Analyze' button (✨) to get smart insights about │   ║
║  │    your budget, including quality scores, data      │   ║
║  │    validation, and AI-powered suggestions for       │   ║
║  │    improvement.                                      │   ║
║  │                                                      │   ║
║  │    [✨ Learn More]                                   │   ║
║  └──────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════╝
```

### 4. AI Suggestion Card (After Upload, Compact)

```
┌──────────────────────────────────────────────────────────────┐
│ ✨ Try the AI Analysis for intelligent insights! It will    │
│    check data quality, identify missing information, and    │
│    provide improvement suggestions. [Use AI Analyze →]      │
└──────────────────────────────────────────────────────────────┘
```

## Color Coding Guide

### Quality Score Colors
- **🟢 Green (85/100)**: Excellent quality (80-100)
- **🟡 Yellow (70/100)**: Good quality (60-79)  
- **🔴 Red (45/100)**: Needs improvement (0-59)

### Validation Metrics Colors
- **Total Items**: Gray background (neutral)
- **Missing Units**: Red background/text
- **Missing Quantities**: Orange background/text
- **Missing Prices**: Yellow background/text

### AI Elements
- **Primary**: Purple gradient (#8B5CF6)
- **Secondary**: Blue gradient (#3B82F6)
- **Accent**: Sparkles icon (✨)

## Layout Sections

### Page Structure
```
Header
├── Back Button
├── Title (Budget Name)
└── Subtitle (Quantity Map)

File Section
├── Upload Area (if no file)
│   └── AI Suggestion Card (Pro Tip)
└── File Info Card (if file uploaded)
    ├── File Details
    ├── Action Buttons
    │   ├── Analyze
    │   ├── AI Analyze ✨
    │   └── Delete
    └── AI Suggestion Card (After Upload)

AI Insights Section (after AI analysis)
└── AI Insights Display Card
    ├── Quality Score
    ├── Summary
    ├── Suggestions
    └── Validation Metrics

Data Display Section
└── Tabs/Tables with analyzed data
```

## Responsive Design

### Desktop (≥1024px)
- Full width cards
- 4-column grid for validation metrics
- Side-by-side buttons
- Expanded card layouts

### Tablet (768px - 1023px)
- Full width cards
- 4-column grid for validation metrics
- Stacked buttons possible
- Slightly compressed layouts

### Mobile (<768px)
- Full width cards
- 2-column grid for validation metrics
- Stacked buttons
- Compact card layouts

## Interaction States

### Button States
```
Normal:     [ ✨ AI Analyze ]
Hover:      [ ✨ AI Analyze ] (with subtle highlight)
Loading:    [ 🔄 AI Analyzing... ]
Disabled:   [ ✨ AI Analyze ] (grayed out)
```

### Card States
```
Default:    Full opacity, clear borders
Hover:      Subtle shadow increase
Active:     Maintains state
Loading:    Skeleton or spinner overlay
```

## Animation & Transitions

1. **Progress Bar**: Smooth fill animation (0.5s ease-in-out)
2. **Card Appearance**: Fade in (0.3s)
3. **Loading Spinner**: Continuous rotation
4. **Hover Effects**: 0.2s transition
5. **Suggestions List**: Staggered fade-in (0.1s delay each)

## Accessibility Features

### ARIA Labels
- Progress bars: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Buttons: Descriptive labels
- Cards: `role="region"` with appropriate labels

### Keyboard Navigation
- Tab order follows logical flow
- Enter/Space to activate buttons
- Escape to close dialogs
- Arrow keys for list navigation

### Screen Reader Support
- Meaningful alt text for icons
- Live region announcements for status changes
- Semantic HTML structure
- Proper heading hierarchy

## Integration Points

### MapaQuantidades Page
- Location: After file upload card, before data tables
- Conditional rendering: Only shown when `aiInsights` state is populated
- Responsive to file changes: Clears on file delete/replace

### State Flow
```
Upload File → Analyze (AI) → Store Results → Display Insights
     ↓              ↓              ↓               ↓
   Show       Loading        Update         Render
Suggestion    Spinner        State          Card
  Card
```

## Example Screenshots Description

### Screenshot 1: Before Upload
- Empty state with upload prompt
- AI Suggestion Card (Pro Tip) visible
- Call-to-action button

### Screenshot 2: After Upload
- File info card displayed
- Two buttons: "Analyze" and "AI Analyze ✨"
- Compact AI suggestion below file card

### Screenshot 3: During AI Analysis
- Loading spinner on AI Analyze button
- "AI Analyzing..." text
- Disabled state for other buttons

### Screenshot 4: AI Insights Displayed
- Full AI Insights card visible
- Quality score: 85/100 (green)
- Summary section with text
- 3-4 suggestions listed
- Validation metrics grid (4 cards)
- Completeness bar showing 78%

### Screenshot 5: Low Quality Score
- Quality score: 45/100 (red)
- More suggestions (5-6 items)
- Higher missing data metrics
- Lower completeness bar (45%)

## Component Hierarchy

```
MapaQuantidades
├── Header
├── FileUploadSection
│   ├── AISuggestionCard (before upload)
│   └── FileInfoCard
│       ├── AISuggestionCard (after upload)
│       └── ActionButtons
│           ├── AnalyzeButton
│           └── AIAnalyzeButton ✨
├── AIInsightsDisplay
│   ├── QualityScoreSection
│   │   ├── ScoreBadge
│   │   └── ProgressBar
│   ├── SummarySection
│   ├── SuggestionsSection
│   │   └── SuggestionsList
│   └── ValidationMetricsSection
│       ├── MetricsGrid
│       └── CompletenessBar
└── DataTablesSection
```

## File Structure

```
src/
├── components/
│   ├── analysis/
│   │   ├── AIInsightsDisplay.tsx    (Main insights card)
│   │   └── AISuggestionCard.tsx     (Suggestion prompts)
│   └── ui/
│       └── progress.tsx              (Enhanced with colors)
├── services/
│   └── aiAnalysisService.ts         (AI logic & metrics)
└── pages/
    └── MapaQuantidades.tsx          (Integration)
```
