import { MyEnrollment } from "@/api/course";
import { useMyEnrollments } from "@/features/profile/hooks/useMyEnrollments";
import { ProfileStackScreenProps } from "@/navigation/types";
import { toVietnamTime } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useCallback, useMemo } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = ProfileStackScreenProps<"MyEnrollments">;

export function MyEnrollmentsScreen({ navigation }: Props) {
  const { data: enrollments, isLoading, error, refetch, isFetching } = useMyEnrollments();

  // ===========================
  // Calculate progress percentage
  // ===========================
  const getProgressPercentage = useCallback((progress: number) => {
    // Progress is already a percentage (0-100), but API may return values > 100 due to errors
    // Cap it at 100% maximum
    return Math.min(Math.max(Math.round(progress), 0), 100);
  }, []);

  // ===========================
  // Format date helper
  // ===========================
  const formatDate = useCallback((dateString: string) => {
    const date = toVietnamTime(dateString);
    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const dateStr = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${time} • ${dateStr}`;
  }, []);

  // ===========================
  // Calculate statistics
  // ===========================
  const stats = useMemo(() => {
    if (!enrollments) return { total: 0, inProgress: 0, completed: 0 };
    
    const total = enrollments.length;
    const completed = enrollments.filter((e) => {
      const progress = Math.min(Math.max(Math.round(e.progress), 0), 100);
      return progress >= 100;
    }).length;
    const inProgress = total - completed;
    
    return { total, inProgress, completed };
  }, [enrollments]);

  // ===========================
  // renderItem - MUST USE useCallback
  // ===========================
  const renderEnrollmentItem = useCallback(
    ({ item }: { item: MyEnrollment }) => {
      const progressPercent = getProgressPercentage(item.progress);
      const isCompleted = progressPercent >= 100;
      const statusText = isCompleted ? "Đã hoàn thành" : "Đang học";

      return (
        <View className="mx-4 mb-4 bg-white dark:bg-dark-card rounded-2xl overflow-hidden shadow-sm border border-beige/30 dark:border-dark-border/30">
          <View className="flex-row">
            {/* Thumbnail - Left */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                navigation.getParent()?.navigate("CoursesTab", {
                  screen: "CourseDetail",
                  params: { slug: item.courseSlug },
                });
              }}
              className="w-28 h-28 rounded-l-2xl overflow-hidden"
            >
              {item.courseThumbnail && item.courseThumbnail !== "string" ? (
                <Image
                  source={{ uri: item.courseThumbnail }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-gradient-to-br from-mint to-skyBlue dark:from-gold dark:to-lavender items-center justify-center">
                  <FontAwesome name="book" size={32} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {/* Content - Right */}
            <View className="flex-1 p-3">
              {/* Title */}
              <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1" numberOfLines={1}>
                {item.courseTitle}
              </Text>

              {/* Shop • Category */}
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-2">
                {item.shopName} • {item.categoryName}
              </Text>

              {/* Status Badge + Progress */}
              <View className="flex-row items-center mb-2">
                <View
                  className={`px-2 py-1 rounded-full mr-2 ${
                    isCompleted
                      ? "bg-mint/20 dark:bg-mint/20"
                      : "bg-gold/20 dark:bg-gold/20"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isCompleted
                        ? "text-mint dark:text-mint"
                        : "text-gold dark:text-gold"
                    }`}
                  >
                    {statusText}
                  </Text>
                </View>
                <Text className="text-xs font-bold text-light-textSecondary dark:text-dark-textSecondary">
                  {progressPercent}%
                </Text>
              </View>

              {/* Progress Bar */}
              <View className="h-1.5 bg-beige/30 dark:bg-dark-border/30 rounded-full overflow-hidden mb-2">
                <View
                  className={`h-full rounded-full ${
                    isCompleted ? "bg-mint dark:bg-mint" : "bg-gold dark:bg-gold"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </View>

              {/* Enrollment Date */}
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-2">
                Đã đăng ký học từ {formatDate(item.enrolledAt)}
              </Text>

              {/* Continue Button */}
              <TouchableOpacity
                className={`self-end px-3 py-1.5 rounded-full flex-row items-center ${
                  isCompleted
                    ? "bg-mint/20 dark:bg-mint/20"
                    : "bg-gold/20 dark:bg-gold/20"
                }`}
                activeOpacity={0.7}
                onPress={() => {
                  // Navigate to lesson player or course detail
                  navigation.getParent()?.navigate("CoursesTab", {
                    screen: "CourseDetail",
                    params: { slug: item.courseSlug },
                  });
                }}
              >
                <FontAwesome
                  name="play"
                  size={10}
                  color={isCompleted ? "#ACD6B8" : "#E8BA69"}
                  style={{ marginRight: 4 }}
                />
                <Text
                  className={`text-xs font-semibold ${
                    isCompleted
                      ? "text-mint dark:text-mint"
                      : "text-gold dark:text-gold"
                  }`}
                >
                  Tiếp tục học
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    },
    [navigation, getProgressPercentage, formatDate]
  );

  // ===========================
  // LOADING & ERROR UI
  // ===========================
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background justify-center items-center">
        <ActivityIndicator size="large" color="#E8BA69" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">
          Đang tải khóa học đã đăng ký...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background justify-center items-center px-6">
        <Text className="text-6xl mb-4">😔</Text>
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Không thể tải khóa học đã đăng ký
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
          Vui lòng thử lại sau
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-mint dark:bg-gold rounded-full px-6 py-3"
        >
          <Text className="text-white font-bold">Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ===========================
  // MAIN UI
  // ===========================
  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header */}
      <View className="bg-white dark:bg-dark-card shadow-sm pb-4">
        {/* Back Button */}
        <View className="px-4 pt-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
            <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2">Trở về</Text>
          </TouchableOpacity>
        </View>

        {/* Title & Subtitle */}
        <View className="px-4 mt-2 mb-4">
          <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
            Khóa học của tôi
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Xem các khóa học đã đăng ký và theo dõi tiến độ học tập của bạn
          </Text>
        </View>

        {/* Statistics */}
        <View className="px-4 flex-row gap-3">
          {/* Total Courses */}
          <View className="flex-1 bg-beige/30 dark:bg-beige/20 rounded-xl p-3">
            <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Tổng số khóa học
            </Text>
            <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {stats.total}
            </Text>
          </View>

          {/* In Progress */}
          <View className="flex-1 bg-gold/20 dark:bg-gold/20 rounded-xl p-3">
            <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Đang học
            </Text>
            <Text className="text-2xl font-bold text-gold dark:text-gold">
              {stats.inProgress}
            </Text>
          </View>

          {/* Completed */}
          <View className="flex-1 bg-mint/20 dark:bg-mint/20 rounded-xl p-3">
            <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Đã hoàn thành
            </Text>
            <Text className="text-2xl font-bold text-mint dark:text-mint">
              {stats.completed}
            </Text>
          </View>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={enrollments}
        renderItem={renderEnrollmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => refetch()}
            tintColor="#E8BA69"
            colors={["#E8BA69"]}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20 px-6">
            <View className="bg-white dark:bg-dark-card rounded-3xl p-10 items-center shadow-lg w-full max-w-sm">
              <View className="bg-mint/10 dark:bg-gold/10 rounded-full p-6 mb-4">
                <FontAwesome name="book" size={64} color="#ACD6B8" />
              </View>
              <Text className="text-gray-800 dark:text-gray-200 text-xl font-bold mb-2 text-center">
                Chưa có khóa học nào
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
                Bạn chưa đăng ký khóa học nào.{"\n"}
                Hãy khám phá và đăng ký khóa học yêu thích!
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

