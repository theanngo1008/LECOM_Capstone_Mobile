import { CommunityScreen } from "@/features/community/screens/CommunityScreen"
import { PostDetailScreen } from "@/features/community/screens/PostDetailScreen"
import type { CommunityStackParamList } from "@/navigation/types"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"

// Nhớ import màn hình thật của bạn


const Stack = createNativeStackNavigator<CommunityStackParamList>()

export function CommunityStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // giữ đồng bộ style với các Stack khác
      }}
    >
      <Stack.Screen
        name="CommunityList"
        component={CommunityScreen}
      />

      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
      />
    </Stack.Navigator>
  )
}
