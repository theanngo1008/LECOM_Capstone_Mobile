import { ThemedButton } from "@/components/themed-button";
import { SettingsScreen } from "@/features/settings/screens/SettingsScreen";
import { WalletScreen } from "@/features/wallet/screens/WalletScreen";
import { useMyProfile } from "@/features/profile/hooks/useMyProfile";
import { useAuthStore } from "@/store/auth-store";
import { FontAwesome } from "@expo/vector-icons";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import React from "react";
import { Alert, Text, View, Image, ActivityIndicator, TouchableOpacity, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatStackNavigator } from "./ChatStackNavigator";
import { CommunityStackNavigator } from "./CommunityStackNavigator";
import { MainTabNavigator } from "./MainTabNavigator";
import { OrdersStackNavigator } from "./OrdersStackNavigator";
import { ShopStackNavigator } from "./ShopStackNavigator";
import { DrawerParamList } from "./types";
import { WalletStackNavigator } from "./WalletStackNavigator";
import { LinearGradient } from 'expo-linear-gradient';

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
        Liên hệ hỗ trợ: support@lecom.com
      </Text>
    </View>
  );
}

// Custom Drawer Content
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const user = useAuthStore((s: any) => s.user);
  const logout = useAuthStore((s: any) => s.logout);
  const { data: profileData, isLoading: isLoadingProfile } = useMyProfile();
  const insets = useSafeAreaInsets();

  const profile = profileData?.result;

  const displayName = profile?.fullName || user?.name || "User";
  const displayEmail = profile?.email || user?.email || "user@example.com";
  const displayAvatar = profile?.imageUrl;

  // ✨ Tính padding phù hợp với notch/dynamic island
  const headerPaddingTop = Math.max(insets.top, 48); // Minimum 48, maximum là insets.top

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
    <View className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#ACD6B8', '#8FC5A8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ 
          paddingTop: headerPaddingTop,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}
      >
        {isLoadingProfile ? (
          // Loading State
          <View className="items-center justify-center py-6">
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white/80 text-sm mt-2">Đang tải...</Text>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => props.navigation.navigate('Settings')}
            className="flex-row items-center"
          >
            {/* Avatar with Shadow */}
            <View className="mr-3">
              {displayAvatar ? (
                <View className="relative">
                  <Image
                    source={{ uri: displayAvatar }}
                    className="w-16 h-16 rounded-full"
                  />
                  {/* Avatar Border Effect */}
                  <View className="absolute inset-0 rounded-full border-3 border-white/30" />
                </View>
              ) : (
                <View className="w-16 h-16 rounded-full bg-white/90 items-center justify-center shadow-lg">
                  <Text className="text-mint text-2xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* User Info */}
            <View className="flex-1">
              {/* Name */}
              <Text
                className="text-white text-lg font-bold mb-1"
                numberOfLines={1}
              >
                {displayName}
              </Text>

              {/* Email */}
              <View className="flex-row items-center mb-1.5">
                <FontAwesome name="envelope-o" size={11} color="rgba(255,255,255,0.9)" />
                <Text
                  className="text-white/90 text-xs ml-1.5 flex-1"
                  numberOfLines={1}
                >
                  {displayEmail}
                </Text>
              </View>

              {/* Username (nếu có) */}
              {profile?.userName && (
                <View className="flex-row items-center bg-white/20 rounded-full px-2.5 py-1 self-start">
                  <FontAwesome name="at" size={9} color="rgba(255,255,255,0.9)" />
                  <Text
                    className="text-white text-[11px] ml-1 font-semibold"
                    numberOfLines={1}
                  >
                    {profile.userName}
                  </Text>
                </View>
              )}
            </View>

            {/* Arrow Icon */}
            <FontAwesome name="chevron-right" size={14} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Menu Items */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="py-2">
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Footer with Version & Logout */}
      <View className="p-6 border-t border-beige/30 dark:border-dark-border/30">
        {/* App Version */}
        <View className="flex-row items-center justify-center mb-4">
          <FontAwesome name="mobile" size={14} color="#9CA3AF" />
          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2">
            LECOM v1.0.0
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 rounded-xl py-3 px-4 flex-row items-center justify-center shadow-sm active:scale-95"
          activeOpacity={0.8}
        >
          <FontAwesome name="sign-out" size={18} color="white" />
          <Text className="text-white font-bold text-base ml-2">
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: "#FFFFFF",
        drawerInactiveTintColor: "#6B7280",
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: "600",
          marginLeft: -5,
        },
        drawerStyle: {
          width: 300,
          backgroundColor: "#FFFBF5",
        },
        drawerActiveBackgroundColor: "#ACD6B8",
        drawerInactiveBackgroundColor: "transparent",
        drawerItemStyle: {
          borderRadius: 14,
          marginHorizontal: 16,
          marginVertical: 3,
          paddingHorizontal: 12,
          paddingVertical: 4,
        },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          title: "Trang chủ",
          drawerIcon: ({ color, size }) => (
            <View className="w-10 h-10 items-center justify-center">
              <FontAwesome name="home" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="ShopStack"
        component={ShopStackNavigator}
        options={{
          title: "Cửa hàng của tôi",
          drawerIcon: ({ color, size }) => (
            <View className="w-10 h-10 items-center justify-center">
              <FontAwesome name="shopping-bag" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="OrdersMain"
        component={OrdersStackNavigator}
        options={{
          title: "Đơn hàng của tôi",
          drawerIcon: ({ color, size }) => (
            <View className="w-10 h-10 items-center justify-center">
              <FontAwesome name="shopping-cart" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="WalletMain"
        component={WalletStackNavigator}
        options={{
          title: "Ví của tôi",
          drawerIcon: ({ color, size }) => (
            <View className="w-10 h-10 items-center justify-center">
              <FontAwesome name="credit-card" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="ChatList"
        component={ChatStackNavigator}
        options={{
          title: "Tin nhắn",
          drawerIcon: ({ color, size }) => (
            <View className="w-10 h-10 items-center justify-center">
              <FontAwesome name="comments" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="CommunityList"
        component={CommunityStackNavigator}
        options={{
          title: "Cộng đồng",
          drawerIcon: ({ color, size }) => (
            <View className="w-10 h-10 items-center justify-center">
              <FontAwesome name="users" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Cài đặt",
          drawerIcon: ({ color, size }) => (
            <View className="w-10 h-10 items-center justify-center">
              <FontAwesome name="cog" size={22} color={color} />
            </View>
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
            <View className="w-10 h-10 items-center justify-center">
              <FontAwesome name="question-circle" size={22} color={color} />
            </View>
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