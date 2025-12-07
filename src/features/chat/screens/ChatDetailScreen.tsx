import type { ChatMessage, ConversationItem } from "@/api/chat";
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
  Image,
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

  const serverMessages = (data?.result || []) as ChatMessage[];

  // ❗ Mỗi lần vào lại màn detail → refetch messages từ BE
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [conversationId, refetch])
  );

  // -------------------------------
  // Local realtime + optimistic
  // -------------------------------
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
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
  const appendMessage = (msg: ChatMessage) => {
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
      appendMessage(msg as ChatMessage);
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
          const tempMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            senderId: userId!,
            senderName: "You",
            senderAvatar: null,
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
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === userId;
    const isTemp = item.id.startsWith("temp-");

    return (
      <View className="w-full px-4 mb-3">
        <View
          className={`flex-row ${
            isMine ? "justify-end" : "justify-start"
          }`}
        >
          {/* Avatar cho người gửi (bên trái nếu không phải mình) */}
          {!isMine && (
            <View className="mr-2 mt-1">
              {item.senderAvatar ? (
                <Image
                  source={{ uri: item.senderAvatar }}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <View className={`w-8 h-8 rounded-full items-center justify-center ${
                  isAIChat ? "bg-purple-500" : "bg-skyBlue"
                }`}>
                  <Text className="text-white text-xs font-bold">
                    {isAIChat ? "🤖" : item.senderName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Message bubble */}
          <View className="max-w-[70%]">
            {/* Sender name (nếu không phải mình) */}
            {!isMine && (
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1 ml-1">
                {item.senderName}
              </Text>
            )}

            <View
              className={`px-4 py-3 rounded-2xl shadow-sm ${
                isMine
                  ? isAIChat
                    ? "bg-purple-500 rounded-br-md"
                    : "bg-mint dark:bg-gold rounded-br-md"
                  : "bg-white dark:bg-dark-card border border-beige/30 dark:border-dark-border/30 rounded-bl-md"
              }`}
              style={{ opacity: isTemp ? 0.6 : 1 }}
            >
              <Text
                className={`text-base leading-5 ${
                  isMine ? "text-white" : "text-light-text dark:text-dark-text"
                }`}
              >
                {item.content}
              </Text>

              <View className="flex-row items-center justify-between mt-2">
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
                  <View className="ml-2">
                    <FontAwesome5
                      name={isTemp ? "clock" : item.isRead ? "check-double" : "check"}
                      size={12}
                      color="rgba(255,255,255,0.7)"
                    />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Avatar cho mình (bên phải) */}
          {isMine && (
            <View className="ml-2 mt-1">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${
                isAIChat ? "bg-purple-600" : "bg-mint dark:bg-gold"
              }`}>
                <Text className="text-white text-xs font-bold">
                  {item.senderName.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
          )}
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
          className="w-10 h-10 bg-beige/20 dark:bg-dark-border/20 rounded-xl items-center justify-center mr-3 active:scale-95"
        >
          <FontAwesome5 name="arrow-left" size={16} color="#333" />
        </Pressable>

        <View className="flex-row items-center flex-1">
          {/* Avatar/Icon */}
          {isAIChat ? (
            <View className="w-12 h-12 rounded-xl bg-purple-500 items-center justify-center mr-3">
              <Text className="text-xl">🤖</Text>
            </View>
          ) : currentConversation?.displayAvatar ? (
            <Image
              source={{ uri: currentConversation.displayAvatar }}
              className="w-12 h-12 rounded-xl mr-3"
            />
          ) : (
            <View className="w-12 h-12 rounded-xl bg-mint/10 items-center justify-center mr-3">
              <FontAwesome5 name="user" size={20} color="#ACD6B8" />
            </View>
          )}

          <View className="flex-1">
            <Text className="text-base font-bold text-light-text dark:text-dark-text">
              {isAIChat
                ? "🤖 AI Assistant"
                : currentConversation?.displayName || "Chat"}
            </Text>
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              {isAIChat ? "Hỗ trợ tự động" : currentConversation?.product?.name || `${messages.length} tin nhắn`}
            </Text>
          </View>
        </View>

        {/* Info button */}
        <Pressable
          onPress={() => {
            // TODO: Show conversation info
            console.log("Show info", currentConversation);
          }}
          className="w-10 h-10 bg-beige/20 dark:bg-dark-border/20 rounded-xl items-center justify-center ml-2 active:scale-95"
        >
          <FontAwesome5 name="info-circle" size={16} color="#333" />
        </Pressable>
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
          <View className="w-20 h-20 rounded-full bg-mint/10 items-center justify-center mb-4">
            <ActivityIndicator size="large" color="#ACD6B8" />
          </View>
          <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary font-medium">
            Đang tải tin nhắn...
          </Text>
        </View>
      </SafeAreaView>
    );

  if (isError)
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        {renderHeader()}
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center mb-6">
            <FontAwesome5 name="exclamation-circle" size={48} color="#EF4444" />
          </View>
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
            Không thể tải
          </Text>
          <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center mb-8">
            Không thể tải tin nhắn.{"\n"}Vui lòng thử lại.
          </Text>
          <Pressable
            className="bg-mint dark:bg-gold px-8 py-4 rounded-2xl active:scale-95 shadow-lg"
            onPress={() => refetch()}
          >
            <View className="flex-row items-center">
              <FontAwesome5 name="redo" size={18} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Thử lại
              </Text>
            </View>
          </Pressable>
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
          inverted
          onEndReached={() => {
            // TODO: Load more old messages (pagination)
            console.log("📜 Load more old messages");
          }}
          onEndReachedThreshold={0.5}
        />

        {/* Input area */}
        <View className="px-4 py-3 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-end">
            <View className="flex-1 bg-beige/20 dark:bg-dark-border/20 rounded-2xl px-4 py-3 mr-2">
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder={isAIChat ? "Hỏi AI về sản phẩm..." : "Nhập tin nhắn..."}
                placeholderTextColor="#9CA3AF"
                className="text-base text-light-text dark:text-dark-text min-h-[20px] max-h-[100px]"
                multiline
                maxLength={1000}
              />
            </View>

            <Pressable
              onPress={handleSendMessage}
              disabled={!messageText.trim() || isSending}
              className={`w-12 h-12 rounded-2xl items-center justify-center shadow-sm active:scale-95 ${
                messageText.trim()
                  ? isAIChat
                    ? "bg-purple-500"
                    : "bg-mint dark:bg-gold"
                  : "bg-gray-300"
              }`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <FontAwesome5 name="paper-plane" size={16} color="#fff" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}