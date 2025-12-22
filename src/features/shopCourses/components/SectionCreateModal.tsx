import React from "react";
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

interface SectionCreateModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onCreate: (title: string) => void;
  isLoading: boolean;
}

export function SectionCreateModal({
  visible,
  title,
  onClose,
  onCreate,
  isLoading,
}: SectionCreateModalProps) {
  const [sectionTitle, setSectionTitle] = React.useState("");

  React.useEffect(() => {
    if (visible) {
      setSectionTitle("");
    }
  }, [visible]);

  const handleCreate = () => {
    if (!sectionTitle.trim()) {
      Alert.alert("Lỗi", "Tiêu đề phần không được để trống.");
      return;
    }
    onCreate(sectionTitle.trim());
    setSectionTitle("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white dark:bg-dark-card rounded-2xl p-6 w-full">
          <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
            Tạo phần mới
          </Text>
          <TextInput
            value={sectionTitle}
            onChangeText={setSectionTitle}
            placeholder="Nhập tiêu đề phần"
            placeholderTextColor="#999"
            className="border border-gray-300 dark:border-dark-border rounded-lg p-3 text-light-text dark:text-dark-text mb-4"
          />
          <View className="flex-row justify-end space-x-4">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500 font-medium mr-4">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreate} disabled={isLoading}>
              <Text className="text-mint dark:text-gold font-bold">
                {isLoading ? "Đang tạo..." : "Tạo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

