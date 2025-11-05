"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CategoryService } from "@/services/category/Category";
import { CategoryReadDTO } from "@/models/dtos/categoryDTO";
import { getAuthToken } from '@/api/apiClient';
import { Edit2, ArrowLeft, Trash2, Folder } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

export default function CategoryDetailPage() {
  const params = useParams() as { id?: string };
  const id = params?.id ? Number(params.id) : null;
  const router = useRouter();
  const userRole = useCurrentUserRole();

  const [category, setCategory] = useState<CategoryReadDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoading(true);

        // if current user is Admin, prefer the admin per-item endpoint which uses admin/(${id})
        let data: CategoryReadDTO | null = null;
        const token = getAuthToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const roles = payload?.roles ?? payload?.role ?? payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            const isAdmin = Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
            if (isAdmin) {
              data = await CategoryService.getAdminItem(id);
            }
          } catch (e) {
            // ignore token parse errors and fall back to public get
          }
        }

        if (!data) {
          data = await CategoryService.getById(id);
        }

        setCategory(data);
      } catch (err) {
        console.error(err);
        alert("Unable to load category");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (!id) return <div className="p-6">Category ID not found.</div>;

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      if (isAdmin) {
        await CategoryService.deleteAdmin(id);
      } else {
        await CategoryService.deleteCategory(id);
      }
      router.push("/dashboard/categories");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete category");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Folder className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Category Details</h1>
              <p className="text-sm text-muted-foreground">
                View category information
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>Details about this category</CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : category ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Category ID</label>
                  <p className="text-lg">{category.CategoryId}</p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-gray-600">Category Name</label>
                  <p className="text-lg">{category.CategoryName}</p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-base">{(category as any).Description || "No description"}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created Date</label>
                    <p className="text-base">{new Date(category.CreatedDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Updated Date</label>
                    <p className="text-base">{new Date(category.UpdatedDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Category not found.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Actions */}
      <div className="w-80 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage this category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push(`/dashboard/categories/${id}/edit`)}
            >
              <Edit2 className="size-4 mr-2" />
              Edit Category
            </Button>
            
            {isAdmin && (
              <Button 
                className="w-full justify-start"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4 mr-2" />
                Delete Category
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{category?.CategoryName}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
