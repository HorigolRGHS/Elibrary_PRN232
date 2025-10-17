"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Sheet,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, X, FileText, Clock, FolderOpen } from "lucide-react";
import { DocumentUserResponseItemDTO } from "@/models/dtos/documentDTO";
import { DocumentService } from "@/services/document/Document";

interface ViewDocumentSheetProps {
  isOpen: boolean;
  documentId: number | null;
  onClose: () => void;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function ViewDocumentSheet({
  isOpen,
  documentId,
  onClose,
}: ViewDocumentSheetProps) {
  const [document, setDocument] = useState<DocumentUserResponseItemDTO | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocument(documentId);
    }
  }, [isOpen, documentId]);

  const fetchDocument = async (id: number) => {
    setLoading(true);
    try {
      const data = await DocumentService.getAdminDocumentItem(id);
      setDocument(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load document";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    setDownloading(true);
    try {
      const file = await DocumentService.downloadDocument(
        document.documentId,
        document.fileUrl || ""
      );

      // Create a download link
      const url = window.URL.createObjectURL(file);
      const link = globalThis.document.createElement("a");
      link.href = url;
      link.download = document.title;
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Document downloaded successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to download document";
      toast.error(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDocument(null);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[700px] overflow-y-auto p-0">
        {loading ? (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-40" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        ) : document ? (
          <>
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {document.title}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    ID: {document.documentId}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-6">
              {/* Description */}
              {document.description && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/20 rounded-lg p-3">
                    {document.description}
                  </p>
                </div>
              )}

              {/* Classification Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/10 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <FolderOpen className="h-3 w-3" />
                    Category
                  </p>
                  <Badge variant="outline" className="text-sm">
                    {document.categoryName}
                  </Badge>
                </div>
                <div className="bg-secondary/10 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <FolderOpen className="h-3 w-3" />
                    Subject
                  </p>
                  <Badge variant="outline" className="text-sm">
                    {document.subjectName}
                  </Badge>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Views
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {document.viewCount}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Downloads
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {document.downloadCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="space-y-3 bg-secondary/5 rounded-lg p-4 border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Created
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">
                    {formatDate(document.createdDate)}
                  </span>
                </div>
              </div>

              {/* File Information */}
              {document.fileUrl && (
                <div className="bg-secondary/10 rounded-lg p-4 border">
                  <p className="text-xs text-muted-foreground mb-2">File Location:</p>
                  <p className="text-sm font-mono text-foreground break-all">
                    {document.fileUrl}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <SheetFooter className="border-t p-4 gap-2 bg-secondary/5">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={downloading}
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              {document.fileUrl && (
                <Button
                  onClick={handleDownload}
                  disabled={downloading || loading}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? "Downloading..." : "Download Document"}
                </Button>
              )}
            </SheetFooter>
          </>
        ) : (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Failed to load document details
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
