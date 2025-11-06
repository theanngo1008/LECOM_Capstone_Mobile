import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";
import { useEffect } from "react";
import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  isSystemTheme: boolean;
  setTheme: (theme: Theme) => void;
  setIsSystemTheme: (isSystem: boolean) => void;
  toggleTheme: () => void;
}

// Hàm update NativeWind theme
const updateNativeWindTheme = (theme: Theme) => {
  colorScheme.set(theme);
};

// Hàm lấy system theme
const getSystemTheme = (): Theme => {
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getSystemTheme(),
      isSystemTheme: true,

      setTheme: (theme: Theme) => {
        updateNativeWindTheme(theme);
        set({ theme, isSystemTheme: false });
      },

      setIsSystemTheme: (isSystem: boolean) => {
        if (isSystem) {
          const systemTheme = getSystemTheme();
          updateNativeWindTheme(systemTheme);
          set({ theme: systemTheme, isSystemTheme: true });
        } else {
          set({ isSystemTheme: false });
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === "light" ? "dark" : "light";
        get().setTheme(newTheme);
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.isSystemTheme) {
            state.theme = getSystemTheme();
          }
          updateNativeWindTheme(state.theme);
        }
      },
    }
  )
);

// Hook to listen system theme changes
export const useSystemThemeListener = () => {
  const { isSystemTheme, setTheme } = useThemeStore();

  useEffect(() => {
    if (!isSystemTheme) return;

    const subscription = Appearance.addChangeListener(
      ({ colorScheme: newColorScheme }) => {
        const newTheme = newColorScheme === "dark" ? "dark" : "light";
        updateNativeWindTheme(newTheme);
        useThemeStore.setState({ theme: newTheme });
      }
    );

    return () => subscription.remove();
  }, [isSystemTheme]);
};
