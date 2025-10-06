# MultiSelect Component

A searchable multi-select component built with shadcn/ui primitives for selecting multiple items from a large list.

## Features

- 🔍 **Searchable** - Filter options with built-in search
- 🎯 **Compact** - Shows selected items as dismissible badges
- 📦 **Scalable** - Handles large lists efficiently with ScrollArea
- ♿ **Accessible** - Keyboard navigation and ARIA support
- 🎨 **Customizable** - Matches your theme and design system

## Usage

### Basic Example

```tsx
import { MultiSelect } from "@/components/ui/multi-select";

function MyComponent() {
  const [selected, setSelected] = useState<string[]>([]);

  const options = [
    { label: "Option 1", value: "opt1" },
    { label: "Option 2", value: "opt2" },
    { label: "Option 3", value: "opt3" },
  ];

  return (
    <MultiSelect
      options={options}
      selected={selected}
      onChange={setSelected}
      placeholder="Select options..."
      emptyText="No options found."
    />
  );
}
```

### With React Hook Form

```tsx
import { MultiSelect } from "@/components/ui/multi-select";
import { useForm } from "react-hook-form";

function FormExample() {
  const form = useForm({
    defaultValues: {
      items: [],
    },
  });

  return (
    <FormField
      control={form.control}
      name="items"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Items</FormLabel>
          <FormControl>
            <MultiSelect
              options={options}
              selected={field.value}
              onChange={field.onChange}
              placeholder="Select items..."
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `MultiSelectOption[]` | required | Array of options with `label` and `value` |
| `selected` | `string[]` | required | Array of selected values |
| `onChange` | `(selected: string[]) => void` | required | Callback when selection changes |
| `placeholder` | `string` | `"Select items..."` | Placeholder text when nothing selected |
| `emptyText` | `string` | `"No items found."` | Text shown when search returns no results |
| `maxDisplay` | `number` | `3` | Maximum badges to show before collapsing to count |

## Implementation Details

The MultiSelect component uses the following shadcn/ui primitives:

- **Command** - Provides search and filtering functionality
- **Popover** - Handles dropdown positioning and overlay
- **ScrollArea** - Enables smooth scrolling for long lists
- **Badge** - Displays selected items as removable tags
- **Button** - Styled trigger for the dropdown

## Use Cases

Perfect for:
- Multi-category selection
- Tag/label assignment
- Permission management
- Filter selection
- Any scenario with 5+ selectable options

## Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly

## Example in Production

See `src/components/companies/CompanyDialog.tsx` for a real-world example of the MultiSelect component being used for company speciality selection.
