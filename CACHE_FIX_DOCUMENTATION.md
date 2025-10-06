# Database Connection Caching Fix

## Problem Description

The application was showing data (companies and specialities) from a previous/different database even though the environment variables were correctly configured to point to the new database at `https://ppnsgmtndhtwtreytftl.supabase.co`.

## Root Cause

The issue was caused by multiple caching mechanisms:

1. **LocalStorage Persistence**: Supabase client uses localStorage to persist authentication sessions and other data
2. **React Query Cache**: React Query caches API responses by query keys
3. **No Cache Invalidation**: When the database URL changed, cached data from the previous database remained in the browser

## Solution Implemented

### 1. Automatic Cache Clearing on Database URL Change

**File**: `src/integrations/supabase/client.ts`

Added logic to automatically detect and clear cached data when the database URL changes:

```typescript
// Clear localStorage if the database URL has changed
const STORAGE_KEY_PREFIX = 'sb-';
const DB_URL_KEY = 'supabase-db-url';
const storedUrl = localStorage.getItem(DB_URL_KEY);

if (storedUrl && storedUrl !== SUPABASE_URL) {
  console.log('Database URL changed, clearing cached data...');
  // Clear all Supabase-related items from localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(STORAGE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

// Store the current database URL
localStorage.setItem(DB_URL_KEY, SUPABASE_URL);
```

### 2. Improved QueryClient Configuration

**File**: `src/App.tsx`

Configured React Query with better cache settings:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce stale time to ensure fresh data
      staleTime: 0,
      // Disable automatic refetch on window focus
      refetchOnWindowFocus: false,
      // Add retry logic
      retry: 1,
    },
  },
});
```

### 3. Database-Specific Query Keys

Updated all query keys to include the database URL, preventing cross-database cache conflicts:

**Before**:
```typescript
queryKey: ["companies"]
```

**After**:
```typescript
queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL]
```

This ensures that data from different databases is cached separately.

## Files Modified

1. `src/integrations/supabase/client.ts` - Added automatic cache clearing
2. `src/App.tsx` - Configured QueryClient with proper cache settings
3. `src/components/companies/CompaniesTable.tsx` - Updated query keys
4. `src/components/companies/CompanyDialog.tsx` - Updated query keys
5. `src/components/companies/SpecialitiesManager.tsx` - Updated query keys
6. `src/components/companies/SpecialityDialog.tsx` - Updated query keys

## How It Works

1. **On Application Load**: The Supabase client initialization code checks if the stored database URL matches the current one
2. **If URL Changed**: All Supabase-related localStorage items are cleared, and the new URL is stored
3. **Query Caching**: React Query now uses the database URL as part of the cache key, ensuring data isolation between different databases
4. **Fresh Data**: With `staleTime: 0`, queries always fetch fresh data from the server

## Manual Cache Clearing (If Needed)

If users still experience issues, they can manually clear the cache:

### Option 1: Clear Browser Data
1. Open browser DevTools (F12)
2. Go to Application tab
3. Click "Clear site data"

### Option 2: Clear localStorage via Console
```javascript
localStorage.clear();
location.reload();
```

### Option 3: Hard Refresh
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

## Prevention

The implemented solution prevents this issue in the future by:

1. **Automatic Detection**: Changes to database URL are detected automatically
2. **Automatic Cleanup**: Old cached data is cleared when URL changes
3. **Isolated Caches**: Data from different databases is kept separate
4. **No Stale Data**: Fresh data is fetched on each query

## Testing

To verify the fix works:

1. Check browser console for "Database URL changed, clearing cached data..." message (on first load after URL change)
2. Verify companies and specialities are loaded from the correct database
3. Check localStorage in DevTools - should contain `supabase-db-url` with current URL
4. Change database URL in `.env` file and reload - old data should be cleared automatically

## Environment Variables

Ensure these are set correctly in `.env`:

```
VITE_SUPABASE_URL="https://ppnsgmtndhtwtreytftl.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_PROJECT_ID="ppnsgmtndhtwtreytftl"
```

## Notes

- The fix is backward compatible and doesn't affect normal operation
- No user action required for the fix to work
- The solution is minimal and focused on the specific caching issue
- Build and lint tests pass successfully
