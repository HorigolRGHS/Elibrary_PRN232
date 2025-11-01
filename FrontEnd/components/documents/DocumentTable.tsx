"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Check, X, Edit, Eye, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DocumentStaffResponseListDTO, DocumentUserResponseItemDTO } from "@/models/dtos/documentDTO";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortState } from "@/app/(dashboard)/dashboard/documents/types";
import { documentColumns } from "@/app/(dashboard)/dashboard/documents/config";
import { DocumentService } from "@/services/document/Document";
import { RejectReasonDialog } from "./RejectReasonDialog";
import { ViewDocumentSheet } from "./ViewDocumentSheet";
import { EditDocumentDialog } from "./EditDocumentDialog";

interface DocumentTableProps {
  data: DocumentStaffResponseListDTO[];
  loading?: boolean;
  sort: SortState;
  onSortChange: (field: string) => void;
  onActionSuccess?: () => void;
}

export function DocumentTable({
  data,
  loading,
  sort,
  onSortChange,
  onActionSuccess,
}: DocumentTableProps) {
  const [rejectingDocId, setRejectingDocId] = useState<number | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getSortIcon = (columnKey: string) => {
    if (sort.field !== columnKey) {
      return <ArrowUpDown className="ml-2 size-4" />;
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="ml-2 size-4" />
    ) : (
      <ArrowDown className="ml-2 size-4" />
    );
  };

  const handleApprove = async (documentId: number) => {
    setIsActionLoading(true);
    try {
      const message = await DocumentService.ApproveDocument(documentId);
      toast.success(message || "Document approved successfully");
      onActionSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to approve document";
      toast.error(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectClick = (documentId: number) => {
    setRejectingDocId(documentId);
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingDocId) return;

    setIsActionLoading(true);
    try {
      const message = await DocumentService.RejectDocument(rejectingDocId, reason);
      toast.success(message || "Document rejected successfully");
      setIsRejectDialogOpen(false);
      setRejectingDocId(null);
      onActionSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reject document";
      toast.error(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectCancel = () => {
    setIsRejectDialogOpen(false);
    setRejectingDocId(null);
  };

  const getCurrentDocTitle = (): string => {
    if (!rejectingDocId) return "";
    const doc = data.find((d) => d.documentId === rejectingDocId);
    return doc?.title || "Document";
  };

  const handleViewClick = (documentId: number) => {
    setViewingDocId(documentId);
    setIsViewSheetOpen(true);
  };

  const handleCloseViewSheet = () => {
    setIsViewSheetOpen(false);
    setViewingDocId(null);
  };

  const handleDeleteClick = (documentId: number) => {
    setDeletingDocId(documentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDocId) return;

    setIsActionLoading(true);
    try {
      const message = await DocumentService.deleteDocument(deletingDocId);
      toast.success(message || "Document deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingDocId(null);
      onActionSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete document";
      toast.error(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeletingDocId(null);
  };

  const getDeleteDocTitle = (): string => {
    if (!deletingDocId) return "";
    const doc = data.find((d) => d.documentId === deletingDocId);
    return doc?.title || "Document";
  };

  if (loading) {
    return <DocumentTableSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No documents found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {documentColumns.map((column) => (
                <TableHead
                  key={column.key as string}
                  className={column.width}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSortChange(column.key as string)}
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                      {column.label}
                      {getSortIcon(column.key as string)}
                    </Button>
                  ) : (
                    <span className="font-semibold">{column.label}</span>
                  )}
                </TableHead>
              ))}
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.documentId}>
                {documentColumns.map((column) => (
                  <TableCell key={`${row.documentId}-${column.key as string}`}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : (row[column.key] as React.ReactNode)}
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {row.status === "Pending" && (
                        <>
                          <DropdownMenuItem
                            className="cursor-pointer flex items-center gap-2"
                            onClick={() => handleApprove(row.documentId)}
                            disabled={isActionLoading}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Approve</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer flex items-center gap-2 text-destructive"
                            onClick={() => handleRejectClick(row.documentId)}
                            disabled={isActionLoading}
                          >
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setEditingDocId(row.documentId);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => handleViewClick(row.documentId)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center gap-2 text-destructive"
                        onClick={() => handleDeleteClick(row.documentId)}
                        disabled={isActionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RejectReasonDialog
        isOpen={isRejectDialogOpen}
        documentTitle={getCurrentDocTitle()}
        isLoading={isActionLoading}
        onConfirm={handleRejectConfirm}
        onCancel={handleRejectCancel}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{getDeleteDocTitle()}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isActionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isActionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <ViewDocumentSheet
        isOpen={isViewSheetOpen}
        documentId={viewingDocId}
        onClose={handleCloseViewSheet}
      />

      {/* Edit Document Dialog */}
      {editingDocId && (() => {
        const editDoc = data.find(d => d.documentId === editingDocId);
        return editDoc ? (
          <EditDocumentDialog
            isOpen={isEditDialogOpen}
            document={{
              documentId: editDoc.documentId,
              title: editDoc.title,
              description: "",
              fileUrl: null,
              viewCount: 0,
              downloadCount: 0,
              categoryName: editDoc.categoryName,
              subjectName: editDoc.subjectName,
              createdBy: editDoc.createdBy,
              createdDate: editDoc.createdDate,
            } as DocumentUserResponseItemDTO}
            onClose={() => {
              setIsEditDialogOpen(false);
              setEditingDocId(null);
            }}
            onSuccess={() => {
              onActionSuccess?.();
            }}
          />
        ) : null;
      })()}
    </div>
  );
}

// Loading skeleton
function DocumentTableSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {documentColumns.map((column) => (
                <TableHead key={column.key as string} className={column.width}>
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {documentColumns.map((column) => (
                  <TableCell key={`${i}-${column.key as string}`}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
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
