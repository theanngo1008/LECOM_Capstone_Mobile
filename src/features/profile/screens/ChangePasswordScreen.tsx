import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedButton } from "@/components/themed-button";
import { useChangePassword } from "../hooks/useChangePassword";

export function ChangePasswordScreen() {
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
      <ScrollView className="flex-1 p-6">
        <Text className="text-xl font-semibold text-light-text dark:text-dark-text mb-6">
          Đổi mật khẩu
        </Text>

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
