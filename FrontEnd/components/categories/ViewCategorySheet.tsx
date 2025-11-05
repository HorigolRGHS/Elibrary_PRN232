"use client";

import { useEffect, useState } from "react";
import { CategoryService } from "@/services/category/Category";
import { CategoryReadDTO } from "@/models/dtos/categoryDTO";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ViewCategorySheetProps {
  categoryId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function ViewCategorySheet({ categoryId, isOpen, onClose, onDeleted }: ViewCategorySheetProps) {
  const router = useRouter();
  const userRole = useCurrentUserRole();
  const [category, setCategory] = useState<CategoryReadDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (!categoryId || !isOpen) {
      setCategory(null);
      setError(null);
      return;
    }

    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data: CategoryReadDTO | null = null;
        if (isAdmin) {
          try {
            data = await CategoryService.getAdminItem(categoryId);
          } catch (e) {
            // Fallback to regular get
          }
        }
        
        if (!data) {
          data = await CategoryService.getById(categoryId);
        }
        
        setCategory(data);
      } catch (err) {
        console.error("Failed to load category:", err);
        setError("Failed to load category details");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, isOpen, isAdmin]);

  const handleEdit = () => {
    if (categoryId) {
      router.push(`/dashboard/categories/${categoryId}/edit`);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!categoryId) return;
    
    try {
      setIsDeleting(true);
      if (isAdmin) {
        await CategoryService.deleteAdmin(categoryId);
      } else {
        await CategoryService.deleteCategory(categoryId);
      }
      setIsDeleteDialogOpen(false);
      onClose();
      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-[40vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Category Details</SheetTitle>
            <SheetDescription>View category information</SheetDescription>
          </SheetHeader>

          <div className="mt-8 space-y-6 pl-10 pr-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : category ? (
              <>
                {/* Category Information */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Category ID</label>
                    <p className="text-lg font-semibold">{category.CategoryId}</p>
                  </div>

                  <Separator />

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Category Name</label>
                    <p className="text-lg font-semibold">{category.CategoryName}</p>
                  </div>

                  <Separator />

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                    <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-700">
                      {(category as any).Description || "No description"}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Created Date</label>
                      <p className="text-sm text-gray-700">
                        {new Date(category.CreatedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Updated Date</label>
                      <p className="text-sm text-gray-700">
                        {new Date(category.UpdatedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Actions</h4>
                  
                  <Button
                    className="w-full justify-start h-11"
                    variant="outline"
                    onClick={handleEdit}
                  >
                    <Edit2 className="size-4 mr-2" />
                    Edit Category
                  </Button>

                  {isAdmin && (
                    <Button
                      className="w-full justify-start h-11"
                      variant="destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete Category
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Category not found
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{category?.CategoryName}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
