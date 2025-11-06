import { ThemedButton } from "@/components/themed-button";
import { CoursesStackScreenProps } from "@/navigation/types";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = CoursesStackScreenProps<"CourseDetail">;

const COURSE_DETAIL = {
  id: 1,
  title: "React Native Complete 2024",
  description:
    "Học React Native từ cơ bản đến nâng cao với các dự án thực tế. Khóa học bao gồm tất cả kiến thức cần thiết để trở thành React Native Developer chuyên nghiệp.",
  price: 990000,
  image: "📱",
  instructor: "Nguyễn Văn A",
  rating: 4.8,
  students: 1250,
  duration: "25 giờ",
  lectures: 180,
  level: "Trung bình",
  videos: [
    { id: 1, title: "Giới thiệu khóa học", duration: "10:30", isLocked: false },
    { id: 2, title: "Setup môi trường", duration: "15:20", isLocked: false },
    { id: 3, title: "Components cơ bản", duration: "25:45", isLocked: true },
    { id: 4, title: "State và Props", duration: "30:15", isLocked: true },
    { id: 5, title: "Navigation", duration: "40:20", isLocked: true },
  ],
};

export function CourseDetailScreen({ route, navigation }: Props) {
  const { courseId, courseName } = route.params;

  const handleEnroll = () => {
    Alert.alert("Đăng ký thành công", "Bạn đã đăng ký khóa học thành công!", [
      { text: "OK" },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
      <ScrollView className="flex-1">
        {/* Hero Image */}
        <View className="aspect-video bg-light-surface dark:bg-dark-surface items-center justify-center">
          <Text className="text-8xl">{COURSE_DETAIL.image}</Text>
        </View>

        {/* Content */}
        <View className="p-6">
          {/* Title & Price */}
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
            {courseName}
          </Text>

          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-primary-light dark:text-primary-dark">
              {COURSE_DETAIL.price.toLocaleString("vi-VN")}đ
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">⭐ {COURSE_DETAIL.rating}</Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                ({COURSE_DETAIL.students} học viên)
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row flex-wrap gap-4 mb-6">
            <View className="flex-row items-center gap-2">
              <Text>⏱️</Text>
              <Text className="text-light-text dark:text-dark-text">
                {COURSE_DETAIL.duration}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text>📚</Text>
              <Text className="text-light-text dark:text-dark-text">
                {COURSE_DETAIL.lectures} bài giảng
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text>📊</Text>
              <Text className="text-light-text dark:text-dark-text">
                {COURSE_DETAIL.level}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-3">
              Mô tả khóa học
            </Text>
            <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary leading-6">
              {COURSE_DETAIL.description}
            </Text>
          </View>

          {/* Instructor */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-3">
              Giảng viên
            </Text>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center">
                <Text className="text-white text-xl font-bold">
                  {COURSE_DETAIL.instructor.charAt(0)}
                </Text>
              </View>
              <Text className="text-base font-semibold text-light-text dark:text-dark-text">
                {COURSE_DETAIL.instructor}
              </Text>
            </View>
          </View>

          {/* Video List */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-3">
              Nội dung khóa học
            </Text>
            {COURSE_DETAIL.videos.map((video, index) => (
              <TouchableOpacity
                key={video.id}
                className="bg-light-card dark:bg-dark-card p-4 rounded-lg border border-light-border dark:border-dark-border mb-2"
                onPress={() => {
                  if (!video.isLocked) {
                    navigation.navigate("VideoPlayer", {
                      courseId,
                      videoId: video.id,
                      videoTitle: video.title,
                    });
                  }
                }}
                disabled={video.isLocked}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-light-text dark:text-dark-text mb-1">
                      {index + 1}. {video.title}
                    </Text>
                    <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      {video.duration}
                    </Text>
                  </View>
                  <Text className="text-2xl ml-3">
                    {video.isLocked ? "🔒" : "▶️"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Enroll Button */}
          <ThemedButton
            title="Đăng ký khóa học"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleEnroll}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
