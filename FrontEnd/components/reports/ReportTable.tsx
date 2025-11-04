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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Badge from "@/components/ui/badge";
import { MoreHorizontal, Eye, Trash2, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportListItemDTO } from "@/services/Reports/Reports";
import { toast } from "react-toastify";
import { ReportsService } from "@/services/Reports/Reports";
import { formatDateToUTC7 } from "@/lib/utils";

interface ReportTableProps {
  data: ReportListItemDTO[];
  loading: boolean;
  sort: { field: string | null; direction: "asc" | "desc" | null };
  onSortChange: (field: string) => void;
  onViewClick: (id: number) => void;
  onDeleteClick?: (id: number) => void;
  onRefresh?: () => void;
}

const formatDate = (dateString: string): string => {
  return formatDateToUTC7(dateString);
};

const getStatusBadgeColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
    case "resolved":
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300";
  }
};

export function ReportTable({
  data,
  loading,
  sort,
  onSortChange,
  onViewClick,
  onDeleteClick,
  onRefresh,
}: ReportTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [isResolveLoading, setIsResolveLoading] = useState(false);

  const getSortIcon = (field: string) => {
    if (sort.field !== field) return " ↕";
    if (sort.direction === "asc") return " ↑";
    if (sort.direction === "desc") return " ↓";
    return " ↕";
  };

  const handleResolve = async (id: number) => {
    setResolvingId(id);
    setIsResolveLoading(true);
    try {
      await ReportsService.update(id, { reportId: id, status: "Resolved" });
      toast.success("Report resolved successfully");
      onRefresh?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resolve report"
      );
    } finally {
      setIsResolveLoading(false);
      setResolvingId(null);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    setIsActionLoading(true);
    try {
      await ReportsService.delete(deletingId);
      toast.success("Report deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      onRefresh?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete report"
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
                <TableHead>Document ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
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
          No reports found.
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
                onClick={() => onSortChange("documentId")}
              >
                Document ID{getSortIcon("documentId")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/70"
                onClick={() => onSortChange("status")}
              >
                Status{getSortIcon("status")}
              </TableHead>
              <TableHead>Reason</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/70"
                onClick={() => onSortChange("createdDate")}
              >
                Created Date{getSortIcon("createdDate")}
              </TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.reportId}>
                <TableCell className="font-mono text-sm">
                  {row.documentId}
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
                <TableCell
                  className="max-w-xs truncate text-sm text-gray-600"
                  title={row.reason}
                >
                  {row.reason || "-"}
                </TableCell>
                <TableCell>{formatDate(row.createdDate)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onViewClick(row.reportId)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      {row.status === "Pending" && (
                        <DropdownMenuItem
                          onClick={() => handleResolve(row.reportId)}
                          disabled={
                            isResolveLoading && resolvingId === row.reportId
                          }
                          className="text-green-600"
                        >
                          <Check className="h-4 w-4 mr-2" /> Resolve
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(row.reportId)}
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
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be
              undone.
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
    </div>
  );
}
