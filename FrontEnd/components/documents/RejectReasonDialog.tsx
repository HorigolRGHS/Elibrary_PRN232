"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Textarea } from "../ui/textarea";

interface RejectReasonDialogProps {
  isOpen: boolean;
  documentTitle?: string;
  isLoading?: boolean;
  onConfirm: (reason: string) => Promise<void> | void;
  onCancel: () => void;
}

export function RejectReasonDialog({
  isOpen,
  documentTitle,
  isLoading = false,
  onConfirm,
  onCancel,
}: RejectReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters");
      return;
    }

    try {
      await onConfirm(reason.trim());
      setReason("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject document");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason("");
      setError("");
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Reject Document
          </DialogTitle>
          <DialogDescription>
            {documentTitle ? (
              <span>
                You are about to reject <strong>{documentTitle}</strong>. Please
                provide a reason for the rejection.
              </span>
            ) : (
              "Please provide a reason for rejecting this document."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Enter your reason for rejecting this document..."
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setReason(e.target.value);
                setError("");
              }}
              disabled={isLoading}
              className="min-h-[100px] resize-none"
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? "Rejecting..." : "Reject Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
