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

  // 🔥 Lấy userId đúng từ zustand
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
  // 1️⃣ Update preview của 1 conversation
  // ================================
  const updateConversationPreview = (updated: ConversationItem) => {
    queryClient.setQueryData(["chat", "userConversations"], (old: any) => {
      if (!old?.result) return old;

      let newList = old.result.map((c: ConversationItem) =>
        c.id === updated.id ? { ...c, ...updated } : c
      );

      // Sort theo lastMessageAt
    newList.sort(
  (a: ConversationItem, b: ConversationItem) =>
    new Date(b.lastMessageAt).getTime() -
    new Date(a.lastMessageAt).getTime()
);


      return { ...old, result: newList };
    });
  };

  // ================================
  // 2️⃣ Replace full list khi BE gửi full list
  // ================================
  const replaceFullList = (list: ConversationItem[]) => {
   list.sort(
  (a: ConversationItem, b: ConversationItem) =>
    new Date(b.lastMessageAt).getTime() -
    new Date(a.lastMessageAt).getTime()
);


    queryClient.setQueryData(["chat", "userConversations"], (old: any) => ({
      ...old,
      result: list,
    }));
  };

  // ================================
  // 3️⃣ Realtime listeners
  // ================================
useChatRealtime({
  userId,
  onConversationListUpdated: (payload: any) => {
    console.log("🔥 User ConversationListUpdated:", payload);

    // payload luôn là 1 conversation summary (object)
    updateConversationPreview(payload);
  },
});






  // ================================
  // Format time
  // ================================
const formatTime = (dateString: string) => {
  const utc = new Date(dateString);
  const date = new Date(utc.getTime() + 7 * 60 * 60 * 1000); // 👉 +7 hours for VN

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};


  // ================================
  // Render each conversation item
  // ================================
  const renderConversationItem = ({ item }: { item: ConversationItem }) => (
    <Pressable
      className="bg-white dark:bg-dark-card rounded-2xl mb-3 overflow-hidden border border-beige/30 dark:border-dark-border/30"
      onPress={() =>
        navigation.navigate("ChatDetail", {
          conversationId: item.id,
        })
      }
    >
      <View className="p-4">
        <View className="flex-row items-start">
          {item.product.thumbnail ? (
            <Image
              source={{ uri: item.product.thumbnail }}
              className="w-16 h-16 rounded-xl bg-beige/20 mr-3"
              resizeMode="cover"
            />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3">
              <FontAwesome name="shopping-bag" size={24} color="#ACD6B8" />
            </View>
          )}

          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-1">
              <Text
                className="text-base font-bold text-light-text dark:text-dark-text flex-1"
                numberOfLines={1}
              >
                {item.product.name}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2">
                {formatTime(item.lastMessageAt)}
              </Text>
            </View>

            {item.isAIChat && (
              <View className="flex-row items-center mb-2">
                <View className="px-2 py-0.5 rounded-full bg-lavender/10 dark:bg-gold/10">
                  <Text className="text-[10px] text-lavender dark:text-gold font-bold">
                    🤖 AI Assistant
                  </Text>
                </View>
              </View>
            )}

            <Text
              className="text-sm text-light-textSecondary dark:text-dark-textSecondary"
              numberOfLines={2}
            >
              {item.lastMessage}
            </Text>
          </View>

          {/* ❗ Chỉ hiển thị nếu unread > 0 */}
          {item.unreadCount > 0 && (
            <View className="w-3 h-3 rounded-full bg-coral ml-2" />
          )}
        </View>
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 rounded-full bg-beige/20 dark:bg-dark-border/20 items-center justify-center mb-4">
        <FontAwesome name="comments-o" size={40} color="#ACD6B8" />
      </View>
      <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
        No Conversations Yet
      </Text>
      <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center px-8">
        Start chatting with sellers about products you are interested in
      </Text>
    </View>
  );

  // ================================
  // Loading UI
  // ================================
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Loading conversations...
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
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-coral/10 items-center justify-center mb-4">
            <FontAwesome name="exclamation-circle" size={40} color="#FF6B6B" />
          </View>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
            Failed to Load
          </Text>
          <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center mb-4">
            Unable to load your conversations
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

  // ================================
  // MAIN UI
  // ================================
  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      <View className="flex-1">

        {/* Header */}
        <View
          className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30"
          style={{ paddingTop: Platform.OS === "ios" ? 16 : 16 }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
                Messages
              </Text>
              <View className="flex-row items-center mt-2">
                <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  {conversations.length}{" "}
                  {conversations.length === 1
                    ? "conversation"
                    : "conversations"}
                </Text>
              </View>
            </View>
            <View className="w-14 h-14 rounded-2xl bg-mint/10 dark:bg-gold/10 items-center justify-center">
              <FontAwesome name="comments" size={24} color="#ACD6B8" />
            </View>
          </View>
        </View>

        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 24,
            paddingBottom: 40,
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
        />
      </View>
    </SafeAreaView>
  );
}
