import { notificationsApi } from "@/api/notifications";
import { notificationsHub } from "@/api/notificationsHub";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationsStore } from "@/store/notifications-store";
import { useCallback, useEffect } from "react";

export function useNotificationsHub() {
  const userId = useAuthStore((s) => s.userId);
  const token = useAuthStore((s) => s.token);

  const {
    latestNotification,
    setUnreadCount,
    incrementUnreadCount,
    setLatestNotification,
  } = useNotificationsStore();

  // Fetch initial unread count from API when user logs in
  const fetchInitialUnreadCount = useCallback(async () => {
    if (!userId || !token) return;

    try {
      const response = await notificationsApi.getUnreadCount();
      if (response?.isSuccess && typeof response.result === "number") {
        console.log("📊 [NotificationsHub] Initial unread count:", response.result);
        setUnreadCount(response.result);
      }
    } catch (error) {
      console.log("⚠️ [NotificationsHub] Failed to fetch initial unread count:", error);
    }
  }, [userId, token, setUnreadCount]);

  const connect = useCallback(async () => {
    if (!userId || !token) {
      console.log("⚠️ No userId or token");
      return;
    }

    // Fetch initial unread count before connecting to hub
    await fetchInitialUnreadCount();

    console.log("🔌 Connecting to NotificationsHub...", { userId });
    
    notificationsHub.setToken(token);

    try {
      await notificationsHub.connect();
      console.log("✅ Connected successfully");

      // 🔔 Lắng nghe notification mới
      notificationsHub.onNotification((notif) => {
        console.log("🔔 New notification:", notif);
        setLatestNotification(notif);
        incrementUnreadCount();
      });

      // 📊 Lắng nghe unread count
      notificationsHub.onUnreadCount((count) => {
        console.log("📊 Unread count update:", count);
        setUnreadCount(count);
      });
    } catch (error) {
      console.log("❌ Failed to connect:", error);
    }
  }, [userId, token, setUnreadCount, incrementUnreadCount, setLatestNotification, fetchInitialUnreadCount]);

  useEffect(() => {
    connect();

    return () => {
      notificationsHub.offNotification();
      notificationsHub.offUnreadCount();
    };
  }, [connect]);

  return {
    latestNotification,
  };
}
