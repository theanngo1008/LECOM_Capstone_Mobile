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
import { useRegister } from "../hooks/useRegister";

type Props = AuthStackScreenProps<"Register">;

export function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const { register, isLoading } = useRegister();

  const handleRegister = async () => {
    // Validation
    if (!fullName || !userName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
     let isoDateOfBirth = "";
    if (dateOfBirth) {
      const [day, month, year] = dateOfBirth.split("/");
      if (day && month && year) {
        isoDateOfBirth = new Date(`${year}-${month}-${day}`).toISOString();
      }
    }

    try {
      await register({
        fullName,
        userName,
        email,
        dateOfBirth: isoDateOfBirth,
        password,
        phoneNumber,
        address,
      });
      Alert.alert("Success", "Registration successful! Please login.");
      navigation.navigate("Login");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "An error occurred");
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
          <View className="flex-1 px-6 pt-8 pb-8">
            {/* Header */}
            <View className="items-center mb-8">
              {/* Logo Circle */}
              <View className="w-20 h-20 rounded-full items-center justify-center bg-mint/20 dark:bg-gold/20 mb-4">
                <View className="w-16 h-16 rounded-full bg-white/50 dark:bg-dark-card/50 items-center justify-center">
                  <Text className="text-4xl">✨</Text>
                </View>
              </View>
              
              <Text className="text-3xl font-bold text-light-text dark:text-dark-text mb-2 text-center">
                Create Account
              </Text>
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center">
                Join us to start your learning journey
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4 mb-6">
              {/* Full Name */}
              <View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Full Name <Text className="text-coral">*</Text>
                </Text>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                  placeholder="John Doe"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!isLoading}
                />
              </View>

              {/* Username */}
              <View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Username <Text className="text-coral">*</Text>
                </Text>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                  placeholder="johndoe"
                  placeholderTextColor="#9CA3AF"
                  value={userName}
                  onChangeText={setUserName}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {/* Email */}
              <View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Email Address <Text className="text-coral">*</Text>
                </Text>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                  placeholder="example@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {/* Date of Birth */}
              <View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Date of Birth
                </Text>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#9CA3AF"
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  editable={!isLoading}
                />
              </View>

              {/* Phone Number */}
              <View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Phone Number
                </Text>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                  placeholder="+84 123 456 789"
                  placeholderTextColor="#9CA3AF"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>

              {/* Address */}
              <View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Address
                </Text>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                  placeholder="123 Street, City"
                  placeholderTextColor="#9CA3AF"
                  value={address}
                  onChangeText={setAddress}
                  editable={!isLoading}
                />
              </View>

              {/* Password */}
              <View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Password <Text className="text-coral">*</Text>
                </Text>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* Confirm Password */}
              <View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Confirm Password <Text className="text-coral">*</Text>
                </Text>
                <TextInput
                  className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className="bg-mint dark:bg-gold rounded-2xl py-4 items-center justify-center shadow-lg active:opacity-80 mb-4"
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-white font-bold text-lg">
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-beige dark:bg-dark-border" />
              <Text className="mx-4 text-light-textSecondary dark:text-dark-textSecondary text-sm">
                or sign up with
              </Text>
              <View className="flex-1 h-px bg-beige dark:bg-dark-border" />
            </View>

            {/* Social Signup Buttons */}
            <View className="gap-3 mb-6">
              <TouchableOpacity className="bg-white dark:bg-dark-card border-2 border-beige dark:border-dark-border rounded-2xl py-3.5 items-center justify-center flex-row active:opacity-80">
                <Text className="text-lg mr-2">🔍</Text>
                <Text className="text-light-text dark:text-dark-text font-semibold">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white dark:bg-dark-card border-2 border-beige dark:border-dark-border rounded-2xl py-3.5 items-center justify-center flex-row active:opacity-80">
                <Text className="text-lg mr-2">📘</Text>
                <Text className="text-light-text dark:text-dark-text font-semibold">
                  Continue with Facebook
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="flex-row items-center justify-center mt-2 mb-4">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-mint dark:text-gold font-bold">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text className="text-xs text-center text-light-textSecondary dark:text-dark-textSecondary px-8">
              By signing up, you agree to our{" "}
              <Text className="text-mint dark:text-gold">Terms of Service</Text>
              {" "}and{" "}
              <Text className="text-mint dark:text-gold">Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}