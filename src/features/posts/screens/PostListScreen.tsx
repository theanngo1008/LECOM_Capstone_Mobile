import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PostsStackParamList } from "../../../navigation/types";
import { CreatePostModal } from "../components/CreatePostModal";
import { PostCard } from "../components/PostCard";
import { PostSkeleton } from "../components/PostSkeleton";
import { usePosts } from "../hooks/usePosts";

type Props = NativeStackScreenProps<PostsStackParamList, "PostList">;

export const PostListScreen: React.FC<Props> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = usePosts();

  // Flatten all pages
  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  // Filter posts by search query
  const posts = useMemo(() => {
    if (!searchQuery.trim()) return allPosts;

    const query = searchQuery.toLowerCase();
    return allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.body.toLowerCase().includes(query) ||
        post.id.toString().includes(query)
    );
  }, [allPosts, searchQuery]);

  // Loading state (lần đầu)
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-red-500 text-6xl mb-4">😞</Text>
        <Text className="text-gray-900 font-semibold text-xl mb-2 text-center">
          Có lỗi xảy ra
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          {error?.message || "Không thể tải danh sách bài viết"}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-blue-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (posts.length === 0 && !searchQuery) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-gray-400 text-6xl mb-4">📝</Text>
        <Text className="text-gray-900 font-semibold text-xl mb-2">
          Chưa có bài viết nào
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          Hãy tạo bài viết đầu tiên của bạn!
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-blue-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">+ Tạo bài viết</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Text className="text-xl mr-2">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm bài viết..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-gray-900 text-base"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text className="text-gray-400 text-xl ml-2">✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <Text className="text-gray-500 text-sm mt-2">
            {posts.length} kết quả tìm thấy
          </Text>
        )}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => {
              // Chặn navigate vào local posts (ID âm)
              if (item.id < 0) {
                Alert.alert(
                  "Bài viết local",
                  "Đây là bài viết demo (chưa có trên server). Chỉ xem được danh sách.",
                  [{ text: "OK" }]
                );
                return;
              }
              navigation.navigate("PostDetail", { postId: item.id });
            }}
          />
        )}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        // Pull to refresh
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor="#3B82F6"
          />
        }
        // Infinite scroll (chỉ khi không search)
        onEndReached={() => {
          if (!searchQuery && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        // Footer loading
        ListFooterComponent={() => {
          if (isFetchingNextPage) {
            return (
              <View className="py-4">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            );
          }

          if (!hasNextPage && posts.length > 0 && !searchQuery) {
            return (
              <View className="py-4">
                <Text className="text-center text-gray-400 text-sm">
                  🎉 Đã tải hết dữ liệu
                </Text>
              </View>
            );
          }

          return null;
        }}
        // Empty search result
        ListEmptyComponent={() => {
          if (searchQuery) {
            return (
              <View className="py-20 items-center">
                <Text className="text-gray-400 text-6xl mb-4">🔍</Text>
                <Text className="text-gray-900 font-semibold text-lg mb-2">
                  Không tìm thấy kết quả
                </Text>
                <Text className="text-gray-500 text-center px-6">
                  Không có bài viết nào khớp với "{searchQuery}"
                </Text>
              </View>
            );
          }
          return null;
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};
