import { ThemedButton } from "@/components/themed-button";
import { SettingsScreen } from "@/features/settings/screens/SettingsScreen";
import { WalletScreen } from "@/features/wallet/screens/WalletScreen";
import { useAuthStore } from "@/store/auth-store";
import { FontAwesome } from "@expo/vector-icons";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import React from "react";
import { Alert, Text, View } from "react-native";
import { ChatStackNavigator } from "./ChatStackNavigator";
import { CommunityStackNavigator } from "./CommunityStackNavigator";
import { MainTabNavigator } from "./MainTabNavigator";
import { OrdersStackNavigator } from "./OrdersStackNavigator";
import { ShopStackNavigator } from "./ShopStackNavigator";
import { DrawerParamList } from "./types";
import { WalletStackNavigator } from "./WalletStackNavigator";

const Drawer = createDrawerNavigator<DrawerParamList>();

// Help Screen
function HelpScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-cream dark:bg-dark-background">
      <View className="w-24 h-24 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mb-6">
        <FontAwesome name="question-circle" size={64} color="#ACD6B8" />
      </View>
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
        Trợ giúp
      </Text>
      <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center px-6">
        Liên hệ hỗ trợ: support@coursehub.com
      </Text>
    </View>
  );
}

// Custom Drawer Content
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const user = useAuthStore((s: any) => s.user);
  const logout = useAuthStore((s: any) => s.logout);

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
      className="flex-1 bg-cream dark:bg-dark-background"
    >
      {/* Header */}
      <View className="p-6 bg-mint dark:bg-gold">
        <View className="w-16 h-16 rounded-full bg-white dark:bg-dark-card items-center justify-center mb-3 border-2 border-white/50">
          <Text className="text-mint dark:text-gold text-2xl font-bold">
            {user?.name?.charAt(0) || "U"}
          </Text>
        </View>
        <Text className="text-white text-lg font-bold">{user?.name}</Text>
        <Text className="text-white/90 text-sm">{user?.email}</Text>
      </View>

      {/* Menu Items */}
      <View className="flex-1 py-4">
        <DrawerItemList {...props} />
      </View>

      {/* Footer */}
      <View className="p-6 border-t border-beige/30 dark:border-dark-border/30">
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
        drawerActiveTintColor: "#FFFFFF", // ✅ Text trắng khi active
        drawerInactiveTintColor: "#6B7280", // ✅ Text xám khi inactive
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "600",
        },
        drawerStyle: {
          width: 280,
          backgroundColor: "#FFFBF5",
        },
        drawerActiveBackgroundColor: "#ACD6B8", // ✅ Background mint khi active
        drawerInactiveBackgroundColor: "transparent", // ✅ Background transparent khi inactive
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 12,
          marginVertical: 4,
        },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          title: "Trang chủ",
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ShopMain"
        component={ShopStackNavigator}
        options={{
          title: "Cửa hàng của tôi",
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="shopping-bag" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="OrdersMain"
        component={OrdersStackNavigator}
        options={{
          title: "Đơn hàng của tôi",
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="shopping-cart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="WalletMain"
        component={WalletStackNavigator}
        options={{
          title: "Ví của tôi",
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="credit-card" size={size} color={color} />
          ),
          headerShown: false,
          headerStyle: {
            backgroundColor: "#ACD6B8",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Drawer.Screen
        name="ChatList"
        component={ChatStackNavigator}
        options={{
          title: "Tin nhắn",
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="comments" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="CommunityList"
        component={CommunityStackNavigator}
        options={{
          title: "Cộng đồng",
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="users" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Cài đặt",
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="cog" size={size} color={color} />
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: "#ACD6B8",
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
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="question-circle" size={size} color={color} />
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: "#ACD6B8",
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