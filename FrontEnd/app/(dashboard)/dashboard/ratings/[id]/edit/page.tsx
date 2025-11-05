"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RatingService } from "@/services/rating/Rating";
import { RatingReadDTO } from "@/models/dtos/ratingDTO";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit2, StarIcon } from "lucide-react";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

export default function RatingEditPage() {
  const params = useParams();
  const router = useRouter();
  const userRole = useCurrentUserRole();
  const ratingId = parseInt(params.id as string);

  const [rating, setRating] = useState<RatingReadDTO | null>(null);
  const [starRating, setStarRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin cannot edit ratings
  useEffect(() => {
    if (userRole === "admin") {
      router.push("/dashboard/ratings");
    }
  }, [userRole, router]);

  useEffect(() => {
    const loadRating = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await RatingService.getById(ratingId);
        setRating(data);
        setStarRating(data.StarRating);
        setReview(data.Review || "");
      } catch (err: any) {
        setError(err?.message || "Failed to load rating");
      } finally {
        setLoading(false);
      }
    };

    if (ratingId) {
      loadRating();
    }
  }, [ratingId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (starRating === 0) {
      alert("Please select a star rating");
      return;
    }

    try {
      setSaving(true);
      await RatingService.updateRating(ratingId, {
        StarRating: starRating,
        Review: review.trim() || undefined,
      });
      router.push("/dashboard/ratings");
      router.refresh();
    } catch (err: any) {
      console.error("Update failed:", err);
      alert(err?.message || "Failed to update rating");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading rating...</p>
      </div>
    );
  }

  if (error || !rating) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || "Rating not found"}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">Edit Rating</h1>
            <p className="text-sm text-muted-foreground">
              Update your rating
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rating Information</CardTitle>
          <CardDescription>Modify your rating details below</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Rating ID</label>
              <div className="px-3 py-2 bg-muted rounded border border-muted-foreground/20 text-sm">
                {rating.RatingId}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Document</label>
              <div className="px-3 py-2 bg-muted rounded border border-muted-foreground/20 text-sm">
                {rating.DocumentTitle || `Document #${rating.DocumentId}`}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Star Rating *</label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStarRating(i + 1)}
                    className="focus:outline-none"
                  >
                    <StarIcon
                      className={`w-8 h-8 cursor-pointer transition-colors ${
                        i < starRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-lg font-semibold">
                  {starRating > 0 ? `${starRating}/5` : "Select rating"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Review (Optional)</label>
              <Textarea 
                value={review} 
                onChange={(e) => setReview(e.target.value)} 
                rows={6}
                placeholder="Share your thoughts about this document..."
              />
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={saving || starRating === 0}
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
        </CardContent>
      </Card>
    </div>
  );
}
