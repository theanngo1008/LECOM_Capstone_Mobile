import { useEffect, useState, useCallback } from "react";
import { notificationsHub } from "@/api/notificationsHub";
import { useAuthStore } from "@/store/auth-store";

// ...existing code...

export function useNotificationsHub() {
  const userId = useAuthStore((s) => s.userId);
  const token = useAuthStore((s) => s.token);

  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<any>(null);

  const connect = useCallback(async () => {
    if (!userId || !token) {
      console.log("⚠️ No userId or token");
      return;
    }

    console.log("🔌 Connecting to NotificationsHub...", { userId });
    
    notificationsHub.setToken(token);

    try {
      await notificationsHub.connect();
      console.log("✅ Connected successfully");

      // 🔔 Lắng nghe notification mới
      notificationsHub.onNotification((notif) => {
        console.log("🔔 New notification:", notif);
        setLatestNotification(notif);
        setUnreadCount((prev) => prev + 1);
      });

      // 📊 Lắng nghe unread count
      notificationsHub.onUnreadCount((count) => {
        console.log("📊 Unread count update:", count);
        setUnreadCount(count);
      });
    } catch (error) {
      console.error("❌ Failed to connect:", error);
    }
  }, [userId, token]);

  useEffect(() => {
    connect();

    return () => {
      notificationsHub.offNotification();
      notificationsHub.offUnreadCount();
    };
  }, [connect]);

  return {
    unreadCount,
    latestNotification,
    setUnreadCount,
  };
}
