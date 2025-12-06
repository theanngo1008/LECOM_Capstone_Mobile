import type { ConversationItem } from "@/api/chat";
import type { ChatStackParamList } from "@/navigation/ChatStackNavigator";
import { useAuthStore } from "@/store/auth-store";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatDetailRealtime } from "../hooks/useChatDetailRealtime";
import { useConversationMessages } from "../hooks/useConversationMessages";
import { useSendAIMessage } from "../hooks/useSendAIMessage";
import { useSendMessage } from "../hooks/useSendMessage";

type ChatDetailScreenProps = NativeStackScreenProps<
  ChatStackParamList,
  "ChatDetail"
>;

interface SimpleMessage {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export function ChatDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ChatStackParamList>>();
  const route = useRoute<ChatDetailScreenProps["route"]>();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  // -------------------------------
  // USER
  // -------------------------------
  const rawUserId = useAuthStore((state) => state.userId);
  const userId = rawUserId ?? undefined;

  // -------------------------------
  // Conversation info
  // -------------------------------
  const conversationId = route.params.conversationId;
  const isAIChatParam = (route.params as { isAIChat?: boolean }).isAIChat;

  const convData = queryClient.getQueryData<{ result: ConversationItem[] }>([
    "chat",
    "userConversations",
  ]);

  const currentConversation = convData?.result?.find(
    (c) => c.id === conversationId
  );

  const isAIChat =
    typeof isAIChatParam === "boolean"
      ? isAIChatParam
      : currentConversation?.isAIChat ?? false;

  // -------------------------------
  // Fetch server messages
  // -------------------------------
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useConversationMessages(conversationId);

  const serverMessages = (data?.result || []) as SimpleMessage[];

