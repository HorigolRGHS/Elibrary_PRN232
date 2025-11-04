"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw } from "lucide-react";
import { ReportTable } from "@/components/reports/ReportTable";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { PaginationBar } from "@/components/common/pagination";
import { useReports } from "@/hooks/useReports";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ViewReportSheet } from "@/components/reports/ViewReportSheet";
import { useState } from "react";

export default function ReportsPage() {
  const {
    data,
    loading,
    error,
    totalCount,
    totalPages,
    params,
    handleSortChange,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleClearFilters,
    refetch,
  } = useReports();

  const [viewingId, setViewingId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const handleViewClick = (id: number) => {
    setViewingId(id);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setViewingId(null);
    setIsViewOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reports Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage and review document reports
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw
              className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Reports</CardTitle>
              <CardDescription>Total: {totalCount} reports</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Items per page:
              </span>
              <Select
                value={params.pageSize.toString()}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
                disabled={loading}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <ReportFilters
            filters={params.filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />

          <Separator />

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          )}

          {/* Table */}
          {!error && (
            <>
              <ReportTable
                data={data}
                loading={loading}
                sort={params.sort}
                onSortChange={handleSortChange}
                onViewClick={handleViewClick}
                onRefresh={refetch}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <PaginationBar
                  currentPage={params.page}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  loading={loading}
                  onChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Report Sheet */}
      <ViewReportSheet
        isOpen={isViewOpen}
        reportId={viewingId}
        onClose={handleCloseView}
      />
    </div>
  );
}
