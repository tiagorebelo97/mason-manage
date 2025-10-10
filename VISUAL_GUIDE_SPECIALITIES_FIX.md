# Visual Guide: Item Specialities Dialog Changes

## Before vs After

### Dialog UI Change

#### BEFORE (Auto-save on close)
```
┌─────────────────────────────────────┐
│  Item Specialities              [X] │
├─────────────────────────────────────┤
│  Select specialities for this item  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ [v] Select specialities...    │ │
│  │  ☑ Carpentry                  │ │
│  │  ☑ Plumbing                   │ │
│  │  ☐ Electrical                 │ │
│  └───────────────────────────────┘ │
│                                     │
│  (Close to auto-save)               │
└─────────────────────────────────────┘
```

#### AFTER (Explicit Apply/Cancel)
```
┌─────────────────────────────────────┐
│  Item Specialities              [X] │
├─────────────────────────────────────┤
│  Select specialities for this item  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ [v] Select specialities...    │ │
│  │  ☑ Carpentry                  │ │
│  │  ☑ Plumbing                   │ │
│  │  ☐ Electrical                 │ │
│  └───────────────────────────────┘ │
│                                     │
│              [ Cancel ]  [ Apply ]  │  ← NEW BUTTONS!
└─────────────────────────────────────┘
```

---

## User Interaction Flow

### Scenario 1: User Applies Changes

```
┌──────────┐
│  Start   │
└────┬─────┘
     │
     ▼
┌────────────────────┐
│ Click "Edit" btn   │
│ on item            │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ Dialog opens       │
│ Shows current      │
│ specialities       │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ User selects/      │
│ deselects options  │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ User clicks        │
│ "Apply" button     │ ← Explicit action
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ Button shows       │
│ "Applying..."      │
│ (disabled)         │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ Mutation succeeds  │
│ Toast: Success     │
│ Dialog closes      │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ Badges update on   │
│ the item row       │
└────────────────────┘
```

### Scenario 2: User Cancels Changes

```
┌──────────┐
│  Start   │
└────┬─────┘
     │
     ▼
┌────────────────────┐
│ Click "Edit" btn   │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ Dialog opens       │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ User makes changes │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ User clicks        │
│ "Cancel" button    │ ← Explicit discard
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ Dialog closes      │
│ immediately        │
│ No save, no toast  │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ Item row unchanged │
│ (old badges still) │
└────────────────────┘
```

---

## Multi-line Comment Processing

### Excel Structure Example

```
┌────────┬─────────────────────┬────┬────┐
│ ARTIGO │ DESCRIÇÃO           │ UN │ QT │
├────────┼─────────────────────┼────┼────┤
│ 1      │ Chapter             │    │    │  ← Case 1: Chapter
├────────┼─────────────────────┼────┼────┤
│ 1.2    │ Demolições          │    │    │  ← Case 2: Item comment parent
│        │                     │    │    │     → Creates parentCommentsMap["1.2"] = ["Demolições"]
│        │                     │    │    │     → Sets lastCommentArtigo = "1.2"
├────────┼─────────────────────┼────┼────┤
│        │ Incluir entulho     │    │    │  ← Case 3: Multi-line comment
│        │                     │    │    │     → Checks lastCommentArtigo = "1.2" ✓
│        │                     │    │    │     → Appends to parentCommentsMap["1.2"]
│        │                     │    │    │     → Now: ["Demolições", "Incluir entulho"]
├────────┼─────────────────────┼────┼────┤
│        │ Transporte incluído │    │    │  ← Case 3: Multi-line comment
│        │                     │    │    │     → Checks lastCommentArtigo = "1.2" ✓
│        │                     │    │    │     → Appends to parentCommentsMap["1.2"]
│        │                     │    │    │     → Now: ["Demolições", "Incluir entulho",
│        │                     │    │    │            "Transporte incluído"]
├────────┼─────────────────────┼────┼────┤
│ 1.2.1  │ Paredes interiores  │ m2 │ 50 │  ← Case 5: Item
│        │                     │    │    │     → Looks up parent "1.2" in map
│        │                     │    │    │     → Gets: ["Demolições", "Incluir entulho",
│        │                     │    │    │             "Transporte incluído"]
│        │                     │    │    │     → Joins with \n: "Demolições\nIncluir entulho\n
│        │                     │    │    │                        Transporte incluído"
└────────┴─────────────────────┴────┴────┘
```

