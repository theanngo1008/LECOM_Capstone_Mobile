import { ApiResponse } from "../types/common";
import { apiClient } from "./client";

// ======================
// 📌 PRODUCT IN CHAT
// ======================
export interface ChatProductInfo {
  id: string;
  name: string;
  thumbnail: string | null;
}

// ======================
// 📌 CONVERSATION ITEM
// ======================
export interface ConversationItem {
  id: string;
  isAIChat: boolean;

  buyerId: string;
  sellerId: string | null;

  product: ChatProductInfo;

  lastMessage: string;
  lastMessageAt: string;

  displayName: string;
  displayAvatar: string;
  role: "buyer" | "seller" | "ai";

  unreadCount?: number;
}

// ======================
// 📌 MESSAGE ITEM (UPDATED)
// ======================
export interface ChatMessage {
  id: string;
  senderId: string;

  senderName: string;         // NEW
  senderAvatar: string | null; // NEW

  content: string;
  isRead: boolean;
  createdAt: string;
}

// ======================
// 📌 RESPONSE TYPES
// ======================
export type StartChatResponse = ApiResponse<ConversationItem>;
export type SendMessageResponse = ApiResponse<ChatMessage>;
export type ConversationListResponse = ApiResponse<ConversationItem[]>;
export type MessageListResponse = ApiResponse<ChatMessage[]>;

// ======================
// 📌 PAYLOADS
// ======================
export interface StartChatPayload {
  productId: string;
}

export interface SendMessagePayload {
  content: string;
}

// ======================
// 📌 API MODULE
// ======================
export const chatApi = {
  startSellerChat: async (payload: StartChatPayload): Promise<StartChatResponse> => {
    const { data } = await apiClient.post<StartChatResponse>(
      "/chat/seller/start",
      payload
    );
    return data;
  },

  startAIChat: async (payload: StartChatPayload): Promise<StartChatResponse> => {
    const { data } = await apiClient.post<StartChatResponse>(
      "/chat/ai/start",
      payload
    );
    return data;
  },

  sendMessage: async (conversationId: string, payload: SendMessagePayload): Promise<SendMessageResponse> => {
    const { data } = await apiClient.post<SendMessageResponse>(
      `/chat/${conversationId}/message`,
      payload
    );
    return data;
  },

  sendAIMessage: async (conversationId: string, payload: SendMessagePayload): Promise<SendMessageResponse> => {
    const { data } = await apiClient.post<SendMessageResponse>(
      `/chat/ai/${conversationId}/message`,
      payload
    );
    return data;
  },

  getUserConversations: async (): Promise<ConversationListResponse> => {
    const { data } = await apiClient.get<ConversationListResponse>("/chat/user");
    return data;
  },

  getSellerConversations: async (): Promise<ConversationListResponse> => {
    const { data } = await apiClient.get<ConversationListResponse>("/chat/seller");
    return data;
  },

  getConversationMessages: async (conversationId: string): Promise<MessageListResponse> => {
    const { data } = await apiClient.get<MessageListResponse>(
      `/chat/${conversationId}/messages`
    );
    return data;
  },
};
