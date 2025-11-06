import { useTheme } from "@/hooks/use-theme";
import React from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function SettingsScreen() {
  const { theme, setTheme, isSystemTheme, setIsSystemTheme } = useTheme();

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    if (newTheme === "system") {
      setIsSystemTheme(true);
    } else {
      setIsSystemTheme(false);
      setTheme(newTheme);
    }
  };

  const themeOptions = [
    { id: "light", label: "Sáng", icon: "☀️", description: "Giao diện sáng" },
    { id: "dark", label: "Tối", icon: "🌙", description: "Giao diện tối" },
    {
      id: "system",
      label: "Hệ thống",
      icon: "⚙️",
      description: "Theo cài đặt hệ thống",
    },
  ];

  const getCurrentTheme = () => {
    if (isSystemTheme) return "system";
    return theme;
  };

  const settingsItems = [
    {
      title: "Thông báo",
      icon: "🔔",
      items: [
        { label: "Thông báo Push", value: true, onToggle: () => {} },
        { label: "Thông báo Email", value: false, onToggle: () => {} },
        { label: "Thông báo khóa học mới", value: true, onToggle: () => {} },
      ],
    },
    {
      title: "Quyền riêng tư",
      icon: "🔒",
      items: [
        { label: "Hồ sơ công khai", value: false, onToggle: () => {} },
        { label: "Hiển thị tiến độ học tập", value: true, onToggle: () => {} },
      ],
    },
    {
      title: "Tải xuống",
      icon: "📥",
      items: [
        { label: "Tự động tải qua WiFi", value: true, onToggle: () => {} },
        { label: "Chất lượng tải xuống HD", value: false, onToggle: () => {} },
      ],
    },
  ];

  const handleClearCache = () => {
    Alert.alert("Xóa bộ nhớ đệm", "Bạn có chắc muốn xóa toàn bộ bộ nhớ đệm?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          Alert.alert("Thành công", "Đã xóa bộ nhớ đệm");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
      <ScrollView className="flex-1">
        {/* Theme Section */}
        <View className="p-6 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border">
          <View className="flex-row items-center mb-4">
            <Text className="text-3xl mr-3">🎨</Text>
            <View className="flex-1">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Giao diện
              </Text>
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                Tùy chỉnh giao diện ứng dụng
              </Text>
            </View>
          </View>

          <View className="gap-3">
            {themeOptions.map((option) => {
              const isSelected = getCurrentTheme() === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  className={`flex-row items-center p-4 rounded-xl border-2 ${
                    isSelected
                      ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                      : "bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border"
                  }`}
                  onPress={() => handleThemeChange(option.id as any)}
                >
                  <Text className="text-3xl mr-4">{option.icon}</Text>
                  <View className="flex-1">
                    <Text
                      className={`text-base font-semibold ${
                        isSelected
                          ? "text-primary-light dark:text-primary-dark"
                          : "text-light-text dark:text-dark-text"
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center">
                      <Text className="text-white text-sm">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Other Settings */}
        {settingsItems.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            className="p-6 border-b border-light-border dark:border-dark-border"
          >
            <View className="flex-row items-center mb-4">
              <Text className="text-2xl mr-3">{section.icon}</Text>
              <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                {section.title}
              </Text>
            </View>

            <View className="gap-3">
              {section.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  className="flex-row items-center justify-between bg-light-surface dark:bg-dark-surface p-4 rounded-lg"
                >
                  <Text className="text-base text-light-text dark:text-dark-text flex-1">
                    {item.label}
                  </Text>
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                    thumbColor={item.value ? "#FFFFFF" : "#F3F4F6"}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* App Info & Actions */}
        <View className="p-6">
          <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            Khác
          </Text>

          <TouchableOpacity
            className="flex-row items-center bg-light-card dark:bg-dark-card p-4 rounded-lg border border-light-border dark:border-dark-border mb-3"
            onPress={handleClearCache}
          >
            <Text className="text-2xl mr-3">🗑️</Text>
            <Text className="flex-1 text-base font-semibold text-light-text dark:text-dark-text">
              Xóa bộ nhớ đệm
            </Text>
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              125 MB
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-light-card dark:bg-dark-card p-4 rounded-lg border border-light-border dark:border-dark-border mb-3">
            <Text className="text-2xl mr-3">📄</Text>
            <Text className="flex-1 text-base font-semibold text-light-text dark:text-dark-text">
              Điều khoản dịch vụ
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary">
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-light-card dark:bg-dark-card p-4 rounded-lg border border-light-border dark:border-dark-border mb-3">
            <Text className="text-2xl mr-3">🔐</Text>
            <Text className="flex-1 text-base font-semibold text-light-text dark:text-dark-text">
              Chính sách bảo mật
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary">
              ›
            </Text>
          </TouchableOpacity>

          <View className="items-center mt-6 mb-2">
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              CourseHub v1.0.0
            </Text>
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
              © 2024 CourseHub. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
