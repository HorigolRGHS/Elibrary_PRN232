"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import { CategoryService } from "@/services/category/Category";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/api/apiClient";
import { Folder, Plus, RefreshCw, Edit2, Trash2, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PaginationBar } from "@/components/common/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const { categories, loading, error, totalCount, totalPages, params, handlePageChange, handlePageSizeChange, handleSearch, refresh } = useCategories();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<number | null>(null);
  const [diagError, setDiagError] = useState<any>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return setIsAdmin(false);
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const roles = payload?.roles ?? payload?.role ?? payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if (Array.isArray(roles)) {
        setIsAdmin(roles.includes("Admin"));
      } else {
        setIsAdmin(roles === "Admin");
      }
    } catch (e) {
      setIsAdmin(false);
    }
  }, []);

  const openDeleteConfirm = (id: number) => {
    if (!isAdmin) {
      alert("You need Admin privileges to delete categories.");
      return;
    }
    setConfirmTarget(id);
    setDiagError(null);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    const id = confirmTarget;
    if (!id) return;
    setDeletingId(id);
    try {
      await CategoryService.deleteCategory(id);
      setConfirmOpen(false);
      // refresh the client-side categories list
      try {
        await refresh();
      } catch (e) {
        // fallback to router refresh if needed
        router.refresh();
      }
    } catch (err: any) {
      console.error('Delete failed:', err);
      // prepare diagnostics for copy/share
      const payload = {
        message: err?.message || 'Delete failed',
        status: err?.status ?? err?.response?.status,
        attempted: err?.attempted ?? err?.config?.url,
        responseHeaders: err?.responseHeaders ?? err?.response?.headers,
        responseData: err?.responseData ?? err?.response?.data,
        cause: err?.cause ?? undefined,
      };
      setDiagError(payload);
    } finally {
      setDeletingId(null);
    }
  };

  const copyDiagnostics = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(diagError, null, 2));
      alert('Diagnostics copied to clipboard');
    } catch (e) {
      alert('Could not copy diagnostics: ' + String(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Folder className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-sm text-muted-foreground">
              Manage categories used to classify documents
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refresh()}
          >
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/categories/new">
              <Plus className="size-4 mr-2" />
              Create Category
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Categories</CardTitle>
              <CardDescription>
                Total: {totalCount} categories
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input 
              placeholder="Search by name or id" 
              value={params.searchQuery} 
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Separator />

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">Error loading categories: {error}</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No categories found.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-48 text-right">Actions</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {categories.map((c: any, idx: number) => (
                    <TableRow key={`${c.CategoryId ?? "cat"}-${idx}`}>
                      <TableCell className="font-medium">{c.CategoryId}</TableCell>
                      <TableCell>{c.CategoryName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                        {(c as any).Description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                          >
                            <Link href={`/dashboard/categories/${c.CategoryId}`}>
                              <Eye className="size-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                          >
                            <Link href={`/dashboard/categories/${c.CategoryId}`}>
                              <Edit2 className="size-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                          {isAdmin ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeleteConfirm(c.CategoryId)}
                              disabled={deletingId === c.CategoryId}
                            >
                              <Trash2 className="size-4 mr-1" />
                              {deletingId === c.CategoryId ? "Deleting..." : "Delete"}
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled 
                              title="Admin role required to delete"
                            >
                              <Trash2 className="size-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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

        {/* Confirmation / diagnostics dialog */}
        <Dialog open={confirmOpen} onOpenChange={(v) => { setConfirmOpen(v); if (!v) { setDiagError(null); setConfirmTarget(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm delete</DialogTitle>
              <DialogDescription>Are you sure you want to delete category ID {confirmTarget}? This action cannot be undone.</DialogDescription>
            </DialogHeader>

            {diagError ? (
              <div className="mt-4">
                <div className="text-sm font-medium text-destructive">Delete failed</div>
                <pre className="mt-2 max-h-40 overflow-auto rounded border p-2 text-xs bg-muted">{JSON.stringify(diagError, null, 2)}</pre>
                <div className="mt-3 flex gap-2">
                  <Button onClick={copyDiagnostics} size="sm">Copy diagnostics</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setDiagError(null); setConfirmOpen(false); }}>Close</Button>
                </div>
              </div>
            ) : (
              <DialogFooter>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleConfirmDelete} disabled={deletingId !== null}>{deletingId ? 'Deleting...' : 'Delete'}</Button>
                  <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                </div>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
