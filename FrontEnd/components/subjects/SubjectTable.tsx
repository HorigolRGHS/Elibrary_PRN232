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
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { SortState } from "@/app/(dashboard)/dashboard/subjects/types";
import { subjectColumns } from "@/app/(dashboard)/dashboard/subjects/config";
import { SubjectService } from "@/services/subject/Subject";
import { SubjectResponseDTO, SubjectDetailDTO, camelSubjectDetailDTO } from "@/models/dtos/subjectDTO";
import SubjectForm from "@/components/subjects/SubjectForm";
import ViewSubjectSheet from "@/components/subjects/ViewSubjectSheet";

interface SubjectTableProps {
  data: SubjectResponseDTO[];
  loading?: boolean;
  sort: SortState;
  onSortChange: (field: string) => void;
  onActionSuccess?: () => void;
}

export function SubjectTable({
  data: items,
  loading,
  sort,
  onSortChange,
  onActionSuccess,
}: SubjectTableProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const [viewingSubjectId, setViewingSubjectId] = useState<number | null>(null);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);

  const [deletingSubjectId, setDeletingSubjectId] = useState<number | null>(null);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<camelSubjectDetailDTO | null>(null);
  const [isEditingLoading, setIsEditingLoading] = useState(false);

  const getSortIcon = (columnKey: string) => {
    if (sort.field !== columnKey || !sort.direction) {
      return <ArrowUpDown className="ml-2 size-4" />;
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="ml-2 size-4" />
    ) : (
      <ArrowDown className="ml-2 size-4" />
    );
  };
  
  const handleViewClick = (subjectId: number) => {
    setViewingSubjectId(subjectId);
    setIsViewSheetOpen(true);
  };
  
  const handleEditClick = async (subjectId: number) => {
    setIsEditDialogOpen(true);
    setIsEditingLoading(true);
    setEditingSubject(null);
    try {
      const details = await SubjectService.getCamelSubjectById(subjectId);
      if (details) {
        setEditingSubject(details);
      } else {
        toast.error("Could not find subject details.");
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      toast.error("Failed to load subject for editing.");
      setIsEditDialogOpen(false);
    } finally {
      setIsEditingLoading(false);
    }
  };
  
  const handleDeleteClick = (subjectId: number) => {
    setDeletingSubjectId(subjectId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubjectId) return;
    setIsActionLoading(true);
    try {
      const msg = await SubjectService.deleteSubject(deletingSubjectId);
      toast.success(msg || "Subject deleted successfully");
      onActionSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete subject");
    } finally {
      setIsActionLoading(false);
      setDeletingSubjectId(null);
    }
  };
  

  if (loading) return <SubjectTableSkeleton />;

  console.log("Rendering SubjectTable with items:", items);

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No subjects found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/60">
                {subjectColumns.map((col) => (
                  <TableHead key={col.key as string} className={col.width}>
                    {col.sortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSortChange(col.key as string)}
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                      >
                        {col.label}
                        {getSortIcon(col.key as string)}
                      </Button>
                    ) : (
                      <span className="font-semibold text-sm">{col.label}</span>
                    )}
                  </TableHead>
                ))}
                <TableHead className="w-24 text-center font-semibold text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((row) => (
                <TableRow key={row.SubjectId}>
                  {subjectColumns.map((col) => {
                    const cellValue = row[col.key as keyof SubjectResponseDTO];
                    return (
                      <TableCell key={`${row.SubjectId}-${col.key}`}>
                        {col.render ? col.render(cellValue, row) : cellValue}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditClick(row.SubjectId)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewClick(row.SubjectId)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(row.SubjectId)}
                          className="flex items-center gap-2 text-destructive focus:text-destructive"
                          disabled={isActionLoading}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Dialogs and Sheets */}

      <AlertDialog open={!!deletingSubjectId} onOpenChange={(open) => !open && setDeletingSubjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subject.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isActionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {viewingSubjectId && (
        <ViewSubjectSheet
          open={isViewSheetOpen}
          onOpenChange={setIsViewSheetOpen}
          SubjectId={viewingSubjectId}
        />
      )}

      {isEditDialogOpen && (
        <SubjectForm
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditingSubject(null);
            }
            setIsEditDialogOpen(open);
          }}
          camelInitial={isEditingLoading ? null : editingSubject}
          onSaved={() => {
            onActionSuccess?.();
            setIsEditDialogOpen(false);
            setEditingSubject(null);
          }}
        />
      )}
    </>
  );
}

function SubjectTableSkeleton() {
  const skeletonRows = 5;
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {subjectColumns.map((c) => (
              <TableHead key={c.key as string} className={c.width}>{c.label}</TableHead>
            ))}
            <TableHead className="w-24 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(skeletonRows)].map((_, i) => (
            <TableRow key={i}>
              {subjectColumns.map((c) => (
                <TableCell key={c.key as string}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              ))}
              <TableCell className="flex justify-center">
                <Skeleton className="h-8 w-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}