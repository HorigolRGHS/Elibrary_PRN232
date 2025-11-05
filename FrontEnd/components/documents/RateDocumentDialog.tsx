"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarIcon, Trash2 } from "lucide-react";
import { RatingService } from "@/services/rating/Rating";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RateDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  userId: number;
  existingRatingId?: number | null;
  existingStarRating?: number;
  existingReview?: string;
  onSuccess?: () => void;
}

export function RateDocumentDialog({
  isOpen,
  onClose,
  documentId,
  userId,
  existingRatingId,
  existingStarRating,
  existingReview,
  onSuccess,
}: RateDocumentDialogProps) {
  const [starRating, setStarRating] = useState(existingStarRating || 0);
  const [review, setReview] = useState(existingReview || "");
  const [saving, setSaving] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isUpdate = !!existingRatingId;

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStarRating(existingStarRating || 0);
      setReview(existingReview || "");
    }
  }, [isOpen, existingStarRating, existingReview]);

  const handleSubmit = async () => {
    if (starRating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    try {
      setSaving(true);
      
      if (isUpdate && existingRatingId) {
        // Update existing rating
        await RatingService.updateRating(existingRatingId, {
          StarRating: starRating,
          Review: review.trim() || undefined,
        });
        toast.success("Rating updated successfully");
      } else {
        // Create new rating
        await RatingService.createRating({
          DocumentId: documentId,
          StarRating: starRating,
          Review: review.trim() || undefined,
          CreatedBy: userId,
        });
        toast.success("Rating submitted successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${isUpdate ? "update" : "submit"} rating`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingRatingId) return;

    try {
      setIsDeleting(true);
      
      // First verify the rating exists
      console.log(`[RateDocumentDialog] Attempting to delete rating ID: ${existingRatingId}`);
      
      await RatingService.deleteRating(existingRatingId);
      toast.success("Rating deleted successfully");
      setIsDeleteDialogOpen(false);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error("Delete rating error:", err);
      console.error("Error response:", err?.response);
      
      let errorMessage = "Failed to delete rating";
      
      if (err?.response?.status === 404) {
        errorMessage = "Rating not found or already deleted";
      } else if (err?.response?.status === 403) {
        errorMessage = "You don't have permission to delete this rating";
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isUpdate ? "Update Your Rating" : "Rate This Document"}</DialogTitle>
          <DialogDescription>
            {isUpdate 
              ? "Update your rating and review for this document"
              : "Share your experience with this document"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">Your Rating *</label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStarRating(i + 1)}
                  onMouseEnter={() => setHoveredStar(i + 1)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <StarIcon
                    className={`w-10 h-10 cursor-pointer transition-colors ${
                      i < (hoveredStar || starRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-lg font-semibold text-gray-700">
                {starRating > 0 ? `${starRating}/5` : "Select rating"}
              </span>
            </div>
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Review (Optional)</label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              placeholder="Share your thoughts about this document..."
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="flex-1">
            {isUpdate && (
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={saving || isDeleting}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving || isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || isDeleting || starRating === 0}
            >
              {saving ? "Submitting..." : isUpdate ? "Update Rating" : "Submit Rating"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rating</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your rating? This action cannot be undone.
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
    </Dialog>
  );
}
