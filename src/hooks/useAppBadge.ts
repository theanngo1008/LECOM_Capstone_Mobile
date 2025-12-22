import { useAuthStore } from "@/store/auth-store";
import { useNotificationsStore } from "@/store/notifications-store";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

/**
 * Hook để quản lý app badge (số thông báo chưa đọc trên icon app)
 * Tự động cập nhật badge khi unread count thay đổi
 * Chỉ hoạt động khi user đã đăng nhập
 * 
 * Note: 
 * - App badge KHÔNG hoạt động trong Expo Go trên Android (SDK 53+)
 * - App badge HOẠT ĐỘNG trong development build và production build (APK/AAB)
 * - App badge HOẠT ĐỘNG trong Expo Go trên iOS
 * - Android badge phụ thuộc vào launcher (MIUI/Xiaomi cần cấu hình đặc biệt)
 * - Emulator thường không support badge
 */
export function useAppBadge() {
  const { isAuthenticated } = useAuthStore();
  const { unreadCount } = useNotificationsStore();
  const retryCountRef = useRef(0);
  const lastUnreadCountRef = useRef(unreadCount);

  // Check if running in Expo Go
  // executionEnvironment === "storeClient" → Expo Go
  // executionEnvironment === "standalone" → Development/Production build (APK/AAB)
  const isExpoGo = Constants.executionEnvironment === "storeClient";

  // Check if running on emulator
  // Emulator thường không support badge vì không có launcher hỗ trợ
  const [isEmulator, setIsEmulator] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkEmulator = async () => {
      if (Platform.OS === "android") {
        try {
          const deviceInfo = await Device.getDeviceTypeAsync();
          const modelName = Device.modelName || "";
          // Emulator thường có DeviceType.UNKNOWN hoặc modelName chứa "sdk", "emulator"
          const isEmu = deviceInfo === Device.DeviceType.UNKNOWN || 
                        modelName.toLowerCase().includes("sdk") ||
                        modelName.toLowerCase().includes("emulator") ||
                        modelName.toLowerCase().includes("generic");
          setIsEmulator(isEmu);
          if (isEmu) {
            console.warn("🔔 [AppBadge] ⚠️ Running on Android Emulator");
            console.warn("🔔 [AppBadge] Badge KHÔNG hoạt động trên emulator");
            console.warn("🔔 [AppBadge] Cần test trên device thật để xem badge");
            console.warn("🔔 [AppBadge] Code vẫn sẽ chạy nhưng badge sẽ không hiển thị");
          } else {
            console.log("🔔 [AppBadge] Running on real device - badge should work");
          }
        } catch (error) {
          console.warn("🔔 [AppBadge] Could not detect device type:", error);
          setIsEmulator(null);
        }
      } else {
        setIsEmulator(false);
      }
    };
    checkEmulator();
  }, []); // isEmulator được set trong effect này, không cần dependency

  useEffect(() => {
    // Chỉ update badge khi user đã đăng nhập
    if (!isAuthenticated) {
      // Clear badge khi logout (chỉ trên iOS hoặc development build)
      if (Platform.OS !== "web" && (Platform.OS === "ios" || !isExpoGo)) {
        Notifications.setBadgeCountAsync(0).catch(() => {
          // Silent fail - badge không support trong Expo Go trên Android
        });
      }
      return;
    }

    // Chỉ update badge trên iOS và Android
    if (Platform.OS === "web") {
      return;
    }

    // Trong Expo Go trên Android, badge không được support (SDK 53+)
    // Chỉ hoạt động trên iOS hoặc development build
    if (Platform.OS === "android" && isExpoGo) {
      return;
    }

    const updateBadge = async (retryAttempt = 0) => {
      try {
        // Chỉ log khi unreadCount thay đổi hoặc lần đầu
        if (unreadCount !== lastUnreadCountRef.current || retryAttempt === 0) {
          console.log("🔔 [AppBadge] Updating badge:", {
            unreadCount,
            isAuthenticated,
            isExpoGo,
            platform: Platform.OS,
            executionEnvironment: Constants.executionEnvironment,
            retryAttempt,
          });
        }

        // Kiểm tra quyền hiển thị badge
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Nếu chưa có quyền, yêu cầu quyền
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
            },
          });
          finalStatus = status;
        }

        if (finalStatus === "granted") {
          try {
            // Đảm bảo notification channel đã được tạo với badge enabled (Android 8.0+)
            // Điều này QUAN TRỌNG để badge hoạt động trên Android 8.0+
            if (Platform.OS === "android") {
              try {
                await Notifications.setNotificationChannelAsync("default", {
                  name: "Thông báo mặc định",
                  importance: Notifications.AndroidImportance.HIGH,
                  vibrationPattern: [0, 250, 250, 250],
                  lightColor: "#3B82F6",
                  showBadge: true, // ✅ QUAN TRỌNG: Bật badge cho channel
                });
                console.log("🔔 [AppBadge] ✅ Notification channel created with badge enabled");
              } catch {
                // Channel có thể đã tồn tại, không sao - nhưng có thể cần update
                try {
                  // Thử update channel để đảm bảo showBadge = true
                  await Notifications.setNotificationChannelAsync("default", {
                    name: "Thông báo mặc định",
                    importance: Notifications.AndroidImportance.HIGH,
                    showBadge: true,
                  });
                } catch {
                  // Silent fail - channel có thể không thể update
                }
              }
            }

            // Set badge count với retry logic cho Android
            await Notifications.setBadgeCountAsync(unreadCount);
            
            // Đợi một chút để badge được cập nhật (đặc biệt quan trọng cho Android)
            if (Platform.OS === "android") {
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
            
            // Verify badge was set
            const currentBadge = await Notifications.getBadgeCountAsync();
            const isSuccess = currentBadge === unreadCount;
            
            if (isSuccess) {
              // Reset retry count khi thành công
              retryCountRef.current = 0;
              lastUnreadCountRef.current = unreadCount;
              
              if (unreadCount !== lastUnreadCountRef.current || retryAttempt === 0) {
                console.log("🔔 [AppBadge] ✅ Badge updated successfully:", {
                  requested: unreadCount,
                  actual: currentBadge,
                });
              }
            } else {
              // Retry logic cho Android (một số launcher cần thời gian để cập nhật)
              if (Platform.OS === "android" && retryAttempt < 2) {
                console.log(`🔔 [AppBadge] Retry ${retryAttempt + 1}/2...`);
                setTimeout(() => {
                  updateBadge(retryAttempt + 1);
                }, 500 * (retryAttempt + 1));
                return;
              }

              // Log warning nếu không thành công sau retry
              if (retryAttempt >= 2 || Platform.OS === "ios") {
                console.warn("🔔 [AppBadge] ⚠️ Badge không được set thành công:", {
                  requested: unreadCount,
                  actual: currentBadge,
                  platform: Platform.OS,
                  isEmulator: isEmulator,
                });
                
                if (isEmulator === true) {
                  console.warn("🔔 [AppBadge] ⚠️ ĐANG CHẠY TRÊN EMULATOR");
                  console.warn("🔔 [AppBadge] Badge KHÔNG hoạt động trên emulator là BÌNH THƯỜNG");
                  console.warn("🔔 [AppBadge] Code đã đúng, chỉ cần test trên device thật");
                  console.warn("🔔 [AppBadge] Trên device thật, badge sẽ hoạt động nếu:");
                  console.warn("    1. Launcher hỗ trợ badge (Pixel Launcher, Nova, v.v.)");
                  console.warn("    2. Notification channel đã được tạo với showBadge: true");
                  console.warn("    3. Permission đã được granted");
                } else {
                  console.warn("🔔 [AppBadge] Có thể do:");
                  console.warn("  - Launcher không support: MIUI/Xiaomi, OneUI (Samsung), ColorOS (Oppo), v.v.");
                  console.warn("  - Device/OS version không support badge");
                  console.warn("  - Cần cấu hình notification channel cho Android 8.0+");
                  console.warn("  - Cần bật badge trong Settings > Apps > LECOM > Notifications");
                }
              }
            }

            // ⚠️ TEST: Tạm thời set badge = 5 để test (xóa sau khi confirm badge hoạt động)
            // Nếu badge hiển thị số 5, nghĩa là badge hoạt động, chỉ cần đợi unreadCount > 0
            if (unreadCount === 0 && retryAttempt === 0) {
              try {
                await Notifications.setBadgeCountAsync(5);
                if (Platform.OS === "android") {
                  await new Promise((resolve) => setTimeout(resolve, 300));
                }
                const testBadge = await Notifications.getBadgeCountAsync();
                if (testBadge === 5) {
                  console.log("🔔 [AppBadge] ✅ TEST: Badge hoạt động! (hiển thị số 5)");
                } else {
                  console.warn("🔔 [AppBadge] ⚠️ TEST: Badge không hoạt động trên device này");
                }
                // Reset về 0 sau test
                await Notifications.setBadgeCountAsync(0);
              } catch {
                // Silent fail cho test
              }
            }
          } catch (badgeError: any) {
            // Handle badge errors gracefully với retry
            const errorMessage = badgeError?.message || String(badgeError);
            
            // Retry cho Android nếu là lỗi tạm thời
            if (
              Platform.OS === "android" &&
              retryAttempt < 2 &&
              !errorMessage.includes("ShortcutBadgeException")
            ) {
              console.log(`🔔 [AppBadge] Retry ${retryAttempt + 1}/2 after error...`);
              setTimeout(() => {
                updateBadge(retryAttempt + 1);
              }, 500 * (retryAttempt + 1));
              return;
            }

            // Log error sau khi retry hết
            if (retryAttempt >= 2 || errorMessage.includes("ShortcutBadgeException")) {
              if (errorMessage.includes("ShortcutBadgeException") || errorMessage.includes("unable to resolve intent")) {
                console.warn("🔔 [AppBadge] ⚠️ Badge không được support trên launcher này:");
                console.warn("  - Android Emulator: Badge thường không hoạt động");
                console.warn("  - MIUI/Xiaomi: Cần cấu hình đặc biệt hoặc launcher khác (Nova, Pixel Launcher)");
                console.warn("  - OneUI (Samsung): Có thể cần bật trong Settings > Notifications");
                console.warn("  - ColorOS (Oppo/OnePlus): Có thể cần bật trong Settings");
                console.warn("  - Một số launcher tùy chỉnh không support standard Android badge");
              } else {
                console.error("🔔 [AppBadge] ❌ Error setting badge:", errorMessage);
              }
            }
          }
        } else {
          if (retryAttempt === 0) {
            console.warn("🔔 [AppBadge] ⚠️ Permission not granted:", finalStatus);
          }
        }
      } catch (error: any) {
        console.error("🔔 [AppBadge] ❌ Error updating badge:", error?.message || error);
      }
    };

    updateBadge();
  }, [unreadCount, isAuthenticated, isExpoGo, isEmulator]);
}

