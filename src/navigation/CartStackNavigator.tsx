import { CartScreen } from "@/features/cart/screens/CartScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";



export type CartStackParamList = {
  CartMain: undefined; // Trang chính giỏ hàng
  Checkout: undefined; // Trang thanh toán
  CartProductDetail: {
    productId: string; // Chi tiết sản phẩm trong giỏ hàng
  };
};

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
     
    </Stack.Navigator>
  );
}
