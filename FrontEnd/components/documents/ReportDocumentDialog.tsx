"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReportsService } from "@/services/Reports/Reports";
import { Loader2 } from "lucide-react";

interface ReportDocumentDialogProps {
  isOpen: boolean;
  documentId: number;
  documentTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReportDocumentDialog({
  isOpen,
  documentId,
  documentTitle,
  onClose,
  onSuccess,
}: ReportDocumentDialogProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the report");
      return;
    }

    setIsLoading(true);
    try {
      await ReportsService.create({
        documentId,
        reason: reason.trim(),
      });

      toast.success("Report submitted successfully!");
      setReason("");
      onClose();
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit report";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report Document</DialogTitle>
          <DialogDescription>
            Report the document &quot;{documentTitle}&quot; for review by
            administrators.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Report *</Label>
            <Textarea
              id="reason"
              placeholder="Please describe why you're reporting this document..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-gray-500">
              {reason.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
