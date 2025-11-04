"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RatingService } from "@/services/rating/Rating";
import { RatingReadDTO } from "@/models/dtos/ratingDTO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import Link from "next/link";

export default function RatingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ratingId = parseInt(params.id as string);

  const [rating, setRating] = useState<RatingReadDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRating = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await RatingService.getById(ratingId);
        setRating(data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading rating...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
        <Link href="/dashboard/ratings">
          <Button variant="outline">Back to Ratings</Button>
        </Link>
      </div>
    );
  }

  if (!rating) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Rating not found</p>
        <Link href="/dashboard/ratings">
          <Button variant="outline">Back to Ratings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rating Details</h1>
        <Link href="/dashboard/ratings">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">
            Document
          </label>
          <p className="text-lg">
            {rating.DocumentTitle || `Document #${rating.DocumentId}`}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Rating</label>
          <div className="flex items-center gap-2 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={`w-5 h-5 ${
                  i < rating.StarRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-lg font-semibold">
              {rating.StarRating}/5
            </span>
          </div>
        </div>

        {rating.Review && (
          <div>
            <label className="text-sm font-medium text-gray-600">Review</label>
            <p className="text-base mt-2 whitespace-pre-wrap">{rating.Review}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Created By
            </label>
            <p className="text-base">
              {rating.CreatedByName || `User #${rating.CreatedBy}`}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Created Date
            </label>
            <p className="text-base">
              {new Date(rating.CreatedDate).toLocaleString()}
            </p>
          </div>
        </div>

        {rating.UpdatedDate && (
          <div>
            <label className="text-sm font-medium text-gray-600">
              Last Updated
            </label>
            <p className="text-base">
              {new Date(rating.UpdatedDate).toLocaleString()}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
