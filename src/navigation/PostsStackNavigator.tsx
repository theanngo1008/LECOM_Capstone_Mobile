import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { PostDetailScreen } from "../features/posts/screens/PostDetailScreen";
import { PostListScreen } from "../features/posts/screens/PostListScreen";
import { PostsStackParamList } from "./types";

const Stack = createNativeStackNavigator<PostsStackParamList>();

export const PostsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#3B82F6",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="PostList"
        component={PostListScreen}
        options={{
          title: "📝 Bài viết",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          title: "Chi tiết bài viết",
        }}
      />
    </Stack.Navigator>
  );
};
