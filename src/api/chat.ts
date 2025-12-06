import { ApiResponse } from "../types/common";
import { apiClient } from "./client";

// ======================
// 📌 TYPES
// ======================

export interface ChatProductInfo {
  id: string;
  name: string;
  thumbnail: string | null;
}

export interface ConversationItem {
  id: string;
  isAIChat: boolean;
  buyerId: string;
  sellerId: string | null;
  product: ChatProductInfo;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// Response types
export type StartChatResponse = ApiResponse<ConversationItem>; // ✅ Đã có isAIChat
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
  // Buyer → Seller chat (trả về conversation với isAIChat = false)
  startSellerChat: async (
    payload: StartChatPayload
  ): Promise<StartChatResponse> => {
    const { data } = await apiClient.post<StartChatResponse>(
      "/chat/seller/start",
      payload
    );
    return data;
  },

  // 🧠 Buyer → AI chat (trả về conversation với isAIChat = true)
  startAIChat: async (
    payload: StartChatPayload
  ): Promise<StartChatResponse> => {
    const { data } = await apiClient.post<StartChatResponse>(
      "/chat/ai/start",
      payload
    );
    return data;
  },

  // Gửi tin nhắn trong conversation (buyer ↔ seller)
  sendMessage: async (
    conversationId: string,
    payload: SendMessagePayload
  ): Promise<SendMessageResponse> => {
    const { data } = await apiClient.post<SendMessageResponse>(
      `/chat/${conversationId}/message`,
      payload
    );
    return data;
  },

  // 🧠 Gửi tin nhắn cho AI
  sendAIMessage: async (
    conversationId: string,
    payload: SendMessagePayload
  ): Promise<SendMessageResponse> => {
    const { data } = await apiClient.post<SendMessageResponse>(
      `/chat/ai/${conversationId}/message`,
      payload
    );
    return data;
  },

  // Danh sách conversation buyer
  getUserConversations: async (): Promise<ConversationListResponse> => {
    const { data } = await apiClient.get<ConversationListResponse>("/chat/user");
    return data;
  },

  // Danh sách conversation seller
  getSellerConversations: async (): Promise<ConversationListResponse> => {
    const { data } = await apiClient.get<ConversationListResponse>("/chat/seller");
    return data;
  },

  // Lấy messages
  getConversationMessages: async (
    conversationId: string
  ): Promise<MessageListResponse> => {
    const { data } = await apiClient.get<MessageListResponse>(
      `/chat/${conversationId}/messages`
    );
    return data;
  },
};