import { ProductDetailScreen } from "@/features/products/screens/ProductDetailScreen";
import { ProductsScreen } from "@/features/products/screens/ProductsScreen";
import { CartScreen } from "@/features/cart/screens/CartScreen";

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
};

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export function ProductsStackNavigator() {
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
        animation: "slide_from_right",
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
   
     
    </Stack.Navigator>
  );
}
