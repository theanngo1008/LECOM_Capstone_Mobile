import { formatVietnamDateTimeFull } from "@/utils/dateUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReplyModal } from "../components/ReplyModal";
import { useReplyFeedback } from "../hooks/useReplyFeedback";
import { useShopFeedback } from "../hooks/useShopFeedback";
import { useUpdateReply } from "../hooks/useUpdateReply";

/**
 * Shop Feedback Screen
 * 
 * Uses same pattern as other ShopStack screens (ShopScreen, UpdateShopScreen, etc.)
 */
export function ShopFeedbackScreen({ navigation }: any) {
  // State hooks
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  
  const pageSize = 10;

  // Query hooks - called directly like AchievementsScreen
  const { data, isLoading, isError, refetch } = useShopFeedback(
    pageNumber,
    pageSize,
    selectedRating
  );

  // Mutation hooks
  const { mutate: replyFeedback, isPending: isReplying } = useReplyFeedback();
  const { mutate: updateReply, isPending: isUpdating } = useUpdateReply();

  // Callback hooks (must be called before early returns)
  const renderStars = useCallback((rating: number) => {
    return (
      <View className="flex-row gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesome
            key={star}
            name={star <= rating ? "star" : "star-o"}
            size={14}
            color="#FFCB66"
          />
        ))}
      </View>
    );
  }, []);

  const getResponseStatus = useCallback((reply: any) => {
    if (reply?.content) {
      return {
        text: reply.content,
        color: "text-mint dark:text-mint",
      };
    }
    return {
      text: "Chưa trả lời đánh giá",
      color: "text-gold dark:text-gold",
    };
  }, []);

  const handleOpenReplyModal = useCallback((feedback: any) => {
    const hasExistingReply = !!feedback.reply?.content;
    setSelectedFeedback(feedback);
    setReplyContent(feedback.reply?.content || "");
    setIsEditMode(hasExistingReply);
    setShowReplyModal(true);
  }, []);

  const handleSubmitReply = useCallback(() => {
    if (!replyContent.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung trả lời");
      return;
    }

    if (!selectedFeedback?.id) {
      Alert.alert("Lỗi", "Không tìm thấy đánh giá");
      return;
    }

    const params = {
      feedbackId: selectedFeedback.id,
      replyContent: replyContent.trim(),
    };

    const mutation = isEditMode ? updateReply : replyFeedback;
    const successMessage = isEditMode
      ? "Đã cập nhật phản hồi"
      : "Đã gửi phản hồi";

    mutation(params, {
      onSuccess: () => {
        Alert.alert("Thành công", successMessage);
        setShowReplyModal(false);
        setReplyContent("");
        setSelectedFeedback(null);
        setIsEditMode(false);
        refetch();
      },
      onError: (error: any) => {
        Alert.alert(
          "Lỗi",
          error?.response?.data?.message ||
            `Không thể ${isEditMode ? "cập nhật" : "gửi"} phản hồi`
        );
      },
    });
  }, [
    replyContent,
    selectedFeedback,
    isEditMode,
    replyFeedback,
    updateReply,
    refetch,
  ]);

  const renderFeedbackItem = useCallback(
    ({ item }: any) => {
      const hasResponse = !!item.reply?.content;
      const status = getResponseStatus(item.reply);

      return (
        <View className="bg-white dark:bg-dark-card rounded-2xl p-4 mb-3 border border-beige/30 dark:border-dark-border/30">
          {/* User Header */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                {item.userAvatar ? (
                  <Image
                    source={{ uri: item.userAvatar }}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                ) : (
                  <View className="w-8 h-8 rounded-full bg-beige/30 items-center justify-center mr-2">
                    <FontAwesome name="user" size={12} color="#9CA3AF" />
                  </View>
                )}
                <Text className="text-base font-bold text-light-text dark:text-dark-text">
                  {item.userName}
                </Text>
              </View>
              {renderStars(item.rating)}
            </View>

            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              {formatVietnamDateTimeFull(item.createdAt)}
            </Text>
          </View>

          {/* Content */}
          <View className="mb-3">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Nội dung đánh giá
            </Text>

            <Text className="text-sm text-light-text dark:text-dark-text leading-5 mb-2">
              {item.content}
            </Text>

            {/* Images */}
            {item.images?.length > 0 && (
              <View className="flex-row gap-2 flex-wrap">
                {item.images.slice(0, 3).map((imageUrl: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: imageUrl }}
                    className="w-20 h-20 rounded-lg bg-beige/30"
                  />
                ))}
                {item.images.length > 3 && (
                  <View className="w-20 h-20 rounded-lg bg-beige/30 items-center justify-center">
                    <Text className="text-xs font-bold text-light-textSecondary">
                      +{item.images.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Status + Button */}
          <View className="flex-row items-center justify-between pt-3 border-t border-beige/30 dark:border-dark-border/30">
            <View className="flex-1">
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-0.5">
                Trả lời của shop
              </Text>
              <Text className={`text-sm font-semibold ${status.color}`} numberOfLines={2}>
                {status.text}
              </Text>
            </View>

            <Pressable
              className={`px-4 py-2 rounded-xl ${
                hasResponse
                  ? "bg-lavender/20 dark:bg-lavender/20"
                  : "bg-gold/20 dark:bg-gold/20"
              } active:opacity-70 ml-3`}
              onPress={() => handleOpenReplyModal(item)}
            >
              <View className="flex-row items-center">
                <FontAwesome
                  name={hasResponse ? "edit" : "comment"}
                  size={14}
                  color={hasResponse ? "#CDB6DB" : "#FFCB66"}
                />
                <Text
                  className={`ml-2 text-xs font-bold ${
                    hasResponse
                      ? "text-lavender dark:text-lavender"
                      : "text-gold dark:text-gold"
                  }`}
                >
                  {hasResponse ? "Chỉnh sửa" : "Trả lời"}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      );
    },
    [renderStars, getResponseStatus, handleOpenReplyModal]
  );

  // Derived data (computed after hooks)
  const feedbackData = data?.result?.items || [];
  const totalPages = data?.result?.pagination?.totalPages || 1;
  const totalCount = data?.result?.pagination?.totalItems || 0;
  const currentPage = data?.result?.pagination?.currentPage || 1;

  const isSubmitting = isReplying || isUpdating;

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FFCB66" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Đang tải đánh giá...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome name="exclamation-triangle" size={48} color="#F2A297" />
          <Text className="text-coral font-bold text-xl mt-4 mb-2">
            Không thể tải đánh giá
          </Text>
          <Pressable
            className="mt-4 px-6 py-3 bg-gold rounded-xl active:opacity-80"
            onPress={() => refetch()}
          >
            <Text className="text-white font-bold">Thử lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Main UI
  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
      {/* Header */}
      <View className="bg-gradient-to-br from-gold/10 to-lavender/10 dark:from-gold/5 dark:to-lavender/5">
        <View className="flex-row items-center px-6 py-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-12 h-12 rounded-xl bg-white dark:bg-dark-card items-center justify-center border border-beige/30 dark:border-dark-border/30 active:opacity-70"
          >
            <FontAwesome name="arrow-left" size={20} color="#4A5568" />
          </Pressable>

          <View className="flex-1 ml-4">
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
              Đánh giá sản phẩm
            </Text>
            <View className="flex-row items-center mt-1">
              <FontAwesome name="star" size={12} color="#FFCB66" />
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                {totalCount} đánh giá
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => refetch()}
            className="w-12 h-12 rounded-xl bg-white dark:bg-dark-card items-center justify-center border border-beige/30 dark:border-dark-border/30 active:opacity-70"
          >
            <FontAwesome name="refresh" size={16} color="#4A5568" />
          </Pressable>
        </View>

        {/* Star Filter */}
        <View className="px-6 pb-4">
          <Text className="text-xs font-semibold text-light-text dark:text-dark-text mb-2.5 uppercase tracking-wide">
            Lọc theo đánh giá
          </Text>

          <View className="flex-row gap-2">
            {/* ALL */}
            <Pressable
              onPress={() => {
                setSelectedRating(null);
                setPageNumber(1);
              }}
              className={`px-4 py-2.5 rounded-xl border-2 items-center justify-center ${
                selectedRating === null
                  ? "bg-gold border-gold shadow-lg shadow-gold/20"
                  : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  selectedRating === null
                    ? "text-white"
                    : "text-light-textSecondary dark:text-dark-textSecondary"
                }`}
              >
                Tất cả
              </Text>
            </Pressable>

            {[5, 4, 3, 2, 1].map((rating) => (
              <Pressable
                key={rating}
                onPress={() => {
                  setSelectedRating(rating);
                  setPageNumber(1);
                }}
                className={`flex-1 px-3 py-2.5 rounded-xl border-2 items-center justify-center ${
                  selectedRating === rating
                    ? "bg-gold border-gold shadow-lg shadow-gold/20"
                    : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
                }`}
              >
                <View className="flex-row items-center gap-1">
                  <Text
                    className={`text-xs font-bold ${
                      selectedRating === rating
                        ? "text-white"
                        : "text-light-textSecondary dark:text-dark-textSecondary"
                    }`}
                  >
                    {rating}
                  </Text>
                  <FontAwesome
                    name="star"
                    size={10}
                    color={selectedRating === rating ? "#FFFFFF" : "#FFCB66"}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Feedback List */}
      <FlatList
        data={feedbackData}
        renderItem={renderFeedbackItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 rounded-full bg-beige/20 dark:bg-dark-border/20 items-center justify-center mb-4">
              <FontAwesome name="star-o" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-lg font-bold mt-2">
              {selectedRating
                ? `Chưa có đánh giá ${selectedRating} sao`
                : "Chưa có đánh giá nào"}
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mt-1 text-center px-12">
              {selectedRating
                ? "Hãy thử mức sao khác"
                : "Đánh giá sẽ hiển thị tại đây"}
            </Text>
          </View>
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              Trang {currentPage} / {totalPages}
            </Text>
            <Text className="text-xs font-semibold text-gold dark:text-gold">
              {totalCount} kết quả
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex-1 py-3 rounded-xl border-2 items-center justify-center ${
                currentPage === 1
                  ? "opacity-30 bg-beige/10"
                  : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
              }`}
            >
              <View className="flex-row items-center">
                <FontAwesome
                  name="chevron-left"
                  size={12}
                  color={currentPage === 1 ? "#9CA3AF" : "#4A5568"}
                />
                <Text className="font-bold text-sm ml-2">Trước</Text>
              </View>
            </Pressable>

            <View className="px-5 py-3 rounded-xl bg-gold shadow-lg shadow-gold/20">
              <Text className="font-bold text-sm text-white">{currentPage}</Text>
            </View>

            <Pressable
              onPress={() =>
                setPageNumber((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`flex-1 py-3 rounded-xl border-2 items-center justify-center ${
                currentPage === totalPages
                  ? "opacity-30 bg-beige/10"
                  : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
              }`}
            >
              <View className="flex-row items-center">
                <Text className="font-bold text-sm mr-2">Sau</Text>
                <FontAwesome
                  name="chevron-right"
                  size={12}
                  color={currentPage === totalPages ? "#9CA3AF" : "#4A5568"}
                />
              </View>
            </Pressable>
          </View>
        </View>
      )}

      {/* Reply Modal */}
      <ReplyModal
        visible={showReplyModal}
        selectedFeedback={selectedFeedback}
        isEditMode={isEditMode}
        replyContent={replyContent}
        isSubmitting={isSubmitting}
        onClose={() => setShowReplyModal(false)}
        onChangeContent={setReplyContent}
        onSubmit={handleSubmitReply}
        renderStars={renderStars}
      />
    </SafeAreaView>
  );
}
