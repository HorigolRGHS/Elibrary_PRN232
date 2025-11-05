"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Calendar,
  Eye,
  Download,
  FileText,
  Edit,
  Trash2,
  Loader2,
  Flag,
  Star,
  StarIcon,
} from "lucide-react";
import { toast } from "react-toastify";

import { DocumentUserResponseItemDTO } from "@/models/dtos/documentDTO";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { DocumentService } from "@/services/document/Document";
import { EditDocumentDialog } from "@/components/documents/EditDocumentDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useRouter, useParams } from "next/navigation";
import { ReportDocumentDialog } from "@/components/documents/ReportDocumentDialog";
import { RateDocumentDialog } from "@/components/documents/RateDocumentDialog";
import { RatingService } from "@/services/rating/Rating";
import { RatingReadDTO } from "@/models/dtos/ratingDTO";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

// Dynamically import PDFReader to avoid SSR issues with DOMMatrix and other browser APIs
const PDFReader = dynamic(() => import("@/components/ui/pdf-reader"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
      <div className="flex items-center space-x-2 text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading PDF viewer...</span>
      </div>
    </div>
  ),
});

// No props: in Client Components, use useParams()

const triggerFileDownload = (file: File, fallbackName: string): void => {
  try {
    // Create blob URL
    const url = URL.createObjectURL(file);

    // Create anchor element
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name || fallbackName;

    // Set additional attributes for Firefox compatibility
    link.style.display = "none";
    link.setAttribute("target", "_blank");

    // Append to body (required for Firefox)
    document.body.appendChild(link);

    // Trigger download with a slight delay for Firefox
    setTimeout(() => {
      link.click();

      // Cleanup after download starts
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }, 0);
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download file");
  }
};

export default function DocumentPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const currentUserId = useCurrentUserId();
  const userRole = useCurrentUserRole();
  const [document, setDocument] = useState<DocumentUserResponseItemDTO | null>(
    null
  );
  const [documentStream, setDocumentStream] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [userRating, setUserRating] = useState<RatingReadDTO | null>(null);
  const [loadingRating, setLoadingRating] = useState(false);

  const docId = parseInt(id);
  const isCreator =
    document && currentUserId && document.createdBy === currentUserId;
  const isCustomer = userRole === "customer";

  useEffect(() => {
    const fetchDocumentData = async () => {
      setLoading(true);
      setError(null);
      setViewerError(null);
      setDocumentStream(null);
      try {
        const doc = await DocumentService.getUserDocumentDetails(docId);
        setDocument(doc);

        if (doc.fileUrl) {
          try {
            const stream = await DocumentService.getDocumentStream(
              docId,
              doc.fileUrl,
              "preview"
            );
            setDocumentStream(stream);
          } catch (e) {
            console.error("Error fetching document stream:", e);
            setViewerError("Unable to load document file for preview");
          }
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentData();
  }, [docId]);

  // Load user's rating for this document
  useEffect(() => {
    const loadUserRating = async () => {
      if (!currentUserId || !isCustomer) return;
      
      try {
        setLoadingRating(true);
        const rating = await RatingService.getUserRatingForDocument(currentUserId, docId);
        setUserRating(rating);
      } catch (err) {
        console.error("Error loading user rating:", err);
      } finally {
        setLoadingRating(false);
      }
    };

    loadUserRating();
  }, [currentUserId, docId, isCustomer]);

  const handleDownload = async () => {
    if (!document?.fileUrl) return;

    try {
      setHasDownloaded(true);
      const file = await DocumentService.downloadDocument(
        docId,
        document.fileUrl
      );
      triggerFileDownload(file, `${document.title}.pdf`);
    } catch (err) {
      console.error("Error downloading document:", err);
      setError("Failed to download document");
    }
  };

  const handlePDFLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setViewerError("Failed to load PDF viewer");
  };

  const handleRateClick = () => {
    if (!isCustomer) {
      toast.info("Only customers can rate documents");
      return;
    }

    if (!hasDownloaded && !userRating) {
      // Show warning if user hasn't downloaded yet and doesn't have existing rating
      toast.warning("Please download the document first before rating");
      return;
    }

    setIsRateDialogOpen(true);
  };

  const handleRatingSuccess = async () => {
    // Reload user rating after successful rating
    if (currentUserId) {
      const rating = await RatingService.getUserRatingForDocument(currentUserId, docId);
      setUserRating(rating);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await DocumentService.deleteDocument(docId);
      toast.success("Document deleted successfully!");
      router.push("/");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete document";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error || "Document not found"}
            </h3>
            <p className="text-gray-500">
              The document you&apos;re looking for doesn&apos;t exist or
              couldn&apos;t be loaded.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold">
                  {document.title}
                </CardTitle>
                {/* Show user's rating stars if they have rated */}
                {userRating && isCustomer && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < userRating.StarRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-sm font-semibold text-gray-600">
                      ({userRating.StarRating})
                    </span>
                  </div>
                )}
              </div>
              <CardDescription className="text-base">
                {document.description}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2"
                disabled={!document.fileUrl}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>

              {/* Rate button for customers */}
              {isCustomer && (
                <Button
                  onClick={handleRateClick}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={loadingRating}
                >
                  <Star className="w-4 h-4" />
                  {userRating ? "Update Rating" : "Rate"}
                </Button>
              )}

              <Button
                onClick={() => setIsReportDialogOpen(true)}
                variant="outline"
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
                title="Report this document"
              >
                <Flag className="w-4 h-4" />
              </Button>

              {/* Edit & Delete buttons for creator */}
              {isCreator && (
                <>
                  <Button
                    onClick={() => setIsEditDialogOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Badge variant="default" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {document.categoryName}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {document.subjectName}
            </Badge>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {document.viewCount} views
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                {document.downloadCount} downloads
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(document.createdDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Viewer</CardTitle>
          <CardDescription>
            View the document content below. Use the controls to navigate, zoom,
            and interact with the PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewerError && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {viewerError}
            </div>
          )}
          {documentStream ? (
            <PDFReader
              file={documentStream}
              height="600px"
              onLoadError={handlePDFLoadError}
              enableRotate={true}
              enableZoom={true}
              className="w-full"
            />
          ) : (
            <div className="h-[600px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  No PDF file available for this document
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Document Dialog */}
      <EditDocumentDialog
        isOpen={isEditDialogOpen}
        document={document}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => {
          // Refresh document data
          const refetch = async () => {
            const doc = await DocumentService.getUserDocumentDetails(docId);
            setDocument(doc);
          };
          refetch();
        }}
      />

      {/* Delete Document Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{document?.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Document Dialog */}
      <ReportDocumentDialog
        isOpen={isReportDialogOpen}
        documentId={docId}
        documentTitle={document?.title || ""}
        onClose={() => setIsReportDialogOpen(false)}
      />

      {/* Rate Document Dialog */}
      {isCustomer && currentUserId && (
        <RateDocumentDialog
          isOpen={isRateDialogOpen}
          onClose={() => setIsRateDialogOpen(false)}
          documentId={docId}
          userId={currentUserId}
          existingRatingId={userRating?.RatingId}
          existingStarRating={userRating?.StarRating}
          existingReview={userRating?.Review}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
}
