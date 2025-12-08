// src/hooks/useNotificationsList.ts
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/api/notifications";

export function useNotificationsList(page?: number, size?: number) {
  return useQuery({
    queryKey: ["notifications", page, size],
    queryFn: () =>
      notificationsApi.getNotifications({
        page,
        size,
      }),
  });
}
