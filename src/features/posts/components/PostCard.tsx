import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Post } from "../../../api/posts";

interface PostCardProps {
  post: Post;
  onPress: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPress }) => {
  const isLocalPost = post.id < 0; // Local post (chưa sync server)

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-white rounded-xl p-4 mb-3 mx-4 shadow-sm border ${
        isLocalPost ? "border-orange-300 bg-orange-50" : "border-gray-100"
      }`}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <View
          className={`w-8 h-8 rounded-full ${
            isLocalPost ? "bg-orange-500" : "bg-blue-500"
          } items-center justify-center`}
        >
          <Text className="text-white font-bold text-sm">{post.userId}</Text>
        </View>
        <Text className="ml-2 text-gray-500 text-xs">User {post.userId}</Text>
        {isLocalPost && (
          <View className="ml-auto bg-orange-500 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">Local</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text
        className="text-gray-900 font-semibold text-base mb-2"
        numberOfLines={2}
      >
        {post.title}
      </Text>

      {/* Body preview */}
      <Text className="text-gray-600 text-sm" numberOfLines={3}>
        {post.body}
      </Text>

      {/* Footer */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <Text className="text-gray-400 text-xs">ID: {post.id}</Text>
        <Text className="text-blue-500 text-xs font-medium">
          Xem chi tiết →
        </Text>
      </View>
    </TouchableOpacity>
  );
};
