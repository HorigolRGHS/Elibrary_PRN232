"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { ReportsService, ReportDetailDTO } from "@/services/Reports/Reports";
import { toast } from "react-toastify";

interface ViewReportSheetProps {
  isOpen: boolean;
  reportId: number | null;
  onClose: () => void;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadgeColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
    case "resolved":
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300";
  }
};

export function ViewReportSheet({
  isOpen,
  reportId,
  onClose,
}: ViewReportSheetProps) {
  const [item, setItem] = useState<ReportDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && reportId) fetchDetail(reportId);
  }, [isOpen, reportId]);

  const fetchDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await ReportsService.getById(id);
      const data = res.data as ReportDetailDTO;
      setItem(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load report";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setItem(null);
    onClose();
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:w-[700px] overflow-y-auto p-0"
      >
        {loading ? (
          <div className="p-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
            <Skeleton className="h-40 mt-4" />
          </div>
        ) : item ? (
          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
              <h2 className="text-2xl font-bold">Report #{item.reportId}</h2>
              <p className="text-sm text-muted-foreground">
                For Document ID: {item.documentId}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Report ID</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {item.reportId}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Document ID</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {item.documentId}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Status</h3>
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Created By</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {item.createdBy}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Created Date</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(item.createdDate)}
                </p>
              </div>
              {item.updatedDate && (
                <div>
                  <h3 className="text-sm font-semibold">Updated Date</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.updatedDate)}
                  </p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold">Reason</h3>
                <div className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded">
                  {item.reason || "-"}
                </div>
              </div>
            </div>

            <SheetFooter className="border-t p-4">
              <Button variant="outline" onClick={handleClose}>
                <X className="mr-2" />
                Close
              </Button>
            </SheetFooter>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-muted-foreground">No details</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
