import { useThemeStore } from "@/store/theme-store";

export const useTheme = () => {
  const { theme, isSystemTheme, setTheme, setIsSystemTheme, toggleTheme } =
    useThemeStore();

  return {
    theme,
    isSystemTheme,
    setTheme,
    setIsSystemTheme,
    toggleTheme,
    isDark: theme === "dark",
  };
};
