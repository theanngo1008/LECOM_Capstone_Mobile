// src/api/notificationsHub.ts
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
        skipNegotiation: false, // ✅ Cho phép negotiate
        transport: SignalR.HttpTransportType.WebSockets | 
                   SignalR.HttpTransportType.ServerSentEvents | 
                   SignalR.HttpTransportType.LongPolling, // ✅ Fallback transports
      })
      .withAutomaticReconnect()
      .configureLogging(SignalR.LogLevel.Information)
      .build();

    this.connection.serverTimeoutInMilliseconds = 60000;
    this.connection.keepAliveIntervalInMilliseconds = 15000;

    // When reconnect → BE automatically rejoins group
    this.connection.onreconnected(() => {
      console.log("🔄 NotificationHub reconnected");
    });
  }

  if (this.connection.state === "Disconnected") {
    await this.connection.start();
    console.log("🔔 NotificationsHub connected");
  }
}



  async connect() {
    await this.ensureConnection();
  }

  // =====================
  // LISTEN EVENTS
  // =====================

  // BE calls: SendAsync("ReceiveNotification", dto)
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

  // BE calls: SendAsync("UnreadCount", number)
  onUnreadCount(handler: (count: number) => void) {
    if (!this.connection) return;

    this.unreadHandlers.add(handler);

    this.connection.off("UnreadCount");
    this.connection.on("UnreadCount", (count) => {
      this.unreadHandlers.forEach((fn) => fn(count));
    });
  }

  offUnreadCount(handler?: (c: number) => void) {
    if (!handler) return;
    this.unreadHandlers.delete(handler);
  }
}

export const notificationsHub = new NotificationsHub();
