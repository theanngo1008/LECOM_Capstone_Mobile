import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedButton } from "@/components/themed-button";
import { useChangePassword } from "../hooks/useChangePassword";
import { useNavigation } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutate: changePassword, isPending } = useChangePassword();

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    changePassword({ oldPassword, newPassword });
  };

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between mb-4">
          {/* Left - Back Button */}
          <TouchableOpacity
            className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3"
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={20} color="#ACD6B8" />
          </TouchableOpacity>

          {/* Center - Title */}
          <View className="flex-1">
            <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
              Đổi mật khẩu
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                Bảo mật tài khoản
              </Text>
            </View>
          </View>

          {/* Right - Spacer */}
          <View className="w-12" />
        </View>
      </View>

      <ScrollView className="flex-1 p-6">

        <Field
          label="Mật khẩu cũ"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
        />
        <Field
          label="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <Field
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View className="mt-6">
          <ThemedButton
            title={isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
            variant="primary"
            size="large"
            fullWidth
            onPress={handleChangePassword}
            disabled={isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Field = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
}: {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
}) => (
  <View className="mb-4">
    <Text className="text-sm font-medium text-light-text dark:text-dark-text mb-2">
      {label}
    </Text>
    <TextInput
      className="p-4 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#9CA3AF"
    />
  </View>
);
