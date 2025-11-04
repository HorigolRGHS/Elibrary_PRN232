"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRatings } from "@/hooks/useRatings";
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

export default function RatingsPage() {
  const router = useRouter();
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

  // Check if user is admin from localStorage
  const isAdmin = typeof window !== "undefined" 
    ? localStorage.getItem("userRole")?.toLowerCase() === "admin"
    : false;

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
                <TableRow key={rating.ratingId}>
                  <TableCell>{rating.documentId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating.starRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2">({rating.starRating})</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {rating.review || "No review"}
                  </TableCell>
                  <TableCell>
                    {new Date(rating.createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/ratings/${rating.ratingId}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
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
    </div>
  );
}
