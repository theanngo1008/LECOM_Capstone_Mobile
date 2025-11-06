import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PostsStackParamList } from "../../../navigation/types";
import { useDeletePost } from "../hooks/useDeletePost";
import { usePost } from "../hooks/usePost";

type Props = NativeStackScreenProps<PostsStackParamList, "PostDetail">;

export const PostDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { postId } = route.params;

  const { data: post, isLoading, isError, error } = usePost(postId);
  const deleteMutation = useDeletePost();

  const handleDelete = () => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa bài viết này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(postId, {
            onSuccess: () => {
              navigation.goBack();
            },
          });
        },
      },
    ]);
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải...</Text>
      </View>
    );
  }

  // Error state
  if (isError || !post) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-red-500 text-6xl mb-4">😞</Text>
        <Text className="text-gray-900 font-semibold text-xl mb-2 text-center">
          Có lỗi xảy ra
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          {error?.message || "Không thể tải bài viết"}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-blue-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* User info */}
        <View className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
            <Text className="text-white font-bold text-lg">{post.userId}</Text>
          </View>
          <View className="ml-3">
            <Text className="text-gray-900 font-semibold text-base">
              User {post.userId}
            </Text>
            <Text className="text-gray-500 text-sm">Post ID: {post.id}</Text>
          </View>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-gray-900 font-bold text-2xl leading-8">
            {post.title}
          </Text>
        </View>

        {/* Body */}
        <View className="mb-6">
          <Text className="text-gray-700 text-base leading-6">{post.body}</Text>
        </View>

        {/* Metadata */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-600 text-sm">Post ID:</Text>
            <Text className="text-gray-900 font-medium">{post.id}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">User ID:</Text>
            <Text className="text-gray-900 font-medium">{post.userId}</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="space-y-3">
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-500 rounded-xl py-4 items-center"
            activeOpacity={0.8}
          >
            {deleteMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                🗑️ Xóa bài viết
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="border border-gray-300 rounded-xl py-4 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 font-semibold text-base">
              ← Quay lại
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
