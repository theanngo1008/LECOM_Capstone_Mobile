// src/hooks/useUnreadCount.ts
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/api/notifications";

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 10_000, // optional: auto refresh mỗi 10s
  });
}
