# Quick Reference: Blank Page After Analysis Fix

## Problem
Blank page appears immediately after clicking "Analyze" on Excel files (especially single-sheet cases). Page works fine after reload.

## Root Cause
Race condition: UI rendered before data queries completed after analysis mutation.

## Solution
Added loading state checks to prevent content rendering until all queries complete.

## Code Changes

### 1. Track Loading States
```typescript
// Before
const { data: tabs } = useQuery({ ... });

// After
const { data: tabs, isLoading: isLoadingTabs, isFetching: isFetchingTabs } = useQuery({ ... });
```

### 2. Show Loading While Fetching
```typescript
{isAnalyzed && (isLoadingTabs || isFetchingTabs || isLoadingChapters || isFetchingChapters || isLoadingItems) && (
  <LoadingSpinner />
)}
```

### 3. Guard Content Rendering
```typescript
{isAnalyzed && tabs && tabs.length > 0 && 
 !isLoadingTabs && !isFetchingTabs && !isLoadingChapters && !isFetchingChapters && (
  <Content />
)}
```

## Test Scenarios
1. ✅ Upload & analyze single-sheet Excel → No blank page, shows loading
2. ✅ Upload & analyze multi-sheet Excel → Works correctly
3. ✅ Reload after analysis → Data appears immediately
4. ✅ Slow network (DevTools throttling) → Loading spinner shows longer

## Files Changed
- `src/pages/MapaQuantidades.tsx` (16 lines added, 7 modified)

## Key Points
- ✅ No database changes
- ✅ Backward compatible
- ✅ No new dependencies
- ✅ 0 security vulnerabilities
- ✅ Build and lint pass

## Status
✅ **RESOLVED** - Branch: `copilot/fix-blank-page-issue`
