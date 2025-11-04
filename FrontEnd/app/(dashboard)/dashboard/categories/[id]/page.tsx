"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CategoryService } from "@/services/category/Category";
import { CategoryReadDTO } from "@/models/dtos/categoryDTO";
import { getAuthToken } from '@/api/apiClient';
import { Edit2, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CategoryDetailPage() {
  const params = useParams() as { id?: string };
  const id = params?.id ? Number(params.id) : null;
  const router = useRouter();

  const [category, setCategory] = useState<CategoryReadDTO | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
        setName(data.categoryName);
        setDescription((data as any).description || "");
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Category name cannot be empty");
    try {
      setSaving(true);
      
      // If current user is Admin, use admin update endpoint
      const token = getAuthToken();
      let isAdmin = false;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const roles = payload?.roles ?? payload?.role ?? payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          isAdmin = Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
        } catch (e) {
          // ignore token parse errors
        }
      }
      
      if (isAdmin) {
        await CategoryService.updateAdmin(id, { CategoryName: name.trim(), Description: description.trim() });
      } else {
        await CategoryService.updateCategory(id, { CategoryName: name.trim(), Description: description.trim() });
      }
      
      router.push("/dashboard/categories");
      router.refresh();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
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
            <Edit2 className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Edit Category</h1>
            <p className="text-sm text-muted-foreground">
              Update category information
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>Modify the category details below.</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : category ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Category ID</label>
                <div className="px-3 py-2 bg-muted rounded border border-muted-foreground/20 text-sm">
                  {category.categoryId}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category Name *</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={4}
                  placeholder="Enter category description (optional)"
                />
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={saving || !name.trim()}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Category not found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
