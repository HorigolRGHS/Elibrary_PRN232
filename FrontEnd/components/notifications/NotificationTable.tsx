"use client";

import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Badge from "@/components/ui/badge";
import { MoreHorizontal, Eye, Trash2, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import {
  NotificationListItemDTO,
  NotificationsService,
} from "@/services/Notifications/Notifications";
import { EditNotificationDialog } from "./EditNotificationDialog";
import { formatDateToUTC7 } from "@/lib/utils";

interface NotificationTableProps {
  data: NotificationListItemDTO[];
  loading: boolean;
  sort: { field: string | null; direction: "asc" | "desc" | null };
  onSortChange: (field: string) => void;
  onViewClick: (id: number) => void;
  onRefresh?: () => void;
}

const formatDate = (dateString: string): string => {
  return formatDateToUTC7(dateString);
};

const getTypeBadgeColor = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "system":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
    case "customer":
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    case "custom":
      return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300";
  }
};

const getStatusBadgeColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
    case "sent":
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300";
  }
};

export function NotificationTable({
  data,
  loading,
  sort,
  onSortChange,
  onViewClick,
  onRefresh,
}: NotificationTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getSortIcon = (field: string) => {
    if (sort.field !== field) return " ↕";
    if (sort.direction === "asc") return " ↑";
    if (sort.direction === "desc") return " ↓";
    return " ↕";
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    setIsActionLoading(true);
    try {
      await NotificationsService.delete(deletingId);
      toast.success("Notification deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      onRefresh?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete notification"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <div className="p-8 text-center text-muted-foreground">
          No notifications found.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead
                className="cursor-pointer hover:bg-muted/70"
                onClick={() => onSortChange("title")}
              >
                Title{getSortIcon("title")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/70"
                onClick={() => onSortChange("type")}
              >
                Type{getSortIcon("type")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/70"
                onClick={() => onSortChange("status")}
              >
                Status{getSortIcon("status")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/70"
                onClick={() => onSortChange("createdDate")}
              >
                Created Date{getSortIcon("createdDate")}
              </TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.notificationId}>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(
                      row.type
                    )}`}
                  >
                    {row.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(row.createdDate)}</TableCell>
                <TableCell>{row.createdByName ?? "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onViewClick(row.notificationId)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingId(row.notificationId);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(row.notificationId)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isActionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isActionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isActionLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <EditNotificationDialog
        isOpen={isEditDialogOpen}
        notificationId={editingId}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingId(null);
        }}
        onSuccess={() => {
          onRefresh?.();
        }}
      />
    </div>
  );
}
