# Email Validation and Table Data Loss Fix

## Issues Fixed

### 1. Invalid Email Error with Multiple Emails

**Problem**: When a contact had multiple emails (stored as comma-separated values like "email1@test.com, email2@test.com"), attempting to view or edit the contact would show an "Invalid email" error and the dialog would not load properly (blank page).

**Root Cause**: The Zod validation schema was validating the `email` field using `.email()`, which expects a single valid email address. However, when loading a contact with multiple emails, the form was being reset with the comma-separated string (e.g., "email1@test.com, email2@test.com"), which failed the single-email validation.

**Solution**: 
- Removed the strict `.email()` validation from the Zod schemas in:
  - `PersonContactDialog.tsx`
  - `ContactDialog.tsx`
  
The `email`, `mobile`, and `fax` form fields are not directly edited by users. Instead, the app uses separate state arrays (`emails`, `mobiles`, `faxes`) that allow adding/removing multiple values. These arrays are then joined with ", " separator when saving to the database. The form fields exist only for internal state management and don't need validation.

**Files Changed**:
- `src/components/companies/PersonContactDialog.tsx`: Changed `email: z.string().email("Invalid email").optional().or(z.literal(""))` to `email: z.string().optional()`
- `src/components/companies/ContactDialog.tsx`: Same change, plus removed validation for `mobile` and `fax`

### 2. Missing Badge Import

**Problem**: `ContactDialog.tsx` was using the `Badge` component in read-only mode to display multiple emails/mobiles/faxes, but the import was missing.

**Solution**: Added the missing import:
```tsx
import { Badge } from "@/components/ui/badge";
```

**File Changed**: `src/components/companies/ContactDialog.tsx`

### 3. Company Table Data Loss When Editing

**Problem**: When clicking the edit button on a company row, the table columns in the background would temporarily show "0" or empty values for specialties, brands, locations, and people count.

**Root Cause**: Double query invalidation was occurring:
1. When saving changes, the mutation's `onSuccess` handler would invalidate the companies query (triggering a refetch)
2. Immediately after, when the dialog closed, the dialog's `onOpenChange` handler would ALSO invalidate the companies query (triggering a second refetch)

This double invalidation caused the table to refetch twice in quick succession, resulting in a brief period where the table showed loading/empty state.

**Solution**: Removed the redundant query invalidation from the dialog's `onOpenChange` handler. Now queries are only invalidated once - in the mutation's `onSuccess` handler when data is actually saved. This makes sense because:
- We should refresh data after saving changes (mutation onSuccess) ✓
- We don't need to refresh data when just closing the dialog without saving ✗

**Files Changed**:
- `src/components/companies/CompanyDialog.tsx`: Removed `queryClient.invalidateQueries()` from `onOpenChange` handler
- `src/components/companies/ContactDialog.tsx`: Removed `queryClient.invalidateQueries()` from `onOpenChange` handler

## Technical Details

### How Multiple Emails Work

The app supports multiple emails/mobiles/fax numbers per contact:

1. **UI State**: Managed via React state arrays:
   ```tsx
   const [emails, setEmails] = useState<string[]>([""]);
   const [mobiles, setMobiles] = useState<string[]>([""]);
   const [faxes, setFaxes] = useState<string[]>([""]);
   ```

2. **User Interface**: Users see multiple input fields with +/- buttons to add/remove entries

3. **Storage**: When saving, arrays are filtered for non-empty values and joined:
   ```tsx
   email: emails.filter(e => e.trim()).join(', ') || null
   ```

4. **Loading**: When loading, comma-separated strings are split back into arrays:
   ```tsx
   setEmails(contact.email ? contact.email.split(',').map(e => e.trim()) : [""]);
   ```

5. **Form State**: The form's `email`, `mobile`, and `fax` fields contain the full comma-separated strings for internal tracking but are not validated or directly edited by users.

### Query Invalidation Pattern

**Before** (Problematic):
```tsx
// In mutation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["companies", ...] }); // First invalidation
  onOpenChange(false); // Close dialog
}

// In dialog onOpenChange
onOpenChange={(isOpen) => {
  if (!isOpen) {
    queryClient.invalidateQueries({ queryKey: ["companies", ...] }); // Second invalidation!
  }
}}
```

**After** (Fixed):
```tsx
// In mutation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["companies", ...] }); // Only invalidation
  onOpenChange(false); // Close dialog
}

// In dialog onOpenChange
onOpenChange={(isOpen) => {
  if (!isOpen) {
    form.reset(); // Just cleanup, no invalidation
  }
}}
```

## Testing Recommendations

1. **Multiple Emails Test**:
   - Add a contact with multiple emails
   - Save and close
   - Open the contact for viewing (should display without errors)
   - Open the contact for editing (should display without errors)
   - Add more emails
   - Remove emails
   - Save changes

2. **Company Table Test**:
   - Navigate to the Companies page
   - Click the edit (pencil) icon on a company row
   - Observe the table in the background - data should remain stable
   - Make changes and save
   - Observe table updates with new data
   - Click edit on another company immediately
   - Table should not flicker or show zeros

3. **Contact View Test**:
   - Navigate to Contacts page
   - Click on a contact row to view details
   - Should display properly with all emails shown as badges
   - Click edit
   - Should allow editing without validation errors

## Impact

These fixes resolve all three reported issues:
1. ✓ No more "Invalid email" errors when working with multiple emails
2. ✓ No more blank pages when viewing contacts
3. ✓ No more table data loss when editing companies or contacts

All changes are minimal and surgical - only the necessary validation rules and query invalidations were modified.
