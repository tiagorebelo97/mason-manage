import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface MultiSelectOption {
  label: string;
  value: string;
  group?: string;
}

export interface GroupedMultiSelectOptions {
  [groupName: string]: MultiSelectOption[];
}

interface MultiSelectProps {
  options?: MultiSelectOption[];
  groupedOptions?: GroupedMultiSelectOptions;
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  maxDisplay?: number;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  groupedOptions,
  selected,
  onChange,
  placeholder = "Select items...",
  emptyText = "No items found.",
  maxDisplay = 3,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (value: string) => {
    if (!disabled) {
      onChange(selected.filter((s) => s !== value));
    }
  };

  const handleSelect = (value: string) => {
    if (!disabled) {
      if (selected.includes(value)) {
        onChange(selected.filter((s) => s !== value));
      } else {
        onChange([...selected, value]);
      }
    }
  };

  // Flatten grouped options or use regular options
  const allOptions = React.useMemo(() => {
    if (groupedOptions) {
      return Object.values(groupedOptions).flat();
    }
    return options || [];
  }, [options, groupedOptions]);

  const selectedOptions = allOptions.filter((option) =>
    selected.includes(option.value)
  );

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-10 h-auto"
          disabled={disabled}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {selectedOptions.length <= maxDisplay ? (
              selectedOptions.map((option) => (
                <Badge
                  variant="secondary"
                  key={option.value}
                  className="mr-1 mb-1"
                  onClick={(e) => {
                    if (!disabled) {
                      e.stopPropagation();
                      handleUnselect(option.value);
                    }
                  }}
                >
                  {option.label}
                  {!disabled && (
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(option.value);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(option.value);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="mr-1 mb-1">
                {selected.length} items selected
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search...`} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groupedOptions ? (
              // Render grouped options
              Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <CommandGroup key={groupName} heading={groupName}>
                  <ScrollArea className="max-h-64">
                    {groupOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => handleSelect(option.value)}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            selected.includes(option.value)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className={cn("h-4 w-4")} />
                        </div>
                        <span>{option.label}</span>
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              ))
            ) : (
              // Render flat options
              <CommandGroup>
                <ScrollArea className="max-h-64">
                  {allOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selected.includes(option.value)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
