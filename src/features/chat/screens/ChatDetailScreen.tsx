import type { ConversationItem } from "@/api/chat";
import type { ChatStackParamList } from "@/navigation/ChatStackNavigator";
import { useAuthStore } from "@/store/auth-store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatRealtime } from "../hooks/useChatRealtime";
import { useConversationMessages } from "../hooks/useConversationMessages";
import { useSendAIMessage } from "../hooks/useSendAIMessage";
import { useSendMessage } from "../hooks/useSendMessage";

type ChatDetailScreenProps = NativeStackScreenProps<ChatStackParamList, "ChatDetail">;

interface SimpleMessage {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export function ChatDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ChatStackParamList>>();
  const route = useRoute<ChatDetailScreenProps["route"]>();
  const conversationId = route.params.conversationId;
  // route.params may be typed as { conversationId: string } by the navigator; safely read isAIChat with a narrow cast
  const isAIChatParam = (route.params as { isAIChat?: boolean }).isAIChat;
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  
  const userId = useAuthStore((state) => state.userId);
  const [messageText, setMessageText] = useState("");
  // ✅ Optimistic messages for AI chat
  const [optimisticMessages, setOptimisticMessages] = useState<SimpleMessage[]>([]);

  // ✅ Lấy isAIChat từ cached conversations (fallback)
  const conversationsData = queryClient.getQueryData<{ result: ConversationItem[] }>(["chat", "userConversations"]);
  const currentConversation = conversationsData?.result?.find(conv => conv.id === conversationId);
  

  const isAIChat =
  typeof isAIChatParam === "boolean"
    ? isAIChatParam
    : currentConversation?.isAIChat ?? false;



  // ✅ Log để debug
  useEffect(() => {
    console.log("=== CHAT DETAIL DEBUG ===");
    console.log("Conversation ID:", conversationId);
    console.log("isAIChatParam:", isAIChatParam);
    console.log("currentConversation?.isAIChat:", currentConversation?.isAIChat);
    console.log("Final isAIChat:", isAIChat);
    console.log("========================");
  }, [conversationId, isAIChatParam, currentConversation, isAIChat]);

  const { data, isLoading, isError, refetch } = useConversationMessages(conversationId);
  

  const { mutate: sendNormalMessage, isPending: isSendingNormal } = useSendMessage();
  const { mutate: sendAIMessage, isPending: isSendingAI } = useSendAIMessage(conversationId);
  
  const isSending = isAIChat ? isSendingAI : isSendingNormal;
  const serverMessages = (data?.result || []) as SimpleMessage[];

  const messages = isAIChat 
    ? [...serverMessages, ...optimisticMessages]
    : serverMessages;

