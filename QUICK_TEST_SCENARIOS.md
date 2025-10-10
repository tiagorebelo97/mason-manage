# Quick Test Scenarios

## Test 1: Item Specialities Dialog - Apply Changes

### Steps
1. Navigate to a budget with analyzed Excel data
2. Find any item in the table
3. Click the "Edit" button (🏷️) in the Specialities column
4. Dialog opens with current specialities selected
5. Make changes:
   - Add new specialities by clicking them in the dropdown
   - Remove existing ones by clicking the X on badges
6. Click "Apply" button
7. Observe:
   - Button text changes to "Applying..."
   - Both buttons become disabled
   - After success, toast notification appears
   - Dialog closes automatically
   - Item row updates with new speciality badges

### Expected Result
✅ Changes are saved and visible in the item row

---

## Test 2: Item Specialities Dialog - Cancel Changes

### Steps
1. Click "Edit" button on an item
2. Make changes to specialities (add/remove some)
3. Click "Cancel" button
4. Observe:
   - Dialog closes immediately
   - No toast notification
5. Check the item row
6. Observe:
   - Original specialities are still there
   - Changes were not saved

### Expected Result
✅ Changes are discarded, original specialities remain

---

## Test 3: Multi-line Item Comments - Basic Case

### Steps
1. Create an Excel file with this structure:

```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Chapter             |    |    |
| 1.2    | Demolições          |    |    |
|        | Incluir entulho     |    |    |
|        | Transporte incluído |    |    |
| 1.2.1  | Paredes interiores  | m2 | 50 |
```

2. Upload the file to a budget
3. Click "Analyze File"
4. Wait for analysis to complete
5. Find item "1.2.1" in the table
6. Check the item comments (hover or check database)

### Expected Result
✅ Item "1.2.1" has `item_comments`:
```
Demolições
Incluir entulho
Transporte incluído
```

---

## Test 4: Multi-line Comments - Multiple Items

### Steps
1. Create Excel file:

```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Chapter             |    |    |
| 1.2    | Demolições gerais   |    |    |
|        | Com entulho         |    |    |
| 1.2.1  | Paredes             | m2 | 50 |
| 1.2.2  | Pavimentos          | m2 | 30 |
| 1.3    | Construção nova     |    |    |
|        | Material incluído   |    |    |
| 1.3.1  | Paredes novas       | m2 | 40 |
```

2. Upload and analyze
3. Check comments for each item

### Expected Results
✅ Item "1.2.1" comments: "Demolições gerais\nCom entulho"
✅ Item "1.2.2" comments: "Demolições gerais\nCom entulho"
✅ Item "1.3.1" comments: "Construção nova\nMaterial incluído"

---

## Test 5: Chapter Comments vs Item Comments

### Steps
1. Create Excel file:

```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Trabalhos           |    |    |
|        | Chapter note 1      |    |    |
|        | Chapter note 2      |    |    |
| 1.2    | Item parent         |    |    |
|        | Item detail         |    |    |
| 1.2.1  | First item          | m2 | 50 |
```

2. Upload and analyze
3. Check chapter "1" comments
4. Check item "1.2.1" comments

### Expected Results
✅ Chapter "1" has `chapter_comments`: "Chapter note 1\nChapter note 2"
✅ Item "1.2.1" has `item_comments`: "Item parent\nItem detail"
✅ Comments properly separated

---

## Test 6: Error Handling - Apply Button

### Steps
1. Disconnect from internet (or block Supabase requests)
2. Open specialities dialog
3. Make changes
4. Click "Apply"
5. Wait for error

### Expected Result
✅ Error toast appears
✅ Buttons become enabled again
✅ Dialog remains open
✅ Changes can be re-attempted

---

## Test 7: Rapid Clicks - Apply Button

### Steps
1. Open specialities dialog
2. Make changes
3. Click "Apply" button multiple times rapidly
4. Observe behavior

### Expected Result
✅ Only one mutation is triggered
✅ Button is disabled after first click
✅ No duplicate requests
✅ No errors in console

---

## Test 8: Item Without ARTIGO (Inherited)

### Steps
1. Create Excel file:

```
| ARTIGO | DESCRIÇÃO           | UN | QT |
|--------|---------------------|----|----| 
| 1      | Chapter             |    |    |
| 1.2    | Parent comment      |    |    |
|        | Multi-line detail   |    |    |
| 1.2.1  | First item          | m2 | 50 |
|        | Second item         | un | 3  |
```

2. Upload and analyze
3. Check both items

### Expected Results
✅ First item "1.2.1" has correct comments
✅ Second item (no ARTIGO) inherits "1.2.1" as ARTIGO
✅ Second item also has comments "Parent comment\nMulti-line detail"

---

## Verification Checklist

After running all tests:

- [ ] Specialities dialog opens correctly
- [ ] Apply button saves changes
- [ ] Cancel button discards changes
- [ ] Loading state appears during save
- [ ] Toast notifications appear
- [ ] Multi-line item comments are captured
- [ ] Chapter comments vs item comments properly separated
- [ ] No console errors
- [ ] No duplicate requests
- [ ] Error handling works correctly

---

## Database Verification

To verify in Supabase:

```sql
-- Check item specialities
SELECT i.artigo, i.descricao, i.item_comments, s.name_pt
FROM orcamento_items i
LEFT JOIN item_specialities isp ON i.id = isp.item_id
LEFT JOIN specialities s ON isp.speciality_id = s.id
WHERE i.artigo LIKE '1.2%'
ORDER BY i.artigo;

-- Check chapter comments
SELECT chapter_number, chapter_name, chapter_comments
FROM orcamento_chapters
WHERE chapter_number = '1';
```

---

## Troubleshooting

### Dialog doesn't close after Apply
- Check browser console for errors
- Verify Supabase connection
- Check mutation success callback

### Comments not appearing
- Verify Excel structure matches examples
- Check Case 2 and Case 3 conditions
- Verify `lastCommentArtigo` is being set

### Specialities not saving
- Check network tab for failed requests
- Verify user has write permissions
- Check RLS policies on item_specialities table

---

## Performance Notes

### Expected Behavior
- Dialog opens instantly
- Apply takes ~500ms-1s depending on number of specialities
- Excel analysis time varies by file size
- Large files (1000+ items) may take 10-30 seconds

### Warning Signs
- Dialog hangs on open → Check data loading
- Apply takes >3 seconds → Check network/Supabase
- Comments missing → Check Excel structure
- Duplicate badges → Check mutation logic
