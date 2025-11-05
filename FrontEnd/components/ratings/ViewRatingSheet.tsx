"use client";

import { useEffect, useState } from "react";
import { RatingService } from "@/services/rating/Rating";
import { RatingReadDTO } from "@/models/dtos/ratingDTO";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit2, Trash2, Loader2, StarIcon } from "lucide-react";
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

interface ViewRatingSheetProps {
  ratingId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function ViewRatingSheet({ ratingId, isOpen, onClose, onDeleted }: ViewRatingSheetProps) {
  const router = useRouter();
  const userRole = useCurrentUserRole();
  const [rating, setRating] = useState<RatingReadDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (!ratingId || !isOpen) {
      setRating(null);
      setError(null);
      return;
    }

    const fetchRating = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await RatingService.getById(ratingId);
        console.log('[ViewRatingSheet] Rating data:', data);
        console.log('[ViewRatingSheet] CreatedByName:', data.CreatedByName);
        setRating(data);
      } catch (err) {
        console.error("Failed to load rating:", err);
        setError("Failed to load rating details");
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [ratingId, isOpen]);

  const handleEdit = () => {
    if (ratingId) {
      router.push(`/dashboard/ratings/${ratingId}/edit`);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!ratingId) return;
    
    try {
      setIsDeleting(true);
      await RatingService.deleteRating(ratingId);
      setIsDeleteDialogOpen(false);
      onClose();
      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete rating");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-[40vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Rating Details</SheetTitle>
            <SheetDescription>View rating information</SheetDescription>
          </SheetHeader>

          <div className="mt-8 space-y-6 pl-6 pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : rating ? (
              <>
                {/* Rating Information */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Rating ID</label>
                    <p className="text-lg font-semibold">{rating.RatingId}</p>
                  </div>

                  <Separator />

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Document</label>
                    <p className="text-lg font-semibold">
                      {rating.DocumentTitle || `Document #${rating.DocumentId}`}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Rating</label>
                    <div className="flex items-center gap-2">
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
                    <>
                      <Separator />
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Review</label>
                        <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-700">
                          {rating.Review}
                        </p>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Created By</label>
                      <p className="text-sm text-gray-700">
                        {rating.CreatedByName && rating.CreatedByName.trim() 
                          ? rating.CreatedByName 
                          : `User #${rating.CreatedBy}`}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Created Date</label>
                      <p className="text-sm text-gray-700">
                        {new Date(rating.CreatedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {rating.UpdatedDate && (
                    <>
                      <Separator />
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Last Updated</label>
                        <p className="text-sm text-gray-700">
                          {new Date(rating.UpdatedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <Separator className="my-8" />

                {/* Actions - Only show for non-admin users */}
                {!isAdmin && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Actions</h4>
                    
                    <Button
                      className="w-full justify-start h-11"
                      variant="outline"
                      onClick={handleEdit}
                    >
                      <Edit2 className="size-4 mr-2" />
                      Edit Rating
                    </Button>

                    <Button
                      className="w-full justify-start h-11"
                      variant="destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete Rating
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Rating not found
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rating</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rating? This action cannot be undone.
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
