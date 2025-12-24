import { CartScreen } from "@/features/cart/screens/CartScreen";
import { CheckoutScreen } from "@/features/cart/screens/CheckoutScreen";
import { ChatDetailScreen } from "@/features/chat/screens/ChatDetailScreen";
import { CourseDetailScreen } from "@/features/courses/screens/CourseDetailScreen";
import { HomeScreen } from "@/features/home/screens/HomeScreen";
import { OrderDetailScreen } from "@/features/orders/screens/OrderDetailScreen";
import { OrdersScreen } from "@/features/orders/screens/OrdersScreen";
import { ProductDetailScreen } from "@/features/products/screens/ProductDetailScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { HomeStackParamList } from "./types";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="CartMain" component={CartScreen} />
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
      <Stack.Screen
        name="OrdersMain"
        component={OrdersScreen}
        options={{ title: "Đơn hàng" }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: "Chi tiết đơn hàng" }}
      />
    </Stack.Navigator>
  );
}

export { HomeStackParamList };
