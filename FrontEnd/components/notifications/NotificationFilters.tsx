"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { FilterState } from "../../app/(dashboard)/dashboard/notifications/types";
import { filterableColumns } from "../../app/(dashboard)/dashboard/notifications/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Badge from "@/components/ui/badge";

interface NotificationFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClear: () => void;
}

export function NotificationFilters({
  filters,
  onFilterChange,
  onClear,
}: NotificationFiltersProps) {
  const [selectedField, setSelectedField] =
    useState<keyof FilterState>("title");
  const [inputValue, setInputValue] = useState("");

  const hasActiveFilters = Object.values(filters).some((value) => value);
  const activeFilterCount = Object.values(filters).filter(
    (value) => value
  ).length;

  const currentFilterValue = filters[selectedField] || "";

  const selectedFieldLabel =
    filterableColumns.find((col) => col.key === selectedField)?.label ||
    "Title";

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleApplyFilter = () => {
    onFilterChange({
      ...filters,
      [selectedField]: inputValue || undefined,
    });
    setInputValue("");
  };

  const handleClearCurrentField = () => {
    onFilterChange({
      ...filters,
      [selectedField]: undefined,
    });
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyFilter();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Filter className="size-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" className="h-5 px-2">
              {activeFilterCount}
            </Badge>
          )}
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 text-xs"
          >
            <X className="size-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Input Section */}
      <div className="flex gap-2">
        {/* Dropdown to select field */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[140px] justify-between">
              {selectedFieldLabel}
              <Filter className="ml-2 size-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuLabel>Filter by field</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={selectedField}
              onValueChange={(value) => {
                setSelectedField(value as keyof FilterState);
                setInputValue(filters[value as keyof FilterState] || "");
              }}
            >
              {filterableColumns.map((column) => (
                <DropdownMenuRadioItem
                  key={column.key}
                  value={column.key}
                  className="cursor-pointer"
                >
                  {column.label}
                  {filters[column.key as keyof FilterState] && (
                    <Badge
                      variant="outline"
                      className="ml-auto h-5 px-1.5 text-xs"
                    >
                      ✓
                    </Badge>
                  )}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Input field */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              type="text"
              placeholder={`Search ${selectedFieldLabel.toLowerCase()}...`}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9"
            />
            {currentFilterValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCurrentField}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>
          <Button onClick={handleApplyFilter} disabled={!inputValue.trim()}>
            Apply
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filterableColumns.map((column) => {
            const value = filters[column.key as keyof FilterState];
            if (!value) return null;

            return (
              <Badge
                key={column.key}
                variant="outline"
                className="pl-2 pr-1 py-1 gap-1"
              >
                <span className="text-xs font-medium">{column.label}:</span>
                <span className="text-xs">&quot;{value}&quot;</span>
                <button
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      [column.key]: undefined,
                    })
                  }
                  className="ml-1 hover:bg-accent rounded-sm p-0.5"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
