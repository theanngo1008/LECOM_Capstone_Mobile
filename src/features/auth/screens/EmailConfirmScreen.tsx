import { AuthStackParamList } from "@/navigation/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


type EmailConfirmScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "EmailConfirm"
>;

export function EmailConfirmScreen() {
  const navigation = useNavigation<EmailConfirmScreenNavigationProp>();

  const handleReturnToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-cream dark:bg-dark-background"
      edges={["top", "bottom"]}
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Card Container */}
        <View className="bg-white dark:bg-dark-card rounded-3xl p-8 w-full max-w-md border border-beige/30 dark:border-dark-border/30 shadow-lg">
          
          {/* Title */}
          <Text className="text-3xl font-bold text-light-text dark:text-dark-text text-center mb-8">
            Email Confirmed
          </Text>

          {/* Icon Illustration */}
          <View className="items-center mb-8">
            <View className="relative">
              {/* Envelope Base */}
              <View className="w-40 h-32 bg-white dark:bg-dark-background rounded-2xl border-2 border-beige dark:border-dark-border items-center justify-center">
                {/* Envelope Flap */}
                <View className="absolute -top-3 w-36 h-24 bg-cream dark:bg-dark-card rounded-t-2xl border-2 border-beige dark:border-dark-border border-b-0" />
                
                {/* Check Mark Circle */}
                <View className="w-20 h-20 rounded-full bg-gold items-center justify-center z-10">
                  <FontAwesome name="check" size={40} color="white" />
                </View>

                {/* Decorative Lines */}
                <View className="absolute bottom-4 left-4 w-8 h-1 bg-gold/30 rounded" />
              </View>
            </View>
          </View>

          {/* Message */}
          <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center mb-8 leading-6">
            Your email has been confirmed, you can now login.
          </Text>

          {/* Return to Login Button */}
          <Pressable
            onPress={handleReturnToLogin}
            className="bg-gold dark:bg-gold rounded-2xl py-4 items-center justify-center"
          >
            <Text className="text-white text-lg font-bold">
              Return to login
            </Text>
          </Pressable>
        </View>

        {/* Bottom Decoration */}
        <View className="mt-8 flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
            Welcome to CourseHub
          </Text>
          <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold ml-2" />
        </View>
      </View>
    </SafeAreaView>
  );
}