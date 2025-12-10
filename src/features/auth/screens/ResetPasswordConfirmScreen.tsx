import React, { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthStackScreenProps } from "../../../navigation/types";
import { useResetPasswordConfirm } from "../hooks/useResetPasswordConfirm";
import { FontAwesome } from "@expo/vector-icons";

type Props = AuthStackScreenProps<"ResetPasswordConfirm">;

export function ResetPasswordConfirmScreen({ navigation, route }: Props) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { confirmResetPasswordAsync, isLoading } = useResetPasswordConfirm();

  // ✅ Parse URL từ deep link
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      try {
        const urlObj = new URL(url);
        const emailParam = urlObj.searchParams.get("email");
        const tokenParam = urlObj.searchParams.get("token");

        if (emailParam) setEmail(emailParam);
        if (tokenParam) setToken(decodeURIComponent(tokenParam));

        console.log("✅ Deep link parsed:", {
          email: emailParam,
          token: tokenParam ? "token received" : "no token",
        });
      } catch (error) {
        console.error("❌ Error parsing deep link:", error);
      }
    };

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Listen for URL changes
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // ✅ Parse từ route params (nếu navigate từ app)
  useEffect(() => {
    if (route.params?.email) setEmail(route.params.email);
    if (route.params?.token) setToken(route.params.token);
  }, [route.params]);

  const handleConfirmReset = async () => {
    if (!email || !token || !newPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await confirmResetPasswordAsync({
        email,
        token,
        newPassword,
      });
      // Navigate to login after success
      setTimeout(() => {
        navigation.navigate("Login");
      }, 1500);
    } catch (error: any) {
      Alert.alert("Thất bại", error.message || "Đặt lại mật khẩu thất bại");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-12">
            {/* Header */}
            <View className="items-center mb-12">
              <View className="w-24 h-24 rounded-full bg-mint/20 dark:bg-gold/20 items-center justify-center mb-6">
                <FontAwesome name="key" size={40} color="#10B981" />
              </View>

              <Text className="text-4xl font-bold text-light-text dark:text-dark-text mb-3 text-center">
                Đặt lại mật khẩu
              </Text>
              <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center px-4">
                Nhập mật khẩu mới cho tài khoản của bạn
              </Text>
            </View>

            {/* Email Display */}
            <View className="mb-5">
              <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-3 ml-1">
                Email
              </Text>
              <View className="bg-gray-100 dark:bg-dark-card px-4 py-5 rounded-2xl border-2 border-beige dark:border-dark-border">
                <Text className="text-light-text dark:text-dark-text text-base">
                  {email || "Đang tải..."}
                </Text>
              </View>
            </View>

            {/* New Password Input */}
            <View className="mb-5">
              <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-3 ml-1">
                Mật khẩu mới
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                  <FontAwesome name="lock" size={18} color="#9CA3AF" />
                </View>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-14 py-5 rounded-2xl border-2 border-beige dark:border-dark-border text-base"
                  placeholder="Nhập mật khẩu mới..."
                  placeholderTextColor="#9CA3AF"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  className="absolute right-4 top-0 bottom-0 justify-center"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <FontAwesome
                    name={showPassword ? "eye" : "eye-slash"}
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {newPassword && newPassword.length < 8 && (
                <Text className="text-xs text-coral mt-1 ml-1">
                  Mật khẩu phải có ít nhất 8 ký tự
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View className="mb-8">
              <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-3 ml-1">
                Xác nhận mật khẩu
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                  <FontAwesome name="lock" size={18} color="#9CA3AF" />
                </View>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-14 py-5 rounded-2xl border-2 border-beige dark:border-dark-border text-base"
                  placeholder="Nhập lại mật khẩu..."
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  className="absolute right-4 top-0 bottom-0 justify-center"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FontAwesome
                    name={showConfirmPassword ? "eye" : "eye-slash"}
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword && newPassword !== confirmPassword && (
                <Text className="text-xs text-coral mt-1 ml-1">
                  Mật khẩu xác nhận không khớp
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="rounded-2xl py-5 items-center justify-center shadow-lg active:scale-98 mb-8"
              onPress={handleConfirmReset}
              disabled={isLoading || !email || !token}
              style={{
                backgroundColor: isLoading || !email || !token ? "#D1D5DB" : "#E3B967",
                shadowColor: "#E3B967",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {isLoading ? (
                <View className="flex-row items-center gap-3">
                  <View className="w-5 h-5 border-2 border-gray-800/30 border-t-gray-800 rounded-full animate-spin" />
                  <Text style={{ color: "#1F2937" }} className="font-bold text-lg">
                    Đang đặt lại...
                  </Text>
                </View>
              ) : (
                <Text style={{ color: "#1F2937" }} className="font-bold text-lg">
                  Đặt lại mật khẩu
                </Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <View className="flex-row items-center justify-center gap-2 mb-12">
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                className="active:opacity-70"
              >
                <Text className="text-gray-800 dark:text-lavender font-bold text-base">
                  ← Quay lại đăng nhập
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="items-center pb-8">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs opacity-60">
                LECOM v1.0.0
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}