  // ❗ Mỗi lần vào lại màn detail → refetch messages từ BE
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [conversationId, refetch])
  );

  // -------------------------------
  // Local realtime + optimistic
  // -------------------------------
  const [liveMessages, setLiveMessages] = useState<SimpleMessage[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<
    SimpleMessage[]
  >([]);
  const [messageText, setMessageText] = useState("");

  // -------------------------------
  // ⭐ Merge & REVERSE messages (newest first)
  // -------------------------------
  const messages = [
    ...serverMessages,
    ...liveMessages,
    ...optimisticMessages,
  ].reverse(); // ⭐ Đảo ngược để tin nhắn mới nhất ở đầu

  // -------------------------------
  // Realtime append
  // -------------------------------
  const appendMessage = (msg: SimpleMessage) => {
    setLiveMessages((prev) => {
      const exists =
        prev.some((m) => m.id === msg.id) ||
        serverMessages.some((m) => m.id === msg.id);

      if (exists) return prev;

      return [...prev, msg];
    });

    // ⭐ Scroll to top (vì tin nhắn mới ở đầu)
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 80);
  };

  // -------------------------------
  // Hook realtime
  // -------------------------------
  useChatDetailRealtime({
    conversationId,
    onMessage: (msg) => {
      console.log("🔥 Detail received realtime:", msg);
      appendMessage(msg as SimpleMessage);
    },
  });

  // -------------------------------
  // Reset live messages when server loads mới
  // -------------------------------
  useEffect(() => {
    if (serverMessages.length > 0) {
      setLiveMessages([]);
    }
  }, [serverMessages.length]);

  // -------------------------------
  // Send message handlers
  // -------------------------------
  const { mutate: sendNormalMessage, isPending: sendingNormal } =
    useSendMessage();
  const { mutate: sendAIMessage, isPending: sendingAI } =
    useSendAIMessage(conversationId);

  const isSending = isAIChat ? sendingAI : sendingNormal;

  const handleSendMessage = () => {
    if (!messageText.trim() || isSending) return;

    const content = messageText.trim();
    setMessageText("");

    // AI optimistic
    if (isAIChat) {
      const tempMsg: SimpleMessage = {
        id: `temp-${Date.now()}`,
        senderId: userId!,
        content,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setOptimisticMessages((prev) => [...prev, tempMsg]);

      sendAIMessage(
        { content },
        {
          onSuccess: () => {
            setOptimisticMessages([]);
            queryClient.invalidateQueries({
              queryKey: ["chat", "messages", conversationId],
            });
            // ⭐ Scroll to top after sending
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }, 100);
          },
          onError: () => {
            setOptimisticMessages((prev) =>
              prev.filter((m) => !m.id.startsWith("temp-"))
            );
          },
        }
      );

      return;
    }

    // Normal message
    sendNormalMessage(
      { conversationId, content },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["chat", "messages", conversationId],
          });
          // ⭐ Scroll to top after sending
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }, 100);
        },
      }
    );
  };

  const formatTime = (dateString: string) => {
    const utc = new Date(dateString);
    const vn = new Date(utc.getTime() + 7 * 60 * 60 * 1000);

    return vn.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // -------------------------------
  // Message bubble
  // -------------------------------
  const renderMessage = ({ item }: { item: SimpleMessage }) => {
    const isMine = item.senderId === userId;
    const isTemp = item.id.startsWith("temp-");

    return (
      <View className="w-full px-4 mb-2">
        <View
          className={`flex-row ${
            isMine ? "justify-end" : "justify-start"
          }`}
        >
          <View
            className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
              isMine
                ? "bg-mint dark:bg-gold rounded-br-md"
                : "bg-white dark:bg-dark-card border border-beige/30 dark:border-dark-border/30 rounded-bl-md"
            }`}
            style={{ opacity: isTemp ? 0.6 : 1 }}
          >
            <Text
              className={`text-base ${
                isMine ? "text-white" : "text-light-text dark:text-dark-text"
              }`}
            >
              {item.content}
            </Text>

            <View className="flex-row justify-between mt-1">
              <Text
                className={`text-xs ${
                  isMine
                    ? "text-white/70"
                    : "text-light-textSecondary dark:text-dark-textSecondary"
                }`}
              >
                {formatTime(item.createdAt)}
              </Text>

              {isMine && (
                <FontAwesome5
                  name={isTemp ? "clock" : item.isRead ? "check-circle" : "check"}
                  size={12}
                  color="#fff"
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // -------------------------------
  // Header
  // -------------------------------
  const renderHeader = () => (
    <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
      <View className="flex-row items-center">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-beige/20 dark:bg-dark-border/20 rounded-xl items-center justify-center mr-3"
        >
          <FontAwesome5 name="arrow-left" size={16} color="#333" />
        </Pressable>

        <View className="flex-row items-center flex-1">
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
              isAIChat ? "bg-lavender/10" : "bg-mint/10"
            }`}
          >
            <FontAwesome5
              name={isAIChat ? "robot" : "comments"}
              size={20}
              color={isAIChat ? "#B19CD9" : "#ACD6B8"}
            />
          </View>

          <View className="flex-1">
            <Text className="text-base font-bold text-light-text dark:text-dark-text">
              {isAIChat
                ? "🤖 AI Assistant"
                : currentConversation?.product?.name || "Chat"}
            </Text>
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              {messages.length} messages
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // -------------------------------
  // LOADING & ERROR
  // -------------------------------
  if (isLoading)
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        {renderHeader()}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
        </View>
      </SafeAreaView>
    );

  if (isError)
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        {renderHeader()}
        <View className="flex-1 justify-center items-center">
          <Text className="text-light-text dark:text-dark-text">Error loading messages</Text>
        </View>
      </SafeAreaView>
    );

  // -------------------------------
  // MAIN UI
  // -------------------------------
  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {renderHeader()}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          // ⭐ Inverted to show newest first at top
          inverted
          // ⭐ Optional: Add pull-to-refresh for loading older messages
          onEndReached={() => {
            // TODO: Load more old messages (pagination)
            console.log("📜 Load more old messages");
          }}
          onEndReachedThreshold={0.5}
        />

        <View className="px-4 py-3 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-center">
            <View className="flex-1 bg-beige/20 dark:bg-dark-border/20 rounded-xl px-4 py-2 mr-2">
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder={isAIChat ? "Ask AI..." : "Type a message..."}
                placeholderTextColor="#9CA3AF"
                className="text-base text-light-text dark:text-dark-text"
                multiline
              />
            </View>

            <Pressable
              onPress={handleSendMessage}
              disabled={!messageText.trim() || isSending}
              className={`w-10 h-10 rounded-xl items-center justify-center ${
                messageText.trim()
                  ? isAIChat
                    ? "bg-lavender"
                    : "bg-mint"
                  : "bg-gray-300"
              }`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <FontAwesome5 name="send" size={16} color="#fff" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}