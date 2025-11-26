import * as SignalR from "@microsoft/signalr";

const HUB_URL = "https://lecom.click/hubs/chat";

class ChatHub {
  connection: SignalR.HubConnection | null = null;
  token: string | null = null;
  joinedConversationId: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  // --------------------------
  // 1. Ensure ONLY ONE connection exists
  // --------------------------
  async ensureConnection() {
    if (this.connection && this.connection.state === "Connected") return;

    if (!this.connection) {
      this.connection = new SignalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => this.token ?? "",
        })
        .withAutomaticReconnect()
        .build();

      // Rejoin group if reconnected
      this.connection.onreconnected(async () => {
        if (this.joinedConversationId) {
          await this.connection!.invoke(
            "JoinConversation",
            this.joinedConversationId
          );
        }
      });
    }

    if (this.connection.state === "Disconnected") {
      await this.connection.start();
    }
  }

  // --------------------------
  // 2. Join NEW conversation + Leave old one
  // --------------------------
  async joinConversation(conversationId: string) {
    await this.ensureConnection();

    // Leave old group
    if (
      this.joinedConversationId &&
      this.joinedConversationId !== conversationId
    ) {
      await this.connection!.invoke(
        "LeaveConversation",
        this.joinedConversationId
      );
    }

    // Join new group
    await this.connection!.invoke("JoinConversation", conversationId);
    this.joinedConversationId = conversationId;
  }

  // --------------------------
  // 3. Public API for screens
  // --------------------------
  async connect(conversationId: string) {
    await this.joinConversation(conversationId);
  }

  onReceiveMessage(handler: (msg: any) => void) {
    this.connection?.on("ReceiveMessage", handler);
  }

  offReceiveMessage() {
    this.connection?.off("ReceiveMessage");
  }
  
}

export const chatHub = new ChatHub();