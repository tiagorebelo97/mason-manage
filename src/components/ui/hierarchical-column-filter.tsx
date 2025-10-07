import * as React from "react";
import { Filter, X, ChevronRight, ChevronDown } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface HierarchicalOption {
  label: string;
  value: string;
  children?: HierarchicalOption[];
}

interface HierarchicalColumnFilterProps {
  options: HierarchicalOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  columnName: string;
}

export function HierarchicalColumnFilter({
  options,
  selected,
  onChange,
  placeholder = "Search...",
  emptyText = "No items found.",
  columnName,
}: HierarchicalColumnFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

  const toggleGroup = (value: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(value)) {
      newExpanded.delete(value);
    } else {
      newExpanded.add(value);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSelect = (value: string, option: HierarchicalOption) => {
    if (option.children && option.children.length > 0) {
      // This is a parent - toggle all children
      const childValues = option.children.map(child => child.value);
      const allChildrenSelected = childValues.every(cv => selected.includes(cv));
      
      if (allChildrenSelected) {
        // Deselect all children
        onChange(selected.filter(s => !childValues.includes(s)));
      } else {
        // Select all children
        const newSelected = [...selected];
        childValues.forEach(cv => {
          if (!newSelected.includes(cv)) {
            newSelected.push(cv);
          }
        });
        onChange(newSelected);
      }
    } else {
      // This is a child - toggle individual selection
      if (selected.includes(value)) {
        onChange(selected.filter((s) => s !== value));
      } else {
        onChange([...selected, value]);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange([]);
    setOpen(false);
  };

  const hasActiveFilters = selected.length > 0;

  const isParentSelected = (option: HierarchicalOption): boolean => {
    if (!option.children || option.children.length === 0) return false;
    return option.children.every(child => selected.includes(child.value));
  };

  const isParentPartiallySelected = (option: HierarchicalOption): boolean => {
    if (!option.children || option.children.length === 0) return false;
    const selectedCount = option.children.filter(child => selected.includes(child.value)).length;
    return selectedCount > 0 && selectedCount < option.children.length;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 gap-1",
            hasActiveFilters && "text-primary"
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          {hasActiveFilters && (
            <>
              <Badge variant="secondary" className="h-5 px-1 text-xs">
                {selected.length}
              </Badge>
              <button
                className="ml-0.5 hover:text-destructive"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="max-h-64">
                {options.map((option) => {
                  const hasChildren = option.children && option.children.length > 0;
                  const isExpanded = expandedGroups.has(option.value);
                  const parentSelected = isParentSelected(option);
                  const parentPartiallySelected = isParentPartiallySelected(option);

                  return (
                    <div key={option.value}>
                      <CommandItem
                        onSelect={() => handleSelect(option.value, option)}
                        className="flex items-center gap-2"
                      >
                        {hasChildren && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGroup(option.value);
                            }}
                            className="flex items-center"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </button>
                        )}
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            parentSelected || (hasChildren && parentPartiallySelected)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          {parentPartiallySelected && !parentSelected ? (
                            <div className="h-2 w-2 bg-primary rounded-sm" />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className={cn("text-sm", hasChildren && "font-medium")}>
                          {option.label}
                        </span>
                      </CommandItem>
                      {hasChildren && isExpanded && (
                        <div className="ml-6">
                          {option.children?.map((child) => (
                            <CommandItem
                              key={child.value}
                              onSelect={() => handleSelect(child.value, child)}
                              className="flex items-center gap-2"
                            >
                              <div
                                className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  selected.includes(child.value)
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible"
                                )}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                              <span className="text-sm">{child.label}</span>
                            </CommandItem>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
