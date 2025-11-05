"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRatings } from "@/hooks/useRatings";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StarIcon, Eye } from "lucide-react";
import Link from "next/link";
import { ViewRatingSheet } from "@/components/ratings/ViewRatingSheet";

export default function RatingsPage() {
  const router = useRouter();
  const userRole = useCurrentUserRole();
  const isAdmin = userRole === "admin";
  const [selectedRatingId, setSelectedRatingId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const {
    ratings,
    loading,
    error,
    page,
    totalPages,
    searchTerm,
    onPageChange,
    onSearch,
  } = useRatings();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading ratings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ratings</h1>
        {!isAdmin && (
          <Link href="/dashboard/ratings/new">
            <Button>Add Rating</Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Search by document or rating..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document ID</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ratings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No ratings found
                </TableCell>
              </TableRow>
            ) : (
              ratings.map((rating) => (
                <TableRow key={rating.RatingId}>
                  <TableCell>{rating.DocumentId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating.StarRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2">({rating.StarRating})</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {rating.Review || "No review"}
                  </TableCell>
                  <TableCell>
                    {new Date(rating.CreatedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedRatingId(rating.RatingId);
                        setIsSheetOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Rating Sheet */}
      <ViewRatingSheet
        ratingId={selectedRatingId}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedRatingId(null);
        }}
        onDeleted={() => {
          // Refresh ratings list after delete
          window.location.reload();
        }}
      />
    </div>
  );
}
