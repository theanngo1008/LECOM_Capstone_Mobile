// src/api/chatHub.ts
import * as SignalR from "@microsoft/signalr";

const HUB_URL = "https://lecom.click/hubs/chat";

// ✅ Suppress SignalR WebSocket errors
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || "";
  
  // ✅ Chặn SignalR WebSocket errors
  if (
    message.includes("Failed to start the transport 'WebSockets'") ||
    message.includes("WebSocket failed to connect") ||
    message.includes("SignalR")
  ) {
    return; // Silent ignore
  }
  
  // ✅ Log các errors khác bình thường
  originalConsoleError.apply(console, args);
};

class ChatHub {
  connection: SignalR.HubConnection | null = null;
  token: string | null = null;

  joinedConversationId: string | null = null;
  joinedUserId: string | null = null;

  private receiveMessageHandlers = new Set<(msg: any) => void>();
  private updateConversationHandlers = new Set<(data: any) => void>();

  setToken(token: string) {
    this.token = token;
  }

  async ensureConnection() {
    if (this.connection && this.connection.state === "Connected") return;

    if (!this.connection) {
      this.connection = new SignalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => this.token ?? "",
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // ✅ Chỉ log lần đầu
            if (retryContext.previousRetryCount === 0) {
              console.log("⚠️ ChatHub connection failed, will retry...");
            }
            // Retry: 2s, 4s, 6s, 30s
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

      // ✅ Thêm error handlers
      this.connection.onreconnecting(() => {
        console.log("🔄 ChatHub reconnecting...");
      });

      this.connection.onreconnected(async () => {
        console.log("✅ ChatHub reconnected");

        if (this.joinedUserId) {
          await this.connection!.invoke("JoinUser", this.joinedUserId);
        }

        if (this.joinedConversationId) {
          await this.connection!.invoke(
            "JoinConversation",
            this.joinedConversationId
          );
        }
      });

      this.connection.onclose((error) => {
        if (error) {
          console.log("⚠️ ChatHub closed:", error.message);
        }
      });
    }

    if (this.connection.state === "Disconnected") {
      try {
        await this.connection.start();
        console.log("⚡ ChatHub connected");
      } catch (error: any) {
        // ✅ Chỉ log warning, không throw
        console.log("⚠️ ChatHub not available, will retry...");
      }
    }
  }

  async joinUser(userId: string) {
    await this.ensureConnection();

    if (this.joinedUserId && this.joinedUserId !== userId) {
      await this.connection!.invoke("LeaveUser", this.joinedUserId);
    }

    await this.connection!.invoke("JoinUser", userId);
    this.joinedUserId = userId;
  }

  async joinConversation(conversationId: string) {
    await this.ensureConnection();

    if (
      this.joinedConversationId &&
      this.joinedConversationId !== conversationId
    ) {
      await this.connection!.invoke(
        "LeaveConversation",
        this.joinedConversationId
      );
    }

    await this.connection!.invoke("JoinConversation", conversationId);
    this.joinedConversationId = conversationId;
  }

  async leaveConversation(conversationId: string) {
    try {
      await this.connection?.invoke("LeaveConversation", conversationId);
    } catch {}
    this.joinedConversationId = null;
  }

  // ================== LISTENERS ==================

  onReceiveMessage(handler: (msg: any) => void) {
    if (!this.connection) return;

    this.receiveMessageHandlers.add(handler);

    // 1 global listener dispatch cho tất cả handler trong Set
    this.connection.off("ReceiveMessage");
    this.connection.on("ReceiveMessage", (msg) => {
      this.receiveMessageHandlers.forEach((fn) => fn(msg));
    });
  }

  offReceiveMessage(handler?: (msg: any) => void) {
    if (!handler) return;
    this.receiveMessageHandlers.delete(handler);
  }

  onConversationListUpdated(handler: (data: any) => void) {
    if (!this.connection) return;

    this.updateConversationHandlers.add(handler);

    this.connection.off("UpdateConversationList");
    this.connection.on("UpdateConversationList", (data) => {
      this.updateConversationHandlers.forEach((fn) => fn(data));
    });
  }

  offConversationListUpdated(handler?: (data: any) => void) {
    if (!handler) return;
    this.updateConversationHandlers.delete(handler);
  }
}

export const chatHub = new ChatHub();