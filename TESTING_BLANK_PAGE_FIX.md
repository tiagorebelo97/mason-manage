# Testing Guide: Blank Quantity Map Page Fix

## Issue Description
The Quantity Map page (MapaQuantidades) was showing a blank page due to a circular dependency in React Query hooks.

## Root Cause
- The `articleSpecialities` query depended on `articlesFromDB` in its `enabled` condition
- However, `articlesFromDB` was declared AFTER `articleSpecialities`
- This caused `articlesFromDB` to be `undefined` when referenced, leading to a blank page

## Fix Applied
Reordered the query definitions so that `articlesFromDB` is declared before `articleSpecialities`.

## How to Test

### Prerequisites
1. Ensure you have Node.js and npm installed
2. Clone the repository and install dependencies: `npm install`
3. Set up your `.env` file with Supabase credentials

### Test Steps

#### 1. Build Test
```bash
npm run build
```
**Expected Result**: Build should succeed without errors

#### 2. TypeScript Compilation Test
```bash
npx tsc --noEmit
```
**Expected Result**: No TypeScript errors

#### 3. Development Server Test
```bash
npm run dev
```
**Expected Result**: Development server starts successfully on `http://localhost:8080`

#### 4. Manual UI Test
1. Navigate to `http://localhost:8080`
2. Log in to the application
3. Navigate to the "Orcamentos" section
4. Click on any orcamento to view details
5. Navigate to the "Mapa Quantidades" page (URL: `/orcamentos/:id/mapa-quantidades`)

**Expected Results**:
- The page should load without being blank
- You should see the page header with "Back to Orcamentos" button
- The page content should display:
  - If no file uploaded: Upload interface
  - If file uploaded but not analyzed: File info with "Analyze" button
  - If file analyzed: Tabs with chapters, articles, and items

#### 5. Browser Console Test
Open browser developer tools (F12) and check the console:

**Expected Result**: No JavaScript errors related to undefined variables or circular dependencies

## What Was Changed
File: `src/pages/MapaQuantidades.tsx`
- Moved lines 365-383 (articlesFromDB query) to before line 341
- This places articlesFromDB definition before articleSpecialities
- No other code changes were necessary

## Verification
- ✅ TypeScript compilation passes
- ✅ Build succeeds
- ✅ No circular dependency errors
- ✅ articlesFromDB is now properly defined when referenced by articleSpecialities
