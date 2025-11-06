import { useTheme } from "@/hooks/use-theme";
import { RootNavigator } from "@/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./globals.css";

export default function RootLayout() {
  const { isDark } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