  useChatRealtime(
    !isAIChat ? conversationId : undefined,
    (newMessage) => {
      console.log("🔔 Realtime message received:", newMessage);
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", conversationId] });
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  );

  useEffect(() => {
    if (isAIChat && serverMessages.length > 0) {
      setOptimisticMessages([]);
    }
  }, [serverMessages.length, isAIChat]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

const handleSendMessage = () => {
  if (!messageText.trim() || isSending) return;

  const content = messageText.trim();
  setMessageText("");

  if (isAIChat) {
  // 1. Tạo optimistic message
  const optimistic = {
    id: `temp-${Date.now()}`,
    senderId: userId!,
    content,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  setOptimisticMessages((prev) => [...prev, optimistic]);

  sendAIMessage(
    { content },
    {
      onSuccess: () => {
        // 2. Khi server phản hồi → xoá tất cả optimistic
        setOptimisticMessages([]);

        // 3. Refetch để lấy message AI chính thức từ server
        queryClient.invalidateQueries({
          queryKey: ["chat", "messages", conversationId],
        });
      },

      onError: () => {
        // Nếu lỗi → xóa optimistic
        setOptimisticMessages((prev) =>
          prev.filter((m) => !m.id.startsWith("temp-"))
        );
      },
    }
  );
}


  // ==============================
  // 📌 NORMAL SELLER CHAT
  // ==============================
  sendNormalMessage(
    { conversationId, content },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["chat", "messages", conversationId],
        });
      },
    }
  );
};


  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: SimpleMessage }) => {
    const isOwnMessage = item.senderId === userId;
    const isOptimistic = item.id.startsWith('temp-');

    return (
      <View className="w-full mb-3 px-4">
        <View className={`flex-row ${isOwnMessage ? "justify-end" : "justify-start"}`}>
          <View
            className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
              isOwnMessage
                ? "bg-mint dark:bg-gold rounded-br-md"
                : "bg-white dark:bg-dark-card border border-beige/30 dark:border-dark-border/30 rounded-bl-md"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isOptimistic ? 0.05 : 0.1,
              shadowRadius: 2,
              elevation: 2,
              opacity: isOptimistic ? 0.7 : 1,
            }}
          >
            <Text
              className={`text-base leading-5 ${
                isOwnMessage
                  ? "text-white dark:text-dark-text"
                  : "text-light-text dark:text-dark-text"
              }`}
            >
              {item.content}
            </Text>

            <View className="flex-row items-center justify-between mt-1">
              <Text
                className={`text-xs ${
                  isOwnMessage
                    ? "text-white/70 dark:text-dark-text/70"
                    : "text-light-textSecondary dark:text-dark-textSecondary"
                }`}
              >
                {formatMessageTime(item.createdAt)}
              </Text>

              {isOwnMessage && (
                <FontAwesome 
                  name={isOptimistic ? "clock-o" : item.isRead ? "check-circle" : "check"} 
                  size={12} 
                  color={item.isRead ? "#fff" : "rgba(255,255,255,0.7)"} 
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View className="bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30 px-6 py-4">
      <View className="flex-row items-center">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-xl bg-beige/20 dark:bg-dark-border/20 items-center justify-center mr-3"
        >
          <FontAwesome name="arrow-left" size={16} color="#2D3748" />
        </Pressable>

        <View className="flex-row items-center flex-1">
          <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
            isAIChat ? "bg-lavender/10" : "bg-mint/10 dark:bg-gold/10"
          }`}>
            <FontAwesome 
              name={
                isAIChat
                  ? ("robot" as React.ComponentProps<typeof FontAwesome>["name"])
                  : ("comments" as React.ComponentProps<typeof FontAwesome>["name"])
              }
              size={20} 
              color={isAIChat ? "#B19CD9" : "#ACD6B8"} 
            />
          </View>

          <View className="flex-1">
            <Text
              className="text-base font-bold text-light-text dark:text-dark-text"
              numberOfLines={1}
            >
              {isAIChat ? "🤖 AI Assistant" : currentConversation?.product?.name || "Chat"}
            </Text>
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              {serverMessages.length} {serverMessages.length === 1 ? 'message' : 'messages'}
            </Text>
          </View>
        </View>

        <Pressable className="w-10 h-10 rounded-xl bg-beige/20 dark:bg-dark-border/20 items-center justify-center ml-2">
          <FontAwesome name="ellipsis-v" size={16} color="#2D3748" />
        </Pressable>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 rounded-full bg-beige/20 dark:bg-dark-border/20 items-center justify-center mb-4">
        <FontAwesome
          name={
            isAIChat
              ? ("robot" as React.ComponentProps<typeof FontAwesome>["name"])
              : ("comment-o" as React.ComponentProps<typeof FontAwesome>["name"])
          }
          size={40}
          color="#ACD6B8"
        />
      </View>
      <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
        No Messages Yet
      </Text>
      <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center px-8">
        {isAIChat ? "Ask AI anything about this product!" : "Start the conversation!"}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Loading messages...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
        {renderHeader()}
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-coral/10 items-center justify-center mb-4">
            <FontAwesome name="exclamation-circle" size={40} color="#FF6B6B" />
          </View>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
            Failed to Load
          </Text>
          <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center mb-4">
            Unable to load messages
          </Text>
          <Pressable
            className="bg-mint dark:bg-gold px-6 py-3 rounded-xl"
            onPress={() => refetch()}
          >
            <Text className="text-white dark:text-dark-text font-bold">
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {renderHeader()}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
         keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 8,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          inverted={false}
        />

        <View className="bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30 px-4 py-3">
          <View className="flex-row items-center">
            <Pressable className="w-10 h-10 rounded-xl bg-beige/20 dark:bg-dark-border/20 items-center justify-center mr-2">
              <FontAwesome name="paperclip" size={18} color="#9CA3AF" />
            </Pressable>

            <View className="flex-1 bg-beige/20 dark:bg-dark-border/20 rounded-xl px-4 py-2 mr-2">
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder={isAIChat ? "Ask AI..." : "Type a message..."}
                placeholderTextColor="#9CA3AF"
                className="text-base text-light-text dark:text-dark-text max-h-24"
                multiline
                maxLength={1000}
              />
            </View>

            <Pressable
              onPress={handleSendMessage}
              disabled={!messageText.trim() || isSending}
              className={`w-10 h-10 rounded-xl items-center justify-center ${
                messageText.trim() && !isSending
                  ? isAIChat 
                    ? "bg-lavender" 
                    : "bg-mint dark:bg-gold"
                  : "bg-beige/20 dark:bg-dark-border/20"
              }`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <FontAwesome
                  name="send"
                  size={16}
                  color={messageText.trim() ? "#fff" : "#9CA3AF"}
                />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}