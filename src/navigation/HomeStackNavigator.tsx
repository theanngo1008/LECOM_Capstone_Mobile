import { CartScreen } from "@/features/cart/screens/CartScreen";
import { CourseDetailScreen } from "@/features/courses/screens/CourseDetailScreen";
import { HomeScreen } from "@/features/home/screens/HomeScreen";
import { ProductDetailScreen } from "@/features/products/screens/ProductDetailScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

export type HomeStackParamList = {
  HomeMain: undefined;
  CourseDetail: { slug: string };
  ProductDetail: { slug: string };
  CartMain: undefined;
};

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
    </Stack.Navigator>
  );
}