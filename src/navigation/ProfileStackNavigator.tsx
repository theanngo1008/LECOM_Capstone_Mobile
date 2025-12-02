import { ChangePasswordScreen } from "@/features/profile/screens/ChangePasswordScreen";
import { EditProfileScreen } from "@/features/profile/screens/EditProfileScreen";
import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";
import { WalletScreen } from "@/features/wallet/screens/WalletScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ProfileStackParamList } from "./types";
import { MissionScreen } from "@/features/profile/screens/MissionScreen";
import { RewardsStoreScreen } from "@/features/profile/screens/RewardsStoreScreen";
const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          title: "Hồ sơ",
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: "Chỉnh sửa hồ sơ",
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        />
        <Stack.Screen
        name="WalletMain"
        component={WalletScreen}
        />
       
      
      <Stack.Screen
        name="MissionsMain"
        component={MissionScreen}
      />
      <Stack.Screen
        name="RewardsStore"
        component={RewardsStoreScreen}
      />
    </Stack.Navigator>
  );
}
