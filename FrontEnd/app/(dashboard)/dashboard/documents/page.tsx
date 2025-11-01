"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, RefreshCw } from "lucide-react";
import { DocumentTable } from "../../../../components/documents/DocumentTable";
import { DocumentFilters } from "../../../../components/documents/DocumentFilters";
import { PaginationBar } from "@/components/common/pagination";
import { useDocuments } from "../../../../hooks/useDocuments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export default function DocumentsPage() {
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
  } = useDocuments();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Documents Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize library documents
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
          >
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button
          onClick={() => router.push('/document/upload')}
          >
            <Plus className="size-4 mr-2" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>
                Total: {totalCount} documents
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
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
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <DocumentFilters
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
              <DocumentTable
                data={data}
                loading={loading}
                sort={params.sort}
                onSortChange={handleSortChange}
                onActionSuccess={() => {
                  refetch();
                }}
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
    </div>
  );
}
