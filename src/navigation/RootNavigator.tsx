import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "@/hooks/use-theme";
import { useSystemThemeListener } from "@/store/theme-store";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import React from "react";
import { AuthStackNavigator } from "./AuthStackNavigator";
import { DrawerNavigator } from "./DrawerNavigator";
import { linking } from "./linking";

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { isDark } = useTheme();

  // Listen to system theme changes
  useSystemThemeListener();

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
      theme={isDark ? CustomDarkTheme : CustomLightTheme}
      linking={linking}
    >
      {isAuthenticated ? <DrawerNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}
