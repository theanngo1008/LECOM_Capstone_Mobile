import { formatVietnamDateTime } from "@/utils/dateUtils";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFeedbackFilter } from "../hooks/useFeedbackFilter";
import { useUpdateFeedback, useDeleteFeedback } from "../hooks/useFeedbackActions";
import { useAuthStore } from "@/store/auth-store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FeedbackSectionProps {
  productId: string;
}

export function FeedbackSection({ productId }: FeedbackSectionProps) {
    const userId = useAuthStore((state) => state.userId);
  const {
    data: feedbackData,
    isLoading: isLoadingFeedback,
    rating: selectedRating,
    page: feedbackPage,
    setRating: setSelectedRating,
    setPage: setFeedbackPage,
  } = useFeedbackFilter(productId);

  const updateFeedback = useUpdateFeedback(productId);
  const deleteFeedback = useDeleteFeedback(productId);

  const [showFeedbackImageModal, setShowFeedbackImageModal] = useState(false);
  const [selectedFeedbackImages, setSelectedFeedbackImages] = useState<string[]>([]);
  const [selectedFeedbackImageIndex, setSelectedFeedbackImageIndex] = useState(0);
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<any>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState("");

  const feedbackList = feedbackData?.result?.items || [];
  const feedbackStats = {
    totalItems: feedbackData?.result?.pagination.totalItems || 0,
    totalPages: feedbackData?.result?.pagination.totalPages || 0,
    pageNumber: feedbackData?.result?.pagination.currentPage || 1,
    pageSize: feedbackData?.result?.pagination.pageSize || 10,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  // Calculate average rating and distribution
  if (feedbackList.length > 0) {
    const totalRating = feedbackList.reduce((sum, fb) => sum + fb.rating, 0);
    feedbackStats.averageRating = totalRating / feedbackList.length;

    feedbackList.forEach((fb) => {
      feedbackStats.ratingDistribution[fb.rating as keyof typeof feedbackStats.ratingDistribution]++;
    });
  }

  const formatDate = (dateString: string) => {
    return formatVietnamDateTime(dateString);
  };

  const renderStarRating = (rating: number, size = 16) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesome
            key={star}
            name={star <= rating ? "star" : "star-o"}
            size={size}
            color="#F59E0B"
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  const renderInteractiveStarRating = (currentRating: number, onRatingChange: (rating: number) => void) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
            className="mr-2"
          >
            <FontAwesome
              name={star <= currentRating ? "star" : "star-o"}
              size={32}
              color="#F59E0B"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleFeedbackImagePress = (imageUrls: string[], index: number) => {
    setSelectedFeedbackImages(imageUrls);
    setSelectedFeedbackImageIndex(index);
    setShowFeedbackImageModal(true);
  };

  // ✨ Check if feedback belongs to current user
  const isOwnFeedback = (feedback: any) => {
    return userId === feedback.userId;
  };

  // ✨ Handle Edit
  const handleEditPress = (feedback: any) => {
    setEditingFeedback(feedback);
    setEditRating(feedback.rating);
    setEditContent(feedback.content);
    setShowEditModal(true);
  };

  // ✨ Handle Update Submit
  const handleUpdateSubmit = () => {
    if (!editContent.trim()) {
      Alert.alert("Lỗi", "Nội dung đánh giá không được để trống");
      return;
    }

    updateFeedback.mutate(
      {
        feedbackId: editingFeedback.id,
        payload: {
          rating: editRating,
          content: editContent.trim(),
        },
      },
      {
        onSuccess: () => {
          setShowEditModal(false);
          Alert.alert("Thành công", "Đã cập nhật đánh giá");
        },
      }
    );
  };

  // ✨ Handle Delete
  const handleDeletePress = (feedbackId: string) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa đánh giá này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            deleteFeedback.mutate(feedbackId, {
              onSuccess: () => {
                Alert.alert("Thành công", "Đã xóa đánh giá");
              },
            });
          },
        },
      ]
    );
  };

  return (
    <>
      <View className="bg-white dark:bg-dark-card rounded-2xl p-6 mb-6 border border-beige/30 dark:border-dark-border/30">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-light-text dark:text-dark-text">
            Đánh giá sản phẩm
          </Text>
          <View className="flex-row items-center">
            <FontAwesome name="star" size={16} color="#F59E0B" />
            <Text className="text-base font-bold text-light-text dark:text-dark-text ml-1">
              {feedbackStats.averageRating.toFixed(1)}
            </Text>
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary ml-1">
              ({feedbackStats.totalItems})
            </Text>
          </View>
        </View>

        {/* Rating Distribution */}
        {feedbackStats.totalItems > 0 && (
          <View className="mb-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = feedbackStats.ratingDistribution[star as keyof typeof feedbackStats.ratingDistribution];
              const percentage = feedbackStats.totalItems > 0 
                ? (count / feedbackStats.totalItems) * 100 
                : 0;

              return (
                <View key={star} className="flex-row items-center mb-2">
                  <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary w-8">
                    {star} ⭐
                  </Text>
                  <View className="flex-1 h-2 bg-beige/30 dark:bg-dark-border/30 rounded-full mx-2 overflow-hidden">
                    <View 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary w-10 text-right">
                    {count}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${
                selectedRating === undefined
                  ? "bg-mint dark:bg-gold"
                  : "bg-beige/30 dark:bg-dark-border/30"
              }`}
              onPress={() => setSelectedRating(undefined)}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedRating === undefined
                    ? "text-white"
                    : "text-light-text dark:text-dark-text"
                }`}
              >
                Tất cả ({feedbackStats.totalItems})
              </Text>
            </TouchableOpacity>

            {[5, 4, 3, 2, 1].map((star) => {
              const count = feedbackStats.ratingDistribution[star as keyof typeof feedbackStats.ratingDistribution];
              if (count === 0) return null;

              return (
                <TouchableOpacity
                  key={star}
                  className={`px-4 py-2 rounded-full ${
                    selectedRating === star
                      ? "bg-mint dark:bg-gold"
                      : "bg-beige/30 dark:bg-dark-border/30"
                  }`}
                  onPress={() => setSelectedRating(star)}
                >
                  <View className="flex-row items-center">
                    <Text
                      className={`text-sm font-semibold ${
                        selectedRating === star
                          ? "text-white"
                          : "text-light-text dark:text-dark-text"
                      }`}
                    >
                      {star} ⭐
                    </Text>
                    <Text
                      className={`text-xs ml-1 ${
                        selectedRating === star
                          ? "text-white/80"
                          : "text-light-textSecondary dark:text-dark-textSecondary"
                      }`}
                    >
                      ({count})
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Feedback List */}
        {isLoadingFeedback ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" color="#ACD6B8" />
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-2">
              Đang tải đánh giá...
            </Text>
          </View>
        ) : feedbackList.length === 0 ? (
          <View className="py-8 items-center">
            <FontAwesome name="comment-o" size={48} color="#D1D5DB" />
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-3">
              {selectedRating 
                ? `Chưa có đánh giá ${selectedRating} sao`
                : "Chưa có đánh giá nào"}
            </Text>
          </View>
        ) : (
          <>
            {feedbackList.map((feedback) => (
              <View
                key={feedback.id}
                className="border-t border-beige/20 dark:border-dark-border/20 pt-4 mb-4"
              >
                {/* User Info */}
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    {feedback.userAvatar ? (
                      <Image
                        source={{ uri: feedback.userAvatar }}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <View className="w-10 h-10 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3">
                        <FontAwesome name="user" size={16} color="#ACD6B8" />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-light-text dark:text-dark-text">
                        {feedback.userName || `Người dùng #${feedback.id.slice(0, 8)}`}
                      </Text>
                      <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                        {formatDate(feedback.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {/* ✨ Edit/Delete Buttons (Only for own feedback) */}
                  {isOwnFeedback(feedback) && (
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleEditPress(feedback)}
                        className="w-8 h-8 rounded-full bg-skyBlue/10 dark:bg-lavender/10 items-center justify-center"
                      >
                        <FontAwesome name="edit" size={14} color="#7DD3FC" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeletePress(feedback.id)}
                        className="w-8 h-8 rounded-full bg-coral/10 items-center justify-center"
                      >
                        <FontAwesome name="trash" size={14} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Rating */}
                <View className="mb-2">
                  {renderStarRating(feedback.rating)}
                </View>

                {/* Content */}
                <Text className="text-sm text-light-text dark:text-dark-text leading-5 mb-3">
                  {feedback.content}
                </Text>

                {/* Images */}
                {feedback.images && feedback.images.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-2"
                  >
                    <View className="flex-row gap-2">
                      {feedback.images.map((imageUrl, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleFeedbackImagePress(feedback.images, index)}
                        >
                          <Image
                            source={{ uri: imageUrl }}
                            className="w-20 h-20 rounded-xl"
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}

                {/* Shop Reply */}
                {feedback.reply && (
                  <View className="mt-3 bg-skyBlue/5 dark:bg-lavender/10 rounded-xl p-4 ml-4 border-l-4 border-mint dark:border-gold">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <FontAwesome name="reply" size={12} color="#ACD6B8" />
                        <Text className="text-xs font-bold text-mint dark:text-gold ml-2">
                          Phản hồi từ người bán
                        </Text>
                      </View>
                      <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                        {formatDate(feedback.reply.createdAt)}
                      </Text>
                    </View>
                    <Text className="text-sm text-light-text dark:text-dark-text leading-5">
                      {feedback.reply.content}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {/* Pagination */}
            {feedbackStats.totalPages > 1 && (
              <View className="flex-row items-center justify-center gap-2 mt-4">
                <TouchableOpacity
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    feedbackPage === 1
                      ? "bg-beige/20 dark:bg-dark-border/20"
                      : "bg-mint/20 dark:bg-gold/20"
                  }`}
                  onPress={() => setFeedbackPage(feedbackPage - 1)}
                  disabled={feedbackPage === 1}
                >
                  <FontAwesome
                    name="chevron-left"
                    size={14}
                    color={feedbackPage === 1 ? "#D1D5DB" : "#ACD6B8"}
                  />
                </TouchableOpacity>

                <Text className="text-sm text-light-text dark:text-dark-text">
                  Trang {feedbackPage} / {feedbackStats.totalPages}
                </Text>

                <TouchableOpacity
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    feedbackPage === feedbackStats.totalPages
                      ? "bg-beige/20 dark:bg-dark-border/20"
                      : "bg-mint/20 dark:bg-gold/20"
                  }`}
                  onPress={() => setFeedbackPage(feedbackPage + 1)}
                  disabled={feedbackPage === feedbackStats.totalPages}
                >
                  <FontAwesome
                    name="chevron-right"
                    size={14}
                    color={
                      feedbackPage === feedbackStats.totalPages
                        ? "#D1D5DB"
                        : "#ACD6B8"
                    }
                  />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* ✨ Edit Feedback Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-dark-card rounded-t-3xl p-6 max-h-[80%]">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Chỉnh sửa đánh giá
              </Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                disabled={updateFeedback.isPending}
              >
                <FontAwesome name="times" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Rating Selector */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
                  Đánh giá của bạn
                </Text>
                {renderInteractiveStarRating(editRating, setEditRating)}
              </View>

              {/* Content Input */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
                  Nội dung
                </Text>
                <TextInput
                  value={editContent}
                  onChangeText={setEditContent}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  className="bg-beige/30 dark:bg-dark-border/30 rounded-2xl p-4 text-light-text dark:text-dark-text min-h-[120px]"
                  textAlignVertical="top"
                />
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-2">
                  {editContent.length}/500 ký tự
                </Text>
              </View>

              {/* Note */}
              <View className="bg-skyBlue/10 dark:bg-lavender/10 rounded-xl p-4 mb-6">
                <View className="flex-row items-start">
                  <FontAwesome name="info-circle" size={16} color="#7DD3FC" />
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2 flex-1">
                    Lưu ý: Hình ảnh không thể chỉnh sửa. Bạn chỉ có thể cập nhật đánh giá sao và nội dung.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-mint dark:bg-gold rounded-full py-4 items-center"
              onPress={handleUpdateSubmit}
              disabled={updateFeedback.isPending || !editContent.trim()}
            >
              {updateFeedback.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-bold">
                  Cập nhật đánh giá
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Feedback Image Viewer Modal */}
      <Modal
        visible={showFeedbackImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFeedbackImageModal(false)}
      >
        <View className="flex-1 bg-black">
          {/* Header */}
          <SafeAreaView edges={["top"]} className="absolute top-0 left-0 right-0 z-10">
            <View className="flex-row items-center justify-between px-6 py-4">
              <TouchableOpacity
                onPress={() => setShowFeedbackImageModal(false)}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <FontAwesome name="times" size={20} color="white" />
              </TouchableOpacity>
              <Text className="text-white font-semibold">
                {selectedFeedbackImageIndex + 1} / {selectedFeedbackImages.length}
              </Text>
              <View className="w-10" />
            </View>
          </SafeAreaView>

          {/* Image Carousel */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
              );
              setSelectedFeedbackImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {selectedFeedbackImages.map((imageUrl, index) => (
              <View
                key={index}
                className="items-center justify-center"
                style={{ width: SCREEN_WIDTH }}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: SCREEN_WIDTH, height: "100%" }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Thumbnail Navigation */}
          {selectedFeedbackImages.length > 1 && (
            <SafeAreaView edges={["bottom"]} className="absolute bottom-0 left-0 right-0">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-6 py-4"
                contentContainerStyle={{ gap: 8 }}
              >
                {selectedFeedbackImages.map((imageUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedFeedbackImageIndex(index)}
                    className={`rounded-lg overflow-hidden border-2 ${
                      selectedFeedbackImageIndex === index
                        ? "border-white"
                        : "border-white/30"
                    }`}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-16 h-16"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </SafeAreaView>
          )}
        </View>
      </Modal>
    </>
  );
}