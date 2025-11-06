import { ThemedButton } from "@/components/themed-button";
import { useAuthStore } from "@/store/auth-store";
import { SettingsScreen } from "@/features/settings/screens/SettingsScreen";
import { ShopStackNavigator } from "./ShopStackNavigator"; 
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import React from "react";
import { Alert, Text, View } from "react-native";
import { MainTabNavigator } from "./MainTabNavigator";
import { DrawerParamList } from "./types";


const Drawer = createDrawerNavigator<DrawerParamList>();

// Help Screen
function HelpScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-light-background dark:bg-dark-background">
      <Text className="text-6xl mb-4">❓</Text>
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
        Trợ giúp
      </Text>
      <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center px-6">
        Liên hệ: support@coursehub.com
      </Text>
    </View>
  );
}

// Custom Drawer Content
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <DrawerContentScrollView
      {...props}
      className="flex-1 bg-light-background dark:bg-dark-background"
    >
      {/* Header */}
      <View className="p-6 bg-primary-light dark:bg-primary-dark">
        <View className="w-16 h-16 rounded-full bg-white items-center justify-center mb-3">
          <Text className="text-primary-light text-2xl font-bold">
            {user?.name?.charAt(0) || "U"}
          </Text>
        </View>
        <Text className="text-white text-lg font-bold">{user?.name}</Text>
        <Text className="text-white/80 text-sm">{user?.email}</Text>
      </View>

      {/* Menu Items */}
      <View className="flex-1 py-4">
        <DrawerItemList {...props} />
      </View>

      {/* Footer */}
      <View className="p-6 border-t border-light-border dark:border-dark-border">
        <ThemedButton
          title="Đăng xuất"
          variant="error"
          fullWidth
          onPress={handleLogout}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: "#3B82F6",
        drawerInactiveTintColor: "#6B7280",
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "600",
        },
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          title: "Trang chủ",
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Drawer.Screen
        name="My Shop"
        component={ShopStackNavigator}
        options={{
          title: "My Shop",
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
          headerShown: true,
          headerStyle: {
            backgroundColor: "#3B82F6",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Cài đặt",
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
          headerShown: true,
          headerStyle: {
            backgroundColor: "#3B82F6",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{
          title: "Trợ giúp",
          drawerIcon: ({ color }) => <Text style={{ fontSize: 20 }}>❓</Text>,
          headerShown: true,
          headerStyle: {
            backgroundColor: "#3B82F6",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Drawer.Navigator>
  );
}
