import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthStackScreenProps } from "../../../navigation/types";
import { useResetPassword } from "../hooks/useResetPassword";
import { FontAwesome } from "@expo/vector-icons";

type Props = AuthStackScreenProps<"ResetPassword">;

export function ResetPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const { resetPassword, isLoading } = useResetPassword();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    try {
      await resetPassword({ email });
    } catch (error: any) {
      Alert.alert("Thất bại", error.message || "Đã xảy ra lỗi");
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
                <FontAwesome name="lock" size={40} color="#10B981" />
              </View>

              <Text className="text-4xl font-bold text-light-text dark:text-dark-text mb-3 text-center">
                Khôi phục mật khẩu
              </Text>
              <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center px-4">
                Nhập email của bạn để nhận link đặt lại mật khẩu
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-8">
              <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-3 ml-1">
                Email của bạn là gì?
                <Text className="text-skyBlue dark:text-lavender ml-2">
                  <FontAwesome name="question-circle" size={14} />
                </Text>
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                  <FontAwesome name="envelope" size={18} color="#9CA3AF" />
                </View>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-4 py-5 rounded-2xl border-2 border-beige dark:border-dark-border text-base"
                  placeholder="Email của tài khoản..."
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="rounded-2xl py-5 items-center justify-center shadow-lg active:scale-98 mb-8"
              onPress={handleResetPassword}
              disabled={isLoading}
              style={{
                backgroundColor: "#E3B967",
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
                    Đang gửi email...
                  </Text>
                </View>
              ) : (
                <Text style={{ color: "#1F2937" }} className="font-bold text-lg">
                  Gửi email xác thực
                </Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <View className="flex-row items-center justify-center gap-2 mb-12">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-base">
                Đột nhiên nhớ lại mật khẩu?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                className="active:opacity-70"
              >
                <Text className="text-gray-800 dark:text-lavender font-bold text-base">
                  Quay lại đăng nhập
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