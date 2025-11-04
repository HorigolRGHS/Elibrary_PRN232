import { api } from "@/api/apiClient";
import { ResponseDTO } from "@/models/dtos/commonDTO";

export interface NotificationListItemDTO {
  notificationId: number;
  title: string;
  type: "System" | "Customer" | "Custom";
  status: "Pending" | "Sent" | "Cancelled";
  createdDate: string;
  scheduledDate?: string | null;
  // backend returns CreatedBy as an int id; frontend will resolve to a name when available
  createdBy?: number | null;
  // populated client-side after resolving user info
  createdByName?: string | null;
}

export interface NotificationDetailDTO extends NotificationListItemDTO {
  content: string;
  updatedDate?: string | null;
}

export const NotificationsService = {
  getList: async (query?: string) => {
    // Activity service controllers are routed under /api on the service side,
    // Gatekeeper maps /activity/{everything} -> downstream /{everything},
    // so we must include the /api prefix in the upstream path: /activity/api/Notifications
    const base = `/activity/api/Notifications`;
    const url = query ? `${base}?${query}` : base;
    return api.get<ResponseDTO<NotificationListItemDTO[]>>(url);
  },

  getById: async (id: number) => {
    return api.get<ResponseDTO<NotificationDetailDTO>>(
      `/activity/api/Notifications/${id}`
    );
  },

  delete: async (id: number) => {
    return api.delete<ResponseDTO<boolean>>(
      `/activity/api/Notifications/${id}`
    );
  },

  create: async (data: {
    title: string;
    content: string;
    type: string;
    scheduledDate: string;
    status: string;
  }) => {
    return api.post<ResponseDTO<NotificationDetailDTO>>(
      `/activity/api/Notifications`,
      data
    );
  },

  createCustom: async (data: {
    title: string;
    content: string;
    scheduledDate: string;
    recipientUserIds: number[];
  }) => {
    return api.post<ResponseDTO<NotificationDetailDTO>>(
      `/activity/api/Notifications/custom`,
      data
    );
  },

  update: async (
    id: number,
    data: {
      notificationId: number;
      title: string;
      content: string;
      type: string;
      status: string;
      scheduledDate: string;
    }
  ) => {
    return api.put<ResponseDTO<NotificationDetailDTO>>(
      `/activity/api/Notifications/${id}`,
      data
    );
  },
};
