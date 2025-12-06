import { WalletScreen } from "@/features/wallet/screens/WalletScreen";
import { WithdrawalsScreen } from "@/features/wallet/screens/WithdrawalsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { WalletStackParamList } from "./types";

const Stack = createNativeStackNavigator<WalletStackParamList>();

export function WalletStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="WalletMain"
        component={WalletScreen}
        options={{
          title: "Ví của tôi",
        }}
      />
      <Stack.Screen
        name="Withdrawals"
        component={WithdrawalsScreen}
        options={{
          title: "Yêu cầu rút tiền",
        }}
      />
    </Stack.Navigator>
  );
}