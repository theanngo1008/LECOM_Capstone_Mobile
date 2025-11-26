import { ProfileStackScreenProps } from "@/navigation/types";
import { useAuthStore } from "@/store/auth-store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMyProfile } from "../hooks/useMyProfile";

type Props = ProfileStackScreenProps<"ProfileMain">;

export function ProfileScreen({ navigation }: Props) {
  const { logout, isLoading: authLoading, userId } = useAuthStore();
  const { data, isLoading, isError, refetch } = useMyProfile();
  const profile = data?.result;

  useEffect(() => {
    const { token, userId, isAuthenticated } = useAuthStore.getState();
    console.log("🔐 ProfileScreen: Auth Store", {
      hasToken: !!token,
      userId,
      isAuthenticated,
      authLoading,
    });
  }, [authLoading]);

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          // Token sẽ được xóa trong logout() của auth store
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: "book",
      title: "Khóa học của tôi",
      color: "#ACD6B8",
      bgColor: "bg-mint/10 dark:bg-gold/10",
      onPress: () => {},
    },
    {
      icon: "ticket",
      title: "Ưu đãi của tôi",
      color: "#F2A297",
      bgColor: "bg-coral/10",
      onPress: () => {},
    },
    {
      icon: "certificate",
      title: "Chứng chỉ",
      color: "#FFCB66",
      bgColor: "bg-gold/10",
      onPress: () => {},
    },
    {
      icon: "lock",
      title: "Đổi mật khẩu",
      color: "#A5C4FB",
      bgColor: "bg-skyBlue/10",
      onPress: () => navigation.navigate("ChangePassword"),
    },
  ];

  // Loading auth store
  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
        <View className="items-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4 text-base">
            Initializing...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Loading profile
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
        <View className="items-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4 text-base">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6" edges={['top', 'bottom']}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={40} color="#F2A297" />
          </View>
          <Text className="text-coral font-bold text-xl mb-2">Oops!</Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
            Failed to load profile. Please check your connection.
          </Text>
          <TouchableOpacity
            className="bg-mint dark:bg-gold rounded-2xl py-3 px-8 active:opacity-80"
            onPress={() => refetch()}
          >
            <Text className="text-white font-bold text-base">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - No profile
  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="w-32 h-32 rounded-full bg-mint/20 dark:bg-gold/20 items-center justify-center mb-6">
              <FontAwesome name="user" size={60} color="#ACD6B8" />
            </View>

            <Text className="text-3xl font-bold text-light-text dark:text-dark-text mb-3 text-center">
              No Profile Yet
            </Text>

            <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center mb-6 px-4">
              Your account does not have profile details yet.{"\n"}
              Create your profile to get started!
            </Text>

            {/* User Info Card */}
            <View className="w-full bg-white dark:bg-dark-card rounded-2xl p-4 mb-6 border border-beige/30 dark:border-dark-border/30">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-skyBlue/10 dark:bg-lavender/10 items-center justify-center mr-3">
                  <FontAwesome name="id-card" size={18} color="#A5C4FB" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                    User ID
                  </Text>
                  <Text className="text-base font-bold text-light-text dark:text-dark-text">
                    {userId || "N/A"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="w-full gap-3">
              <TouchableOpacity
                className="bg-mint dark:bg-gold rounded-2xl py-4 items-center shadow-lg active:opacity-80"
                onPress={() => navigation.navigate("EditProfile")}
              >
                <Text className="text-white font-bold text-lg">Create Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white dark:bg-dark-card rounded-2xl py-4 items-center border-2 border-coral active:opacity-80"
                onPress={handleLogout}
              >
                <Text className="text-coral font-bold text-lg">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Success state - Display profile
  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="relative">
          {/* Cover Background */}
          <View className="h-32 bg-gradient-to-r from-mint to-skyBlue dark:from-gold dark:to-lavender" />
          
          {/* Profile Content */}
          <View className="px-6 -mt-16">
            {/* Avatar */}
            <View className="items-center mb-4">
              <View className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-cream dark:border-dark-background shadow-lg bg-white dark:bg-dark-card">
                {profile?.imageUrl ? (
                  <Image
                    source={{ uri: profile.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-mint/20 dark:bg-gold/20 items-center justify-center">
                    <Text className="text-4xl font-bold text-mint dark:text-gold">
                      {profile?.fullName?.charAt(0).toUpperCase() || "U"}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Edit Button */}
              <TouchableOpacity
                className="absolute bottom-0 right-1/3 w-10 h-10 rounded-full bg-mint dark:bg-gold items-center justify-center border-2 border-cream dark:border-dark-background shadow-lg"
                onPress={() => navigation.navigate("EditProfile")}
              >
                <FontAwesome name="pencil" size={14} color="white" />
              </TouchableOpacity>
            </View>

            {/* Name & Email */}
            <View className="items-center mb-6">
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                {profile?.fullName || "No Name"}
              </Text>
              <View className="flex-row items-center">
                <FontAwesome name="envelope" size={12} color="#9CA3AF" />
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary ml-2">
                  {profile?.email || "No Email"}
                </Text>
              </View>
            </View>

            {/* Stats Cards */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30">
                <View className="flex-row items-center justify-between mb-2">
                  <FontAwesome name="book" size={18} color="#ACD6B8" />
                  <Text className="text-2xl font-bold text-mint dark:text-gold">12</Text>
                </View>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  Courses
                </Text>
              </View>

              <View className="flex-1 bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30">
                <View className="flex-row items-center justify-between mb-2">
                  <FontAwesome name="clock-o" size={18} color="#A5C4FB" />
                  <Text className="text-2xl font-bold text-skyBlue dark:text-lavender">45</Text>
                </View>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  Hours
                </Text>
              </View>

              <View className="flex-1 bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30">
                <View className="flex-row items-center justify-between mb-2">
                  <FontAwesome name="certificate" size={18} color="#FFCB66" />
                  <Text className="text-2xl font-bold text-gold">8</Text>
                </View>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  Certificates
                </Text>
              </View>
            </View>

            {/* Menu Items */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
                Account Settings
              </Text>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center bg-white dark:bg-dark-card p-4 rounded-2xl border border-beige/30 dark:border-dark-border/30 mb-3 active:opacity-80"
                  onPress={item.onPress}
                >
                  <View className={`w-10 h-10 rounded-xl ${item.bgColor} items-center justify-center mr-3`}>
                    <FontAwesome name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <Text className="flex-1 text-base font-semibold text-light-text dark:text-dark-text">
                    {item.title}
                  </Text>
                  <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              className="bg-coral rounded-2xl py-4 items-center shadow-lg active:opacity-80 mb-6"
              onPress={handleLogout}
            >
              <View className="flex-row items-center">
                <FontAwesome name="sign-out" size={18} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}