import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Platform } from "react-native";
import { UserChatListScreen } from "@/features/chat/screens/UserChatListScreen";
import { ChatDetailScreen } from "@/features/chat/screens/ChatDetailScreen";
import { ChatStackParamList } from "./types";

const Stack = createNativeStackNavigator<ChatStackParamList>();

export function ChatStackNavigator() {
  return (
    <Stack.Navigator
       screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ChatList"
        component={UserChatListScreen}
        options={{
          title: "Messages",
        }}
      />
      
      {/* ✅ Chat Detail Screen */}
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={{
          title: "Chat",
        }}
      />

      {/* TODO: Add StartChat screen (optional) */}
      {/* <Stack.Screen
        name="StartChat"
        component={StartChatScreen}
        options={{
          headerShown: true,
          title: "New Chat",
          presentation: "modal",
          headerStyle: {
            backgroundColor: "#FAF8F5",
          },
          headerTintColor: "#2D3748",
        }}
      /> */}
    </Stack.Navigator>
  );
}

export { ChatStackParamList };
