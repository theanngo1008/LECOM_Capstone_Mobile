import { CartScreen } from "@/features/cart/screens/CartScreen";
import { CheckoutScreen } from "@/features/cart/screens/CheckoutScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { CartStackParamList } from "./types";

const Stack = createNativeStackNavigator<CartStackParamList>();

export function CartStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="CartMain"
        component={CartScreen}
        options={{ title: "My Cart" }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: "Thanh toán" }}
      />
    </Stack.Navigator>
  );
}
