# Fix: Duplicate ARTIGO Numbers in Article-Based View

## Problem Statement
When using article-based view with multiple Excel sheets containing the same ARTIGO numbers, the application encountered critical errors that prevented successful analysis.

## Symptoms
1. **Database Error**: "Failed to analyze file" with unique constraint violation
2. **React Errors**: Key collision warnings in browser console
3. **UI Issues**: Articles not displaying correctly or state getting mixed up between articles

## Root Cause

### Issue 1: Duplicate Chapter Insertion
In article-based view, all sheets are mapped to a single "Principal" tab. When multiple sheets contain the same chapter number:

**Example:**
- Sheet1 has Chapter "1"
- Sheet2 has Chapter "1"

Both try to insert into database as:
- (tab_id: Principal, chapter_number: "1")
- (tab_id: Principal, chapter_number: "1") ← **DUPLICATE!**

The database has a UNIQUE constraint on `(tab_id, chapter_number)`, causing the insert to fail.

### Issue 2: Duplicate Article IDs
Article IDs were generated using pattern: `${chapter_id}_${artigo}`

When the same ARTIGO number exists in different sheets:
- Sheet1 Article 1.1 → `chapter_123_1.1`
- Sheet2 Article 1.1 → `chapter_123_1.1` ← **DUPLICATE!**

React requires unique keys for array items, causing rendering issues and state management problems.

## Solution

### Part 1: Chapter Deduplication
Before inserting chapters into the database, deduplicate them based on `(tab_id, chapter_number)`:

```typescript
const uniqueChaptersMap = new Map<string, typeof chaptersWithTabIds[0]>();
const chapterIndexMapping = new Map<number, number>();

chaptersWithTabIds.forEach((chapter, index) => {
  const key = `${chapter.tab_id}_${chapter.chapter_number}`;
  if (!uniqueChaptersMap.has(key)) {
    uniqueChaptersMap.set(key, chapter);
    chapterIndexMapping.set(index, uniqueChaptersMap.size - 1);
  } else {
    const existingIndex = Array.from(uniqueChaptersMap.keys()).indexOf(key);
    chapterIndexMapping.set(index, existingIndex);
  }
});

const uniqueChapters = Array.from(uniqueChaptersMap.values());
// Insert only unique chapters
```

**Result:** Only one chapter per (tab_id, chapter_number) combination is inserted.

### Part 2: Proper Chapter Mapping
Update the mapping logic to handle deduplication:

```typescript
chaptersToInsert.forEach((originalChapter, originalIndex) => {
  const deduplicatedIndex = chapterIndexMapping.get(originalIndex);
  if (deduplicatedIndex !== undefined && insertedChapters[deduplicatedIndex]) {
    const key = `${originalChapter.sheet_name}_${originalChapter.chapter_number}`;
    chapterMap.set(key, insertedChapters[deduplicatedIndex].id);
  }
});
```

**Result:** All (sheet_name, chapter_number) combinations correctly map to their chapter IDs.

### Part 3: Unique Article IDs
Include sheet_name in article ID generation:

**Before:** `${chapter.id}_${artigo}`
**After:** `${chapter.id}_${sheet_name}_${artigo}`

**Result:** Articles with same ARTIGO from different sheets have unique IDs.

### Part 4: UI Enhancement
Display sheet name to help users distinguish duplicate ARTIGOs:

```typescript
{article.artigo} - {article.title}
{article.sheet_name && (
  <span className="ml-2 text-xs font-normal text-muted-foreground">
    ({article.sheet_name})
  </span>
)}
```

**Result:** User sees "1.1 - Article Title (Sheet1)" and "1.1 - Article Title (Sheet2)"

## Example Flow

### Scenario: Two sheets with duplicate chapter and article numbers

**Input:**
```
Sheet1:
  Chapter 1
    Article 1.1
    Article 1.2

Sheet2:
  Chapter 1
    Article 1.1
    Article 1.3
```

**Processing:**

1. **Chapter Deduplication:**
   - Input: 2 chapters both with number "1"
   - Output: 1 unique chapter in database
   - Mapping: Sheet1_1 → chapter_456, Sheet2_1 → chapter_456

2. **Article Processing:**
   - Sheet1 Article 1.1 → ID: `chapter_456_Sheet1_1.1`
   - Sheet1 Article 1.2 → ID: `chapter_456_Sheet1_1.2`
   - Sheet2 Article 1.1 → ID: `chapter_456_Sheet2_1.1` ← Unique!
   - Sheet2 Article 1.3 → ID: `chapter_456_Sheet2_1.3`

3. **UI Display:**
   ```
   Chapter 1
     [v] 1.1 - Article Title (Sheet1)
         Content from Sheet1...
     
     [v] 1.2 - Article Title (Sheet1)
         Content from Sheet1...
     
     [v] 1.1 - Article Title (Sheet2)
         Content from Sheet2...
     
     [v] 1.3 - Article Title (Sheet2)
         Content from Sheet2...
   ```

**Result:** ✅ All articles display correctly with no errors or collisions.

## Files Changed

- `src/pages/MapaQuantidades.tsx`
  - Lines 330: Updated article ID generation
  - Lines 1180-1198: Added chapter deduplication logic
  - Lines 1215-1225: Updated chapter mapping logic
  - Lines 2627-2632: Added sheet name display in UI

## Testing Recommendations

1. **Test Case 1:** Single sheet with articles (baseline)
   - Should work as before
   
2. **Test Case 2:** Multiple sheets with different chapter numbers
   - Sheet1: Chapter 1, Sheet2: Chapter 2
   - Should work as before
   
3. **Test Case 3:** Multiple sheets with same chapter numbers
   - Sheet1: Chapter 1, Sheet2: Chapter 1
   - Should now work (was failing before)
   
4. **Test Case 4:** Multiple sheets with duplicate ARTIGO numbers
   - Sheet1: Chapter 1 Article 1.1, Sheet2: Chapter 1 Article 1.1
   - Should now work with distinct IDs and display

## Verification

✅ Lint: No new errors introduced
✅ Build: Successful compilation
✅ Logic: Verified through trace analysis
✅ Database: Respects UNIQUE constraints
✅ React: No key collision issues
