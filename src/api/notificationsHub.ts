import * as SignalR from "@microsoft/signalr";

const HUB_URL = "https://lecom.click/hubs/notifications";

class NotificationsHub {
  connection: SignalR.HubConnection | null = null;
  token: string | null = null;

  private notificationHandlers = new Set<(notification: any) => void>();
  private unreadHandlers = new Set<(count: number) => void>();

  setToken(token: string) {
    this.token = token;
  }

  async ensureConnection() {
    if (this.connection && this.connection.state === "Connected") return;

    if (!this.connection) {
      this.connection = new SignalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => this.token ?? "",
          skipNegotiation: false,
          transport: SignalR.HttpTransportType.WebSockets | 
                     SignalR.HttpTransportType.ServerSentEvents | 
                     SignalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // ✅ Suppress error logs during retry
            if (retryContext.previousRetryCount === 0) {
              console.log("⚠️ Connection failed, will retry...");
            }
            // Retry sau 2s, 5s, 10s, 30s
            if (retryContext.previousRetryCount < 3) {
              return retryContext.previousRetryCount * 2000 + 2000;
            }
            return 30000;
          }
        })
        .configureLogging(SignalR.LogLevel.None) // ✅ Tắt hoàn toàn logging
        .build();

      this.connection.serverTimeoutInMilliseconds = 60000;
      this.connection.keepAliveIntervalInMilliseconds = 15000;

      this.connection.onreconnecting((error) => {
        console.log("🔄 NotificationHub reconnecting...");
      });

      this.connection.onreconnected(() => {
        console.log("✅ NotificationHub reconnected");
      });

      this.connection.onclose((error) => {
        if (error) {
          console.log("⚠️ NotificationHub closed:", error.message);
        } else {
          console.log("NotificationHub closed normally");
        }
      });
    }

    if (this.connection.state === "Disconnected") {
      try {
        await this.connection.start();
        console.log("🔔 NotificationsHub connected");
      } catch (error: any) {
        // ✅ Silent error, chỉ log nếu cần
        console.log("⚠️ Connection not available, will retry...");
      }
    }
  }

  async connect() {
    await this.ensureConnection();
  }

  // =====================
  // LISTEN EVENTS
  // =====================

  onNotification(handler: (notification: any) => void) {
    if (!this.connection) return;

    this.notificationHandlers.add(handler);

    this.connection.off("ReceiveNotification");
    this.connection.on("ReceiveNotification", (notification) => {
      console.log("🔔 Received Notification:", notification);
      this.notificationHandlers.forEach((fn) => fn(notification));
    });
  }

  offNotification(handler?: (n: any) => void) {
    if (!handler) return;
    this.notificationHandlers.delete(handler);
  }

  onUnreadCount(handler: (count: number) => void) {
    if (!this.connection) return;

    this.unreadHandlers.add(handler);

    this.connection.off("UnreadCount");
    this.connection.on("UnreadCount", (count) => {
      console.log("📊 Unread count:", count);
      this.unreadHandlers.forEach((fn) => fn(count));
    });
  }

  offUnreadCount(handler?: (c: number) => void) {
    if (!handler) return;
    this.unreadHandlers.delete(handler);
  }
}

export const notificationsHub = new NotificationsHub();