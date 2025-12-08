import { ApiResponse } from "@/types/common";
import { apiClient } from "./client";

export interface NotificationItem {
  id: string;
  type: "OrderStatus" | "ChatMessage" | "System";
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationListResponse = ApiResponse<NotificationItem[]>;

interface NotificationQuery {
  page?: number;
  size?: number;
}

export const notificationsApi = {

  // ==============================
  // GET /api/notifications?page=&size=
  // ==============================
  async getNotifications(query: NotificationQuery = {}) {
    const { page = 1, size = 20 } = query;

    const { data } = await apiClient.get<NotificationListResponse>(
      "/notifications",
      {
        params: { page, size },
        // backend của bạn dùng GET và auth → ok
      }
    );

    return data;
  },

  // ==============================
  // GET /api/notifications/unread-count
  // ==============================
  async getUnreadCount() {
    const { data } = await apiClient.get<ApiResponse<number>>(
      "/notifications/unread-count"
    );
    return data;
  },

  // ==============================
  // PUT /api/notifications/{id}/read
  // ==============================
  async markAsRead(id: string) {
    const { data } = await apiClient.post<ApiResponse<boolean>>(
      `/notifications/${id}/read`
    );
    return data;
  },

  // ==============================
  // PUT /api/notifications/read-all
  // ==============================
  async markAllAsRead() {
    const { data } = await apiClient.post<ApiResponse<boolean>>(
      `/notifications/read-all`
    );
    return data;
  },
};
