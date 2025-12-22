import { CourseLesson } from "@/api/shopCourses";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";

interface LessonItemProps {
  lesson: CourseLesson;
  index: number;
  onPress: () => void;
  onDelete: (lessonId: string, lessonTitle: string) => void;
  onLinkProduct: (lessonId: string) => void;
  isDeleting: boolean;
  getApprovalStatusColor: (status: "Approved" | "Pending" | "Rejected") => string;
  getApprovalStatusTextColor: (status: "Approved" | "Pending" | "Rejected") => string;
  getApprovalStatusText: (status: "Approved" | "Pending" | "Rejected") => string;
  formatDuration: (seconds: number | null) => string;
  formatPrice: (price: number) => string;
}

export function LessonItem({
  lesson,
  index,
  onPress,
  onDelete,
  onLinkProduct,
  isDeleting,
  getApprovalStatusColor,
  getApprovalStatusTextColor,
  getApprovalStatusText,
  formatDuration,
  formatPrice,
}: LessonItemProps) {
  const hasLinkedProducts = lesson.linkedProducts && lesson.linkedProducts.length > 0;

  return (
    <View className="p-4 bg-beige/20 dark:bg-dark-border/20 rounded-xl mb-2">
      {/* Row chính: info + play + delete */}
      <View className="flex-row items-center mb-3">
        <TouchableOpacity
          className="flex-1 flex-row items-center"
          activeOpacity={0.7}
          onPress={onPress}
        >
          <View className="w-10 h-10 rounded-full bg-mint/20 dark:bg-gold/20 items-center justify-center mr-3">
            <Text className="text-mint dark:text-gold font-bold">{index + 1}</Text>
          </View>

          <View className="flex-1">
            <Text
              className="text-base font-semibold text-light-text dark:text-dark-text mb-1"
              numberOfLines={2}
            >
              {lesson.title}
            </Text>

            <View className="flex-row items-center flex-wrap mb-1">
              <FontAwesome name="video-camera" size={12} color="#9CA3AF" />
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                {lesson.type}
              </Text>

              {lesson.durationSeconds !== null && (
                <>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mx-2">
                    •
                  </Text>
                  <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                    {formatDuration(lesson.durationSeconds)}
                  </Text>
                </>
              )}

              {hasLinkedProducts && (
                <>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mx-2">
                    •
                  </Text>
                  <FontAwesome name="shopping-bag" size={12} color="#ACD6B8" />
                  <Text className="text-xs text-mint dark:text-gold ml-1">
                    {lesson.linkedProducts.length}{" "}
                    {lesson.linkedProducts.length === 1 ? "sản phẩm" : "sản phẩm"}
                  </Text>
                </>
              )}
            </View>
            <View className="flex-row items-center mb-1">
              <View
                className={`px-2 py-1 rounded-lg border ${getApprovalStatusColor(
                  lesson.approvalStatus
                )}`}
              >
                <Text
                  className={`text-xs font-semibold ${getApprovalStatusTextColor(
                    lesson.approvalStatus
                  )}`}
                >
                  {getApprovalStatusText(lesson.approvalStatus)}
                </Text>
              </View>
            </View>
            {lesson.moderatorNote && (
              <View className="mt-1 px-2 py-1 bg-beige/30 dark:bg-dark-border/30 rounded">
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  <Text className="font-semibold">Ghi chú: </Text>
                  {lesson.moderatorNote}
                </Text>
              </View>
            )}
          </View>

          <View className="w-10 h-10 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
            <FontAwesome name="play" size={14} color="#ACD6B8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-coral/10 items-center justify-center"
          onPress={() => onDelete(lesson.id, lesson.title)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <FontAwesome name="trash-o" size={16} color="#FF6B6B" />
          )}
        </TouchableOpacity>
      </View>

      {/* 🆕 Link Product Button */}
      <TouchableOpacity
        className="flex-row items-center justify-center p-3 bg-skyBlue/10 dark:bg-lavender/10 rounded-xl border border-skyBlue/30 dark:border-lavender/30 mb-3 active:opacity-70"
        onPress={() => onLinkProduct(lesson.id)}
      >
        <FontAwesome name="link" size={14} color="#87CEEB" />
        <Text className="text-skyBlue dark:text-lavender font-semibold text-sm ml-2">
          Liên kết sản phẩm với bài học
        </Text>
      </TouchableOpacity>

      {/* ✅ Linked Products block */}
      {hasLinkedProducts && (
        <View className="bg-white/80 dark:bg-dark-card rounded-xl p-3 border border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-center mb-2">
            <FontAwesome name="shopping-basket" size={14} color="#ACD6B8" />
            <Text className="text-xs font-semibold text-light-text dark:text-dark-text ml-2">
              Sản phẩm đã liên kết ({lesson.linkedProducts.length})
            </Text>
          </View>

          {lesson.linkedProducts.map((product) => (
            <View key={product.id} className="flex-row items-center mb-2 last:mb-0">
              {product.thumbnailUrl ? (
                <Image
                  source={{ uri: product.thumbnailUrl }}
                  className="w-10 h-10 rounded-lg mr-3"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-10 h-10 rounded-lg bg-beige/40 dark:bg-dark-border/40 items-center justify-center mr-3">
                  <FontAwesome name="image" size={14} color="#9CA3AF" />
                </View>
              )}

              <View className="flex-1">
                <Text
                  className="text-xs font-semibold text-light-text dark:text-dark-text"
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                <Text
                  className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary"
                  numberOfLines={1}
                >
                  {product.shopName}
                </Text>
              </View>

              <Text className="text-xs font-bold text-mint dark:text-gold ml-2">
                {formatPrice(product.price)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

