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
import { ThemedButton } from "../../../components/themed-button";
import { AuthStackScreenProps } from "../../../navigation/types";
import { useLogin } from "../hooks/useLogin";

type Props = AuthStackScreenProps<"Login">;

export function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useLogin();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await login({ username, password });
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "An error occurred");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pt-8">
            {/* Header */}
            <View className="items-center mb-12">
              {/* Logo Circle */}
              <View className="w-24 h-24 rounded-full items-center justify-center bg-skyBlue/20 dark:bg-lavender/20 mb-6">
                <View className="w-20 h-20 rounded-full bg-white/50 dark:bg-dark-card/50 items-center justify-center">
                  <Text className="text-5xl">🎓</Text>
                </View>
              </View>
              
              <Text 
                className="text-4xl font-bold text-light-text dark:text-dark-text mb-2 text-center"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Welcome Back
              </Text>
              <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center">
                Sign in to continue learning
              </Text>
            </View>

            {/* Form */}
            <View className="gap-5 mb-6">
              {/* Email */}
              <View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Email Address
                </Text>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text p-4 rounded-2xl border-2 border-beige dark:border-dark-border"
                  placeholder="example@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={username}
                  onChangeText={setUsername}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {/* Password */}
              <View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Password
                </Text>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text p-4 rounded-2xl border-2 border-beige dark:border-dark-border"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity className="self-end">
                <Text className="text-skyBlue dark:text-lavender font-semibold">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className="bg-skyBlue dark:bg-lavender rounded-2xl py-5 items-center justify-center shadow-lg active:opacity-80 mb-4"
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white font-bold text-lg">
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-beige dark:bg-dark-border" />
              <Text className="mx-4 text-light-textSecondary dark:text-dark-textSecondary">
                or
              </Text>
              <View className="flex-1 h-px bg-beige dark:bg-dark-border" />
            </View>

            {/* Social Login Buttons */}
            <View className="gap-3 mb-6">
              <TouchableOpacity className="bg-white dark:bg-dark-card border-2 border-beige dark:border-dark-border rounded-2xl py-4 items-center justify-center flex-row active:opacity-80">
                <Text className="text-xl mr-2">🔍</Text>
                <Text className="text-light-text dark:text-dark-text font-semibold">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white dark:bg-dark-card border-2 border-beige dark:border-dark-border rounded-2xl py-4 items-center justify-center flex-row active:opacity-80">
                <Text className="text-xl mr-2">📘</Text>
                <Text className="text-light-text dark:text-dark-text font-semibold">
                  Continue with Facebook
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="flex-row items-center justify-center mt-6 mb-8">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                Do not have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-skyBlue dark:text-lavender font-bold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}