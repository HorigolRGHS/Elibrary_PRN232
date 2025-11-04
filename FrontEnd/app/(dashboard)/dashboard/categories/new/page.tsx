"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryService } from "@/services/category/Category";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function NewCategoryPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Category name cannot be empty");
    try {
      setLoading(true);
      await CategoryService.createCategory({ CategoryName: name.trim(), Description: description.trim() });
      router.push("/dashboard/categories");
      router.refresh();
    } catch (err) {
      console.error("Create failed:", err);
      alert("Create category failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Plus className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Create Category</h1>
          <p className="text-sm text-muted-foreground">
            Add a new category to organize documents
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>Provide a name and optional description for the new category.</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={loading || !name.trim()}
              >
                {loading ? "Creating..." : "Create Category"}
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
        </CardContent>
      </Card>
    </div>
  );
}
