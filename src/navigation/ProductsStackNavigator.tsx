
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import {ProductsStackParamList } from "./types";
import { ProductsScreen } from "@/features/products/screens/ProductsScreen";

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
      <Stack.Screen
        name="ProductsList"
        component={ProductsScreen}
        options={{
          title: "Danh sách sản phẩm",
        }}
      />
     
    </Stack.Navigator>
  );
}
