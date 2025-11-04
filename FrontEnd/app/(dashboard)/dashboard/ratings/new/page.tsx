"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RatingService } from "@/services/rating/Rating";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";
import Link from "next/link";
import { StarRating } from "@/components/common/star-rating";

export default function NewRatingPage() {
  const router = useRouter();
  const userId = useCurrentUserId();

  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    documentId: "",
    starRating: 0,
    review: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userRole = typeof window !== "undefined" 
      ? localStorage.getItem("userRole")?.toLowerCase()
      : null;
    
    if (userRole === "admin") {
      setIsAdmin(true);
      router.push("/dashboard/ratings");
    }
  }, [router]);

  if (isAdmin) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    if (!formData.documentId || !formData.starRating) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await RatingService.createRating({
        DocumentId: parseInt(formData.documentId),
        StarRating: formData.starRating,
        Review: formData.review || undefined,
        CreatedBy: userId,
      });

      toast.success("Rating created successfully");
      router.push("/dashboard/ratings");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Rating</h1>
        <Link href="/dashboard/ratings">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Document ID *
            </label>
            <Input
              type="number"
              value={formData.documentId}
              onChange={(e) =>
                setFormData({ ...formData, documentId: e.target.value })
              }
              placeholder="Enter document ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rating *
            </label>
            <StarRating
              value={formData.starRating}
              onChange={(rating: number) =>
                setFormData({ ...formData, starRating: rating })
              }
              interactive
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Review</label>
            <Textarea
              value={formData.review}
              onChange={(e) =>
                setFormData({ ...formData, review: e.target.value })
              }
              placeholder="Write your review (optional)"
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Rating"}
            </Button>
            <Link href="/dashboard/ratings">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
