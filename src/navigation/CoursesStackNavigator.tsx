import { CourseDetailScreen } from "@/features/courses/screens/CourseDetailScreen";
import { CoursesScreen } from "@/features/courses/screens/CoursesScreen";
import { LessonPlayerScreen } from "@/features/courses/screens/LessonPlayerScreen";
import { ProductDetailScreen } from "@/features/products/screens/ProductDetailScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { CoursesStackParamList } from "./types";

const Stack = createNativeStackNavigator<CoursesStackParamList>();

export function CoursesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="CoursesList"
        component={CoursesScreen}
        options={{
          title: "Danh sách khóa học",
        }}
      />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{
          title: "Chi tiết khóa học",
        }}
      />
      <Stack.Screen
        name="LessonPlayer"
        component={LessonPlayerScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: "Chi tiết sản phẩm",
        }}
      />
    </Stack.Navigator>
  );
}
