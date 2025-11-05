"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  NotificationDetailDTO,
  NotificationsService,
} from "@/services/Notifications/Notifications";

interface EditNotificationDialogProps {
  isOpen: boolean;
  notificationId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditNotificationDialog({
  isOpen,
  notificationId,
  onClose,
  onSuccess,
}: EditNotificationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [notification, setNotification] =
    useState<NotificationDetailDTO | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "",
    status: "Pending",
    scheduledDate: "",
  });

  // Fetch notification details when dialog opens
  useEffect(() => {
    if (!isOpen || !notificationId) return;

    const fetchNotification = async () => {
      try {
        setFetching(true);
        const response = await NotificationsService.getById(notificationId);
        if (response && response.data) {
          const data = response.data as NotificationDetailDTO;
          setNotification(data);
          setFormData({
            title: data.title || "",
            content: data.content || "",
            type: data.type || "",
            status: data.status || "Pending",
            scheduledDate: data.scheduledDate || "",
          });
        }
      } catch (error) {
        toast.error("Failed to load notification details");
        console.error(error);
      } finally {
        setFetching(false);
      }
    };

    fetchNotification();
  }, [isOpen, notificationId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!notificationId || !notification) return;

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Please enter content");
      return;
    }

    setLoading(true);
    try {
      await NotificationsService.update(notificationId, {
        notificationId,
        title: formData.title,
        content: formData.content,
        type: formData.type,
        status: formData.status,
        scheduledDate: formData.scheduledDate,
      });

      toast.success("Notification updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update notification"
      );
    } finally {
      setLoading(false);
    }
  };

  const isCustomType = notification?.type === "Custom";
  const isSystemOrCustomerType = ["System", "Customer"].includes(
    notification?.type || ""
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Notification</DialogTitle>
          <DialogDescription>
            Update notification details and status
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Notification title"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Notification content"
                disabled={loading}
                rows={4}
              />
            </div>

            {isSystemOrCustomerType && (
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange(value, "type")}
                  disabled={loading}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="System">System</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isCustomType && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Type:{" "}
                  <span className="font-semibold">{notification?.type}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Custom notifications cannot change their type or recipients
                  here.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange(value, "status")}
                disabled={loading}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading || fetching}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || fetching}
          >
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
