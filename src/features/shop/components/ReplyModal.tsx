import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface ReplyModalProps {
  visible: boolean;
  isEditMode: boolean;
  selectedFeedback: any;
  replyContent: string;
  isSubmitting: boolean;

  onClose: () => void;
  onChangeContent: (text: string) => void;
  onSubmit: () => void;
  renderStars: (rating: number) => React.ReactNode;
}

export function ReplyModal({
  visible,
  isEditMode,
  selectedFeedback,
  replyContent,
  isSubmitting,
  onClose,
  onChangeContent,
  onSubmit,
  renderStars,
}: ReplyModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
          <Pressable
            className="bg-white dark:bg-dark-card rounded-t-3xl"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-6">
              <View className="w-12 h-1.5 rounded-full bg-beige/40 dark:bg-dark-border/40" />
            </View>

            <View className="px-6 pb-6">
              {/* Icon */}
              <View className="items-center mb-6">
                <View
                  className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                    isEditMode ? "bg-lavender/20" : "bg-gold/20"
                  }`}
                >
                  <FontAwesome
                    name={isEditMode ? "edit" : "comment"}
                    size={24}
                    color={isEditMode ? "#CDB6DB" : "#FFCB66"}
                  />
                </View>

                <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
                  {isEditMode ? "Chỉnh sửa phản hồi" : "Trả lời đánh giá"}
                </Text>

                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center">
                  Khách hàng:{" "}
                  <Text className="text-gold font-bold">
                    {selectedFeedback?.userName}
                  </Text>
                </Text>
              </View>

              {/* Original Feedback */}
              <View className="bg-beige/10 dark:bg-dark-border/10 rounded-2xl p-4 mb-4 border border-beige/30 dark:border-dark-border/30">
                <View className="flex-row items-center mb-2">
                  {renderStars(selectedFeedback?.rating || 0)}
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2">
                    Đánh giá gốc
                  </Text>
                </View>
                <Text className="text-sm text-light-text dark:text-dark-text leading-5">
                  {selectedFeedback?.content}
                </Text>
              </View>

              {/* Input */}
              <View className="mb-6">
                <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-3">
                  Nội dung phản hồi
                </Text>
                <TextInput
                  className="bg-beige/10 dark:bg-dark-border/10 rounded-2xl p-4 text-sm text-light-text dark:text-dark-text min-h-[120px] border border-beige/30 dark:border-dark-border/30"
                  placeholder="Nhập nội dung trả lời..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={replyContent}
                  onChangeText={onChangeContent}
                  editable={!isSubmitting}
                />
              </View>

              {/* Buttons */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={onClose}
                  className="flex-1 py-4 rounded-2xl bg-beige/20 dark:bg-dark-border/20 items-center justify-center border border-beige/30 dark:border-dark-border/30"
                >
                  <Text className="font-bold text-light-text dark:text-dark-text">
                    Hủy
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 py-4 rounded-2xl items-center justify-center shadow-lg ${
                    isEditMode ? "bg-lavender" : "bg-gold"
                  }`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text className="font-bold text-white">
                      {isEditMode ? "Cập nhật" : "Gửi phản hồi"}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
