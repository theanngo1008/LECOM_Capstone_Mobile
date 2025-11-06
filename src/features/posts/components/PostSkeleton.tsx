import React from "react";
import { View } from "react-native";

export const PostSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 mx-4 border border-gray-100">
      {/* Header skeleton */}
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-full bg-gray-200" />
        <View className="ml-2 w-16 h-3 bg-gray-200 rounded" />
      </View>

      {/* Title skeleton */}
      <View className="mb-2">
        <View className="w-full h-4 bg-gray-200 rounded mb-2" />
        <View className="w-3/4 h-4 bg-gray-200 rounded" />
      </View>

      {/* Body skeleton */}
      <View>
        <View className="w-full h-3 bg-gray-200 rounded mb-1.5" />
        <View className="w-full h-3 bg-gray-200 rounded mb-1.5" />
        <View className="w-2/3 h-3 bg-gray-200 rounded" />
      </View>

      {/* Footer skeleton */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <View className="w-12 h-3 bg-gray-200 rounded" />
        <View className="w-20 h-3 bg-gray-200 rounded" />
      </View>
    </View>
  );
};
