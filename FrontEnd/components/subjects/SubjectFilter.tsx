"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { FilterState } from "@/app/(dashboard)/dashboard/subjects/types";
import { filterableColumns } from "@/app/(dashboard)/dashboard/subjects/config";
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

interface SubjectFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClear: () => void;
}

export function SubjectFilters({
  filters,
  onFilterChange,
  onClear,
}: SubjectFiltersProps) {
  const [selectedField, setSelectedField] = useState<keyof FilterState>("subjectName");
  const [inputValue, setInputValue] = useState("");

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const selectedFieldLabel =
    filterableColumns.find((c) => c.key === selectedField)?.label || "Name";

  const handleApplyFilter = () => {
    onFilterChange({ ...filters, [selectedField]: inputValue || undefined });
    setInputValue("");
  };

  const handleClearField = () => {
    onFilterChange({ ...filters, [selectedField]: undefined });
    setInputValue("");
  };

  return (
    <div className="space-y-4">
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
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="size-3 mr-1" /> Clear All
          </Button>
        )}
      </div>

      <div className="flex gap-2">
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
              onValueChange={(v) => setSelectedField(v as keyof FilterState)}
            >
              {filterableColumns.map((col) => (
                <DropdownMenuRadioItem key={col.key} value={col.key}>
                  {col.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Search ${selectedFieldLabel.toLowerCase()}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
              className="pl-9"
            />
            {filters[selectedField] && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearField}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
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
    </div>
  );
}
