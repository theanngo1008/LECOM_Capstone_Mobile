import { CartScreen } from "@/features/cart/screens/CartScreen";
import { CheckoutScreen } from "@/features/cart/screens/CheckoutScreen";
import { ChatDetailScreen } from "@/features/chat/screens/ChatDetailScreen";
import { ProductDetailScreen } from "@/features/products/screens/ProductDetailScreen";
import { ProductsScreen } from "@/features/products/screens/ProductsScreen";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// ==============================================
// PRODUCTS + CART STACK PARAM LIST
// ==============================================
export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetail: {
    slug: string;
  };
  CartMain: undefined;
  Checkout: undefined;
  CartProductDetail: {
    productId: string;
  };
   ChatDetail: {
    conversationId: string;
    isAIChat?: boolean;
  };
   OrdersMain: undefined;
};

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export function ProductsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* PRODUCTS */}
      <Stack.Screen
        name="ProductsList"
        component={ProductsScreen}
        options={{
          title: "Danh sách sản phẩm",
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: "Chi tiết sản phẩm",
        }}
      />

      {/* CART */}
      <Stack.Screen
        name="CartMain"
        component={CartScreen}
        options={{ title: "Giỏ hàng" }}
      />
    <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: "Thanh toán" }}
      />
     
<Stack.Screen
  name="ChatDetail"
  component={ChatDetailScreen}
  options={{ title: "Chi tiết trò chuyện" }}
/>

    </Stack.Navigator>
  );
} 
