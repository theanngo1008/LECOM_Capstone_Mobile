import { LoadingScreen } from "@/components/LoadingScreen";
import { useTheme } from "@/hooks/use-theme";
import { useAppBadge } from "@/hooks/useAppBadge";
import { useAuthStore } from "@/store/auth-store";
import { useSystemThemeListener } from "@/store/theme-store";
import {
    DarkTheme,
    DefaultTheme,
    NavigationContainer,
} from "@react-navigation/native";
import React, { useRef } from "react";
import { AuthStackNavigator } from "./AuthStackNavigator";
import { DrawerNavigator } from "./DrawerNavigator";
import { linking } from "./linking";

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { isDark } = useTheme();
  const navigationRef = useRef<any>(null);

  // Listen to system theme changes
  useSystemThemeListener();

  // Update app badge when authenticated (only show badge when logged in)
  // Note: Hook must be called unconditionally, but it will only update badge when authenticated
  useAppBadge();

  // Custom theme colors
  const CustomLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: "#3B82F6",
      background: "#F9FAFB",
      card: "#FFFFFF",
      text: "#111827",
      border: "#E5E7EB",
    },
  };

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: "#60A5FA",
      background: "#111827",
      card: "#1F2937",
      text: "#F9FAFB",
      border: "#374151",
    },
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={isDark ? CustomDarkTheme : CustomLightTheme}
      linking={linking}
      onReady={() => {
        console.log("✅ NavigationContainer is ready");
      }}
    >
      {isAuthenticated ? <DrawerNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}
