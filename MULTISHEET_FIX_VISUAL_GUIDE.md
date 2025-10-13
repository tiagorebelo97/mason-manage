# Quick Visual Guide: Article-Based View Multi-Sheet Fix

## The Problem

When you upload a multi-sheet Excel file with article-based view enabled:
- Sheet1 has: Chapter 1 → Articles 1.1, 1.2
- Sheet2 has: Chapter 1 → Articles 1.1, 1.3

### ❌ Before (Broken):
```
[Principal] [Arquitetura] [Instalações Especiais]

📄 Sheet1  ← Only ONE separator shown
┌─────────────────────────────────────┐
│ ▼ 1. Chapter Name                   │
│   • Article 1.1 (Sheet1)            │
│   • Article 1.2 (Sheet1)            │
│   • Article 1.1 (Sheet2) ← Mixed!   │
│   • Article 1.3 (Sheet2) ← Mixed!   │
└─────────────────────────────────────┘

Problem: Sheet2 separator never appears!
All articles mixed together under Sheet1.
```

### ✅ After (Fixed):
```
[Principal] [Arquitetura] [Instalações Especiais]

┌─────────────────────────────────────┐
│ ▼ 1. Chapter Name                   │
│                                     │
│   📄 Sheet1  ← Separator inside!   │
│   • Article 1.1 (from Sheet1)      │
│   • Article 1.2 (from Sheet1)      │
│                                     │
│   📄 Sheet2  ← Second separator!   │
│   • Article 1.1 (from Sheet2)      │
│   • Article 1.3 (from Sheet2)      │
└─────────────────────────────────────┘

Fixed: Sheet separators appear INSIDE chapters!
Articles clearly organized by their source sheet.
```

## The Technical Change

### Old Logic:
1. Group chapters by sheet_name
2. Show separator above chapter groups
3. Problem: Deduplicated chapters only have ONE sheet_name

### New Logic:
1. Show chapters normally (deduplicated)
2. Inside each chapter, group articles by sheet_name
3. Show separators INSIDE chapters
4. Works perfectly with deduplicated chapters!

## When Separators Appear

### Single Sheet File:
```
┌─────────────────────────────────────┐
│ ▼ 1. Chapter Name                   │
│   (No separator - only one sheet)   │
│   • Article 1.1                     │
│   • Article 1.2                     │
└─────────────────────────────────────┘
```

### Multi-Sheet with Unique Chapters:
```
┌─────────────────────────────────────┐
│ ▼ 1. Chapter Name (only in Sheet1)  │
│   (No separator - only one sheet)   │
│   • Article 1.1                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ▼ 2. Chapter Name (only in Sheet2)  │
│   (No separator - only one sheet)   │
│   • Article 2.1                     │
└─────────────────────────────────────┘
```

### Multi-Sheet with Duplicate Chapters:
```
┌─────────────────────────────────────┐
│ ▼ 1. Chapter Name                   │
│                                     │
│   📄 Sheet1 ← Separators appear!   │
│   • Article 1.1 (Sheet1)            │
│                                     │
│   📄 Sheet2                         │
│   • Article 1.1 (Sheet2)            │
└─────────────────────────────────────┘
```

## Benefits

✅ **Preserves Sheet Information**: You can see which articles came from which sheet
✅ **Minimal Changes**: No database schema changes needed
✅ **Backwards Compatible**: Single-sheet files work exactly as before
✅ **Clear Organization**: Articles grouped logically by their source

## Code Location

**File**: `src/pages/MapaQuantidades.tsx`
**Lines**: 2514-2733 (article-based view rendering)

Key change: Moved from grouping chapters by sheet to grouping articles by sheet within each chapter.
