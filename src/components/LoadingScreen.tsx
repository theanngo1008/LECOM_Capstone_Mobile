import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-light-background dark:bg-dark-background">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4">
        Đang tải...
      </Text>
    </View>
  );
}
