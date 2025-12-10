
import { ChangePasswordScreen } from "@/features/profile/screens/ChangePasswordScreen";
import { EditProfileScreen } from "@/features/profile/screens/EditProfileScreen";
import { LeaderBoardScreen } from "@/features/profile/screens/LeaderBoardScreen";
import { MissionScreen } from "@/features/profile/screens/MissionScreen";
import { MyVoucherScreen } from "@/features/profile/screens/MyVoucherScreen";
import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";
import { RewardsStoreScreen } from "@/features/profile/screens/RewardsStoreScreen";
import { WalletScreen } from "@/features/wallet/screens/WalletScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ProfileStackParamList } from "./types";
import { AchievementsScreen } from "@/features/profile/screens/AchievementsScreen";
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
      <Stack.Screen
        name="MyVouchers"
        component={MyVoucherScreen}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderBoardScreen}
      />
     
    </Stack.Navigator>
  );
}
