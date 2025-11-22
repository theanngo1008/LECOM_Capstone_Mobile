import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text, Platform, View } from "react-native";
import { CoursesStackNavigator } from "./CoursesStackNavigator";
import { PostsStackNavigator } from "./PostsStackNavigator";
import { ProfileStackNavigator } from "./ProfileStackNavigator";
import { ProductsStackNavigator } from "./ProductsStackNavigator";
import { HomeStackNavigator } from "./HomeStackNavigator";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
const Tab = createBottomTabNavigator<any>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#3B82F6",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },

        tabBarActiveTintColor: "#000000ff",
        tabBarInactiveTintColor: "#9CA3AF",

        // ➜ Phần quan trọng: tabBarBackground để đồng bộ màu SAFE AREA
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
        ),

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F5F5DC",
          paddingBottom: Platform.OS === "ios" ? 0 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 60 : 68,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <AntDesign name="home" size={focused ? 26 : 24} />
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="CoursesTab"
        component={CoursesStackNavigator}
        options={{
          title: "Courses",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="book-open" size={focused ? 26 : 24} />
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="ProductsTab"
        component={ProductsStackNavigator}
        options={{
          title: "Products",
          tabBarIcon: ({ focused }) => (
            <Fontisto name="shopping-store" size={focused ? 26 : 24} />
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Ionicons name="person" size={focused ? 26 : 24} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
