"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, RefreshCw, Plus } from "lucide-react";
import { NotificationTable } from "@/components/notifications/NotificationTable";
import { NotificationFilters } from "@/components/notifications/NotificationFilters";
import { PaginationBar } from "@/components/common/pagination";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ViewNotificationSheet } from "@/components/notifications/ViewNotificationSheet";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
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
  } = useNotifications();

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage and view system notifications
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => router.push("/dashboard/notifications/create")}
          >
            <Plus className="size-4 mr-2" />
            Add Notification
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>
                Total: {totalCount} notifications
              </CardDescription>
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
          <NotificationFilters
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
              <NotificationTable
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

      <ViewNotificationSheet
        isOpen={isViewOpen}
        notificationId={viewingId}
        onClose={handleCloseView}
      />
    </div>
  );
}