### Result in Database

```
Item: 1.2.1
├── artigo: "1.2.1"
├── descricao: "Paredes interiores"
├── un: "m2"
├── qt: 50
└── item_comments: "Demolições
                    Incluir entulho
                    Transporte incluído"
```

---

## Code Flow Diagram

### Case 3 Logic (Multi-line Comment)

#### BEFORE (Had defensive check that could skip)
```
Row without ARTIGO, UN, QT
         │
         ▼
   lastCommentArtigo
      is set?
         │
    ┌────┴────┐
   NO         YES
    │          │
    │          ▼
    │    Map has key?
    │          │
    │     ┌────┴────┐
    │    NO        YES
    │     │         │
    │     │         ▼
    │     │    Append to map  ← Only happens if key exists
    │     │
    │     └──→ SKIP!  ← Could lose comments in edge cases
    │
    └──→ Try next case
```

#### AFTER (Defensive - always works)
```
Row without ARTIGO, UN, QT
         │
         ▼
   lastCommentArtigo
      is set?
         │
    ┌────┴────┐
   NO         YES
    │          │
    │          ▼
    │    Map has key?
    │          │
    │     ┌────┴────┐
    │    NO        YES
    │     │         │
    │     ▼         │
    │   Create      │
    │   array       │
    │     │         │
    │     └────┬────┘
    │          │
    │          ▼
    │    Append to map  ← Always happens
    │
    └──→ Try next case
```

---

## Button States

### Apply Button

| State      | Appearance | Enabled | Text        |
|------------|-----------|---------|-------------|
| Ready      | Primary   | Yes     | "Apply"     |
| Saving     | Primary   | No      | "Applying..."|
| Success    | N/A       | N/A     | (Dialog closes) |
| Error      | Primary   | Yes     | "Apply"     |

### Cancel Button

| State      | Appearance | Enabled | Text       |
|------------|-----------|---------|------------|
| Ready      | Outline   | Yes     | "Cancel"   |
| Saving     | Outline   | No      | "Cancel"   |

---

## Testing Checklist

### Specialities Dialog Testing

- [ ] Open item specialities dialog
- [ ] Select a few specialities
- [ ] Click "Cancel" → Dialog closes, no changes saved
- [ ] Reopen dialog → Previous specialities still there
- [ ] Make changes again
- [ ] Click "Apply" → Button shows "Applying..."
- [ ] Wait for success → Toast appears, dialog closes
- [ ] Check item row → New badges appear
- [ ] Try clicking Apply multiple times quickly → Should not duplicate requests

### Multi-line Comments Testing

- [ ] Create Excel file with structure from example above
- [ ] Upload and analyze the file
- [ ] Open the item "1.2.1" in the UI
- [ ] Verify `item_comments` field contains all three lines:
  ```
  Demolições
  Incluir entulho
  Transporte incluído
  ```
- [ ] Try variations:
  - [ ] Multiple multi-line comments in same chapter
  - [ ] Item comment after first item (should still work)
  - [ ] Chapter comments before item comments

---

## Benefits Summary

### For Users
- ✅ **Clear control** - Explicit buttons for save/cancel
- ✅ **No surprises** - Changes only saved when Apply is clicked
- ✅ **Visual feedback** - Loading state on Apply button
- ✅ **Undo capability** - Cancel discards changes easily

### For Developers
- ✅ **Simpler logic** - No auto-save on close complexity
- ✅ **Better UX** - Follows standard dialog patterns
- ✅ **More maintainable** - Clear separation of concerns
- ✅ **Robust comments** - Defensive programming prevents data loss
