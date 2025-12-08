import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { CoursesStackNavigator } from "./CoursesStackNavigator";
import { HomeStackNavigator } from "./HomeStackNavigator";
import { ProductsStackNavigator } from "./ProductsStackNavigator";
import { ProfileStackNavigator } from "./ProfileStackNavigator";

const Tab = createBottomTabNavigator<any>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ACD6B8",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },

        tabBarActiveTintColor: "#237c72ff", // Teal-600 - đậm hơn để đọc được
        tabBarInactiveTintColor: "#222428ff", // Slate-400 - nhạt hơn

        // ✨ Gradient background
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={['#FFFFFF', '#F0FDFA']} // White → Teal-50
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </View>
        ),

        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 1,
          borderTopColor: "rgba(20, 184, 166, 0.1)", // Teal border nhẹ
          paddingBottom: Platform.OS === "android" ? 8 : 20, // ✅ iOS cần padding nhiều hơn
          paddingTop: 12,
          height: Platform.OS === "android" ? 70 : 88, // ✅ iOS cao hơn
          elevation: 0,
          shadowColor: "#14B8A6",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700", // Bold hơn
          marginTop: 6,
          marginBottom: 2,
        },

        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <AntDesign 
                name="home" 
                size={focused ? 26 : 24} 
                color={focused ? "#14B8A6" : color}
              />
            </View>
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="CoursesTab"
        component={CoursesStackNavigator}
        options={{
          title: "Học tập",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <MaterialCommunityIcons 
                name="book-open-variant" 
                size={focused ? 26 : 24} 
                color={focused ? "#14B8A6" : color}
              />
            </View>
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="ProductsTab"
        component={ProductsStackNavigator}
        options={{
          title: "Mua sắm",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Fontisto 
                name="shopping-store" 
                size={focused ? 24 : 22} 
                color={focused ? "#14B8A6" : color}
              />
            </View>
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons 
                name={focused ? "person" : "person-outline"} 
                size={focused ? 26 : 24} 
                color={focused ? "#14B8A6" : color}
              />
            </View>
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)', // Teal 12% - nhẹ hơn
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)', // Teal border 30%
    // ✨ Shadow nhẹ nhàng hơn
    shadowColor: "#14B8A6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});