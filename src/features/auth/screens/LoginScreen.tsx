import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
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
import { useLogin } from "../hooks/useLogin";

type Props = AuthStackScreenProps<"Login">;

export function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useLogin();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await login({ username, password });
    } catch (error: any) {
      Alert.alert("Đăng nhập thất bại", error.message || "Đã xảy ra lỗi");
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
            <View className="items-center mb-16">
              <View className="relative mb-8">
                <View className="w-32 h-32 rounded-3xl items-center justify-center bg-gradient-to-br from-skyBlue/30 to-mint/30 dark:from-lavender/30 dark:to-gold/30">
                  <View className="w-28 h-28 rounded-2xl bg-white/80 dark:bg-dark-card/80 items-center justify-center overflow-hidden shadow-xl">
                    <Image 
                      source={require('../../../../assets/images/icon.png')}
                      style={{ width: 132, height: 132 }}
                      resizeMode="cover"
                    />
                  </View>
                </View>
                <View className="absolute -bottom-2 -right-2 w-10 h-10 bg-mint rounded-full items-center justify-center shadow-lg">
                  <FontAwesome name="check" size={18} color="white" />
                </View>
              </View>

              <Text className="text-4xl font-bold text-light-text dark:text-dark-text mb-3">
                Chào mừng trở lại
              </Text>
              <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center px-8">
                Đăng nhập để trải nghiệm học tập và mua sắm thông minh
              </Text>
            </View>

            <View className="gap-6 mb-8">
              <View>
                <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-3 ml-1">
                  Tên đăng nhập
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <FontAwesome name="user" size={18} color="#9CA3AF" />
                  </View>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-4 py-5 rounded-2xl border-2 border-beige dark:border-dark-border text-base"
                    placeholder="Nhập tên đăng nhập"
                    placeholderTextColor="#9CA3AF"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-3 ml-1">
                  Mật khẩu
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <FontAwesome name="lock" size={18} color="#9CA3AF" />
                  </View>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-14 py-5 rounded-2xl border-2 border-beige dark:border-dark-border text-base"
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-0 bottom-0 justify-center z-10"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesome
                      name={showPassword ? "eye" : "eye-slash"}
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                className="self-end mt-2"
                onPress={() => navigation.navigate("ResetPassword")}
              >
                <Text className="text-gray-800 dark:text-lavender font-bold text-sm">
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="rounded-2xl py-5 items-center justify-center shadow-lg active:scale-98 mb-8"
              onPress={handleLogin}
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
                  <Text
                    style={{ color: "#1F2937" }}
                    className="font-bold text-lg"
                  >
                    Đang đăng nhập...
                  </Text>
                </View>
              ) : (
                <Text
                  style={{ color: "#1F2937" }}
                  className="font-bold text-lg"
                >
                  Đăng nhập
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center justify-center gap-2 mb-12">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-base">
                Chưa có tài khoản?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
                className="active:opacity-70"
              >
                <Text className="text-gray-800 dark:text-lavender font-bold text-base">
                  Đăng ký ngay
                </Text>
              </TouchableOpacity>
            </View>

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