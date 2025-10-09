# Visual Guide: Specialities Override Fix

## Problem Demonstration

### Before Fix - Frustrating Behavior ❌

```
Step 1: Initial State
+------------------+
| Chapter Settings |
+------------------+
Specialities: [Electrical] [Plumbing]

Item Table Row:
+--------+-------------+------------------+
| Item   | Specialities| Actions          |
+--------+-------------+------------------+
| 1.1    | [Electrical ✕] [Plumbing ✕] [Edit] |
+--------+-------------+------------------+

Step 2: User clicks X on "Electrical"
Current: [Electrical ✕] [Plumbing ✕]
After click: [Plumbing ✕]
✓ Works as expected

Step 3: User clicks X on "Plumbing" (trying to remove all)
Current: [Plumbing ✕]
After click: [Electrical ✕] [Plumbing ✕]  ← ❌ THEY CAME BACK!
```

**User frustration:** "I just removed Plumbing, why are they back?!"

### After Fix - Expected Behavior ✅

```
Step 1: Initial State
+------------------+
| Chapter Settings |
+------------------+
Specialities: [Electrical] [Plumbing]

Item Table Row:
+--------+-------------+------------------+
| Item   | Specialities| Actions          |
+--------+-------------+------------------+
| 1.1    | [Electrical ✕] [Plumbing ✕] [Edit] |
+--------+-------------+------------------+

Step 2: User clicks X on "Electrical"
Current: [Electrical ✕] [Plumbing ✕]
After click: [Plumbing ✕]
✓ Works as expected

Step 3: User clicks X on "Plumbing"
Current: [Plumbing ✕]
After click: None
✓ All cleared! No longer inherits from chapter

Database state: specialities_explicitly_set = TRUE
```

## Dialog Scenario

### Before Fix - Confusing ❌

```
Chapter: [Electrical] [Plumbing]
Item: (never touched, inheriting)

User opens Edit dialog:
┌─────────────────────────────────┐
│ Item Specialities               │
├─────────────────────────────────┤
│ ☑ Electrical                    │
│ ☑ Plumbing                      │
│ ☐ HVAC                          │
│ ☐ Fire Safety                   │
└─────────────────────────────────┘

User unchecks both and clicks Save.

Result: Back to [Electrical ✕] [Plumbing ✕]  ← ❌ WHY?!
```

### After Fix - Intuitive ✅

```
Chapter: [Electrical] [Plumbing]
Item: (never touched, inheriting)

User opens Edit dialog:
┌─────────────────────────────────┐
│ Item Specialities               │
├─────────────────────────────────┤
│ ☑ Electrical                    │
│ ☑ Plumbing                      │
│ ☐ HVAC                          │
│ ☐ Fire Safety                   │
└─────────────────────────────────┘

User unchecks both and clicks Save.

Result: None  ← ✅ PERFECT!
Database: specialities_explicitly_set = TRUE
```

## Database State Visualization

### Item States

```
State 1: New Item (Never Touched)
┌────────────────────────────────────────┐
│ orcamento_items                        │
├────────┬──────────┬────────────────────┤
│ id     │ chapter  │ spec_explicitly_set│
├────────┼──────────┼────────────────────┤
│ item-1 │ chap-A   │ FALSE (or NULL)    │
└────────┴──────────┴────────────────────┘

┌────────────────────────────────────────┐
│ item_specialities                      │
├────────┬──────────────┐
│ item_id│ spec_id      │
├────────┼──────────────┤
│ (empty - no rows)     │
└────────┴──────────────┘

Display: Shows chapter specialities (inherited)


State 2: User Explicitly Cleared All
┌────────────────────────────────────────┐
│ orcamento_items                        │
├────────┬──────────┬────────────────────┤
│ id     │ chapter  │ spec_explicitly_set│
├────────┼──────────┼────────────────────┤
│ item-1 │ chap-A   │ TRUE               │  ← Flag is set!
└────────┴──────────┴────────────────────┘

┌────────────────────────────────────────┐
│ item_specialities                      │
├────────┬──────────────┐
│ item_id│ spec_id      │
├────────┼──────────────┤
│ (empty - no rows)     │  ← Same as State 1
└────────┴──────────────┘

Display: Shows "None" (does NOT inherit)  ← The difference!


State 3: User Has Custom Specialities
┌────────────────────────────────────────┐
│ orcamento_items                        │
├────────┬──────────┬────────────────────┤
│ id     │ chapter  │ spec_explicitly_set│
├────────┼──────────┼────────────────────┤
│ item-1 │ chap-A   │ TRUE               │
└────────┴──────────┴────────────────────┘

┌────────────────────────────────────────┐
│ item_specialities                      │
├────────┬──────────────┐
│ item_id│ spec_id      │
├────────┼──────────────┤
│ item-1 │ hvac-id      │
│ item-1 │ fire-id      │
└────────┴──────────────┘

Display: Shows [HVAC ✕] [Fire Safety ✕]
```

## User Flows

### Flow 1: Remove all inherited specialities

```
1. Chapter: [A, B]
   Item: inherits [A, B]
   Flag: FALSE
   
2. Click X on A
   → Mutation saves [B]
   → Sets flag = TRUE
   
3. Item now shows: [B ✕]
   Flag: TRUE
   
4. Click X on B
   → Mutation saves []
   → Sets flag = TRUE
   
5. Item now shows: None
   Flag: TRUE ✅
   
6. Does NOT revert to [A, B] because flag is TRUE
```

### Flow 2: Clear all via dialog

```
1. Chapter: [A, B, C]
   Item: inherits [A, B, C]
   Flag: FALSE
   
2. Open dialog
   → Shows: ☑A ☑B ☑C
   
3. Uncheck all
   → Shows: ☐A ☐B ☐C
   
4. Save
   → Mutation saves []
   → Sets flag = TRUE
   
5. Item now shows: None
   Flag: TRUE ✅
```

### Flow 3: Re-add specialities after clearing

```
1. Item shows: None
   Flag: TRUE (was explicitly cleared)
   
2. Open dialog
   → Shows: ☐A ☐B ☐C (all unchecked)
   
3. Check A and B
   → Shows: ☑A ☑B ☐C
   
4. Save
   → Mutation saves [A, B]
   → Flag remains TRUE
   
5. Item now shows: [A ✕] [B ✕]
   Flag: TRUE ✅
```

## Code Logic

### Decision Tree in getItemSpecialityIds()

```
getItemSpecialityIds(itemId, chapterId)
  │
  ├─ Has item_specialities rows?
  │  YES → Return those IDs
  │  NO  → Continue...
  │
  ├─ Is specialities_explicitly_set == TRUE?
  │  YES → Return [] (empty - user wants no specialities)
  │  NO  → Continue...
  │
  └─ Has chapterId?
     YES → Return chapter specialities (inherit)
     NO  → Return []
```

## Summary

The fix allows users to:
- ✅ Remove all specialities from an item (even if chapter has defaults)
- ✅ Explicitly set "no specialities" for an item
- ✅ Override chapter inheritance with empty selection
- ✅ Still inherit from chapter by default (backwards compatible)

The key is the `specialities_explicitly_set` flag that distinguishes:
- **FALSE/NULL**: "Never touched, use chapter defaults"
- **TRUE**: "User configured this (even if empty), don't inherit"
