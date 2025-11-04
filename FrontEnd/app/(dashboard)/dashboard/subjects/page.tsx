"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { SubjectTable } from "@/components/subjects/SubjectTable";
import { PaginationBar } from "@/components/common/pagination";
import { useSubjects } from "../../../../hooks/useSubjects";
import AddSubjectDialog from "@/components/subjects/AddSubjectDialog";
import { useState } from "react";

export default function DashboardSubjectsPage() {
  const {
    subjects: data,
    loading,
    error,
    totalCount,
    totalPages,
    params,
    handleSortChange,
    handlePageChange,
    handlePageSizeChange,
    refetch,
  } = useSubjects();

  const router = useRouter();

  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Subjects Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize subject categories
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setOpenAdd(true)}>
            <Plus className="size-4 mr-2" />
            Add Subject
            
          </Button>
          <AddSubjectDialog
  open={openAdd}
  onOpenChange={setOpenAdd}
  onCreated={() => refetch()}
/>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Subjects</CardTitle>
              <CardDescription>Total: {totalCount} subjects</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <select
                value={params.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                disabled={loading}
                className="border rounded-md px-2 py-1 text-sm"
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          {/* Error */}
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          )}

          {/* Table */}
          {!error && (
            <>
              <SubjectTable
                data={data}
                loading={loading}
                sort={params.sort}
                onSortChange={handleSortChange}
                onActionSuccess={() => refetch()}
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
