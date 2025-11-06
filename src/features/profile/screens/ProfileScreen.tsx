import { ThemedButton } from "@/components/themed-button";
import { ProfileStackScreenProps } from "@/navigation/types";
import { useAuthStore } from "@/store/auth-store";
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
  const { user, logout, isLoading: authLoading } = useAuthStore();
  const { data, isLoading, isError, refetch } = useMyProfile();
  const profile = data?.result;

  // ✅ FIX: Sửa "seEffect" thành "useEffect"
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
        },
      },
    ]);
  };

  const menuItems = [
    { icon: "📚", title: "Khóa học của tôi", onPress: () => {} },
    { icon: "❤️", title: "Yêu thích", onPress: () => {} },
    { icon: "🎓", title: "Chứng chỉ", onPress: () => {} },
    {
      icon: "🔒",
      title: "Đổi mật khẩu",
      onPress: () => navigation.navigate("ChangePassword"),
    },
  ];

  // ✅ Đợi auth store rehydrate xong
  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Đang khởi tạo...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Loading profile
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Đang tải thông tin...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Error state
  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">😞</Text>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
            Không thể tải thông tin
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
            Vui lòng kiểm tra kết nối mạng
          </Text>
          <ThemedButton
            title="Thử lại"
            variant="primary"
            onPress={() => refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Empty state - Profile chưa được tạo (404)
  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">👤</Text>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2 text-center">
            Chưa có thông tin hồ sơ
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
            Tài khoản của bạn chưa có thông tin chi tiết.{"\n"}
            Vui lòng liên hệ quản trị viên hoặc cập nhật thông tin.
          </Text>

          {/* Hiển thị thông tin cơ bản từ auth store */}
          <View className="w-full bg-light-card dark:bg-dark-card rounded-2xl p-4 mb-6 border border-light-border dark:border-dark-border">
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-2">
              Thông tin đăng nhập:
            </Text>
            <Text className="text-base text-light-text dark:text-dark-text font-semibold">
              User ID: {user?.userId || "N/A"}
            </Text>
          </View>

          <View className="w-full gap-3">
            <ThemedButton
              title="Tạo hồ sơ"
              variant="primary"
              fullWidth
              onPress={() => navigation.navigate("EditProfile")}
            />
            <ThemedButton
              title="Đăng xuất"
              variant="secondary"
              fullWidth
              onPress={handleLogout}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Success state - Hiển thị profile bình thường
  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center p-6 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border">
          {/* Avatar */}
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              overflow: "hidden",
              marginBottom: 16,
              backgroundColor: profile?.imageUrl ? undefined : "#3B82F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {profile?.imageUrl ? (
              <Image
                source={{ uri: profile.imageUrl }}
                style={{ width: 96, height: 96, borderRadius: 48 }}
              />
            ) : (
              <Text
                style={{ color: "white", fontSize: 32, fontWeight: "bold" }}
              >
                {profile?.fullName?.charAt(0).toUpperCase() || "U"}
              </Text>
            )}
          </View>

          <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
            {profile?.fullName || "Chưa có tên"}
          </Text>
          <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary mb-4">
            {profile?.email || "Chưa có email"}
          </Text>

          <TouchableOpacity
            className="bg-light-surface dark:bg-dark-surface px-6 py-2 rounded-full"
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text className="text-primary-light dark:text-primary-dark font-semibold">
              Chỉnh sửa hồ sơ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row p-6">
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
              12
            </Text>
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Khóa học
            </Text>
          </View>
          <View className="flex-1 items-center border-l border-r border-light-border dark:border-dark-border">
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
              45
            </Text>
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Giờ học
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
              8
            </Text>
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Chứng chỉ
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center bg-light-card dark:bg-dark-card p-4 rounded-lg border border-light-border dark:border-dark-border mb-2"
              onPress={item.onPress}
            >
              <Text className="text-2xl mr-3">{item.icon}</Text>
              <Text className="flex-1 text-base font-semibold text-light-text dark:text-dark-text">
                {item.title}
              </Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                ›
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View className="p-6">
          <ThemedButton
            title="Đăng xuất"
            variant="error"
            fullWidth
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}