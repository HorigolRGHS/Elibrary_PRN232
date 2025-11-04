"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { FilterState } from "@/app/(dashboard)/dashboard/reports/types";

interface ReportFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClear: () => void;
}

export function ReportFilters({
  filters,
  onFilterChange,
  onClear,
}: ReportFiltersProps) {
  const [documentId, setDocumentId] = useState(filters.documentId || "");
  const [status, setStatus] = useState(filters.status || "all");

  const handleApply = () => {
    onFilterChange({
      documentId: documentId || undefined,
      status: status !== "all" ? status : undefined,
    });
  };

  const handleRemoveFilter = (filterKey: keyof FilterState) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    onFilterChange(newFilters);
    if (filterKey === "documentId") setDocumentId("");
    if (filterKey === "status") setStatus("all");
  };

  return (
    <div className="space-y-4">
      {/* Filter Inputs */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Filter by Document ID..."
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            className="h-9"
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleApply} variant="default" className="h-9">
          Apply
        </Button>
        <Button onClick={onClear} variant="outline" className="h-9">
          Clear All
        </Button>
      </div>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {filters.documentId && (
            <Badge variant="default" className="h-5 px-2">
              DocumentID: {filters.documentId}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleRemoveFilter("documentId")}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="default" className="h-5 px-2">
              Status: {filters.status}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleRemoveFilter("status")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
