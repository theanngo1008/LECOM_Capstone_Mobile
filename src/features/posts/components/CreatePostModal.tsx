import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCreatePost } from "../hooks/useCreatePost";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const createMutation = useCreatePost();

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) {
      return;
    }

    createMutation.mutate(
      {
        userId: 1, // Fake user ID
        title: title.trim(),
        body: body.trim(),
      },
      {
        onSuccess: () => {
          // Reset form và đóng modal
          setTitle("");
          setBody("");
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setTitle("");
    setBody("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        {/* Backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          className="flex-1 bg-black/50"
        />

        {/* Modal content */}
        <View className="bg-white rounded-t-3xl">
          <ScrollView className="max-h-[80vh]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <TouchableOpacity onPress={handleClose}>
                <Text className="text-gray-600 text-base">Hủy</Text>
              </TouchableOpacity>
              <Text className="text-gray-900 font-semibold text-lg">
                Tạo bài viết mới
              </Text>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={
                  !title.trim() || !body.trim() || createMutation.isPending
                }
              >
                <Text
                  className={`text-base font-semibold ${
                    title.trim() && body.trim() && !createMutation.isPending
                      ? "text-blue-500"
                      : "text-gray-400"
                  }`}
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    "Đăng"
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View className="p-4">
              {/* Title input */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">Tiêu đề</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Nhập tiêu đề bài viết..."
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900"
                  editable={!createMutation.isPending}
                />
              </View>

              {/* Body input */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">Nội dung</Text>
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  placeholder="Viết nội dung bài viết của bạn..."
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 h-32"
                  editable={!createMutation.isPending}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
