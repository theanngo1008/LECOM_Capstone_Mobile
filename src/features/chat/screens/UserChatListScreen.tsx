import type { ConversationItem } from "@/api/chat";
import type { ChatStackParamList } from "@/navigation/ChatStackNavigator";
import { useAuthStore } from "@/store/auth-store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatRealtime } from "../hooks/useChatRealtime";
import { useUserConversations } from "../hooks/useUserConversations";

export function UserChatListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ChatStackParamList>>();
  const queryClient = useQueryClient();

  const userId = useAuthStore((s) => s.userId ?? undefined);

  const { data, isLoading, isError, refetch, isRefetching } =
    useUserConversations();

  let conversations: ConversationItem[] =
    data?.result
      ?.slice()
      .sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      ) || [];

  // ================================
  // Update preview của 1 conversation
  // ================================
  const updateConversationPreview = (updated: ConversationItem) => {
    queryClient.setQueryData(["chat", "userConversations"], (old: any) => {
      if (!old?.result) return old;

      let newList = old.result.map((c: ConversationItem) =>
        c.id === updated.id ? { ...c, ...updated } : c
      );

      newList.sort(
        (a: ConversationItem, b: ConversationItem) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      );

      return { ...old, result: newList };
    });
  };

  // ================================
  // Realtime listeners
  // ================================
  useChatRealtime({
    userId,
    onConversationListUpdated: (payload: any) => {
      console.log("🔥 User ConversationListUpdated:", payload);
      updateConversationPreview(payload);
    },
  });

  // ================================
  // Format time
  // ================================
  const formatTime = (dateString: string) => {
    const utc = new Date(dateString);
    const date = new Date(utc.getTime() + 7 * 60 * 60 * 1000);

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins}p`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // ================================
  // Render each conversation item
  // ================================
  const renderConversationItem = ({ item }: { item: ConversationItem }) => {
    const unreadCount = item.unreadCount ?? 0;
    const hasUnread = unreadCount > 0;
    const isAI = item.isAIChat;

    return (
      <Pressable
        className="mx-4 mb-3 rounded-3xl overflow-hidden shadow-sm active:scale-[0.98]"
        style={{
          backgroundColor: isAI ? '#F3E8FF' : '#FFFFFF',
          borderWidth: hasUnread && !isAI ? 2 : 0,
          borderColor: hasUnread && !isAI ? '#ACD6B8' : 'transparent',
        }}
        onPress={() =>
          navigation.navigate("ChatDetail", {
            conversationId: item.id,
          })
        }
      >
        {/* AI Border với multiple layers */}
        {isAI && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: '#A78BFA',
            }}
          />
        )}

        <View className="p-4">
          <View className="flex-row items-center">
            {/* Avatar & Product Image Stack */}
            <View className="relative mr-4">
              {/* Product Thumbnail */}
              {item.product.thumbnail ? (
                <Image
                  source={{ uri: item.product.thumbnail }}
                  className="w-14 h-14 rounded-2xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-14 h-14 rounded-2xl bg-mint/10 dark:bg-gold/10 items-center justify-center">
                  <FontAwesome name="shopping-bag" size={20} color="#ACD6B8" />
                </View>
              )}

              {/* User Avatar Badge */}
              <View className="absolute -bottom-1 -right-1 rounded-full border-2 border-white dark:border-dark-card">
                {isAI ? (
                  // AI Avatar
                  <View className="w-6 h-6 rounded-full bg-purple-500 items-center justify-center">
                    <Text className="text-[12px]">🤖</Text>
                  </View>
                ) : item.displayAvatar ? (
                  <Image
                    source={{ uri: item.displayAvatar }}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <View className="w-6 h-6 rounded-full bg-mint dark:bg-gold items-center justify-center">
                    <Text className="text-white text-[10px] font-bold">
                      {item.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* AI Sparkle Badge */}
              {isAI && (
                <View className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-yellow-400 items-center justify-center border-2 border-white">
                  <Text className="text-[10px]">✨</Text>
                </View>
              )}
            </View>

            {/* Content */}
            <View className="flex-1">
              {/* Top Row: Name & Time & AI Badge */}
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center flex-1 mr-2">
                  <Text
                    className={`text-base mr-2 ${
                      hasUnread
                        ? "font-bold text-light-text dark:text-dark-text"
                        : "font-semibold text-light-text dark:text-dark-text"
                    }`}
                    numberOfLines={1}
                  >
                    {item.displayName}
                  </Text>
                  {/* AI Badge inline */}
                  {isAI && (
                    <View className="px-2 py-0.5 rounded-full bg-purple-500">
                      <Text className="text-white text-[10px] font-bold">
                        🤖 AI
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  className={`text-xs ${
                    hasUnread
                      ? isAI
                        ? "text-purple-600 font-bold"
                        : "text-mint dark:text-gold font-bold"
                      : "text-light-textSecondary dark:text-dark-textSecondary"
                  }`}
                >
                  {formatTime(item.lastMessageAt)}
                </Text>
              </View>

              {/* Product Name */}
              <View className="flex-row items-center mb-2">
                <FontAwesome
                  name="cube"
                  size={11}
                  color={isAI ? "#9333EA" : "#9CA3AF"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className={`text-xs flex-1 ${
                    isAI
                      ? "text-purple-600"
                      : "text-light-textSecondary dark:text-dark-textSecondary"
                  }`}
                  numberOfLines={1}
                >
                  {item.product.name}
                </Text>
              </View>

              {/* Last Message & Unread Badge */}
              <View className="flex-row items-center">
                {/* AI Icon prefix */}
                {isAI && (
                  <View className="mr-1">
                    <Text className="text-[12px]">💬</Text>
                  </View>
                )}

                <Text
                  className={`text-sm flex-1 mr-2 ${
                    hasUnread
                      ? isAI
                        ? "text-purple-700 font-semibold"
                        : "text-light-text dark:text-dark-text font-semibold"
                      : isAI
                      ? "text-purple-600/70"
                      : "text-light-textSecondary dark:text-dark-textSecondary"
                  }`}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>

                {/* Unread Badge */}
                {hasUnread && (
                  <View
                    className="min-w-[22px] h-[22px] rounded-full items-center justify-center px-2"
                    style={{
                      backgroundColor: isAI ? '#9333EA' : '#F2A297',
                    }}
                  >
                    <Text className="text-white text-[11px] font-bold">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-32 h-32 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mb-6">
        <FontAwesome name="comments-o" size={56} color="#ACD6B8" />
      </View>
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-3 text-center">
        Chưa có tin nhắn
      </Text>
      <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center leading-6">
        Bắt đầu trò chuyện với người bán{"\n"}về sản phẩm bạn quan tâm
      </Text>
      <View className="mt-8 px-8 py-4 rounded-full bg-mint/10 dark:bg-gold/10">
        <Text className="text-sm text-mint dark:text-gold font-semibold">
          💬 Sẵn sàng hỗ trợ bạn
        </Text>
      </View>
    </View>
  );

  // ================================
  // Loading UI
  // ================================
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="flex-1 items-center justify-center">
          <View className="w-20 h-20 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mb-4">
            <ActivityIndicator size="large" color="#ACD6B8" />
          </View>
          <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary font-medium">
            Đang tải tin nhắn...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ================================
  // Error UI
  // ================================
  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center mb-6">
            <FontAwesome name="exclamation-circle" size={48} color="#EF4444" />
          </View>
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
            Không thể tải
          </Text>
          <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center mb-8 leading-6">
            Không thể tải danh sách tin nhắn.{"\n"}Vui lòng thử lại.
          </Text>
          <Pressable
            className="bg-mint dark:bg-gold px-8 py-4 rounded-2xl active:scale-95 shadow-lg"
            onPress={() => refetch()}
          >
            <View className="flex-row items-center">
              <FontAwesome name="refresh" size={18} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Thử lại
              </Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Total unread count
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + (conv.unreadCount ?? 0),
    0
  );

  // ================================
  // MAIN UI
  // ================================
  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-5 bg-white dark:bg-dark-card border-b border-beige/20 dark:border-dark-border/20">
          <View className="flex-row items-center justify-between">
            {/* Left: Title & Count */}
            <View className="flex-1">
              <Text className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
                Tin nhắn
              </Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary font-medium">
                  {conversations.length} cuộc trò chuyện
                </Text>
                {totalUnread > 0 && (
                  <>
                    <View className="w-1 h-1 rounded-full bg-light-textSecondary/40 mx-2" />
                    <Text className="text-sm text-coral font-bold">
                      {totalUnread} chưa đọc
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Right: Icon - FIXED */}
            <View className="relative">
              <View className="w-14 h-14 rounded-2xl bg-mint dark:bg-gold items-center justify-center shadow-lg">
                <FontAwesome name="comments" size={24} color="white" />
              </View>
              {totalUnread > 0 && (
                <View className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-coral items-center justify-center px-1.5 border-2 border-white dark:border-dark-card">
                  <Text className="text-white text-[10px] font-bold">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Conversations List */}
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 32,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#ACD6B8"
              colors={["#ACD6B8"]}
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-1" />}
        />
      </View>
    </SafeAreaView>
  );
}