# Blank Page Fix - Visual Summary

## Before (Broken Code)
```typescript
// ❌ BROKEN - Circular Dependency
// Line 341-362
const { data: articleSpecialities } = useQuery({
  queryKey: ["article_specialities", id, import.meta.env.VITE_SUPABASE_URL],
  queryFn: async () => {
    // ... query logic ...
  },
  enabled: !!id && articlesFromDB && articlesFromDB.length > 0,  // ❌ articlesFromDB is undefined here!
});

// Line 365-383
const { data: articlesFromDB } = useQuery({
  queryKey: ["orcamento_articles", id, import.meta.env.VITE_SUPABASE_URL],
  queryFn: async () => {
    // ... query logic ...
  },
  enabled: !!id && chapters && chapters.length > 0,
});
```

**Problem**: When React renders the component, it tries to evaluate the `enabled` condition for `articleSpecialities` query, which references `articlesFromDB`. But at that point, `articlesFromDB` hasn't been declared yet, so it's `undefined`. This causes the component to fail or behave unexpectedly, resulting in a blank page.

## After (Fixed Code)
```typescript
// ✅ FIXED - Proper Order
// Line 341-360
const { data: articlesFromDB } = useQuery({
  queryKey: ["orcamento_articles", id, import.meta.env.VITE_SUPABASE_URL],
  queryFn: async () => {
    // ... query logic ...
  },
  enabled: !!id && chapters && chapters.length > 0,
});

// Line 362-383
const { data: articleSpecialities } = useQuery({
  queryKey: ["article_specialities", id, import.meta.env.VITE_SUPABASE_URL],
  queryFn: async () => {
    // ... query logic ...
  },
  enabled: !!id && articlesFromDB && articlesFromDB.length > 0,  // ✅ articlesFromDB is now properly defined!
});
```

**Solution**: By moving the `articlesFromDB` query definition BEFORE the `articleSpecialities` query, we ensure that when React evaluates the `enabled` condition of `articleSpecialities`, the `articlesFromDB` variable is already declared and can be safely accessed.

## Impact
- **Before**: Blank page when navigating to quantity map
- **After**: Page loads correctly with all data displayed

## Technical Details
- **Hook Order**: In React, hooks must be called in the same order every time a component renders. Variables declared by hooks are available to subsequent hooks in the same render.
- **Query Dependencies**: React Query's `enabled` option allows conditional query execution. When it references another query's data, that query must be declared first.
- **Type Safety**: TypeScript didn't catch this error because it only checks types, not runtime execution order.

## Lesson Learned
When using React Query (or any hooks) with dependencies between them:
1. Always declare dependent queries in the correct order
2. The query that provides data should be declared BEFORE queries that consume that data
3. Pay attention to `enabled` conditions that reference other query results
