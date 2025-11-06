import { CourseDetailScreen } from "@/features/courses/screens/CourseDetailScreen";
import { CourseListScreen } from "@/features/courses/screens/CourseListScreen";
import { VideoPlayerScreen } from "@/features/courses/screens/VideoPlayerScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { CoursesStackParamList } from "./types";

const Stack = createNativeStackNavigator<CoursesStackParamList>();

export function CoursesStackNavigator() {
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
        name="CourseList"
        component={CourseListScreen}
        options={{
          title: "Danh sách khóa học",
        }}
      />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={({ route }) => ({
          title: route.params.courseName,
        })}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={({ route }) => ({
          title: route.params.videoTitle,
          headerShown: true,
        })}
      />
    </Stack.Navigator>
  );
}
