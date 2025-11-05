"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import {
  NotificationsService,
  NotificationDetailDTO,
} from "@/services/Notifications/Notifications";
import { getUsers } from "@/services/Auth/userService";
import { toast } from "react-toastify";

interface ViewNotificationSheetProps {
  isOpen: boolean;
  notificationId: number | null;
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

const getTypeBadgeColor = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "system":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
    case "customer":
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    case "custom":
      return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300";
  }
};

const getStatusBadgeColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
    case "sent":
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300";
  }
};

export function ViewNotificationSheet({
  isOpen,
  notificationId,
  onClose,
}: ViewNotificationSheetProps) {
  const [item, setItem] = useState<NotificationDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && notificationId) fetchDetail(notificationId);
  }, [isOpen, notificationId]);

  const fetchDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await NotificationsService.getById(id);
      let it = res.data as NotificationDetailDTO;
      // resolve createdBy to fullname if possible
      try {
        if (it?.createdBy) {
          const uq = `$filter=userId eq ${it.createdBy}&$top=1`;
          const ures = await getUsers(uq);
          if (ures?.success && ures.data?.items?.length) {
            const u = ures.data.items[0];
            it = { ...it, createdByName: u.fullName };
          }
        }
      } catch (e) {
        console.warn("Failed to resolve notification creator name", e);
      }
      setItem(it);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to load notification";
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
              <h2 className="text-2xl font-bold">{item.title}</h2>
              <p className="text-sm text-muted-foreground">
                ID: {item.notificationId}
              </p>
            </div>

            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-semibold">Type</h3>
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(
                    item.type
                  )}`}
                >
                  {item.type}
                </Badge>
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
                <p className="text-sm text-muted-foreground">
                  {(item as any).createdByName ?? "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  ID: {item.createdBy ?? "-"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Created Date</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(item.createdDate)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Scheduled Date</h3>
                <p className="text-sm text-muted-foreground">
                  {item.scheduledDate ? formatDate(item.scheduledDate) : "-"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Updated Date</h3>
                <p className="text-sm text-muted-foreground">
                  {(item as any).updatedDate
                    ? formatDate((item as any).updatedDate)
                    : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Content</h3>
                <div className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded">
                  {item.content}
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
