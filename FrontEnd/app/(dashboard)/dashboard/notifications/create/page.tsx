"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, ArrowLeft, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { NotificationsService } from "@/services/Notifications/Notifications";
import { Textarea } from "@/components/ui/textarea";
import Badge from "@/components/ui/badge";
import { getUsers } from "@/services/Auth/userService";
import { UserListItemDTO } from "@/models/dtos/userDTO";

interface NormalFormData {
  title: string;
  content: string;
  type: "System" | "Customer" | "";
  scheduledDate: string;
  scheduledTime: string;
}

interface CustomFormData {
  title: string;
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  recipientUserIds: number[];
}

export default function CreateNotificationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserListItemDTO[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [normalFormData, setNormalFormData] = useState<NormalFormData>({
    title: "",
    content: "",
    type: "",
    scheduledDate: "",
    scheduledTime: "",
  });
  const [customFormData, setCustomFormData] = useState<CustomFormData>({
    title: "",
    content: "",
    scheduledDate: "",
    scheduledTime: "",
    recipientUserIds: [],
  });

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        // Request all users without role filter
        const response = await getUsers("$top=1000");
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data && response.data.items) {
          setUsers(response.data.items);
        } else if (response.data && (response.data as any).value) {
          setUsers((response.data as any).value);
        }
      } catch (error) {
        toast.error("Failed to load users");
        console.error(error);
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleNormalInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNormalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setNormalFormData((prev) => ({
      ...prev,
      type: value as "System" | "Customer",
    }));
  };

  const handleAddUser = (userId: number) => {
    setCustomFormData((prev) => {
      if (!prev.recipientUserIds.includes(userId)) {
        return {
          ...prev,
          recipientUserIds: [...prev.recipientUserIds, userId],
        };
      }
      return prev;
    });
  };

  const handleRemoveUser = (userId: number) => {
    setCustomFormData((prev) => ({
      ...prev,
      recipientUserIds: prev.recipientUserIds.filter((id) => id !== userId),
    }));
  };

  const combineDateAndTime = (date: string, time: string): string => {
    if (!date || !time) {
      return "";
    }
    const dateTime = `${date}T${time}`;
    const dateObj = new Date(dateTime);
    const utcDate = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000);
    return utcDate.toISOString();
  };

  const handleNormalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!normalFormData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!normalFormData.content.trim()) {
      toast.error("Please enter content");
      return;
    }
    if (!normalFormData.type) {
      toast.error("Please select a type");
      return;
    }
    if (!normalFormData.scheduledDate || !normalFormData.scheduledTime) {
      toast.error("Please select a date and time");
      return;
    }

    setIsLoading(true);
    try {
      const scheduledDateISO = combineDateAndTime(
        normalFormData.scheduledDate,
        normalFormData.scheduledTime
      );

      const payload = {
        title: normalFormData.title,
        content: normalFormData.content,
        type: normalFormData.type,
        scheduledDate: scheduledDateISO,
        status: "Pending",
      };

      await NotificationsService.create(payload);
      toast.success("Notification created successfully!");

      setTimeout(() => {
        router.push("/dashboard/notifications");
      }, 1000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create notification"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customFormData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!customFormData.content.trim()) {
      toast.error("Please enter content");
      return;
    }
    if (customFormData.recipientUserIds.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }
    if (!customFormData.scheduledDate || !customFormData.scheduledTime) {
      toast.error("Please select a date and time");
      return;
    }

    setIsLoading(true);
    try {
      const scheduledDateISO = combineDateAndTime(
        customFormData.scheduledDate,
        customFormData.scheduledTime
      );

      const payload = {
        title: customFormData.title,
        content: customFormData.content,
        scheduledDate: scheduledDateISO,
        recipientUserIds: customFormData.recipientUserIds,
      };

      await NotificationsService.createCustom(payload);
      toast.success("Custom notification created successfully!");

      setTimeout(() => {
        router.push("/dashboard/notifications");
      }, 1000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create notification"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create Notification</h1>
            <p className="text-sm text-muted-foreground">
              Create a new notification to send to users
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Options</CardTitle>
          <CardDescription>
            Choose how you want to create the notification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Tabs defaultValue="normal" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="normal">Normal</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              <TabsContent value="normal" className="space-y-4 mt-6">
                <form onSubmit={handleNormalSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      name="title"
                      placeholder="Enter notification title"
                      value={normalFormData.title}
                      onChange={handleNormalInputChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      name="content"
                      placeholder="Enter notification content"
                      value={normalFormData.content}
                      onChange={handleNormalInputChange}
                      disabled={isLoading}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={normalFormData.type}
                      onValueChange={handleTypeChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="System">System</SelectItem>
                        <SelectItem value="Customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Date (UTC+7)
                      </label>
                      <Input
                        type="date"
                        name="scheduledDate"
                        value={normalFormData.scheduledDate}
                        onChange={handleNormalInputChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Time (UTC+7)
                      </label>
                      <Input
                        type="time"
                        name="scheduledTime"
                        value={normalFormData.scheduledTime}
                        onChange={handleNormalInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                      )}
                      {isLoading ? "Creating..." : "Create Notification"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 mt-6">
                <form onSubmit={handleCustomSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      name="title"
                      placeholder="Enter notification title"
                      value={customFormData.title}
                      onChange={handleCustomInputChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      name="content"
                      placeholder="Enter notification content"
                      value={customFormData.content}
                      onChange={handleCustomInputChange}
                      disabled={isLoading}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Select Recipients
                    </label>
                    {usersLoading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Loading users...
                      </div>
                    ) : (
                      <Select
                        disabled={isLoading || usersLoading}
                        onValueChange={(value) =>
                          handleAddUser(parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select users to send notification" />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter(
                              (user) =>
                                !customFormData.recipientUserIds.includes(
                                  user.userId
                                )
                            )
                            .map((user) => (
                              <SelectItem
                                key={user.userId}
                                value={user.userId.toString()}
                              >
                                {user.fullName} ({user.email})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {customFormData.recipientUserIds.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Selected Recipients (
                        {customFormData.recipientUserIds.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {customFormData.recipientUserIds.map((userId) => {
                          const user = users.find((u) => u.userId === userId);
                          return (
                            <Badge
                              key={userId}
                              variant="default"
                              className="flex items-center gap-1"
                            >
                              {user?.fullName}
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(userId)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="size-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Date (UTC+7)
                      </label>
                      <Input
                        type="date"
                        name="scheduledDate"
                        value={customFormData.scheduledDate}
                        onChange={handleCustomInputChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Time (UTC+7)
                      </label>
                      <Input
                        type="time"
                        name="scheduledTime"
                        value={customFormData.scheduledTime}
                        onChange={handleCustomInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                      )}
                      {isLoading ? "Creating..." : "Create Custom Notification"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
