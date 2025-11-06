import { ThemedButton } from "@/components/themed-button";
import { AuthStackScreenProps } from "@/navigation/types";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = AuthStackScreenProps<"Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo & Title */}
        <Animated.View 
          className="items-center w-full"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Animated Logo */}
          <Animated.View
            className="relative mb-8"
            style={{
              transform: [{ scale: scaleAnim }],
            }}
          >
            {/* Gradient Background Circle */}
            <View className="w-48 h-48 rounded-full items-center justify-center bg-skyBlue/20 dark:bg-lavender/20">
              <View className="w-40 h-40 rounded-full bg-white/50 dark:bg-dark-card/50 items-center justify-center">
                <Text className="text-8xl">🍳</Text>
              </View>
            </View>
            
            {/* Decorative Elements */}
            <View className="absolute -top-2 -right-2 w-12 h-12 bg-mint/60 rounded-full" />
            <View className="absolute -bottom-3 -left-3 w-16 h-16 bg-coral/40 rounded-full" />
            <View className="absolute top-1/2 -right-4 w-8 h-8 bg-gold/50 rounded-full" />
          </Animated.View>

          {/* Title */}
          <Text className="text-5xl font-bold text-center mb-3 text-light-text dark:text-dark-text tracking-tight">
            LECOM
          </Text>
          
          {/* Subtitle */}
          <View className="bg-skyBlue/20 dark:bg-lavender/20 rounded-full px-6 py-2 mb-4">
            <Text className="text-lg text-skyBlue dark:text-lavender font-semibold">
              Learn & Shop Smart
            </Text>
          </View>
          
          <Text className="text-base text-center text-light-textSecondary dark:text-dark-textSecondary px-6 leading-6 mb-12">
            Smart learning and shopping platform{"\n"}for cooking, health and beauty
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View 
          className="w-full gap-4"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Login Button */}
          <Pressable
            className="bg-skyBlue dark:bg-lavender rounded-2xl py-5 items-center justify-center shadow-lg active:opacity-80"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="text-white font-bold text-lg">
              Sign In
            </Text>
          </Pressable>

          {/* Register Button */}
          <Pressable
            className="bg-white dark:bg-dark-card border-2 border-skyBlue dark:border-lavender rounded-2xl py-5 px-8 items-center justify-center active:opacity-80"
            onPress={() => navigation.navigate("Register")}
          >
            <Text className="text-skyBlue dark:text-lavender font-bold text-lg">
              Sign Up
            </Text>
          </Pressable>

          {/* Skip Button - Footer */}
          <View className="mt-6 items-center">
            <Pressable
              className="py-3 active:opacity-60"
              onPress={() => {
                // Giữ nguyên navigation logic cũ
                // Nếu cần navigate đến home, bạn có thể thêm logic ở đây
              }}
            >
              <Text className="text-center text-light-textSecondary dark:text-dark-textSecondary font-medium">
                Explore Now →
              </Text>
            </Pressable>
            
            <View className="mt-4 items-center">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm opacity-60">
                By continuing, you agree to our
              </Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm opacity-60">
                Terms of Service & Privacy Policy
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}